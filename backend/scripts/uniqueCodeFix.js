// backend/scripts/fixMissingUniqueCodes.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const generateUniqueCode = () => {
  return Math.random().toString(36).substring(2, 12);
};

async function fixUsers() {
  try {
    const usersWithoutCode = await prisma.user.findMany({
      where: { uniqueCode: null },
    });

    console.log(`Topildi: ${usersWithoutCode.length} foydalanuvchi.`);

    for (const user of usersWithoutCode) {
      const newCode = generateUniqueCode();
      await prisma.user.update({
        where: { id: user.id },
        data: { uniqueCode: newCode },
      });
      console.log(`✅ ${user.email} uchun kod berildi: ${newCode}`);
    }

    console.log("Barcha foydalanuvchilarga kod berildi.");
  } catch (error) {
    console.error("Xatolik:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixUsers();
