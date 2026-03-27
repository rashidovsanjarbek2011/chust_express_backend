require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function test() {
  try {
    const user = await prisma.user.findFirst({ where: { role: 'user' } });
    if (!user) {
      console.log('No user found');
      return;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    
    // Attempt to create an order
    const payload = {
      orderItems: [
        {
          product: 9999, // Delivery service
          quantity: 1,
        },
      ],
      shippingAddress: "Urganch, Xorazm",
      notes: "Test delivery with preferred courier",
      subtotalPrice: 0,
      deliveryTypeId: 1,
      latitude: 41.2995,
      longitude: 69.2401,
      originLat: 41.3,
      originLng: 69.25,
      paymentMethod: "Cash",
      preferredCourierId: 1 // Assuming courier 1 exists, if not it will just fallback
    };
    
    const orderRes = await axios.post('http://localhost:5000/api/orders', payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Order created successfully:', orderRes.data.id);
  } catch (error) {
    console.error('Test Failed:', error.response ? error.response.data : error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
