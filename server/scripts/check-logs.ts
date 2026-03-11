import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.log.findMany({
    take: 5,
    orderBy: { timestamp: 'desc' }
  });
  console.log('Recent Logs:', logs.length);
  logs.forEach(l => console.log(`[${l.type}] ${l.content.trim()}`));

  const events = await prisma.gameEvent.findMany({
    take: 5,
    orderBy: { timestamp: 'desc' }
  });
  console.log('\nRecent Game Events:', events.length);
  events.forEach(e => console.log(`[${e.type}] ${e.data}`));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
