require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seed() {
  try {
    const existing = await prisma.deliveryType.count();
    if (existing === 0) {
      console.log('No DeliveryTypes found. Seeding default types...');
      
      await prisma.deliveryType.create({
        data: {
          typeName: 'Avtomobil (Car)',
          basePrice: 5000,
          baseCostPerKm: 1500,
          vehicleRequired: true
        }
      });
      
      await prisma.deliveryType.create({
        data: {
          typeName: 'Piyoda / Velo',
          basePrice: 3000,
          baseCostPerKm: 1000,
          vehicleRequired: false
        }
      });
      
      console.log('Successfully seeded default DeliveryTypes!');
    } else {
      console.log(`Found ${existing} DeliveryTypes. No seeding needed.`);
    }

    const dummyProduct = await prisma.product.findUnique({ where: { id: 9999 } });
    if (!dummyProduct) {
      console.log('Seeding dummy delivery product (9999)...');
      // We need an owner for the product. Let's find an admin or user to own it, or create a dummy user.
      let owner = await prisma.user.findFirst({ where: { role: 'administrator' }});
      if (!owner) owner = await prisma.user.findFirst();
      if (!owner) {
        owner = await prisma.user.create({
          data: {
            username: 'system_admin',
            email: 'admin@system.local',
            password: 'na',
            role: 'administrator'
          }
        });
      }

      // To insert with a specific ID, we can use create and set ID if database allows,
      // but Postgres autoincrement might ignore manual ID. 
      // Actually Prisma allows setting ID for Postgres if it's not overriding an existing sequence value aggressively.
      // Easiest is to use queryRaw:
      await prisma.$executeRaw`INSERT INTO "Product" (id, name, description, price, stock, "ownerId", currency, "deliveryPrice", unit, "updatedAt") VALUES (9999, 'Yetkazib Berish Xizmati', 'Maxsus yetkazib berish xizmati uchun virtual mahsulot', 0, 999999, ${owner.id}, 'UZS', 0, 'xizmat', NOW()) ON CONFLICT (id) DO NOTHING;`;
      console.log('Successfully seeded dummy product 9999!');
    } else {
      console.log('Dummy product 9999 already exists.');
    }
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
