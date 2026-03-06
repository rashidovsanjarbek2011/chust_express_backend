const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.product.findUnique({
    where: { id: 6 },
    include: {
      owner: {
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          address: true,
        }
      }
    }
  });
  console.log(JSON.stringify(p, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
