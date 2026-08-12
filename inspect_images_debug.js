const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const products = await prisma.product.findMany({
      take: 20,
      select: {
        id: true,
        name: true,
        image: true,
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("--- Product Images Inspection ---");
    products.forEach((p) => {
      let imgPreview = "NULL";
      if (p.image) {
        if (p.image.startsWith("data:")) {
          imgPreview = `Base64 (${p.image.substring(0, 30)}...) [Length: ${p.image.length}]`;
        } else if (p.image.startsWith("http")) {
          imgPreview = `URL (${p.image})`;
        } else {
          imgPreview = `Local Path (${p.image})`;
        }
      }
      console.log(`[${p.id}] ${p.name}: ${imgPreview}`);
    });
    console.log("---------------------------------");
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
