const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Check if delivery types exist
  const count = await prisma.deliveryType.count();
  if (count > 0) {
    console.log("ℹ️ Delivery types already exist. Skipping creation.");
  } else {
    console.log("🚚 Creating default delivery types...");
    await prisma.deliveryType.createMany({
      data: [
        {
          typeName: "Velo (Cycle)",
          basePrice: 5000,
          baseCostPerKm: 1500,
          minWeightKg: 0,
          maxWeightKg: 10,
          maxDistanceKm: 10,
          vehicleRequired: false,
        },
        {
          typeName: "Yengil Avto (Car)",
          basePrice: 15000,
          baseCostPerKm: 3000,
          minWeightKg: 0,
          maxWeightKg: 50,
          maxDistanceKm: 50,
          vehicleRequired: true,
        },
        {
          typeName: "Damas / Van",
          basePrice: 30000,
          baseCostPerKm: 5000,
          minWeightKg: 50,
          maxWeightKg: 500,
          maxDistanceKm: 100,
          vehicleRequired: true,
        },
        {
          typeName: "Yuk Mashinasi (Truck)",
          basePrice: 80000,
          baseCostPerKm: 10000,
          minWeightKg: 100,
          maxWeightKg: 5000,
          maxDistanceKm: 500,
          vehicleRequired: true,
        },
      ],
    });
    console.log("✅ Delivery types created.");
  }
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
