import client from './client';

export interface ScrimMatch {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  serverId?: string;
  teamAId?: string;
  teamBId?: string;
  teamA?: any;
  teamB?: any;
  server?: any;
}

export const getMatches = () => client.get<ScrimMatch[]>('/calendar');
export const createMatch = (data: Partial<ScrimMatch>) => client.post<ScrimMatch>('/calendar', data);
export const updateMatch = (id: string, data: Partial<ScrimMatch>) => client.put<ScrimMatch>(`/calendar/${id}`, data);
export const deleteMatch = (id: string) => client.delete(`/calendar/${id}`);
