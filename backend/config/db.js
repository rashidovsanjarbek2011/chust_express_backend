// config/db.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Prisma ulanishini tekshirish (ixtiyoriy)
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("PostgreSQL ulandi");
  } catch (error) {
    console.error("PostgreSQL xatosi:", error);
    process.exit(1);
  }
};

module.exports = { prisma, connectDB };
