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

// PUBLIC ROUTES (no authentication required)
router.get("/", productController.getProducts);
router.get("/categories", productController.getCategories);
router.get("/:id", productController.getProductById);  // ⬅️ MOVED HERE: Public product detail

// PROTECTED ROUTES (authentication required)
router.get("/seller/stats", protect, productController.getSellerStats);
router.post("/", protect, productController.createProduct);
router.put("/:id", protect, productController.updateProduct);
router.delete("/:id", protect, productController.deleteProduct);

module.exports = router;
// Force Deploy
