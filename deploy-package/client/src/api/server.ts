import client from './client';

export interface Server {
  id: string;
  name: string;
  host?: string;
  rconPort?: number;
  rconStatus?: 'connected' | 'disconnected' | 'connecting';
  fileProtocol?: string;
  fileHost?: string;
  filePort?: number;
  filePassword?: string;
  filePath?: string;
  welcomeMessage?: string;
  isPublished?: boolean;
  queryPort?: number;
  currentMap?: string;
  playerCount?: number;
  maxPlayers?: number;
}

export const getServers = () => client.get<Server[]>('/servers');

export const createServer = (data: any) => client.post<Server>('/servers', data);
export const updateServer = (id: string, data: any) => client.put<Server>(`/servers/${id}`, data);
export const deleteServer = (id: string) => client.delete(`/servers/${id}`);
export const testFileConnection = (data: any) => client.post('/servers/test-file-connection', data);
export const testRconConnection = (id: string) => client.post(`/servers/${id}/test-rcon`);

export const getServerMetrics = (id: string, range: string) => client.get(`/servers/${id}/metrics`, { params: { range } });

export const bulkServerAction = (serverIds: string[], action: 'broadcast' | 'command', payload: string) => {
  return client.post('/servers/bulk', { serverIds, action, payload });
};
