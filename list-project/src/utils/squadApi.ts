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

export const fetchServers = async (): Promise<ServerData[]> => {
  const res = await fetch('https://api.battlemetrics.com/servers?game=squad&filter[search]=FY&page[size]=50');
  const data = await res.json();
  return data.data.map((item: any) => {
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
      playTime: details.timePlayed || 0,
      version: details.version || 'Unknown',
      country: item.attributes.country,
      licenseId: details.licenseId,
      isModServer: details.modded || false,
      nextMap: details.nextLayer || 'Unknown'
    };
  });
};

export const formatPlayTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
};
