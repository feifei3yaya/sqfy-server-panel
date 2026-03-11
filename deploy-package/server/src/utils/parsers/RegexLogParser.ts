import { BaseLogParser, ParsedSystemLog } from './BaseLogParser';

export class RegexLogParser extends BaseLogParser {
  private regex: RegExp;
  private mapping: Record<string, string>;

  constructor(regex: RegExp, mapping: Record<string, string> = {}) {
    super();
    this.regex = regex;
    this.mapping = mapping;
  }

  parse(line: string): ParsedSystemLog | null {
    const match = line.match(this.regex);
    if (!match) return null;

    const metadata: Record<string, any> = {};
    const groups = match.groups || {};
    
    // If using named groups in regex
    for (const [key, value] of Object.entries(groups)) {
      metadata[key] = value;
    }

    // If using positional groups, they are harder to map without explicit config
    // We assume named groups for now as it's cleaner in JS regex

    const level = groups[this.mapping.level || 'level'] || 'info';
    const message = groups[this.mapping.message || 'message'] || line;
    const timestampRaw = groups[this.mapping.timestamp || 'timestamp'];
    const category = groups[this.mapping.category || 'category'] || 'system';

    const timestamp = timestampRaw ? new Date(timestampRaw.replace(':', ' ')) : new Date(); // Simple fix for some formats

    // Remove mapped fields from metadata to avoid duplication if desired
    // But for regex, keeping them is usually fine.

    return {
      level: this.mapLevel(level),
      category: category,
      message: message,
      metadata: metadata,
      timestamp: isNaN(timestamp.getTime()) ? new Date() : timestamp,
    };
  }
}
