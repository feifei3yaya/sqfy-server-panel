import { BaseLogParser, ParsedSystemLog } from './BaseLogParser';

export class JsonLogParser extends BaseLogParser {
  parse(line: string): ParsedSystemLog | null {
    try {
      const json = JSON.parse(line);
      
      const level = json[this.config.mapping?.level || 'level'] || 'info';
      const message = json[this.config.mapping?.message || 'message'] || json.msg || '';
      const timestampRaw = json[this.config.mapping?.timestamp || 'timestamp'] || json.time;
      const category = json[this.config.mapping?.category || 'category'] || 'application';

      const timestamp = timestampRaw ? new Date(timestampRaw) : new Date();

      // Remove already mapped fields from metadata
      const metadata = { ...json };
      delete metadata[this.config.mapping?.level || 'level'];
      delete metadata[this.config.mapping?.message || 'message'];
      delete metadata[this.config.mapping?.timestamp || 'timestamp'];
      delete metadata.msg;
      delete metadata.time;

      return {
        level: this.mapLevel(String(level)),
        category: String(category),
        message: String(message),
        metadata,
        timestamp: isNaN(timestamp.getTime()) ? new Date() : timestamp,
      };
    } catch (e) {
      // Not a valid JSON line
      return null;
    }
  }
}
