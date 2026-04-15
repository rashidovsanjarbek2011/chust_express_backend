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
    const parsed = JSON.parse(dbImage);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.filter((img) => img && img.trim());
    }
    return [dbImage];
  } catch (e) {
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

  imagesArray = imagesArray
    .filter((img) => img && typeof img === "string" && img.trim())
    .map((img) => img.trim())
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
// IMPORT CONTROLLER
// ====================================
const productController = require("../controllers/productController");

// ====================================
// ROUTE MAPPING
// ====================================

// Public routes — specific paths BEFORE wildcard /:id
router.get("/", productController.getProducts);
router.get("/categories", productController.getCategories);

// Protected routes — specific paths BEFORE wildcard /:id
router.use(protect);
router.get("/seller/stats", productController.getSellerStats);
router.post("/", productController.createProduct);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

// Wildcard /:id — ALWAYS LAST 
router.get("/:id", productController.getProductById);

module.exports = router;