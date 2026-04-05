const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { translate } = require("google-translate-api-x");

// Cache for translations
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
    return text;
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
// HELPER: Convert database image (JSON string) to frontend images (array)
// ====================================
const dbImageToFrontendImages = (dbImage) => {
  if (!dbImage) return ["https://placehold.co/400x300?text=No+Image"];
  
  try {
    // Try to parse as JSON (multiple images)
    const parsed = JSON.parse(dbImage);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.filter(img => img && img.trim());
    }
    return [dbImage];
  } catch (e) {
    // Not JSON, treat as single image
    return [dbImage];
  }
};

// ====================================
// HELPER: Convert frontend images (array) to database image (JSON string)
// ====================================
const frontendImagesToDbImage = (images) => {
  if (!images) {
    return JSON.stringify(["https://placehold.co/400x300?text=No+Image"]);
  }
  
  let imagesArray = [];
  
  if (Array.isArray(images)) {
    imagesArray = images;
  } else if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images);
      imagesArray = Array.isArray(parsed) ? parsed : [images];
    } catch {
      imagesArray = [images];
    }
  } else {
    imagesArray = [String(images)];
  }
  
  // Clean up images
  imagesArray = imagesArray
    .filter(img => img && typeof img === 'string' && img.trim())
    .map(img => img.trim())
    .slice(0, 5);
  
  if (imagesArray.length === 0) {
    imagesArray = ["https://placehold.co/400x300?text=No+Image"];
  }
  
  return JSON.stringify(imagesArray);
};

// ====================================
// HELPER: Format product for frontend response
// ====================================
const formatProductResponse = (product) => {
  if (!product) return product;
  
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    stock: product.stock,
    description: product.description,
    category: product.category,
    images: dbImageToFrontendImages(product.image),
    weight: product.weight,
    unit: product.unit,
    currency: product.currency,
    deliveryPrice: product.deliveryPrice,
    isActive: product.isActive,
    shopAddress: product.shopAddress || "",
    ownerId: product.ownerId,
    owner: product.owner,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

// ====================================
// 1. GET /api/products - Get all products
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

    // Format each product (convert image JSON to images array)
    const formattedProducts = products.map(formatProductResponse);

    // Translate if needed
    const translatedProducts = lang && lang !== "ru"
      ? await Promise.all(formattedProducts.map((p) => translateProduct(p, lang)))
      : formattedProducts;

    res.status(200).json({ 
      success: true, 
      count: formattedProducts.length, 
      data: translatedProducts 
    });
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
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Mahsulot topilmadi." 
      });
    }

    const formattedProduct = formatProductResponse(product);

    const { lang } = req.query;
    const finalProduct = lang && lang !== "ru" 
      ? await translateProduct(formattedProduct, lang) 
      : formattedProduct;

    res.status(200).json({ success: true, data: finalProduct });
  } catch (error) {
    console.error("❌ getProductById error:", error.message);
    res.status(500).json({
      success: false,
      message: "Mahsulotni olishda xatolik.",
      error: error.message,
    });
  }
};

// ====================================
// 3. POST /api/products - Create product with multiple images
// ====================================
const createProduct = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      stock, 
      category, 
      images,
      shopAddress,
      weight,
      unit,
      currency,
      deliveryPrice,
      isActive 
    } = req.body;

    console.log("📦 Creating product with multiple images:");
    console.log("  - Name:", name);
    console.log("  - Price:", price);
    console.log("  - Images count:", images?.length || 0);
    console.log("  - Images:", images);

    // Validation
    if (!name || !price) {
      return res.status(400).json({ 
        success: false, 
        message: "Nomi va narxi majburiy." 
      });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Narx noto'g'ri formatda." 
      });
    }

    const parsedStock = stock ? parseInt(stock, 10) : 0;
    const parsedWeight = weight ? parseFloat(weight) : 1.0;
    const parsedDeliveryPrice = deliveryPrice ? parseFloat(deliveryPrice) : 0.0;
    
    // Convert multiple images array to JSON string for database
    const imageJsonString = frontendImagesToDbImage(images);
    console.log("  - Stored as JSON:", imageJsonString.substring(0, 100) + "...");

    const product = await req.prisma.product.create({
      data: {
        name: String(name).trim(),
        description: description ? String(description).trim() : null,
        price: parsedPrice,
        stock: parsedStock,
        category: category ? String(category).trim() : "Not Selected",
        image: imageJsonString, // Store JSON string of multiple images
        weight: parsedWeight,
        unit: unit || "pcs",
        currency: currency || "UZS",
        deliveryPrice: parsedDeliveryPrice,
        isActive: isActive !== undefined ? isActive : true,
        shopAddress: shopAddress && shopAddress !== "null" ? shopAddress.trim() : "",
        ownerId: req.user.id,
      },
      include: {
        owner: {
          select: { id: true, username: true, email: true, role: true, address: true },
        },
      },
    });
    
    console.log("✅ Product created with ID:", product.id);
    
    // Format response with images array
    const formattedProduct = formatProductResponse(product);
    
    res.status(201).json({ 
      success: true, 
      message: "Mahsulot muvaffaqiyatli yaratildi.",
      data: formattedProduct 
    });
  } catch (error) {
    console.error("❌ createProduct error:", error);
    
    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "Bu nomdagi mahsulot allaqachon mavjud.",
      });
    }
    
    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: "Foydalanuvchi topilmadi. Iltimos qayta login qiling.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Mahsulot yaratishda xatolik: " + error.message,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ====================================
