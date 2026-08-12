const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with sample products...");
  
  await prisma.product.deleteMany();
  console.log("🗑️  Cleared existing products");

  const products = [
    {
      name: "Chust Express Burger",
      description: "Delicious homemade beef burger with fresh vegetables",
      price: 35000,
      category: "Food",
      images: JSON.stringify(["https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400"]),
      stock: 50,
      weight: 0.3,
      unit: "pcs",
      currency: "UZS",
      deliveryPrice: 5000,
      isActive: true,
      shopAddress: "Chust, Main Street 123"
    },
    {
      name: "Chust Special Pizza",
      description: "Special pizza with local ingredients and mozzarella",
      price: 45000,
      category: "Pizza",
      images: JSON.stringify(["https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400"]),
      stock: 30,
      weight: 0.5,
      unit: "pcs",
      currency: "UZS",
      deliveryPrice: 7000,
      isActive: true,
      shopAddress: "Chust, Market Street 45"
    },
    {
      name: "Chust Fresh Salad",
      description: "Fresh organic salad with seasonal vegetables",
      price: 18000,
      category: "Salad",
      images: JSON.stringify(["https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400"]),
      stock: 40,
      weight: 0.2,
      unit: "pcs",
      currency: "UZS",
      deliveryPrice: 4000,
      isActive: true,
      shopAddress: "Chust, Garden Street 7"
    },
    {
      name: "Chust Traditional Plov",
      description: "Uzbek traditional plov with lamb and spices",
      price: 32000,
      category: "Food",
      images: JSON.stringify(["https://images.unsplash.com/photo-1547573854-74d2a71d0826?w=400"]),
      stock: 25,
      weight: 0.6,
      unit: "pcs",
      currency: "UZS",
      deliveryPrice: 6000,
      isActive: true,
      shopAddress: "Chust, Central Bazaar 12"
    },
    {
      name: "Chust Express Drink",
      description: "Refreshing homemade lemonade with mint",
      price: 12000,
      category: "Drinks",
      images: JSON.stringify(["https://images.unsplash.com/photo-1543857926-5a7cd5ae8ab9?w=400"]),
      stock: 100,
      weight: 0.5,
      unit: "pcs",
      currency: "UZS",
      deliveryPrice: 3000,
      isActive: true,
      shopAddress: "Chust, Main Street 123"
    },
    {
      name: "Chust Homemade Soup",
      description: "Warm hearty soup with fresh vegetables",
      price: 22000,
      category: "Soup",
      images: JSON.stringify(["https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400"]),
      stock: 35,
      weight: 0.4,
      unit: "pcs",
      currency: "UZS",
      deliveryPrice: 5000,
      isActive: true,
      shopAddress: "Chust, Winter Street 8"
    },
    {
      name: "Chust Special Somsa",
      description: "Traditional Uzbek somsa with meat filling",
      price: 15000,
      category: "Food",
      images: JSON.stringify(["https://images.unsplash.com/photo-1585515322407-617c4c5e4b3f?w=400"]),
      stock: 60,
      weight: 0.2,
      unit: "pcs",
      currency: "UZS",
      deliveryPrice: 4000,
      isActive: true,
      shopAddress: "Chust, Bazaar Street 3"
    },
    {
      name: "Chust Green Tea",
      description: "Traditional green tea with aromatic herbs",
      price: 8000,
      category: "Drinks",
      images: JSON.stringify(["https://images.unsplash.com/photo-1556881286-fc6915169721?w=400"]),
      stock: 80,
      weight: 0.1,
      unit: "pcs",
      currency: "UZS",
      deliveryPrice: 2000,
      isActive: true,
      shopAddress: "Chust, Main Street 123"
    }
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
    console.log(`✅ Created: ${product.name} (${product.price} UZS)`);
  }

  console.log(`✅ Seeding complete! ${products.length} products added.`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
