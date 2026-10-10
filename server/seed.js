const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial administrator account...');
  
  // Hash the password securely
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  
  // Create the user in the Supabase database
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mentorcolleges.com' },
    update: {},
    create: {
      email: 'admin@mentorcolleges.com',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });
  
  console.log('Success! Admin created with email:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });