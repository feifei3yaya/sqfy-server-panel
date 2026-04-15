import fs from 'fs';
import { Server as SocketIOServer } from 'socket.io';
import { prisma, toJson } from '../utils/prisma';
import { LogParser, ParsedLog } from '../utils/logParser';
import rconService from './rconService';
import ruleService from './ruleService';
import discordService from './discordService';
import gameStateService from './gameStateService';

class LogWatcherService {
  private static instance: LogWatcherService;
  private io: SocketIOServer | null = null;
  private activeMatches: Map<string, string> = new Map();
  
  // Server ID -> { timer: NodeJS.Timeout, isProcessing: boolean, incompleteLine: string }
  private watchers: Map<string, { 
    timer: NodeJS.Timeout | null, 
    isProcessing: boolean, 
    incompleteLine: string 
  }> = new Map();

  private constructor() {}

  public static getInstance(): LogWatcherService {
    if (!LogWatcherService.instance) {
      LogWatcherService.instance = new LogWatcherService();
    }
    return LogWatcherService.instance;
  }

  public setIO(io: SocketIOServer) {
    this.io = io;
  }

  /**
   * Start watching a log file for a specific server using polling and offset tracking
   */
  public async watch(filePath: string, serverId: string) {
    // Stop existing watcher
    this.stop(serverId);

    // Initialize watcher state in memory
    this.watchers.set(serverId, {
      timer: null,
      isProcessing: false,
      incompleteLine: ''
    });

    // Start polling loop
    const poll = async () => {
      const watcher = this.watchers.get(serverId);
      if (!watcher) return; // Stopped

      if (watcher.isProcessing) {
        // Skip this tick if still processing previous batch
        watcher.timer = setTimeout(poll, 500); 
        return;
      }

      watcher.isProcessing = true;

      try {
        await this.checkAndRead(filePath, serverId, watcher);
      } catch (error) {
        console.error(`Error polling log file for server ${serverId}:`, error);
      } finally {
        watcher.isProcessing = false;
        if (this.watchers.has(serverId)) {
          watcher.timer = setTimeout(poll, 500);
        }
      }
    };

    // Initial delay
    this.watchers.get(serverId)!.timer = setTimeout(poll, 100);
    console.log(`Started robust log watcher for server ${serverId} at ${filePath}`);
  }

  public stop(serverId: string) {
    const watcher = this.watchers.get(serverId);
    if (watcher && watcher.timer) {
      clearTimeout(watcher.timer);
    }
    this.watchers.delete(serverId);
  }

  public stopAll() {
    for (const serverId of this.watchers.keys()) {
      this.stop(serverId);
    }
  }

