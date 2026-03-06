const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Generates a 10-character alphanumeric code
 */
function generateCode() {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Gets the current active delivery code or creates a new one if expired
 */
async function getCurrentDeliveryCode() {
  const now = new Date();

  // Find active code that hasn't expired
  let activeCode = await prisma.deliveryCode.findFirst({
    where: {
      isActive: true,
      expiresAt: {
        gt: now,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // If no active code or expired, create new one
  if (!activeCode) {
    // Deactivate all old codes
    await prisma.deliveryCode.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // Create new code that expires in 1 month
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    activeCode = await prisma.deliveryCode.create({
      data: {
        code: generateCode(),
        expiresAt,
        isActive: true,
      },
    });

    console.log(
      `[DELIVERY CODE] New monthly code generated: ${activeCode.code}`,
    );
    console.log(`[DELIVERY CODE] Expires at: ${activeCode.expiresAt}`);
  }

  return activeCode;
}

/**
 * Validates if the provided code matches the current active code
 */
async function validateDeliveryCode(inputCode) {
  if (!inputCode) return false;

  const activeCode = await getCurrentDeliveryCode();
  return activeCode.code === inputCode.trim().toUpperCase();
}

module.exports = {
  getCurrentDeliveryCode,
  validateDeliveryCode,
};
