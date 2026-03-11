/**
 * Squad 服务器实时数据同步脚本
 * 从 RCON 获取实时服务器数据并更新到数据库
 */

import { PrismaClient } from '@prisma/client';
import { Rcon as SquadRcon } from 'squad-rcon';

const prisma = new PrismaClient();

async function syncRealtimeData() {
  console.log('=== Squad 服务器实时数据同步 ===\n');
  
  // 获取服务器配置
  const servers = await prisma.server.findMany({
    where: { isPublished: true }
  });
  
  if (servers.length === 0) {
    console.log('❌ 没有已发布的服务器');
    return;
  }
  
  for (const server of servers) {
    console.log(`同步服务器：${server.name}`);
    console.log(`地址：${server.host}:${server.rconPort}\n`);
    
    let rcon: any;
    
    try {
      // 连接 RCON
      console.log('[1/5] 连接 RCON...');
      rcon = new SquadRcon({
        id: 1,
        host: server.host,
        port: server.rconPort,
        password: server.rconPassword,
        autoReconnect: false
      });
      
      await rcon.init();
      console.log('✅ RCON 连接成功\n');
      
      // 获取服务器信息
      console.log('[2/5] 获取服务器信息...');
      const serverInfoRaw = await rcon.execute('ShowServerInfo');
      let serverInfo: any = {};
      
      try {
        serverInfo = JSON.parse(serverInfoRaw);
      } catch (e) {
        console.log('⚠️ JSON 解析失败，使用原始响应');
      }
      console.log('✅ 服务器信息获取成功');
      console.log(`   服务器名称：${serverInfo.ServerName || 'N/A'}`);
      console.log(`   当前地图：${serverInfo.CurrentMap || 'N/A'}`);
      console.log(`   玩家数量：${serverInfo.PlayerCount || '0'}/${serverInfo.MaxPlayers || '100'}`);
      
      // 获取当前地图详情
      console.log('\n[3/5] 获取地图详情...');
      const currentMapRaw = await rcon.execute('ShowCurrentMap');
      const mapInfo = parseMapInfo(currentMapRaw);
      console.log('✅ 地图信息获取成功');
      console.log(`   地图名称：${mapInfo.mapName}`);
      console.log(`   地图图层：${mapInfo.layerName}`);
      console.log(`   阵营：${mapInfo.factions}`);
      
      // 获取玩家列表
      console.log('\n[4/5] 获取玩家列表...');
      const playersRaw = await rcon.execute('ListPlayers');
      const players = parsePlayers(playersRaw);
      console.log(`✅ 玩家列表获取成功 (${players.length} 人)`);
      
      if (players.length > 0) {
        console.log('   在线玩家:');
        players.forEach(p => {
          console.log(`   - ${p.name} (ID: ${p.id}, 队伍：${p.teamId})`);
        });
      }
      
      // 获取下一张地图
      console.log('\n[5/5] 获取下一张地图...');
      const nextMapRaw = await rcon.execute('ShowNextMap');
      const nextMapInfo = parseMapInfo(nextMapRaw);
      console.log(`✅ 下一张地图：${nextMapInfo.layerName}`);
      
      // 更新数据库
      console.log('\n📝 更新数据库...');
      await prisma.server.update({
        where: { id: server.id },
        data: {
          name: serverInfo.ServerName || server.name,
          queryPort: serverInfo.QueryPort || server.queryPort
        }
      });
      
      // 创建服务器状态记录
      await prisma.serverMetric.create({
        data: {
          serverId: server.id,
          playerCount: parseInt(serverInfo.PlayerCount) || 0,
          maxPlayers: parseInt(serverInfo.MaxPlayers) || 100,
          timestamp: new Date()
        }
      });
      
      console.log('✅ 数据库更新成功\n');
      
      // 关闭连接
      await rcon.close();
      
    } catch (error: any) {
      console.error('❌ 同步失败:', error.message);
      
      if (rcon) {
        try {
          await rcon.close();
        } catch (e) {}
      }
    }
    
    console.log('='.repeat(50) + '\n');
  }
  
  await prisma.$disconnect();
  console.log('同步完成');
}

function parseMapInfo(raw: string) {
  // 格式：Current level is Jensen's Range, layer is JensensRange_USA-PLA, factions USA PLA
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
    // 新格式：ID: 0 | Online IDs: EOS: ... steam: 7656... | Name: ... | Team ID: 2 | Squad ID: N/A
    const match = line.match(/ID: (\d+) \| Online IDs: EOS: [\w\d]+ steam: (\d+) \| Name: (.+?) \| Team ID: (\d+)/);
    
    if (match) {
      players.push({
        id: match[1],
        steamId: match[2],
        name: match[3].trim(),
        teamId: match[4]
      });
    }
  }
  
  return players;
}

syncRealtimeData()
  .catch(console.error)
  .finally(() => {
    process.exit(0);
  });
