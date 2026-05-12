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

// Public product detail — shoppers must be able to view a product
// before being asked to log in. This stays BEFORE the protect middleware.
router.get("/:id", productController.getProductById);

// Protected routes — write/seller operations require auth.
router.use(protect);
router.get("/seller/stats", productController.getSellerStats);
router.post("/", productController.createProduct);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;