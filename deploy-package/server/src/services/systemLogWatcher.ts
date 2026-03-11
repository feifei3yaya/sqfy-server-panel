import { Tail } from 'tail';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { Server as SocketIOServer } from 'socket.io';
import { LogParserFactory, ParserType } from '../utils/parsers/LogParserFactory';
import { BaseLogParser } from '../utils/parsers/BaseLogParser';

const prisma = new PrismaClient();

export interface LogSourceConfig {
  id: string;
  path: string;
  parserType: ParserType;
  parserConfig?: any;
  category: string;
  enabled: boolean;
}

class SystemLogWatcherService {
  private static instance: SystemLogWatcherService;
  private watchers: Map<string, Tail> = new Map();
  private parsers: Map<string, BaseLogParser> = new Map();
  private configs: Map<string, LogSourceConfig> = new Map();
  private io: SocketIOServer | null = null;
  private retryTimers: Map<string, NodeJS.Timeout> = new Map();
  private configPath: string;

  private constructor() {
    this.configPath = path.join(process.cwd(), 'config', 'system-logs.json');
    this.ensureConfigDir();
  }

  public static getInstance(): SystemLogWatcherService {
    if (!SystemLogWatcherService.instance) {
      SystemLogWatcherService.instance = new SystemLogWatcherService();
    }
    return SystemLogWatcherService.instance;
  }

  public setIO(io: SocketIOServer) {
    this.io = io;
  }

  private ensureConfigDir() {
    const dir = path.dirname(this.configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  public async start() {
    await this.loadConfig();
  }

  public async loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = await fs.promises.readFile(this.configPath, 'utf-8');
        const configs: LogSourceConfig[] = JSON.parse(data);
        
        // Clear existing
        this.stopAll();
        this.configs.clear();

        for (const config of configs) {
          this.configs.set(config.id, config);
          if (config.enabled) {
            this.watch(config);
          }
        }
        console.log(`Loaded ${configs.length} system log configurations`);
      } else {
        // Create default empty config
        await this.saveConfig([]);
      }
    } catch (error) {
      console.error('Failed to load system log config:', error);
    }
  }

  public async saveConfig(configs: LogSourceConfig[]) {
    try {
      await fs.promises.writeFile(this.configPath, JSON.stringify(configs, null, 2), 'utf-8');
      
      // Reload
      this.stopAll();
      this.configs.clear();
      for (const config of configs) {
        this.configs.set(config.id, config);
        if (config.enabled) {
          this.watch(config);
        }
      }
    } catch (error) {
      console.error('Failed to save system log config:', error);
      throw error;
    }
  }

  public getConfigs(): LogSourceConfig[] {
    return Array.from(this.configs.values());
  }

  public stopAll() {
    for (const [id, watcher] of this.watchers) {
      try {
        watcher.unwatch();
      } catch (e) {}
    }
    this.watchers.clear();
    this.parsers.clear();
    
    for (const [id, timer] of this.retryTimers) {
      clearTimeout(timer);
    }
    this.retryTimers.clear();
  }

  public watch(config: LogSourceConfig) {
    const { id, path: filePath } = config;

    // Cleanup existing
    if (this.retryTimers.has(id)) {
      clearTimeout(this.retryTimers.get(id)!);
      this.retryTimers.delete(id);
    }
    if (this.watchers.has(id)) {
      try {
        this.watchers.get(id)!.unwatch();
      } catch (e) {}
      this.watchers.delete(id);
    }

    if (!fs.existsSync(filePath)) {
      console.warn(`System log file not found: ${filePath}. Retrying in 10 seconds...`);
      const timer = setTimeout(() => this.watch(config), 10000);
      this.retryTimers.set(id, timer);
      return;
    }

    try {
      // Create parser
      const parser = LogParserFactory.createParser(config.parserType, config.parserConfig);
      this.parsers.set(id, parser);

      console.log(`Starting to watch system log: ${filePath} (${config.parserType})`);
      const tail = new Tail(filePath, {
        useWatchFile: true,
        fsWatchOptions: { interval: 1000 },
        follow: true
      });

      tail.on('line', (line: string) => {
        this.processLine(line, config);
      });

      tail.on('error', (error: any) => {
        console.error(`Tail error for ${filePath}:`, error);
        try { tail.unwatch(); } catch (e) {}
        const timer = setTimeout(() => this.watch(config), 5000);
        this.retryTimers.set(id, timer);
      });

      this.watchers.set(id, tail);
    } catch (error) {
      console.error(`Failed to watch system log ${filePath}:`, error);
      const timer = setTimeout(() => this.watch(config), 10000);
      this.retryTimers.set(id, timer);
    }
  }

  private async processLine(line: string, config: LogSourceConfig) {
    if (!line || line.trim() === '') return;

    try {
      const parser = this.parsers.get(config.id);
      if (!parser) return;

      const parsed = parser.parse(line);
      if (parsed) {
        // Save to DB
        const logEntry = await prisma.systemLog.create({
          data: {
            level: parsed.level,
            category: config.category || parsed.category,
            source: config.id, // Use config ID or path as source identifier
            message: parsed.message,
            metadata: JSON.stringify(parsed.metadata),
            timestamp: parsed.timestamp
          }
        });

        // Broadcast
        this.io?.emit('systemLog', {
          ...logEntry,
          sourceName: path.basename(config.path)
        });

      }
    } catch (error) {
      // Silent error for parsing failures to avoid spam
      // console.error('Error processing system log line:', error);
    }
  }
}

export default SystemLogWatcherService.getInstance();
