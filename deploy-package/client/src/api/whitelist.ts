import client from './client';

export interface Whitelist {
  id: string;
  steamId: string;
  serverId: string;
  expiresAt?: string;
  comment?: string;
  createdAt: string;
  server?: {
    id: string;
    name: string;
  };
  player?: {
    nameHistory: string;
  };
}

export const getWhitelist = (serverId?: string) => 
  client.get<Whitelist[]>(serverId ? `/whitelist?serverId=${serverId}` : '/whitelist');

export const addWhitelist = (data: { steamId: string; serverId: string; expiresAt?: string; comment?: string; name?: string }) => 
  client.post<Whitelist>('/whitelist', data);

export const removeWhitelist = (id: string) => 
  client.delete(`/whitelist/${id}`);
