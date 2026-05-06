// config/db.js

const { PrismaClient } = require("@prisma/client");

// Configure Prisma with optimized connection pool for Render
// Render free tier: max 17 connections
// Reducing pool size to 5 (min: 2, max: 5) to leave headroom
const prisma = new PrismaClient({
  log: ["error", "warn"],
});

// Prisma ulanishini tekshirish (ixtiyoriy)
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("✅ PostgreSQL ulandi");
  } catch (error) {
    console.error("❌ PostgreSQL xatosi:", error);
    process.exit(1);
  }
};

module.exports = { prisma, connectDB };
