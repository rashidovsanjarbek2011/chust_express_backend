const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");


// --- Formatting is handled in productController.js ---


// ====================================
// IMPORT CONTROLLER
// ====================================
const productController = require("../controllers/productController");

// ====================================
// ROUTE MAPPING
// ====================================

// Public routes
router.get("/", productController.getProducts);
router.get("/categories", productController.getCategories);

// Protected routes (Specific paths MUST be before wildcards)
router.get("/seller/stats", protect, productController.getSellerStats);
router.post("/", protect, productController.createProduct);

// Wildcard routes (MUST be at the end)
router.get("/:id", productController.getProductById);
router.put("/:id", protect, productController.updateProduct);
router.delete("/:id", protect, productController.deleteProduct);

module.exports = router;
// Force Deploy
