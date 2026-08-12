const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    // 1. Create Delivery Code
    const deliveryCodeStr = "DELIVERY-TEST-" + Math.floor(Math.random() * 10000);
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const deliveryCode = await prisma.deliveryCode.create({
        data: {
            code: deliveryCodeStr,
            expiresAt,
        },
    });

    console.log("===========================================");
    console.log("🚚 DELIVERY CODE CREATED");
    console.log("Code:", deliveryCode.code);
    console.log("===========================================");

    // 2. We need an owner account. 
    // Since legacyCode is per-user, we will update a known user or create one.
    // Let's create a user 'test_owner' with legacyCode 'OWNER123'
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash("password123", 10);

    const ownerUser = await prisma.user.upsert({
        where: { email: "owner@test.com" },
        update: {
            legacyCode: "OWNER123",
            role: "user" // Role will be escalated during login
        },
        create: {
            username: "test_owner",
            email: "owner@test.com",
            password: hashedPassword,
            legacyCode: "OWNER123",
            role: "user"
        }
    });

    console.log("🏠 OWNER ACCOUNT READY");
    console.log("Email: owner@test.com");
    console.log("Password: password123");
    console.log("Legacy Code: OWNER123");
    console.log("===========================================");

    // 3. Ensure a standard user exists
    await prisma.user.upsert({
        where: { email: "user@test.com" },
        update: {},
        create: {
            username: "test_user",
            email: "user@test.com",
            password: hashedPassword,
            role: "user"
        }
    });

    console.log("👤 USER ACCOUNT READY");
    console.log("Email: user@test.com");
    console.log("Password: password123");
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
