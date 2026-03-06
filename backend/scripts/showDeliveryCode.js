const { PrismaClient } = require("@prisma/client");
const { getCurrentDeliveryCode } = require("../services/deliveryCodeService");

const prisma = new PrismaClient();

async function initializeDeliveryCode() {
  try {
    const code = await getCurrentDeliveryCode();
    console.log("===========================================");
    console.log("🚚 MONTHLY DELIVERY ACCESS CODE");
    console.log("===========================================");
    console.log(`Code: ${code.code}`);
    console.log(`Expires: ${code.expiresAt.toLocaleString()}`);
    console.log("===========================================");
  } catch (error) {
    console.error("Error initializing delivery code:", error);
  } finally {
    await prisma.$disconnect();
  }
}

initializeDeliveryCode();
