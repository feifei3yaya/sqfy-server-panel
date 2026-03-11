import { BaseLogParser, ParsedSystemLog } from './BaseLogParser';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

// Common Log Format (CLF)
// 127.0.0.1 - frank [10/Oct/2000:13:55:36 -0700] "GET /apache_pb.gif HTTP/1.0" 200 2326
const CLF_REGEX = /^(?<remote_addr>[\d.]+) - (?<remote_user>\S+) \[(?<timestamp>[^\]]+)\] "(?<method>\S+) (?<url>\S+) (?<protocol>[^"]+)" (?<status>\d+) (?<body_bytes_sent>\d+)(?: "(?<http_referer>[^"]*)" "(?<http_user_agent>[^"]*)")?/;

export class CommonLogParser extends BaseLogParser {
  parse(line: string): ParsedSystemLog | null {
    const match = line.match(CLF_REGEX);
    if (!match || !match.groups) return null;

    const { timestamp, method, url, status, protocol, ...rest } = match.groups;
    
    // Parse timestamp: 10/Oct/2000:13:55:36 -0700
    // Format: DD/MMM/YYYY:HH:mm:ss ZZ
    const ts = dayjs(timestamp, 'DD/MMM/YYYY:HH:mm:ss ZZ');
    
    const statusCode = parseInt(status);
    let level = 'info';
    if (statusCode >= 500) level = 'error';
    else if (statusCode >= 400) level = 'warn';

    return {
      level: level,
      category: 'access_log',
      message: `${method} ${url} ${statusCode}`,
      metadata: { 
        ...rest, 
        method,
        url,
        protocol,
        status: statusCode,
        originalTimestamp: timestamp 
      },
      timestamp: ts.isValid() ? ts.toDate() : new Date(),
    };
  }
}
