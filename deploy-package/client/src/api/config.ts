import client from './client';

export const getConfig = (serverId: string, filename: string) => 
  client.get<{ content: string }>(`/servers/${serverId}/config/${filename}`);

export const updateConfig = (serverId: string, filename: string, content: string) => 
  client.post(`/servers/${serverId}/config/${filename}`, { content });
