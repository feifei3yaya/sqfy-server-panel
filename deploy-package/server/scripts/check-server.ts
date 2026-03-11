import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkServer() {
  const server = await prisma.server.findFirst({
    where: { isPublished: true }
  });
  
  console.log('数据库中的服务器配置:');
  console.log('服务器名称:', server?.name);
  console.log('服务器地址:', server?.host);
  console.log('RCON 端口:', server?.rconPort);
  console.log('Query 端口:', server?.queryPort);
  
  await prisma.$disconnect();
}

checkServer().catch(console.error);
