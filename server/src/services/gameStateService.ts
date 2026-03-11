import { ParsedLog } from '../utils/logParser';

export interface PlayerState {
  steamId: string;
  name: string;
  teamId?: string;
  squadId?: string;
  role?: string;
  isLeader?: boolean;
  
  // Real-time status
  isAlive: boolean;
  isWounded: boolean; // Incapacitated
  
  // Statistics
  kills: number;
  deaths: number;
  
  // Position
  x?: number;
  y?: number;
  z?: number;
  
  lastUpdate: Date;
}

class GameStateService {
  private static instance: GameStateService;
  
  // serverId -> steamId -> PlayerState
  private states: Map<string, Map<string, PlayerState>> = new Map();

  private constructor() {}

  public static getInstance(): GameStateService {
    if (!GameStateService.instance) {
      GameStateService.instance = new GameStateService();
    }
    return GameStateService.instance;
  }

  public getPlayerStates(serverId: string): PlayerState[] {
    const serverState = this.states.get(serverId);
    if (!serverState) return [];
    return Array.from(serverState.values());
  }

  public updateFromRcon(serverId: string, rconPlayers: any[]) {
    let serverState = this.states.get(serverId);
    if (!serverState) {
      serverState = new Map();
      this.states.set(serverId, serverState);
    }

    const currentSteamIds = new Set<string>();

    for (const p of rconPlayers) {
      currentSteamIds.add(p.steamId);
      
      const existing = serverState.get(p.steamId);
      if (existing) {
        // Update existing
        existing.name = p.name;
        existing.teamId = p.teamId;
        existing.squadId = p.squadId;
        existing.role = p.role || existing.role; // RCON might not always have role
        existing.isLeader = p.isLeader;
        existing.lastUpdate = new Date();
      } else {
        // Create new
        serverState.set(p.steamId, {
          steamId: p.steamId,
          name: p.name,
          teamId: p.teamId,
          squadId: p.squadId,
          role: p.role,
          isLeader: p.isLeader,
          isAlive: true, // Default to alive on join/discovery
          isWounded: false,
          kills: 0,
          deaths: 0,
          lastUpdate: new Date()
        });
      }
    }

    // Remove stale players (disconnected)
    // We only remove if they are NOT in the current RCON list
    for (const steamId of serverState.keys()) {
      if (!currentSteamIds.has(steamId)) {
        serverState.delete(steamId);
      }
    }
  }

  public handleLogEvent(serverId: string, log: ParsedLog) {
    let serverState = this.states.get(serverId);
    if (!serverState) {
      serverState = new Map();
      this.states.set(serverId, serverState);
    }

    switch (log.type) {
      case 'WOUND': {
        const { victimSteamId, victimName } = log.payload;
        this.updatePlayerStatus(serverId, victimSteamId, victimName, { isAlive: true, isWounded: true });
        break;
      }
      case 'KILL': {
        const { victimSteamId, victimName, attackerSteamId, attackerName } = log.payload;
        // 更新受害者状态
        this.updatePlayerStatus(serverId, victimSteamId, victimName, { isAlive: false, isWounded: false });
        // 增加攻击者击杀数
        this.incrementKills(serverId, attackerSteamId, attackerName);
        // 增加受害者死亡数
        this.incrementDeaths(serverId, victimSteamId, victimName);
        break;
      }
      case 'REVIVE': {
        const { victimSteamId, victimName } = log.payload;
        this.updatePlayerStatus(serverId, victimSteamId, victimName, { isAlive: true, isWounded: false });
        break;
      }
      case 'POS': {
        const { steamId, name, x, y, z } = log.payload;
        this.updatePlayerStatus(serverId, steamId, name, { x, y, z });
        break;
      }
      case 'POST_LOGIN': {
        const { steamId, name } = log.payload;
        // Just ensure existence
        if (!serverState.has(steamId)) {
          this.updatePlayerStatus(serverId, steamId, name, { isAlive: true, isWounded: false });
        }
        break;
      }
      case 'DISCONNECT': {
        // We might not have SteamID in DISCONNECT log reliably, so we rely on RCON polling to cleanup.
        // But if we parsed name, we could try to find by name (risky if duplicate names).
        break;
      }
    }
  }

  private updatePlayerStatus(serverId: string, steamId: string, name: string, updates: Partial<PlayerState>) {
    const serverState = this.states.get(serverId)!;
    const player = serverState.get(steamId);

    if (player) {
      Object.assign(player, updates);
      player.lastUpdate = new Date();
    } else {
      // If we receive a log event for a player not in RCON list yet (race condition), create them
      serverState.set(steamId, {
        steamId,
        name,
        isAlive: true,
        isWounded: false,
        kills: 0,
        deaths: 0,
        lastUpdate: new Date(),
        ...updates
      });
    }
  }

  private incrementKills(serverId: string, steamId: string, name: string) {
    const serverState = this.states.get(serverId);
    if (!serverState) return;
    
    const player = serverState.get(steamId);
    if (player) {
      player.kills = (player.kills || 0) + 1;
      player.lastUpdate = new Date();
    } else {
      serverState.set(steamId, {
        steamId,
        name,
        isAlive: true,
        isWounded: false,
        kills: 1,
        deaths: 0,
        lastUpdate: new Date()
      });
    }
  }

  private incrementDeaths(serverId: string, steamId: string, name: string) {
    const serverState = this.states.get(serverId);
    if (!serverState) return;
    
    const player = serverState.get(steamId);
    if (player) {
      player.deaths = (player.deaths || 0) + 1;
      player.lastUpdate = new Date();
    } else {
      serverState.set(steamId, {
        steamId,
        name,
        isAlive: true,
        isWounded: false,
        kills: 0,
        deaths: 1,
        lastUpdate: new Date()
      });
    }
  }
}

export default GameStateService.getInstance();
