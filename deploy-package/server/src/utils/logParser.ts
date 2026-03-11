import dayjs from 'dayjs';

export interface ParsedLog {
  type: 'KILL' | 'WOUND' | 'REVIVE' | 'CHAT' | 'ADMIN' | 'POS' | 'CONNECT' | 'DISCONNECT' | 'POST_LOGIN' | 'MATCH_START' | 'MATCH_WINNER' | 'VEHICLE_DESTROY' | 'DEPLOYABLE_DAMAGE' | 'UNKNOWN';
  payload: any;
  timestamp: Date;
  raw: string;
  metadata?: {
    frame?: number;
    category?: string;
    threadId?: string;
  };
}

export class LogParser {
  // [2023.10.27-12.34.56:789][123]LogCategory: Message
  private static METADATA_REGEX = /^\[([0-9.:-]+)\]\[\s*([0-9]+)\]([^:]+):/;
  
  // LogSquad: Player: Name (Steam ID: 76561198000000000) has been killed by Name (Steam ID: 76561198000000000) with Weapon
  private static KILL_REGEX = /LogSquad: Player: (.+?) \(Steam ID: (\d+)\) has been killed by (.+?) \(Steam ID: (\d+)\) with (.+)/;
  
  // LogSquad: Player: Name (Steam ID: 76561198000000000) has been wounded by Name (Steam ID: 76561198000000000) with Weapon
  private static WOUND_REGEX = /LogSquad: Player: (.+?) \(Steam ID: (\d+)\) has been wounded by (.+?) \(Steam ID: (\d+)\) with (.+)/;
  
  // LogSquad: Chat: Name (Steam ID: 76561198000000000): Message
  private static CHAT_REGEX = /LogSquad: Chat: (.+?) \(Steam ID: (\d+)\): (.+)/;
  
  // LogSquad: ADMIN COMMAND: Command executed by Name (Steam ID: 76561198000000000)
  private static ADMIN_REGEX = /LogSquad: ADMIN COMMAND: (.+?) executed by (.+?) \(Steam ID: (\d+)\)/;

  // LogNet: Join succeeded: Name
  private static CONNECT_REGEX = /LogNet: Join succeeded: (.+)/;

  // LogSquad: PostLogin: NewPlayer: Name (IP: 127.0.0.1, SteamID: 76561198000000000)
  private static POST_LOGIN_REGEX = /LogSquad: PostLogin: NewPlayer: (.+?) \(IP: .+, SteamID: (\d+)\)/;

  // LogWorld: BringUpWorld:/Game/Maps/Gorodok/Gorodok_RAAS_v1.Gorodok_RAAS_v1
  private static MATCH_START_REGEX = /LogWorld: BringUpWorld:.+\/([^\.]+)\./;

  // LogSquadTrace: [DedicatedServer]ASQGameMode::DetermineMatchWinner: Winner is Team 1
  private static MATCH_WINNER_REGEX = /LogSquadTrace: \[DedicatedServer\]ASQGameMode::DetermineMatchWinner: Winner is Team (\d+)/;

  // LogSquadTrace: [DedicatedServer]ASQVehicle::Die(): Vehicle: BP_BTR80_C_0 (Team 2) died. Last damage by Player: Name (Steam ID: 76561198000000000) with Weapon: BP_M4_C
  private static VEHICLE_DESTROY_REGEX = /LogSquadTrace: \[DedicatedServer\]ASQVehicle::Die\(\): Vehicle: (.+?) \(Team (\d+)\) died\.(?: Last damage by Player: (.+?) \(Steam ID: (\d+)\) with Weapon: (.+))?/;

