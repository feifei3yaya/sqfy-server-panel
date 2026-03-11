import client from './client';

export interface SystemLog {
  id: string;
  level: string;
  category: string;
  source: string;
  message: string;
  metadata: string; // JSON string
  timestamp: string;
}

export interface LogStats {
  byLevel: { level: string; _count: { _all: number } }[];
  byCategory: { category: string; _count: { _all: number } }[];
  trend: { time: string; level: string; count: number }[];
}

export interface LogSourceConfig {
  id: string;
  path: string;
  parserType: string;
  parserConfig?: any;
  category: string;
  enabled: boolean;
}

export const getSystemLogs = (params: any) => {
  return client.get<{ data: SystemLog[]; meta: any }>('/system-logs', { params });
};

export const getSystemLogStats = (params: any) => {
  return client.get<LogStats>('/system-logs/stats', { params });
};

export const getLogConfig = () => {
  return client.get<LogSourceConfig[]>('/system-logs/config');
};

export const updateLogConfig = (config: LogSourceConfig[]) => {
  return client.post('/system-logs/config', config);
};
