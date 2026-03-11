/**
 * Squad 服务器 RCON 连接测试脚本
 * 用于测试管理面板与 Squad 游戏服务器之间的通信连接
 */

import { Rcon as SquadRcon } from 'squad-rcon';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TEST_COMMANDS = [
  'ShowServerInfo',
  'ListPlayers',
  'ShowCurrentMap',
  'ShowNextMap'
];

async function testRconConnection() {
  console.log('=== Squad 服务器 RCON 连接测试 ===\n');
  
  // 获取所有已发布的服务器
  const servers = await prisma.server.findMany({
    where: { isPublished: true }
  });
  
  if (servers.length === 0) {
    console.log('❌ 数据库中没有已发布的服务器配置');
    console.log('\n请先在管理面板中添加服务器配置：');
    console.log('- 服务器 IP: 111.170.155.19');
    console.log('- RCON 端口：21114');
    console.log('- RCON 密码：Kw123456789');
    return;
  }
  
  console.log(`找到 ${servers.length} 个已发布的服务器\n`);
  
  for (const server of servers) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`测试服务器：${server.name}`);
    console.log(`地址：${server.host}:${server.rconPort}`);
    console.log('='.repeat(50));
    
    let rcon: any;
    
    try {
      // 创建 RCON 连接
      console.log('\n[1/4] 正在建立 RCON 连接...');
      rcon = new SquadRcon({
        id: 1,
        host: server.host,
        port: server.rconPort,
        password: server.rconPassword,
        autoReconnect: false
      });
      
      await rcon.init();
      console.log('✅ RCON 连接成功');
      
      // 测试各个命令
      for (const command of TEST_COMMANDS) {
        try {
          console.log(`\n[测试] 执行命令：${command}`);
          const response = await rcon.execute(command);
          
          // 解析并显示结果
          if (command === 'ShowServerInfo') {
            console.log('✅ 服务器信息获取成功:');
            console.log(`   原始响应：${response.substring(0, 300)}`);
            try {
              const info = JSON.parse(response);
              console.log(`   服务器名称：${info.ServerName || 'N/A'}`);
              console.log(`   当前地图：${info.CurrentMap || 'N/A'}`);
              console.log(`   玩家数量：${info.PlayerCount || 'N/A'}/${info.MaxPlayers || 'N/A'}`);
              console.log(`   排队人数：${info.PublicQueue || 'N/A'}`);
            } catch (e) {
              console.log('   ⚠️  JSON 解析失败，显示原始响应');
            }
          } else if (command === 'ListPlayers') {
            const lines = response.split('\n').filter((line: string) => line.trim());
            console.log(`✅ 玩家列表获取成功：${lines.length} 条记录`);
            if (lines.length > 0) {
              console.log('   前 3 名玩家:');
              lines.slice(0, 3).forEach((line: string) => {
                console.log(`   - ${line.trim()}`);
              });
            }
          } else if (command === 'ShowCurrentMap') {
            console.log(`✅ 当前地图：${response.trim()}`);
          } else if (command === 'ShowNextMap') {
            console.log(`✅ 下一张地图：${response.trim()}`);
          } else {
            console.log(`✅ 响应：${response.substring(0, 200)}`);
          }
        } catch (error: any) {
          console.log(`❌ 命令执行失败：${error.message}`);
        }
        
        // 命令之间添加延迟
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log(`\n✅ 服务器 ${server.name} 测试完成`);
      
    } catch (error: any) {
      console.log(`\n❌ RCON 连接失败：${error.message}`);
      console.log('可能原因:');
      console.log('1. RCON 密码错误');
      console.log('2. 服务器未开启 RCON');
      console.log('3. 防火墙阻止连接');
      console.log('4. 网络不通');
    } finally {
      // 关闭连接
      if (rcon) {
        try {
          await rcon.close();
          console.log('已关闭 RCON 连接');
        } catch (e) {
          // 忽略关闭错误
        }
      }
    }
    
    // 服务器之间添加延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log('测试完成');
  console.log('='.repeat(50));
  
  await prisma.$disconnect();
}

// 运行测试
testRconConnection()
  .catch(console.error)
  .finally(() => {
    process.exit(0);
  });