  // LogSquadTrace: [DedicatedServer]ASQDeployable::TakeDamage(): Deployable: BP_FOB_Radio_C_0 (Team 1) took 50.000000 damage from Player: Name (Steam ID: 76561198000000000) with Weapon: BP_CombatKnife_C
  private static DEPLOYABLE_DAMAGE_REGEX = /LogSquadTrace: \[DedicatedServer\]ASQDeployable::TakeDamage\(\): Deployable: (.+?) \(Team (\d+)\) took ([0-9.]+) damage from Player: (.+?) \(Steam ID: (\d+)\) with Weapon: (.+)/;

  // LogSquad: Player: Name (Steam ID: 76561198000000000) has been revived by Name (Steam ID: 76561198000000000)
  private static REVIVE_REGEX = /LogSquad: Player: (.+?) \(Steam ID: (\d+)\) has been revived by (.+?) \(Steam ID: (\d+)\)/;

  // LogNet: UChannel::Close: Sending CloseBunch. ChIndex == [0-9]+. Name: [UChannel] ChIndex: [0-9]+, Closing: [0-9]+ [UNetConnection] RemoteAddr: (.+):[0-9]+, Name: (.+), Driver: GameNetDriver/
  private static DISCONNECT_REGEX = /LogNet: UChannel::Close: .+ Name: (.+), Driver: GameNetDriver/;

  // Custom regex for position tracking
  private static POS_REGEX = /LogSquadTrace: \[DedicatedServer\]Player (.+?) \(Steam ID: (\d+)\) saved location: X=([0-9.-]+) Y=([0-9.-]+) Z=([0-9.-]+)/;

