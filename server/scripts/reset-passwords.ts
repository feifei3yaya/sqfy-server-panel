
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const users = ['admin', 'FY'];
  const password = 'password';
  const hashedPassword = await bcrypt.hash(password, 10);

  for (const username of users) {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      await prisma.user.update({
        where: { username },
        data: { 
          passwordHash: hashedPassword,
          role: 'superadmin' // Ensure both are superadmins
        },
      });
      console.log(`Updated password for user '${username}' to '${password}' and set role to 'superadmin'`);
    } else {
      console.log(`User '${username}' not found.`);
    }
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
