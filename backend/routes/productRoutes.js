const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth"); // Verify this path is correct
const { translate } = require("google-translate-api-x");

// Cache for translations to avoid repeated API calls
const translationCache = new Map();

const translateText = async (text, targetLang) => {
  if (!text || !targetLang || targetLang === "ru") return text;
  const cacheKey = `${targetLang}:${text}`;
  if (translationCache.has(cacheKey)) return translationCache.get(cacheKey);

  try {
    const res = await translate(text, { to: targetLang });
    translationCache.set(cacheKey, res.text);
    return res.text;
  } catch (err) {
    console.error("Translation error:", err.message);
    return text; // Fallback to original
  }
};

const translateProduct = async (product, lang) => {
  if (!lang || lang === "ru") return product;
  const [translatedName, translatedDesc] = await Promise.all([
    translateText(product.name, lang),
    translateText(product.description, lang),
  ]);
  return {
    ...product,
    name: translatedName,
    description: translatedDesc,
  };
};

// ====================================
// 1. GET /api/products - Get all products (supports ?search=)
// ====================================
const getProducts = async (req, res) => {
  try {
    const { search, category, lang } = req.query;

    const where = {
      ...(category && { category }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { category: { contains: search, mode: "insensitive" } },
          {
            owner: {
              username: { contains: search, mode: "insensitive" },
            },
          },
        ],
      }),
    };

    const products = await req.prisma.product.findMany({
      where,
      include: {
        owner: {
          select: { id: true, username: true, email: true, role: true, address: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Translate if language requested
    const translatedProducts =
      lang && lang !== "ru"
        ? await Promise.all(products.map((p) => translateProduct(p, lang)))
        : products;

    res
      .status(200)
      .json({ success: true, count: products.length, data: translatedProducts });
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

    const { lang } = req.query;
    const finalProduct =
      lang && lang !== "ru" ? await translateProduct(product, lang) : product;

    res.status(200).json({ success: true, data: finalProduct });
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
// 7. GET /api/products/categories - Get unique categories
// ====================================
const getCategories = async (req, res) => {
  try {
    const categories = await req.prisma.product.groupBy({
      by: ["category"],
      _count: {
        _all: true,
      },
      where: {
        isActive: true,
      },
    });

    const formattedCategories = categories
      .map((c) => c.category)
      .filter((c) => c && c !== "Not Selected");

    res.status(200).json({ success: true, data: formattedCategories });
  } catch (error) {
    console.error("❌ getCategories error:", error.message);
    res.status(500).json({
      success: false,
      message: "Kategoriyalarni olishda xatolik.",
      error: error.message,
    });
  }
};

// ====================================
// ROUTE MAPPING
// ====================================

// Public Routes
router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/:id", getProductById);

// Protected Routes (Authentication required)
router.use(protect);
router.get("/seller/stats", getSellerStats);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

// EXPORT THE ROUTER
module.exports = router;