  static parse(line: string): ParsedLog {
    const metaMatch = line.match(this.METADATA_REGEX);
    let timestamp = new Date();
    let frame = 0;
    let category = 'Unknown';

    if (metaMatch) {
      const rawTs = metaMatch[1];
      frame = parseInt(metaMatch[2]);
      category = metaMatch[3];
      
      try {
        const parts = rawTs.split('-');
        const datePart = parts[0].replace(/\./g, '-');
        
        // Handle time part: HH.MM.SS:MS or HH:MM:SS.MS
        let timePart = parts[1];
        // Ensure MS separator is '.'
        if (timePart.includes(':')) {
            const lastColon = timePart.lastIndexOf(':');
            timePart = timePart.substring(0, lastColon).replace(/\./g, ':') + '.' + timePart.substring(lastColon + 1);
        } else {
            timePart = timePart.replace(/\./g, ':');
        }
        
        timestamp = new Date(`${datePart}T${timePart}Z`);
        if (isNaN(timestamp.getTime())) {
            timestamp = new Date();
        }
      } catch (e) {
        timestamp = new Date();
      }
    } else {
      const timestampMatch = line.match(/^\[([0-9.:-]+)\]/);
      if (timestampMatch) {
        const rawTs = timestampMatch[1];
        try {
          const parts = rawTs.split('-');
          const datePart = parts[0].replace(/\./g, '-');
          
          let timePart = parts[1];
          if (timePart.includes(':')) {
              const lastColon = timePart.lastIndexOf(':');
              timePart = timePart.substring(0, lastColon).replace(/\./g, ':') + '.' + timePart.substring(lastColon + 1);
          } else {
              timePart = timePart.replace(/\./g, ':');
          }

          timestamp = new Date(`${datePart}T${timePart}Z`);
          if (isNaN(timestamp.getTime())) {
              timestamp = new Date();
          }
        } catch(e) {
            timestamp = new Date();
        }
      }
    }

    const baseLog = {
      timestamp,
      raw: line,
      metadata: { frame, category }
    };

    const killMatch = line.match(this.KILL_REGEX);
    if (killMatch) {
      return {
        ...baseLog,
        type: 'KILL',
        payload: {
          victimName: killMatch[1],
          victimSteamId: killMatch[2],
          attackerName: killMatch[3],
          attackerSteamId: killMatch[4],
          weapon: killMatch[5]
        }
      };
    }

    const woundMatch = line.match(this.WOUND_REGEX);
    if (woundMatch) {
      return {
        ...baseLog,
        type: 'WOUND',
        payload: {
          victimName: woundMatch[1],
          victimSteamId: woundMatch[2],
          attackerName: woundMatch[3],
          attackerSteamId: woundMatch[4],
          weapon: woundMatch[5]
        }
      };
    }

    const reviveMatch = line.match(this.REVIVE_REGEX);
    if (reviveMatch) {
      return {
        ...baseLog,
        type: 'REVIVE',
        payload: {
          victimName: reviveMatch[1],
          victimSteamId: reviveMatch[2],
          reviverName: reviveMatch[3],
          reviverSteamId: reviveMatch[4]
        }
      };
    }

    const chatMatch = line.match(this.CHAT_REGEX);
    if (chatMatch) {
      return {
        ...baseLog,
        type: 'CHAT',
        payload: {
          senderName: chatMatch[1],
          steamId: chatMatch[2],
          message: chatMatch[3]
        }
      };
    }

    const adminMatch = line.match(this.ADMIN_REGEX);
    if (adminMatch) {
      return {
        ...baseLog,
        type: 'ADMIN',
        payload: {
          command: adminMatch[1],
          adminName: adminMatch[2],
          steamId: adminMatch[3]
        }
      };
    }

    const posMatch = line.match(this.POS_REGEX);
    if (posMatch) {
      return {
        ...baseLog,
        type: 'POS',
        payload: {
          name: posMatch[1],
          steamId: posMatch[2],
          x: parseFloat(posMatch[3]),
          y: parseFloat(posMatch[4]),
          z: parseFloat(posMatch[5])
        }
      };
    }

    const connectMatch = line.match(this.CONNECT_REGEX);
    if (connectMatch) {
      return {
        ...baseLog,
        type: 'CONNECT',
        payload: {
          name: connectMatch[1]
        }
      };
    }

    const postLoginMatch = line.match(this.POST_LOGIN_REGEX);
    if (postLoginMatch) {
      return {
        ...baseLog,
        type: 'POST_LOGIN',
        payload: {
          name: postLoginMatch[1],
          steamId: postLoginMatch[2]
        }
      };
    }

    const matchStartMatch = line.match(this.MATCH_START_REGEX);
    if (matchStartMatch) {
      return {
        ...baseLog,
        type: 'MATCH_START',
        payload: {
          layerClass: matchStartMatch[1]
        }
      };
    }

    const matchWinnerMatch = line.match(this.MATCH_WINNER_REGEX);
    if (matchWinnerMatch) {
      return {
        ...baseLog,
        type: 'MATCH_WINNER',
        payload: {
          winnerTeamId: matchWinnerMatch[1]
        }
      };
    }

    const vehicleDestroyMatch = line.match(this.VEHICLE_DESTROY_REGEX);
    if (vehicleDestroyMatch) {
      return {
        ...baseLog,
        type: 'VEHICLE_DESTROY',
        payload: {
          vehicle: vehicleDestroyMatch[1],
          teamId: vehicleDestroyMatch[2],
          attackerName: vehicleDestroyMatch[3] || null,
          attackerSteamId: vehicleDestroyMatch[4] || null,
          weapon: vehicleDestroyMatch[5] || null
        }
      };
    }

    const deployableDamageMatch = line.match(this.DEPLOYABLE_DAMAGE_REGEX);
    if (deployableDamageMatch) {
      return {
        ...baseLog,
        type: 'DEPLOYABLE_DAMAGE',
        payload: {
          deployable: deployableDamageMatch[1],
          teamId: deployableDamageMatch[2],
          damage: parseFloat(deployableDamageMatch[3]),
          attackerName: deployableDamageMatch[4],
          attackerSteamId: deployableDamageMatch[5],
          weapon: deployableDamageMatch[6]
        }
      };
    }

    return {
      ...baseLog,
      type: 'UNKNOWN',
      payload: {}
    };
  }
}