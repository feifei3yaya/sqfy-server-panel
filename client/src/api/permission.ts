import client from './client';

export interface ServerPermission {
  id: string;
  userId: string;
  serverId: string;
  permissions: string[];
  server: {
    id: string;
    name: string;
    host: string;
  };
}

export const getUserPermissions = (userId: string) => client.get<ServerPermission[]>(`/permissions/${userId}`);

export const updatePermission = (userId: string, serverId: string, permissions: string[]) => 
  client.post('/permissions', { userId, serverId, permissions });

export const deletePermission = (userId: string, serverId: string) => 
  client.delete(`/permissions/${userId}/${serverId}`);
