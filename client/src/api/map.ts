import client from './client';

export interface GameState {
  serverName: string;
  currentMap: string;
  nextMap: string;
  playerCount: number;
  maxPlayers: number;
  publicQueue: number;
  reservedQueue: number;
  matchTimeout: number;
}

export const getGameState = (serverId: string) => client.get<GameState>(`/servers/${serverId}/state`);
export const changeMap = (serverId: string, map: string) => client.post(`/servers/${serverId}/map/change`, { map });
export const setNextMap = (serverId: string, map: string) => client.post(`/servers/${serverId}/map/next`, { map });
export const endMatch = (serverId: string) => client.post(`/servers/${serverId}/match/end`);
