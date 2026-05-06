const axios = require("axios");

const API_URL = "http://localhost:5000/api";

async function run() {
  try {
    console.log("🚀 Starting Order Reproduction Script...");

    // 1. Register/Login User
    const email = `testuser_${Date.now()}@example.com`;
    const password = "password123";
    console.log(`👤 Creating user: ${email}`);

    let token;
    try {
      const registerRes = await axios.post(`${API_URL}/auth/register`, {
        username: "Test User",
        email,
        password,
        role: "client",
        cardNumber: "8600 0000 0000 0000",
      });
      token = registerRes.data.token;
    } catch (e) {
      console.log("Login fallback...");
      const loginRes = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      token = loginRes.data.token;
    }
    console.log("🔑 Token obtained");

    // 2. Create a dummy product (if we can, or find one)
    // We need a product ID. Let's try to fetch products first.
    console.log("📦 Fetching products...");
    const productsRes = await axios.get(`${API_URL}/products`);
    let product = productsRes.data.data[0];

    if (!product) {
      console.error("❌ No products found. Cannot proceed with order.");
      // Try to create one if we were an admin, but we are a client.
      // Assuming the system has at least one product.
      return;
    }
    console.log(`✅ Using Product: ${product.name} (ID: ${product.id})`);

    // 3. Place Order
    console.log("🛒 Placing Order...");
    const orderData = {
      orderItems: [{ product: product.id, quantity: 1 }],
      shippingAddress: "Test Address 123, Tashkent",
      paymentMethod: "Cash",
      subtotalPrice: product.price,
      latitude: 41.2995,
      longitude: 69.2401,
    };

    const orderRes = await axios.post(`${API_URL}/orders`, orderData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log(`✅ Order Created! ID: ${orderRes.data.id}`);
    console.log("📄 Order Data:", JSON.stringify(orderRes.data, null, 2));

    // 4. Verify Order Get
    console.log(`🔍 Fetching Order ${orderRes.data.id}...`);
    const getOrderRes = await axios.get(
      `${API_URL}/orders/${orderRes.data.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    console.log(
      `✅ Order Fetched Successfully. Status: ${getOrderRes.data.orderStatus}`,
    );
  } catch (error) {
    console.error(
      "❌ Error:",
      error.response ? error.response.data : error.message,
    );
  }
}

run();
