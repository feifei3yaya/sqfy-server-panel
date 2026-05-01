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

export interface FetchServersResult {
  servers: ServerData[];
  nextCursor?: string;
}

export const fetchServers = async (
  type: 'LICENSED' | 'CUSTOM' = 'LICENSED',
  region: 'ALL' | 'CN' | 'OTHER' = 'ALL',
  search: string = '',
  cursor?: string
): Promise<FetchServersResult> => {
  let url = 'https://api.battlemetrics.com/servers?filter[game]=squad&filter[status]=online&page[size]=100&sort=-players';
  
  if (region === 'CN') {
    url += '&filter[countries]=CN';
  }
  
  const q = search.trim();
  if (q) {
    url += `&filter[search]=${encodeURIComponent(q)}`;
  }

  if (cursor) {
    url += `&page[cursor]=${encodeURIComponent(cursor)}`;
  }

  const res = await fetch(url);
  const data = await res.json();
  if (!data.data) return { servers: [] };
  
  let mapped: ServerData[] = data.data.map((item: any) => {
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
  
  if (region === 'OTHER') {
    mapped = mapped.filter((s) => s.country !== 'CN');
  }

  const nextUrl = data?.links?.next;
  const nextCursor = typeof nextUrl === 'string' ? new URL(nextUrl).searchParams.get('page[cursor]') ?? undefined : undefined;

  if (type === 'LICENSED') {
    return { servers: mapped.filter((s) => s.licenseId), nextCursor };
  } else {
    return { servers: mapped.filter((s) => !s.licenseId), nextCursor };
  }
};

export const formatPlayTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
};
