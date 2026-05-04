const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  console.log('--- Verification Start ---');
  
  // 1. Check Territory Stats Isolation logic
  try {
    const userId = 1;
    const territoryCount = await prisma.territory.count({ where: { userId } });
    console.log(`[OK] Territory count for User ${userId}: ${territoryCount}`);
  } catch (err) {
    console.error(`[FAIL] Territory.userId check: ${err.message}`);
  }

  // 2. Check Auth Profile update capability
  try {
    const existingUser = await prisma.user.findFirst();
    if (existingUser) {
      console.log(`[Testing] Updating User ${existingUser.id} with coords...`);
      const updated = await prisma.user.update({
        where: { id: existingUser.id },
        data: { latitude: 40.7128, longitude: -74.0060 },
        select: { id: true, latitude: true, longitude: true }
      });
      console.log(`[OK] Updated coords: Lat ${updated.latitude}, Lng ${updated.longitude}`);
    }
  } catch (err) {
    console.error(`[FAIL] User.latitude/longitude check: ${err.message}`);
  }

  // 3. Check Product formatting
  try {
    const product = await prisma.product.findFirst();
    if (product) {
       console.log(`[OK] Product ${product.id} found, image field type: ${typeof product.image}`);
    }
  } catch (err) {
    console.error(`[FAIL] Product check: ${err.message}`);
  }

  await prisma.$disconnect();
  console.log('--- Verification End ---');
}

verify();
