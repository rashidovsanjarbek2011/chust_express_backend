const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const codes = await prisma.managerCode.findMany({
      orderBy: { createdAt: "desc" },
    });
    if (codes.length === 0) {
      console.log("No manager codes found.");
    } else {
      console.log("Manager codes:");
      codes.forEach((c) => {
        console.log(
          `${c.id} | ${c.code} | active:${c.isActive} | expiresAt:${c.expiresAt} | createdAt:${c.createdAt}`,
        );
      });
    }
  } catch (err) {
    console.error("Error fetching manager codes:", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
