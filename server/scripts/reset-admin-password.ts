
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const username = 'admin';
  const password = 'password';

  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { username },
      data: { passwordHash: hashedPassword },
    });
    console.log(`Updated password for user '${username}' to '${password}'`);
  } else {
    console.log(`User '${username}' not found.`);
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
