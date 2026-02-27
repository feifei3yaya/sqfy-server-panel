import client from './client';

export interface Team {
  id: string;
  name: string;
  tag: string;
  description: string;
  ownerId: string;
  members: TeamMember[];
  _count?: {
    members: number;
  };
}

export interface TeamMember {
  teamId: string;
  userId: string;
  role: string;
  user: {
    username: string;
  };
}

export const getTeams = () => client.get<Team[]>('/teams');
export const getTeam = (id: string) => client.get<Team>(`/teams/${id}`);
export const createTeam = (data: { name: string; tag: string; description: string }) => client.post<Team>('/teams', data);
export const joinTeam = (id: string) => client.post(`/teams/${id}/join`);
export const leaveTeam = (id: string) => client.post(`/teams/${id}/leave`);
export const kickMember = (id: string, userId: string) => client.delete(`/teams/${id}/kick/${userId}`);
