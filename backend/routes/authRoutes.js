// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

// Controllers
const {
  registerUser,
  loginUser,
  getMe,
  registerShopWorker,
  updateProfile,
  registerDelivery,
  updateDeliveryVehicle,
} = require("../controllers/authController");

// Middleware
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

// ======================
// 🔒 Rate limiting
// ======================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: "Juda ko'p urinishlar, keyinroq qayta urinib ko'ring." },
});

// ======================
// 📤 Public routes
// ======================
router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/register/delivery", registerDelivery);

// ======================
// 🔐 Protected routes
// ======================
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/delivery/vehicle", protect, updateDeliveryVehicle);

// ======================
// 🛠️ Admin routes
// ======================
router.post(
  "/admin/register/worker",
  
  protect,
  authorize(["administrator"]),
  registerShopWorker
);

module.exports = router;