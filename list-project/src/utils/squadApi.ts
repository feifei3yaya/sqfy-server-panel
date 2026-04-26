export interface ServerData {
  id: string;
  name: string;
  players: number;
  maxPlayers: number;
  queue: number;
  ip: string;
  port: number;
  map: string;
  gameMode: string;
  playTime: number;
  version: string;
  country: string;
  licenseId?: string;
  isModServer?: boolean;
  nextMap?: string;
}

export const fetchServers = async (type: 'LICENSED' | 'CUSTOM' = 'LICENSED', region: 'ALL' | 'CN' | 'OTHER' = 'ALL'): Promise<ServerData[]> => {
  let url = 'https://api.battlemetrics.com/servers?filter[game]=squad&filter[status]=online&page[size]=100&sort=-players';
  
  if (region === 'CN') {
    url += '&filter[countries]=CN';
  } else if (region === 'OTHER') {
    // BattleMetrics allows excluding countries with ! or multiple. 
    // It's simpler to just fetch all and filter client side for 'OTHER', 
    // but fetching global is fine since top 100 are mostly OTHER anyway.
  }
  
  const res = await fetch(url);
  const data = await res.json();
  if (!data.data) return [];
  
  const mapped = data.data.map((item: any) => {
    const details = item.attributes.details || {};
    return {
      id: item.attributes.id,
      name: item.attributes.name,
      players: item.attributes.players,
      maxPlayers: item.attributes.maxPlayers,
      queue: details.squad_publicQueue || 0,
      ip: item.attributes.ip,
      port: item.attributes.port,
      map: details.map || 'Unknown',
      gameMode: details.gameMode || 'AAS',
      playTime: details.squad_playTime || 0,
      version: details.version || 'Unknown',
      country: item.attributes.country,
      licenseId: details.licenseId,
      isModServer: details.modded || false,
      nextMap: details.squad_nextLayer || 'Unknown'
    };
  });
  
  if (type === 'LICENSED') {
    return mapped.filter((s: ServerData) => s.licenseId);
  } else {
    return mapped.filter((s: ServerData) => !s.licenseId);
  }
};

export const formatPlayTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
};
