import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Delete admin user
  const adminUsername = 'admin';
  const existingAdmin = await prisma.user.findUnique({
    where: { username: adminUsername },
  });

  if (existingAdmin) {
    await prisma.user.delete({
      where: { username: adminUsername },
    });
    console.log(`Deleted admin user: ${adminUsername}`);
  } else {
    console.log(`User '${adminUsername}' not found.`);
  }

  // Create or update FY user
  const fyUsername = 'FY';
  const fyPassword = '123456';
  const fyEmail = 'fy@example.com';

  const existingFY = await prisma.user.findUnique({
    where: { username: fyUsername },
  });

  if (existingFY) {
    const hashedPassword = await bcrypt.hash(fyPassword, 10);
    await prisma.user.update({
      where: { username: fyUsername },
      data: { 
        passwordHash: hashedPassword,
        email: fyEmail,
        role: 'superadmin'
      },
    });
    console.log(`Updated FY user with new password: ${fyPassword}`);
  } else {
    const hashedPassword = await bcrypt.hash(fyPassword, 10);
    
    const user = await prisma.user.create({
      data: {
        username: fyUsername,
        passwordHash: hashedPassword,
        email: fyEmail,
        role: 'superadmin',
      },
    });
    console.log(`Created FY user: ${user.username}`);
    console.log(`Password: ${fyPassword}`);
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
