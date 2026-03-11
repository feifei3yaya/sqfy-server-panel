import client from './client';

export interface Broadcast {
  id: string;
  serverId: string;
  content: string;
  interval: number;
  enabled: boolean;
  lastRun?: string;
}

export const getBroadcasts = (serverId: string) => client.get<Broadcast[]>(`/broadcasts/${serverId}`);
export const createBroadcast = (data: { serverId: string; content: string; interval: number; enabled: boolean }) => client.post<Broadcast>('/broadcasts', data);
export const updateBroadcast = (id: string, data: { content?: string; interval?: number; enabled?: boolean }) => client.put<Broadcast>(`/broadcasts/${id}`, data);
export const deleteBroadcast = (id: string) => client.delete(`/broadcasts/${id}`);
