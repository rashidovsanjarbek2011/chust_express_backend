const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const products = await prisma.product.findMany();
  let updatedCount = 0;
  for (const product of products) {
    let updateData = {};
    if (product.shopAddress === null || product.shopAddress === 'null') {
      updateData.shopAddress = '';
    }
    if (product.category === null || product.category === 'null') {
      updateData.category = 'Not Selected';
    }
    if (Object.keys(updateData).length > 0) {
      await prisma.product.update({
        where: { id: product.id },
        data: updateData
      });
      updatedCount++;
      console.log(`Updated product ${product.id}`);
    }
  }
  console.log(`Successfully fixed ${updatedCount} products.`);
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
