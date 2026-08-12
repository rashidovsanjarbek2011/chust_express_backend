const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function run() {
  console.log('Starting null/invalid image cleanup...');

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { image: null },
        { image: '' },
        { image: 'null' },
        { image: 'undefined' },
      ],
    },
  });

  console.log(`Stacking ${products.length} products for fix.`);

  for (const product of products) {
    const placeholder = 'https://placehold.co/400x300?text=No+Image';

    await prisma.product.update({
      where: { id: product.id },
      data: {
        image: JSON.stringify([placeholder]),
      },
    });

    console.log(`Product ${product.id} image fixed.`);
  }

  console.log('Completed null/invalid image cleanup.');
  await prisma.$disconnect();
}

run().catch((error) => {
  console.error('Error in fix_null_images:', error);
  prisma.$disconnect();
  process.exit(1);
});