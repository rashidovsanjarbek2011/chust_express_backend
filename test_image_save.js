const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Get a user to be the owner (or create one if none exists)
    let user = await prisma.user.findFirst();
    if (!user) {
      console.log("No user found, creating a test user...");
      user = await prisma.user.create({
        data: {
          username: "testuser_img",
          email: "test_img@example.com",
          password: "hashedpassword",
          role: "shop_owner",
        },
      });
    }

    console.log(`Using user ID: ${user.id}`);

    // 2. Create a product with a dummy Base64 string (simulating an image)
    // A small red dot base64
    const dummyBase64 =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";

    console.log("Attempting to create product with image...");
    const product = await prisma.product.create({
      data: {
        name: "Test Image Product",
        price: 100,
        ownerId: user.id,
        image: dummyBase64,
        description: "Test product for image saving",
      },
    });

    console.log("✅ Product created successfully!");
    console.log("Product ID:", product.id);
    console.log("Stored Image:", product.image);

    // 3. Verify it retrieves correctly
    const retrieved = await prisma.product.findUnique({
      where: { id: product.id },
    });

    if (retrieved.image === dummyBase64) {
      console.log("✅ Image verification PASSED: Stored value matches input.");
    } else {
      console.error("❌ Image verification FAILED: Stored value mismatch.");
    }

    // Cleanup
    await prisma.product.delete({ where: { id: product.id } });
    console.log("Test product deleted.");
  } catch (e) {
    console.error("❌ Test FAILED:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
