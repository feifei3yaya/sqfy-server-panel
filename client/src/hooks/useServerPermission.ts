import { useState, useEffect } from 'react';
import { getUserPermissions } from '../api/permission';
import type { ServerPermission } from '../api/permission';
import { useAppSelector } from '../store/hooks';

export const useServerPermission = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [permissions, setPermissions] = useState<ServerPermission[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    if (user.role === 'superadmin') {
      setPermissions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    getUserPermissions(user.id)
      .then(res => setPermissions(res.data))
      .catch(() => setPermissions([]))
      .finally(() => setLoading(false));
  }, [user]);

  const hasPermission = (serverId: string, permission: string) => {
    if (!user) return false;
    if (user.role === 'superadmin') return true;
    
    const serverPerm = permissions.find(p => p.serverId === serverId);
    if (!serverPerm) return false;
    
    return serverPerm.permissions.includes(permission) || serverPerm.permissions.includes('all');
  };

  return { hasPermission, loading };
};
