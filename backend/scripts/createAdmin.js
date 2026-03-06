const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        const hashedPassword = await bcrypt.hash("t#K8jM3$R!", 12);

        const admin = await prisma.user.create({
            data: {
                username: "admin",
                email: "admin@delivery.com",
                password: hashedPassword,
                role: "administrator",
            },
        });

        console.log("===========================================");
        console.log("👑 ADMIN USER CREATED");
        console.log("===========================================");
        console.log(`Email: ${admin.email}`);
        console.log(`Password: t#K8jM3$R!`);
        console.log(`Role: ${admin.role}`);
        console.log("===========================================");
        console.log("\n⚠️  IMPORTANT: Change the password after first login!");
    } catch (error) {
        if (error.code === "P2002") {
            console.log("❌ Admin user already exists!");
        } else {
            console.error("Error creating admin:", error);
        }
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
