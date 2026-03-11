import { ParsedLog } from '../utils/logParser';
import rconService from './rconService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Rule {
  name: string;
  description: string;
  enabled: boolean;
  onEvent?: (event: ParsedLog, serverId: string) => Promise<void>;
  onPeriodic?: (serverId: string, players: any[]) => Promise<void>;
}

class RuleService {
  private rules: Rule[] = [];
  // Cache for TeamKill detection: serverId -> SteamID -> TeamID
  private playerTeamCache: Map<string, Map<string, string>> = new Map();

  constructor() {
    this.registerBuiltInRules();
  }

  private registerBuiltInRules() {
    // 1. TeamKill Auto Kick (Simplified)
    // Needs robust team tracking which we are building
    this.rules.push({
      name: 'TeamKillPunish',
      description: 'Warn on 1st TK, Kick on 2nd TK',
      enabled: true, // Should be configurable via DB
      onEvent: async (event, serverId) => {
        if (event.type === 'KILL') {
          await this.handleTeamKill(event, serverId);
        }
      }
    });

    // 2. Chat Filter
    this.rules.push({
      name: 'ChatFilter',
      description: 'Kick players using forbidden words',
      enabled: true,
      onEvent: async (event, serverId) => {
        if (event.type === 'CHAT') {
          const { message, steamId, senderName } = event.payload;
          const forbidden = ['badword', 'racistword']; // Load from DB config
          
          if (forbidden.some(w => message.toLowerCase().includes(w))) {
            console.log(`[Rule] ChatFilter triggered for ${senderName} (${steamId})`);
            await rconService.execute(serverId, `AdminKick "${steamId}" Forbidden language`);
            await rconService.execute(serverId, `AdminWarn "${steamId}" Language violation`);
          }
        }
      }
    });
  }

  public updatePlayerCache(serverId: string, players: any[]) {
    const teamMap = new Map<string, string>();
    players.forEach(p => {
      if (p.steamId) teamMap.set(p.steamId, p.teamId);
    });
    this.playerTeamCache.set(serverId, teamMap);
  }

  public async handleEvent(event: ParsedLog, serverId: string) {
    for (const rule of this.rules) {
      if (rule.enabled && rule.onEvent) {
        try {
          await rule.onEvent(event, serverId);
        } catch (error) {
          console.error(`Error executing rule ${rule.name}:`, error);
        }
      }
    }
  }

  private tkTracker: Map<string, number> = new Map(); // serverId:steamId -> count

  private async handleTeamKill(event: ParsedLog, serverId: string) {
    const { attackerSteamId, victimSteamId, attackerName, victimName } = event.payload;
    
    // Ignore self-kill (suicide)
    if (attackerSteamId === victimSteamId) return;

    // Check teams
    const teamMap = this.playerTeamCache.get(serverId);
    if (!teamMap) return; // No cache, can't verify

    const attackerTeam = teamMap.get(attackerSteamId);
    const victimTeam = teamMap.get(victimSteamId);

    // If both known and same team
    if (attackerTeam && victimTeam && attackerTeam === victimTeam) {
      const key = `${serverId}:${attackerSteamId}`;
      const count = (this.tkTracker.get(key) || 0) + 1;
      this.tkTracker.set(key, count);

      console.log(`[Rule] TeamKill detected: ${attackerName} -> ${victimName} (Count: ${count})`);

      if (count === 1) {
        await rconService.execute(serverId, `AdminWarn "${attackerSteamId}" WARNING: TeamKilling is not allowed!`);
      } else if (count >= 2) {
        await rconService.execute(serverId, `AdminKick "${attackerSteamId}" Auto-Kick: Excessive TeamKilling`);
        // Reset count after kick?
        this.tkTracker.delete(key);
      }
    }
  }
}

export default new RuleService();
