
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const username = 'FY';
  const password = '123456';
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    await prisma.user.update({
      where: { username },
      data: { 
        passwordHash: hashedPassword,
        role: 'superadmin' 
      },
    });
    console.log(`Updated password for user '${username}' to '${password}' and set role to 'superadmin'`);
  } else {
    // If user doesn't exist, create it
    await prisma.user.create({
      data: {
        username,
        passwordHash: hashedPassword,
        role: 'superadmin',
        // Optional: add a placeholder email if schema requires it, or leave null if optional
        email: 'fy@example.com' 
      }
    });
    console.log(`Created new user '${username}' with password '${password}' and role 'superadmin'`);
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
