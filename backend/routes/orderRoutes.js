// backend/routes/orderRoutes.js

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderStatus,
  getMyOrders,
  getAllOrders,
} = require("../controllers/orderController");

// ------------------------------------------------------------------
// SPECIFIC ROUTES (Must come BEFORE dynamic /:id routes)
// ------------------------------------------------------------------

// Create a new order (Checkout)
// POST /api/orders
router.post(
  "/",
  protect,
  authorize([
    "user",
    "administrator",
    "shop_owner",
    "shop_worker",
    "delivery",
    "manager",
  ]), // Allow all roles to order
  addOrderItems,
);

// Get user's logged-in orders
// GET /api/orders/myorders
// ⚠️ CRITICAL: Must be BEFORE /:id route
router.get(
  "/myorders",
  protect,
  authorize([
    "user",
    "administrator",
    "shop_owner",
    "shop_worker",
    "delivery",
    "manager",
  ]), // Allow all roles to see their orders
  getMyOrders,
);

// Get all orders (for processing/review)
// GET /api/orders/admin
// ⚠️ CRITICAL: Must be BEFORE /:id route
router.get(
  "/admin",
  protect,
  authorize(["administrator", "shop_worker", "manager"]),
  getAllOrders,
);

// ------------------------------------------------------------------
// DYNAMIC ROUTES (Must come AFTER specific routes)
// ------------------------------------------------------------------

// Update order status (Processing, Shipped, Delivered)
// PUT /api/orders/:id/status
// ⚠️ This is OK to be before /:id because it's more specific (has /status)
router.put(
  "/:id/status",
  protect,
  authorize(["administrator", "shop_worker", "manager"]),
  updateOrderStatus,
);

// Update order to paid status (Simulates payment gateway callback)
// PUT /api/orders/:id/pay
// ⚠️ This is OK to be before /:id because it's more specific (has /pay)
router.put("/:id/pay", protect, updateOrderToPaid);

// Get order details by ID
// GET /api/orders/:id
// ⚠️ CRITICAL: This must come LAST among GET routes
router.get("/:id", protect, getOrderById);

module.exports = router;
