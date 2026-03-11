/**
 * 添加 Squad 服务器到数据库
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addSquadServer() {
  console.log('=== 添加 Squad 服务器配置到数据库 ===\n');
  
  try {
    // 检查是否已存在
    const existing = await prisma.server.findFirst({
      where: {
        host: '111.170.155.19',
        rconPort: 21114
      }
    });
    
    if (existing) {
      console.log('⚠️  服务器配置已存在，正在更新...');
      const updated = await prisma.server.update({
        where: { id: existing.id },
        data: {
          name: 'FY 肥鸭服务器',
          host: '111.170.155.19',
          rconPort: 21114,
          rconPassword: 'Kw123456789',
          queryPort: 27165,
          isPublished: true
        }
      });
      console.log('✅ 服务器配置已更新');
      console.log(`   服务器 ID: ${updated.id}`);
      console.log(`   服务器名称：${updated.name}`);
      console.log(`   地址：${updated.host}:${updated.rconPort}`);
    } else {
      console.log('正在创建新的服务器配置...');
      const server = await prisma.server.create({
        data: {
          name: 'FY 肥鸭服务器',
          host: '111.170.155.19',
          rconPort: 21114,
          rconPassword: 'Kw123456789',
          queryPort: 27165,
          isPublished: true
        }
      });
      console.log('✅ 服务器配置已创建');
      console.log(`   服务器 ID: ${server.id}`);
      console.log(`   服务器名称：${server.name}`);
      console.log(`   地址：${server.host}:${server.rconPort}`);
    }
    
    console.log('\n提示：现在可以运行测试脚本 npx ts-node scripts/test-rcon-connection.ts');
    
  } catch (error: any) {
    console.error('❌ 错误:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addSquadServer()
  .catch(console.error)
  .finally(() => {
    process.exit(0);
  });
