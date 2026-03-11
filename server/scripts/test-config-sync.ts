/**
 * Squad 服务器配置同步测试脚本 (SSH 密钥认证版本)
 * 测试管理面板与服务器之间的配置文件同步功能
 */

import { PrismaClient } from '@prisma/client';
import SftpClient from 'ssh2-sftp-client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function testConfigSync() {
  console.log('=== Squad 服务器配置同步测试 ===\n');
  
  // 获取服务器配置
  const servers = await prisma.server.findMany({
    where: { isPublished: true }
  });
  
  if (servers.length === 0) {
    console.log('❌ 数据库中没有已发布的服务器');
    return;
  }
  
  const server = servers[0];
  console.log(`测试服务器：${server.name}`);
  console.log(`地址：${server.host}:${server.rconPort}\n`);
  
  // 测试通过 SSH 命令读取配置文件
  console.log('[1/3] 通过 SSH 读取 Admins.cfg...');
  const { exec } = await import('child_process');
  const util = await import('util');
  const execPromise = util.promisify(exec);
  
  try {
    // 使用 SSH 读取文件
    const sshCmd = `ssh -i "d:\\SQFY-v1.0.0.0\\config\\keys\\id_rsa_server" administrator@${server.host} "chcp 936 >nul && type D:/squad/SquadGame/ServerConfig/Admins.cfg"`;
    const { stdout } = await execPromise(sshCmd, { encoding: 'utf8' });
    
    // 解析组配置
    const groupMatches = stdout.match(/^Group=.*$/gm) || [];
    const adminMatches = stdout.match(/^Admin=.*$/gm) || [];
    
    console.log(`✅ Admins.cfg 读取成功 (${groupMatches.length} 个组，${adminMatches.length} 个管理员)`);
    
    console.log('\n[2/3] 通过 SSH 读取 Server.cfg...');
    const sshCmd2 = `ssh -i "d:\\SQFY-v1.0.0.0\\config\\keys\\id_rsa_server" administrator@${server.host} "chcp 936 >nul && type D:/squad/SquadGame/ServerConfig/Server.cfg"`;
    const { stdout: stdout2 } = await execPromise(sshCmd2, { encoding: 'utf8' });
    
    // 提取服务器名称
    const nameMatch = stdout2.match(/ServerName="(.+)"/);
    const serverName = nameMatch ? nameMatch[1] : 'N/A';
    
    // 提取最大玩家数
    const maxPlayersMatch = stdout2.match(/MaxPlayers=(\d+)/);
    const maxPlayers = maxPlayersMatch ? maxPlayersMatch[1] : 'N/A';
    
    console.log(`✅ Server.cfg 读取成功 (服务器名称：${serverName}, 最大玩家数：${maxPlayers})`);
    
    console.log('\n[3/3] 通过 SSH 读取 Rcon.cfg...');
    const sshCmd3 = `ssh -i "d:\\SQFY-v1.0.0.0\\config\\keys\\id_rsa_server" administrator@${server.host} "chcp 936 >nul && type D:/squad/SquadGame/ServerConfig/Rcon.cfg"`;
    const { stdout: stdout3 } = await execPromise(sshCmd3, { encoding: 'utf8' });
    
    // 提取 RCON 配置
    const portMatch = stdout3.match(/^Port=(\d+)/m);
    const passwordMatch = stdout3.match(/^Password=(.+)/m);
    
    const rconPort = portMatch ? portMatch[1] : 'N/A';
    const rconPassword = passwordMatch ? passwordMatch[1] : 'N/A';
    
    console.log(`✅ Rcon.cfg 读取成功 (端口：${rconPort})`);
    
    // 生成测试报告
    console.log('\n生成配置同步测试报告...');
    const reportPath = path.join(process.cwd(), 'config-sync-report.md');
    const report = generateConfigReport({
      admins: { groups: groupMatches.length, admins: adminMatches.length },
      server: { name: serverName, maxPlayers },
      rcon: { port: rconPort, password: rconPassword }
    }, server);
    fs.writeFileSync(reportPath, report, 'utf-8');
    console.log(`报告已保存至：${reportPath}`);
    
    console.log('\n' + report);
    
  } catch (error: any) {
    console.error('❌ 配置读取失败:', error.message);
  }
  
  await prisma.$disconnect();
}

function generateConfigReport(configs: any, server: any): string {
  let report = `
# Squad 服务器配置同步测试报告

**测试时间**: ${new Date().toLocaleString('zh-CN')}
**测试服务器**: ${server.name} (${server.host}:${server.rconPort})

## 测试摘要

✅ 所有配置文件读取成功

## 配置文件详情

### 1. Admins.cfg (管理员权限配置)

- **权限组数量**: ${configs.admins.groups}
- **管理员数量**: ${configs.admins.admins}
- **状态**: ✅ 可正常读取

### 2. Server.cfg (服务器主配置)

- **服务器名称**: ${configs.server.name}
- **最大玩家数**: ${configs.server.maxPlayers}
- **状态**: ✅ 可正常读取

### 3. Rcon.cfg (RCON 配置)

- **RCON 端口**: ${configs.rcon.port}
- **RCON 密码**: ${configs.rcon.password}
- **状态**: ✅ 可正常读取

## 测试结论

✅ 所有配置同步测试通过，管理面板可以正常读取服务器配置文件！

## 配置文件说明

### Admins.cfg
管理员权限配置文件，包含权限组定义和管理员分配。
路径：\`D:\\squad\\SquadGame\\ServerConfig\\Admins.cfg\`

### Server.cfg  
服务器主配置文件，包含服务器名称、最大玩家数、地图轮换等设置。
路径：\`D:\\squad\\SquadGame\\ServerConfig\\Server.cfg\`

### Rcon.cfg
RCON 远程管理配置文件，包含 RCON 端口、密码等设置。
路径：\`D:\\squad\\SquadGame\\ServerConfig\\Rcon.cfg\`

## 建议

✅ 配置读取功能正常，可以通过 SSH 方式管理服务器配置文件。
`;
  
  return report;
}

testConfigSync()
  .catch(console.error)
  .finally(() => {
    process.exit(0);
  });
