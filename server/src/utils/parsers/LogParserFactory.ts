import { BaseLogParser, ParsedSystemLog } from './BaseLogParser';
import { JsonLogParser } from './JsonLogParser';
import { RegexLogParser } from './RegexLogParser';
import { CommonLogParser } from './CommonLogParser';

export type ParserType = 'json' | 'syslog' | 'common' | 'regex';

export class LogParserFactory {
  static createParser(type: ParserType, config?: any): BaseLogParser {
    switch (type) {
      case 'json':
        return new JsonLogParser(config);
      case 'common':
        return new CommonLogParser(config);
      case 'regex':
        if (!config?.regex) {
          throw new Error('Regex parser requires a regex pattern');
        }
        return new RegexLogParser(new RegExp(config.regex), config.mapping);
      case 'syslog':
        // Syslog is often complex, for now we can use a regex parser with standard syslog pattern
        // <PRI>TIMESTAMP HOSTNAME APP-NAME PROCID MSGID MSG
        // Example: <34>1 2003-10-11T22:14:15.003Z mymachine.example.com su - ID47 - BOM'su root' failed for lonvick on /dev/pts/8
        const SYSLOG_REGEX = /<(?<pri>\d+)>(?<version>\d+)?\s*(?<timestamp>\S+)\s+(?<hostname>\S+)\s+(?<appname>\S+)\s+(?<procid>\S+)?\s*(?<msgid>\S+)?\s*(?<message>.*)/;
        return new RegexLogParser(SYSLOG_REGEX, {
          level: 'pri',
          message: 'message',
          timestamp: 'timestamp',
          category: 'appname'
        });
      default:
        throw new Error(`Unknown parser type: ${type}`);
    }
  }
}
