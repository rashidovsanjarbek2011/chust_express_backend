const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🔍 Checking for products with NULL images...");

    // 1. Count them first
    const count = await prisma.product.count({
      where: {
        image: null,
      },
    });

    console.log(`Found ${count} products with NULL images.`);

    if (count === 0) {
      console.log("✅ No products need fixing.");
      return;
    }

    // 2. Update them
    // Using a generic food placeholder
    const placceholderUrl = "https://placehold.co/600x400?text=No+Image";

    const updateResult = await prisma.product.updateMany({
      where: {
        image: null,
      },
      data: {
        image: placceholderUrl,
      },
    });

    console.log(`✅ Fixed ${updateResult.count} products!`);
    console.log(`New image set to: ${placceholderUrl}`);
  } catch (e) {
    console.error("❌ Error fixing images:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
