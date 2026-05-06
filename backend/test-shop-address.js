const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  const products = await prisma.product.findMany({
    include: { owner: true }
  });
  console.log(products.map(p => ({
    id: p.id,
    name: p.name,
    shopAddress: p.shopAddress,
    ownerAddress: p.owner?.address
  })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
