const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const products = await prisma.product.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        image: true,
      },
    });

    console.log("--- Products Image Data Inspector ---");
    products.forEach((p) => {
      const imgType = p.image
        ? p.image.startsWith("data:")
          ? "Base64"
          : p.image.startsWith("http")
            ? "URL"
            : "Path"
        : "NULL";
      const preview = p.image ? p.image.substring(0, 50) + "..." : "N/A";
      console.log(
        `ID: ${p.id} | Name: ${p.name} | Type: ${imgType} | Preview: ${preview}`,
      );
    });
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
