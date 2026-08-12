const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateImages() {
  console.log('🚀 Starting product image migration...');

  try {
    const products = await prisma.product.findMany();
    let updateCount = 0;

    for (const product of products) {
      const imageText = product.image;
      let safeImages = [];

      if (imageText) {
        try {
          const parsed = JSON.parse(imageText);
          if (Array.isArray(parsed)) {
            safeImages = parsed
              .map((img) => (img ? String(img).trim() : null))
              .filter((img) => img && /^(https?:\/\/|data:)/i.test(img));
          }
        } catch (e) {
          const cleaned = String(imageText || '').trim();
          if (/^(https?:\/\/|data:)/i.test(cleaned)) safeImages = [cleaned];
        }
      }

      if (safeImages.length === 0) {
        safeImages = ['https://placehold.co/400x300?text=No+Image'];
      }

      // Only update if needed
      const needsUpdate =
        !Array.isArray(product.images) ||
        JSON.stringify(product.images) !== JSON.stringify(safeImages);

      if (needsUpdate) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            images: safeImages.slice(0, 5),
            // Optionally clear legacy image field:
            // image: null,
          },
        });
        updateCount++;
        console.log(`✅ Migrated product ${product.id}, images ->`, safeImages);
      }
    }

    console.log(`✨ Completed migration. ${updateCount} products updated.`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateImages();