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