import client from './client';

export interface GameEvent {
  id: string;
  serverId: string;
  matchId?: string;
  type: string;
  data: any;
  timestamp: string;
  server?: {
    name: string;
  };
  match?: {
    map: string;
  };
}

export interface GameEventResponse {
  data: GameEvent[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getGameEvents = (params: {
  serverId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => client.get<GameEventResponse>('/game-events', { params });
