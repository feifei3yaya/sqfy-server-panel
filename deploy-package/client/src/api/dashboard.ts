import client from './client';

export interface DashboardStats {
  summary: {
    totalServers: number;
    onlineServers: number;
    totalPlayers: number;
    activeAdmins: number;
  };
  serverStatuses: {
    id: string;
    name: string;
    status: string;
    playerCount: number;
    maxPlayers: number;
    map: string;
  }[];
  recentBans: {
    id: string;
    player: {
      nameHistory: string;
    };
    reason: string;
    createdAt: string;
  }[];
  activeAdmins: {
    admin: {
      username: string;
    };
    server: {
      name: string;
    };
    sessionStart: string;
  }[];
  chartData: {
    time: string;
    count: number;
  }[];
}

export const getDashboardStats = () => client.get<DashboardStats>('/dashboard/stats');
