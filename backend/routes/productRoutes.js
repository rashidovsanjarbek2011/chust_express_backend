const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth"); // Verify this path is correct

// ====================================
// 1. GET /api/products - Get all products
// ====================================
const getProducts = async (req, res) => {
  try {
    const products = await req.prisma.product.findMany({
      include: {
        owner: {
          select: { id: true, username: true, email: true, role: true, address: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res
      .status(200)
      .json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error("❌ getProducts error:", error.message);
    res.status(500).json({
      success: false,
      message: "Mahsulotlarni olishda xatolik.",
      error: error.message,
    });
  }
};

// ====================================
// 2. GET /api/products/:id - Get single product
// ====================================
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await req.prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        owner: {
          select: { id: true, username: true, email: true, role: true, address: true },
        },
      },
    });
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Mahsulot topilmadi." });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Mahsulotni olishda xatolik.",
      error: error.message,
    });
  }
};

// ====================================
// 3. POST /api/products - Create product (Protected)
// ====================================
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, image } = req.body;
    if (!name || !price)
      return res
        .status(400)
        .json({ success: false, message: "Nomi va narxi majburiy." });

    const product = await req.prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: stock ? parseInt(stock) : 0,
        category,
        image,
        ownerId: req.user.id,
      },
    });
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Mahsulot yaratishda xatolik.",
      error: error.message,
    });
  }
};

// ====================================
// 4. PUT /api/products/:id - Update product (Protected)
// ====================================
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await req.prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        ...req.body,
        price: req.body.price ? parseFloat(req.body.price) : undefined,
        stock:
          req.body.stock !== undefined ? parseInt(req.body.stock) : undefined,
      },
    });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Mahsulotni yangilashda xatolik.",
      error: error.message,
    });
  }
};

// ====================================
// 5. DELETE /api/products/:id - Delete product (Protected)
// ====================================
const deleteProduct = async (req, res) => {
  try {
    await req.prisma.product.delete({ where: { id: parseInt(req.params.id) } });
    res.status(200).json({ success: true, message: "Mahsulot o'chirildi." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Mahsulotni o'chirishda xatolik.",
      error: error.message,
    });
  }
};

// ====================================
// 6. GET /api/products/seller/stats - Seller stats (Protected)
// ====================================
const getSellerStats = async (req, res) => {
  try {
    const products = await req.prisma.product.findMany({
      where: { ownerId: req.user.id },
    });
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const totalValue = products.reduce(
      (sum, p) => sum + (p.price || 0) * (p.stock || 0),
      0,
    );
    res.status(200).json({
      success: true,
      data: {
        productCount: products.length,
        totalStock,
        totalValue,
        products,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Statistikani olishda xatolik.",
      error: error.message,
    });
  }
};

// ====================================
// ROUTE MAPPING
// ====================================

// Public Routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Protected Routes (Authentication required)
router.use(protect);
router.get("/seller/stats", getSellerStats);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

// EXPORT THE ROUTER
module.exports = router;
