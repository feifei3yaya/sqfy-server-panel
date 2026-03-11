import client from './client';

export interface Match {
  id: string;
  serverId: string;
  map: string;
  startTime: string;
  endTime?: string;
  winner?: string;
  score?: string;
  server?: {
    name: string;
  };
  _count?: {
    events: number;
  };
}

export const getMatches = (params: { page: number; pageSize: number; search?: string }) => 
  client.get('/matches', { params });

export const getMatchDetail = (id: string) => client.get(`/matches/${id}`);
