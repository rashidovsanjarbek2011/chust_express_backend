const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Product'
    `;
    console.log('Columns in Product table:');
    console.table(columns);
  } catch (err) {
    console.error('Error checking columns:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
