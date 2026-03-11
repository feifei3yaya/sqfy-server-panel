export interface ParsedSystemLog {
  level: string; // info, warn, error, debug
  category: string; // system, application, access, error, etc.
  message: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

export interface LogParserConfig {
  format?: string;
  regex?: RegExp;
  timestampFormat?: string;
  mapping?: {
    level?: string;
    message?: string;
    timestamp?: string;
    category?: string;
  };
}

export abstract class BaseLogParser {
  protected config: LogParserConfig;

  constructor(config: LogParserConfig = {}) {
    this.config = config;
  }

  abstract parse(line: string): ParsedSystemLog | null;

  protected mapLevel(level: string): string {
    if (!level) return 'info';
    const l = level.toLowerCase();
    if (l.includes('err') || l.includes('fail')) return 'error';
    if (l.includes('warn')) return 'warn';
    if (l.includes('debug')) return 'debug';
    return 'info';
  }
}
