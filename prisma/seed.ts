import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Admin123!@#', 12);

  await prisma.user.upsert({
    where: { email: 'admin@epaylasim.com' },
    update: {},
    create: {
      email: 'admin@epaylasim.com',
      username: 'admin',
      displayName: 'Super Admin',
      passwordHash: hash,
      role: UserRole.SUPER_ADMIN,
      emailVerified: true,
    },
  });

  const demoHash = await bcrypt.hash('Demo123!@#', 12);
  await prisma.user.upsert({
    where: { email: 'demo@epaylasim.com' },
    update: {},
    create: {
      email: 'demo@epaylasim.com',
      username: 'demo_user',
      displayName: 'Demo Kullanıcı',
      passwordHash: demoHash,
      emailVerified: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'HOSGELDIN10' },
    update: {},
    create: {
      code: 'HOSGELDIN10',
      description: 'Hoş geldin kuponu %10 indirim',
      type: 'PERCENTAGE',
      value: 10,
      usageLimit: 500,
      perUserLimit: 1,
    },
  });

  console.log('✅ Seed tamamlandı');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
