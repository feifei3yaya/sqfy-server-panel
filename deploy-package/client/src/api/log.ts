import client from './client';

export interface Log {
  id: string;
  serverId: string;
  type: string;
  content: string;
  timestamp: string;
  server?: {
    name: string;
  };
}

export interface LogResponse {
  data: Log[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getLogs = (params: {
  serverId?: string;
  type?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => client.get<LogResponse>('/logs', { params });
