// backend/routes/deliveryRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAvailableOrders,
  takeOrder,
  updateDeliveryStatus,
  completeDelivery,
  updateLocation,
  getDeliveryTypes,
  getMyActiveOrders,
  assignDriver,
  Status,
} = require("../controllers/deliveryController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

// Kuryerlar uchun endpointlar
// Faqat 'delivery', 'administrator' va 'shop_worker' rollari kuryerlik qilishi mumkin (user istagiga ko'ra 'delivery' asosiy)
router.get(
  "/available",
  protect,
  authorize([
    "delivery",
    "administrator",
    "shop_owner",
    "shop_worker",
    "manager",
  ]),
  getAvailableOrders,
);
router.post(
  "/take/:orderId",
  protect,
  authorize([
    "delivery",
    "administrator",
    "shop_owner",
    "shop_worker",
    "manager",
  ]),
  takeOrder,
);
router.put(
  "/:id/status",
  protect,
  authorize([
    "delivery",
    "administrator",
    "shop_owner",
    "shop_worker",
    "manager",
  ]),
  updateDeliveryStatus,
);
router.post(
  "/complete/:orderId",
  protect,
  authorize([
    "delivery",
    "administrator",
    "shop_owner",
    "shop_worker",
    "manager",
  ]),
  completeDelivery,
);
router.put(
  "/:id/location",
  protect,
  authorize([
    "delivery",
    "administrator",
    "shop_owner",
    "shop_worker",
    "manager",
  ]),
  updateLocation,
);

router.get(
  "/active",
  protect,
  authorize(["delivery", "administrator", "shop_worker", "shop_owner"]),
  getMyActiveOrders,
);

router.post(
  "/assign/:orderId",
  protect,
  authorize(["administrator", "manager", "shop_owner"]),
  assignDriver,
);

// @desc    Get all delivery types (Public)
router.get("/types", getDeliveryTypes);

module.exports = router;
