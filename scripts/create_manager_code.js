
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const code = "MANAGER-TEST-" + Math.floor(Math.random() * 10000);
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const managerCode = await prisma.managerCode.create({
        data: {
            code,
            expiresAt,
        },
    });

    console.log("===========================================");
    console.log("🚀 MANAGER CODE CREATED");
    console.log("Code:", managerCode.code);
    console.log("Expires:", managerCode.expiresAt);
    console.log("===========================================");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