  private async checkAndRead(filePath: string, serverId: string, watcherState: { incompleteLine: string }) {
    // 1. Get LogState from DB
    let logState = await prisma.logState.findUnique({ where: { serverId } });
    
    if (!logState) {
      logState = await prisma.logState.create({
        data: {
          serverId,
          filePath,
          inode: 0,
          size: 0,
          lastRead: 0
        }
      });
    }

    // 2. Check file stats
    if (!fs.existsSync(filePath)) {
      // File missing, maybe server stopped or rotating
      return;
    }

    const stats = fs.statSync(filePath);
    const currentInode = BigInt(stats.ino); // Ensure BigInt
    const currentSize = BigInt(stats.size);
    const lastRead = logState.lastRead;
    const lastInode = logState.inode;

    let startOffset = lastRead;

    // 3. Detect Rotation or Truncation
    if (currentInode !== lastInode || currentSize < lastRead) {
      console.log(`Log rotation detected for server ${serverId}. Resetting offset.`);
      startOffset = BigInt(0);
      watcherState.incompleteLine = ''; // Clear incomplete buffer
      
      // Update DB state to reflect rotation reset
      await prisma.logState.update({
        where: { serverId },
        data: { inode: currentInode, size: BigInt(0), lastRead: BigInt(0) }
      });
    }

    if (currentSize <= startOffset && startOffset !== BigInt(0)) {
        // Only return if we are NOT at the start (because if we reset to 0, and size is > 0, we must read)
        // If startOffset is 0, currentSize <= 0 means empty file, so return.
        if (currentSize === BigInt(0)) return;
        
        // If currentSize > 0 and startOffset is 0, we proceed.
        // If currentSize <= startOffset (and startOffset > 0), nothing new.
        
        if (currentInode !== lastInode) {
             await prisma.logState.update({
              where: { serverId },
              data: { inode: currentInode, size: currentSize, lastRead: currentSize }
            });
        }
        return;
    }

    // 4. Read new content
    let diff = Number(currentSize - startOffset);
    if (diff < 0) {
        // Fallback for cases where rotation was missed in step 3
        startOffset = BigInt(0);
        diff = Number(currentSize);
        // Reset incomplete line buffer if we are resetting offset
        watcherState.incompleteLine = '';
    }
    
    if (diff === 0) {
        // Check if file was truncated to 0 but we missed it in step 3
        if (currentSize === BigInt(0) && startOffset > BigInt(0)) {
             startOffset = BigInt(0);
             watcherState.incompleteLine = '';
             await prisma.logState.update({
                where: { serverId },
                data: { inode: currentInode, size: BigInt(0), lastRead: BigInt(0) }
             });
        }
        return;
    }

    // Limit chunk size to avoid memory issues (e.g., 10MB)
    const CHUNK_SIZE = 10 * 1024 * 1024; 
    const readSize = Math.min(diff, CHUNK_SIZE);
    
    const buffer = Buffer.alloc(readSize);
    const fd = fs.openSync(filePath, 'r');
    
    try {
      fs.readSync(fd, buffer, 0, readSize, Number(startOffset));
    } finally {
      fs.closeSync(fd);
    }

    const newContent = buffer.toString('utf-8');
    const fullContent = watcherState.incompleteLine + newContent;
    const lines = fullContent.split(/\r?\n/);

    // 5. Handle incomplete last line
    // If the last character is not a newline, the last line is incomplete.
    // However, split logic: if text ends with \n, last element is empty string.
    // If text does NOT end with \n, last element is the partial line.
    
    // Check if original content ended with newline
    const endsWithNewline = newContent.endsWith('\n');
    
    if (!endsWithNewline) {
      watcherState.incompleteLine = lines.pop() || '';
    } else {
      watcherState.incompleteLine = '';
      if (lines.length > 0 && lines[lines.length - 1] === '') {
        lines.pop(); // Remove empty trailing line from split
      }
    }

    // 6. Process lines
    const logsToSave: any[] = [];
    
    for (const line of lines) {
      if (!this.watchers.has(serverId)) {
        return;
      }
      // Don't trim immediately, check if it's empty
      if (line.length === 0) continue; 
      
      const parsed = LogParser.parse(line);
      
      // Even "unknown" logs should be saved if they have content, to ensure integrity.
      // LogParser returns UNKNOWN type if no regex matches, but raw line is preserved.
      
      logsToSave.push({
        serverId,
        type: parsed.type.toLowerCase(),
        content: line,
        timestamp: parsed.timestamp // Use parsed timestamp
      });

      // Broadcast immediately (or batch emit?)
      this.io?.to(`server:${serverId}`).emit('log', {
        serverId,
        type: parsed.type.toLowerCase(),
        content: line,
        timestamp: parsed.timestamp
      });

      // Handle events asynchronously
      this.handleParsedEvent(parsed, serverId);
    }

    // 7. Batch Insert
    if (!this.watchers.has(serverId)) {
      return;
    }
    if (logsToSave.length > 0) {
      // Use createMany for SQLite (supported in newer Prisma)
      // Note: SQLite limits variables. Splitting might be needed for huge batches.
      // But we capped readSize to 10MB, which could be 100k lines.
      // Better to split into chunks of 1000.
      const BATCH_SIZE = 500;
      for (let i = 0; i < logsToSave.length; i += BATCH_SIZE) {
        const batch = logsToSave.slice(i, i + BATCH_SIZE);
        await prisma.log.createMany({
          data: batch
        });
      }
    }

    // 8. Update State
    if (!this.watchers.has(serverId)) {
      return;
    }
    const newOffset = startOffset + BigInt(readSize);
    await prisma.logState.update({
      where: { serverId },
      data: {
        inode: currentInode,
        size: currentSize, // Update to actual file size, though we might not have read it all if capped
        lastRead: newOffset
      }
    });
  }

  private async handleParsedEvent(parsed: ParsedLog, serverId: string) {
    try {
      // Update Game State
      gameStateService.handleLogEvent(serverId, parsed);

      await ruleService.handleEvent(parsed, serverId);
      await discordService.sendLog(serverId, parsed.type, parsed.payload);

      if (parsed.type === 'KILL') await this.handleKillEvent(parsed, serverId);
      else if (parsed.type === 'CHAT') await this.handleChatEvent(parsed, serverId);
      else if (parsed.type === 'ADMIN') await this.handleAdminEvent(parsed, serverId);
      else if (parsed.type === 'POS') await this.handlePosEvent(parsed, serverId);
      else if (parsed.type === 'POST_LOGIN') await this.handlePostLoginEvent(parsed, serverId);
      else if (parsed.type === 'MATCH_START') await this.handleMatchStartEvent(parsed, serverId);
      else if (parsed.type === 'MATCH_WINNER') await this.handleMatchWinnerEvent(parsed, serverId);
      else if (parsed.type === 'VEHICLE_DESTROY') await this.handleVehicleDestroyEvent(parsed, serverId);
      else if (parsed.type === 'DEPLOYABLE_DAMAGE') await this.handleDeployableDamageEvent(parsed, serverId);
    } catch (e) {
      console.error('Error handling parsed event:', e);
    }
  }

