
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const targetServerName = 'FY测试服务器';
  const oldServerName = '本地 Squad 服务器';
  const filePath = String.raw`D:\squad_server\SquadGame\ServerConfig`;

  // 先尝试查找旧名称的服务器并重命名
  const oldServer = await prisma.server.findFirst({
    where: { name: oldServerName },
  });

  if (oldServer) {
    await prisma.server.update({
      where: { id: oldServer.id },
      data: { name: targetServerName },
    });
    console.log(`Renamed server from '${oldServerName}' to '${targetServerName}'`);
  }

  const existingServer = await prisma.server.findFirst({
    where: { name: targetServerName },
  });

  if (existingServer) {
    await prisma.server.update({
      where: { id: existingServer.id },
      data: {
        fileProtocol: 'local',
        filePath: filePath,
        isPublished: true,
      },
    });
    console.log(`Updated server '${targetServerName}' with file path: ${filePath} and isPublished=true`);
  } else {
    await prisma.server.create({
      data: {
        name: targetServerName,
        host: '127.0.0.1',
        rconPort: 21114,
        rconPassword: 'changeme',
        fileProtocol: 'local',
        filePath: filePath,
        isPublished: true,
      },
    });
    console.log(`Created server '${targetServerName}' with file path: ${filePath} and isPublished=true`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
