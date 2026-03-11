import client from './client';

export interface SquadGroup {
  id: string;
  name: string;
  permissions: string;
  _count?: {
    admins: number;
  };
}

export interface SquadAdmin {
  id: string;
  steamId: string;
  name: string;
  groupId: string;
  group?: SquadGroup;
}

// Groups
export const getGroups = () => client.get<SquadGroup[]>('/squad-admins/groups');
export const createGroup = (data: { name: string; permissions: string }) => client.post<SquadGroup>('/squad-admins/groups', data);
export const updateGroup = (id: string, data: { name: string; permissions: string }) => client.put<SquadGroup>(`/squad-admins/groups/${id}`, data);
export const deleteGroup = (id: string) => client.delete(`/squad-admins/groups/${id}`);

// Admins
export const getAdmins = () => client.get<SquadAdmin[]>('/squad-admins/admins');
export const addAdmin = (data: { steamId: string; name: string; groupId: string }) => client.post<SquadAdmin>('/squad-admins/admins', data);
export const deleteAdmin = (id: string) => client.delete(`/squad-admins/admins/${id}`);

// Config
export const generateConfig = () => client.get<{ config: string }>('/squad-admins/config');
export const syncConfig = (serverId: string) => client.post('/squad-admins/sync', { serverId });
