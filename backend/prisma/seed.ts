import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const username = process.env.SEED_ADMIN_USERNAME ?? 'adminuser';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'admin123';
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com';
  await prisma.admin.upsert({
    where: { username },
    update: {},
    create: { username, email, password: await bcrypt.hash(password, 10) },
  });
  console.log(`Seeded admin "${username}"`);
}

main().finally(() => prisma.$disconnect());
