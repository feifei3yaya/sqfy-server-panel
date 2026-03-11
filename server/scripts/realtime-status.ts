/**
 * Squad 服务器实时状态查看器
 * 显示服务器的实时真实数据
 */

import { PrismaClient } from '@prisma/client';
import { Rcon as SquadRcon } from 'squad-rcon';

const prisma = new PrismaClient();

async function showRealtimeStatus() {
  console.log('\n' + '='.repeat(60));
  console.log('         Squad 服务器实时状态');
  console.log('='.repeat(60) + '\n');
  
  const servers = await prisma.server.findMany({
    where: { isPublished: true }
  });
  
  if (servers.length === 0) {
    console.log('❌ 没有已发布的服务器');
    return;
  }
  
  for (const server of servers) {
    let rcon: any;
    
    try {
      // 连接 RCON
      rcon = new SquadRcon({
        id: 1,
        host: server.host,
        port: server.rconPort,
        password: server.rconPassword,
        autoReconnect: false
      });
      
      await rcon.init();
      
      // 获取服务器信息
      const serverInfoRaw = await rcon.execute('ShowServerInfo');
      let serverInfo: any = {};
      try {
        serverInfo = JSON.parse(serverInfoRaw);
      } catch (e) {}
      
      // 获取地图信息
      const currentMapRaw = await rcon.execute('ShowCurrentMap');
      const mapInfo = parseMapInfo(currentMapRaw);
      
      // 获取玩家列表
      const playersRaw = await rcon.execute('ListPlayers');
      const players = parsePlayers(playersRaw);
      
      // 获取下一张地图
      const nextMapRaw = await rcon.execute('ShowNextMap');
      const nextMapInfo = parseMapInfo(nextMapRaw);
      
      // 显示实时数据
      console.log(`📺 服务器：${serverInfo.ServerName || server.name}`);
      console.log(`🌐 地址：${server.host}:${server.rconPort}`);
      console.log(`🎮 当前地图：${mapInfo.mapName}`);
      console.log(`🗺️  地图图层：${mapInfo.layerName}`);
      console.log(`⚔️  对阵阵营：${mapInfo.factions}`);
      console.log(`👥 在线人数：${serverInfo.PlayerCount || players.length}/${serverInfo.MaxPlayers || '100'}`);
      console.log(`⏱️  游戏时间：获取中...`);
      console.log(`📍 下一张地图：${nextMapInfo.layerName}`);
      console.log(`🔗 RCON 状态：✅ 已连接`);
      
      if (players.length > 0) {
        console.log(`\n👤 在线玩家列表:`);
        console.log('-'.repeat(60));
        players.forEach((p: any, index: number) => {
          console.log(`   ${index + 1}. ${p.name}`);
          console.log(`      SteamID: ${p.steamId}`);
          console.log(`      队伍：${p.teamId} | 小队：${p.squadId || '无'}`);
          console.log(`      角色：${p.role || '未知'}`);
          console.log('');
        });
      }
      
      await rcon.close();
      
    } catch (error: any) {
      console.error(`❌ 获取 ${server.name} 数据失败：${error.message}`);
      
      if (rcon) {
        try {
          await rcon.close();
        } catch (e) {}
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`数据更新时间：${new Date().toLocaleString('zh-CN')}`);
    console.log('='.repeat(60) + '\n');
  }
  
  await prisma.$disconnect();
}

function parseMapInfo(raw: string) {
  const mapMatch = raw.match(/level is (.+?),/);
  const layerMatch = raw.match(/layer is (.+?),/);
  const factionsMatch = raw.match(/factions (.+)/);
  
  return {
    mapName: mapMatch ? mapMatch[1].trim() : 'N/A',
    layerName: layerMatch ? layerMatch[1].trim() : 'N/A',
    factions: factionsMatch ? factionsMatch[1].trim() : 'N/A'
  };
}

function parsePlayers(raw: string) {
  const lines = raw.split('\n');
  const players = [];
  
  for (const line of lines) {
    const match = line.match(/ID: (\d+) \| Online IDs: EOS: [\w\d]+ steam: (\d+) \| Name: (.+?) \| Team ID: (\d+) \| Squad ID: ([\w\d/]+|N\/A)/);
    
    if (match) {
      const roleMatch = line.match(/Role: ([\w_]+)/);
      players.push({
        id: match[1],
        steamId: match[2],
        name: match[3].trim(),
        teamId: match[4],
        squadId: match[5],
        role: roleMatch ? roleMatch[1] : '未知'
      });
    }
  }
  
  return players;
}

showRealtimeStatus()
  .catch(console.error)
  .finally(() => {
    process.exit(0);
  });
