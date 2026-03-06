const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const products = await prisma.product.findMany({ select: { id: true, shopAddress: true, name: true } });
  console.log(products);
}
main().catch(console.error).finally(() => prisma.$disconnect());
