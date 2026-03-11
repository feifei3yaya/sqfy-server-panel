import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const servers = await prisma.server.findMany();
  console.log('Found servers:', servers.length);
  servers.forEach(s => console.log(`- ${s.name} (${s.id}) [${s.host}:${s.rconPort}]`));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
