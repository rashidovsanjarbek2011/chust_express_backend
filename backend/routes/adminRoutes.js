const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { requireRole, authorize } = require("../middleware/role");
const {
  getAllUsers,
  getAllOrders,
  getDeliveryCode,
  deleteUser,
  toggleUserPause,
} = require("../controllers/adminController");

// All admin routes require authentication
router.use(protect);

// User management - allow read for managers and admins, delete only for admins
router.get("/users", authorize(["administrator", "manager"]), getAllUsers);
router.patch(
  "/users/:id/pause",
  authorize(["administrator", "manager"]),
  toggleUserPause,
);
router.delete("/users/:id", requireRole("administrator"), deleteUser);

// Order management - only admins
router.get(
  "/orders",
  authorize(["administrator", "shop_owner", "shop_worker"]),
  getAllOrders,
);

// Delivery code - only admins
router.get("/delivery-code", requireRole("administrator"), getDeliveryCode);

module.exports = router;