  // ... (Keep existing handler methods: handleKillEvent, etc.) ...
  private async getActiveMatchId(serverId: string): Promise<string | null> {
    if (this.activeMatches.has(serverId)) {
      return this.activeMatches.get(serverId)!;
    }
    const match = await prisma.match.findFirst({
      where: { serverId, endTime: null },
      orderBy: { startTime: 'desc' }
    });
    if (match) {
      this.activeMatches.set(serverId, match.id);
      return match.id;
    }
    return null;
  }

  private async handleKillEvent(parsed: ParsedLog, serverId: string) {
    const matchId = await this.getActiveMatchId(serverId);
    await prisma.gameEvent.create({
      data: {
        serverId,
        matchId,
        type: 'KILL',
        data: toJson(parsed.payload),
        timestamp: parsed.timestamp
      }
    });
    this.io?.to(`server:${serverId}`).emit('gameEvent', {
      type: 'KILL',
      data: parsed.payload
    });
  }

  private async handleChatEvent(parsed: ParsedLog, serverId: string) {
    this.io?.to(`server:${serverId}`).emit('chatMessage', parsed.payload);
  }

  private async handleAdminEvent(parsed: ParsedLog, serverId: string) {
    const matchId = await this.getActiveMatchId(serverId);
    await prisma.gameEvent.create({
      data: {
        serverId,
        matchId,
        type: 'ADMIN_COMMAND',
        data: toJson(parsed.payload),
        timestamp: parsed.timestamp
      }
    });
    this.io?.to(`server:${serverId}`).emit('adminEvent', parsed.payload);
  }

  private async handlePosEvent(parsed: ParsedLog, serverId: string) {
    this.io?.to(`server:${serverId}`).emit('playerPos', parsed.payload);
  }

  private async handlePostLoginEvent(parsed: ParsedLog, serverId: string) {
    const { name, steamId } = parsed.payload;
    try {
      const server = await prisma.server.findUnique({
        where: { id: serverId },
        select: { welcomeMessage: true, name: true }
      });
      if (server && server.welcomeMessage) {
        let message = server.welcomeMessage
          .replace('{PlayerName}', name)
          .replace('{SteamID}', steamId)
          .replace('{ServerName}', server.name);
        await rconService.execute(serverId, `AdminWarn "${steamId}" ${message}`);
      }
    } catch (error) {
      console.error(`Failed to send welcome message to ${name}:`, error);
    }
  }

  private async handleMatchStartEvent(parsed: ParsedLog, serverId: string) {
    const { layerClass } = parsed.payload;
    const lastMatch = await prisma.match.findFirst({
      where: { serverId, endTime: null },
      orderBy: { startTime: 'desc' }
    });
    if (lastMatch) {
      await prisma.match.update({
        where: { id: lastMatch.id },
        data: { endTime: new Date(), winner: 'Draw (Interrupted)' }
      });
    }
    const newMatch = await prisma.match.create({
      data: {
        serverId,
        map: layerClass,
        startTime: parsed.timestamp,
      }
    });
    this.activeMatches.set(serverId, newMatch.id);
  }

  private async handleMatchWinnerEvent(parsed: ParsedLog, serverId: string) {
    const { winnerTeamId } = parsed.payload;
    const currentMatch = await prisma.match.findFirst({
      where: { serverId, endTime: null },
      orderBy: { startTime: 'desc' }
    });
    if (currentMatch) {
      const winnerName = `Team ${winnerTeamId}`;
      await prisma.match.update({
        where: { id: currentMatch.id },
        data: {
          endTime: parsed.timestamp,
          winner: winnerName
        }
      });
      this.activeMatches.delete(serverId);
    }
  }

  private async handleVehicleDestroyEvent(parsed: ParsedLog, serverId: string) {
    const matchId = await this.getActiveMatchId(serverId);
    await prisma.gameEvent.create({
      data: {
        serverId,
        matchId,
        type: 'VEHICLE_DESTROY',
        data: toJson(parsed.payload),
        timestamp: parsed.timestamp
      }
    });
  }

  private async handleDeployableDamageEvent(parsed: ParsedLog, serverId: string) {
    const matchId = await this.getActiveMatchId(serverId);
    await prisma.gameEvent.create({
      data: {
        serverId,
        matchId,
        type: 'DEPLOYABLE_DAMAGE',
        data: toJson(parsed.payload),
        timestamp: parsed.timestamp
      }
    });
  }
}

export default LogWatcherService.getInstance();
