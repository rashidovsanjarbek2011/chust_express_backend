// backend/routes/deliveryCarRoutes.js

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const {
  addCar,
  getCars,
  assignDriverToCar,
  updateCarStatus,
} = require("../controllers/deliveryCarController");

// ------------------------------------------------------------------
// ADMIN ROUTES (Fleet Management)
// ------------------------------------------------------------------

// All routes require authentication and only Admin can manage the fleet
router.use(protect, authorize(["administrator"]));

// Add a new delivery car
// POST /api/delivery/cars
router.post("/", addCar);

// Get all delivery cars
// GET /api/delivery/cars
router.get("/", getCars);

// Assign a driver to a car for a shift
// PUT /api/delivery/cars/:id/driver
router.put("/:id/driver", assignDriverToCar);

// Update car status (e.g., maintenance)
// PUT /api/delivery/cars/:id/status
router.put("/:id/status", updateCarStatus);

module.exports = router;