// 4. PUT /api/products/:id - Update product
// ====================================
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle multiple images - convert array to JSON string
    if (updateData.images !== undefined) {
      updateData.image = frontendImagesToDbImage(updateData.images);
      delete updateData.images;
    }

    // Remove unwanted fields
    delete updateData.id;
    delete updateData.ownerId;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // Validate price
    if (updateData.price !== undefined) {
      updateData.price = isNaN(parseFloat(updateData.price)) 
        ? undefined 
        : parseFloat(updateData.price);
    }

    // Validate stock
    if (updateData.stock !== undefined) {
      updateData.stock = isNaN(parseInt(updateData.stock, 10)) 
        ? undefined 
        : parseInt(updateData.stock, 10);
    }

    // Handle NULL values
    if (updateData.shopAddress === null || updateData.shopAddress === undefined) {
      updateData.shopAddress = "";
    }
    
    if (updateData.category === null || updateData.category === 'null') {
      updateData.category = "Not Selected";
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    const product = await req.prisma.product.update({
      where: { id: parseInt(id, 10) },
      data: updateData,
      include: {
        owner: {
          select: { id: true, username: true, email: true, role: true, address: true },
        },
      },
    });

    const formattedProduct = formatProductResponse(product);

    res.status(200).json({ 
      success: true, 
      message: "Mahsulot muvaffaqiyatli yangilandi.",
      data: formattedProduct 
    });
  } catch (error) {
    console.error("❌ updateProduct error:", error);
    res.status(500).json({
      success: false,
      message: "Mahsulotni yangilashda xatolik.",
      error: error.message,
    });
  }
};

// ====================================
// 5. DELETE /api/products/:id - Delete product
// ====================================
const deleteProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    const product = await req.prisma.product.findUnique({
      where: { id: productId },
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Mahsulot topilmadi.",
      });
    }
    
    if (product.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: "Siz faqat o'zingizning mahsulotingizni o'chira olasiz.",
      });
    }
    
    await req.prisma.product.delete({ 
      where: { id: productId } 
    });
    
    res.status(200).json({ 
      success: true, 
      message: "Mahsulot o'chirildi." 
    });
  } catch (error) {
    console.error("❌ deleteProduct error:", error);
    res.status(500).json({
      success: false,
      message: "Mahsulotni o'chirishda xatolik.",
      error: error.message,
    });
  }
};

// ====================================
// 6. GET /api/products/seller/stats - Seller stats
// ====================================
const getSellerStats = async (req, res) => {
  try {
    const products = await req.prisma.product.findMany({
      where: { ownerId: req.user.id },
      include: {
        orderItems: {
          select: {
            quantity: true,
            price: true,
          },
        },
      },
    });
    
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const totalValue = products.reduce(
      (sum, p) => sum + (p.price || 0) * (p.stock || 0),
      0,
    );
    
    const stats = products.map((product) => {
      const soldCount = product.orderItems.reduce(
        (acc, item) => acc + item.quantity,
        0,
      );
      const totalRevenue = product.orderItems.reduce(
        (acc, item) => acc + item.quantity * item.price,
        0,
      );
      const formatted = formatProductResponse(product);
      return {
        id: formatted.id,
        name: formatted.name,
        price: formatted.price,
        stock: formatted.stock,
        soldCount,
        totalRevenue,
        images: formatted.images,
        shopAddress: formatted.shopAddress,
        category: formatted.category,
        isActive: formatted.isActive,
      };
    });
    
    res.status(200).json({
      success: true,
      data: {
        productCount: products.length,
        totalStock,
        totalValue,
        products: stats,
      },
    });
  } catch (error) {
    console.error("❌ getSellerStats error:", error);
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

// Protected Routes
router.use(protect);
router.get("/seller/stats", getSellerStats);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;