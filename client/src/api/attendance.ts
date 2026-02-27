import client from './client';

export interface AttendanceSession {
  id: string;
  adminId: string;
  serverId: string;
  sessionStart: string;
  sessionEnd?: string;
  duration?: number;
  server?: {
    name: string;
  };
  admin?: {
    username: string;
  };
}

export const startDuty = (serverId: string) => client.post<AttendanceSession>('/attendance/start', { serverId });
export const endDuty = () => client.post<AttendanceSession>('/attendance/end');
export const getDutyStatus = () => client.get<{ isOnDuty: boolean; session: AttendanceSession | null }>('/attendance/status');
export const getDutyStats = (params?: any) => client.get<{ sessions: AttendanceSession[], summary: any }>('/attendance/stats', { params });
