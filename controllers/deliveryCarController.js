// backend/controllers/deliveryCarController.js
// Using Prisma instead of Mongoose

// @desc    Add a new delivery car
// @route   POST /api/delivery/cars
// @access  Private (Administrator Only)
exports.addCar = async (req, res, next) => {
  // Check if user is admin
  if (req.user.role !== "administrator") {
    return res.status(403).json({ message: "Not authorized to add cars." });
  }

  try {
    const carData = {
      driverName: req.body.driverName,
      driverPhone: req.body.driverPhone,
      carModel: req.body.carModel,
      carNumber: req.body.carNumber,
      carStatus: req.body.carStatus || "Available",
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
    };

    // If driverId is provided, link to user
    if (req.body.driverId) {
      carData.driverId = parseInt(req.body.driverId);
    }

    const car = await req.prisma.deliveryCar.create({
      data: carData,
    });

    res.status(201).json({ success: true, data: car });
  } catch (error) {
    // Handle unique constraint violation for carNumber
    if (error.code === "P2002" && error.meta?.target?.includes("carNumber")) {
      return res
        .status(400)
        .json({ message: "License plate already registered." });
    }
    console.error("Failed to add car:", error);
    res
      .status(400)
      .json({ message: "Failed to add car", details: error.message });
  }
};

// @desc    Get all delivery cars
// @route   GET /api/delivery/cars
// @access  Private (Administrator Only)
exports.getCars = async (req, res, next) => {
  // Check if user is admin
  if (req.user.role !== "administrator") {
    return res.status(403).json({ message: "Not authorized to view cars." });
  }

  try {
    const cars = await req.prisma.deliveryCar.findMany({
      include: {
        driver: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        currentDelivery: {
          select: {
            id: true,
            deliveryStatus: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({ success: true, count: cars.length, data: cars });
  } catch (error) {
    console.error("Error fetching cars:", error);
    res
      .status(500)
      .json({ message: "Error fetching cars", details: error.message });
  }
};

// @desc    Assign a worker to a car for a shift
// @route   PUT /api/delivery/cars/:id/driver
// @access  Private (Administrator Only)
exports.assignDriverToCar = async (req, res, next) => {
  // Check if user is admin
  if (req.user.role !== "administrator") {
    return res.status(403).json({ message: "Not authorized to assign drivers." });
  }

  const { driverId } = req.body; // Driver ID to assign or null to unassign

  try {
    const carId = parseInt(req.params.id);
    
    if (isNaN(carId)) {
      return res.status(400).json({ message: "Invalid car ID." });
    }

    const car = await req.prisma.deliveryCar.findUnique({
      where: { id: carId }
    });
    
    if (!car) {
      return res.status(404).json({ message: "Car not found." });
    }

    let driver = null;
    if (driverId) {
      const driverIdInt = parseInt(driverId);
      if (isNaN(driverIdInt)) {
        return res.status(400).json({ message: "Invalid driver ID." });
      }

      driver = await req.prisma.user.findUnique({
        where: { id: driverIdInt }
      });
      
      if (!driver || driver.role !== "shop_worker") {
        return res
          .status(400)
          .json({ message: "Invalid or non-worker driver ID." });
      }
    }

    const updatedCar = await req.prisma.deliveryCar.update({
      where: { id: carId },
      data: {
        driverId: driverId ? parseInt(driverId) : null,
        carStatus: driverId ? "On Shift" : "Available"
      },
      include: {
        driver: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: `Driver ${driverId ? "assigned" : "unassigned"} successfully.`,
      data: updatedCar,
    });
  } catch (error) {
    console.error("Error assigning driver to car:", error);
    res.status(500).json({
      message: "Error assigning driver to car",
      details: error.message,
    });
  }
};

// @desc    Update car status (e.g., set to maintenance)
// @route   PUT /api/delivery/cars/:id/status
// @access  Private (Administrator Only)
exports.updateCarStatus = async (req, res, next) => {
  // Check if user is admin
  if (req.user.role !== "administrator") {
    return res.status(403).json({ message: "Not authorized to update car status." });
  }

  const { carStatus } = req.body;

  if (
    !["Available", "On Shift", "Delivering", "Maintenance"].includes(carStatus)
  ) {
    return res.status(400).json({ message: "Invalid car status." });
  }

  try {
    const carId = parseInt(req.params.id);
    
    if (isNaN(carId)) {
      return res.status(400).json({ message: "Invalid car ID." });
    }

    const car = await req.prisma.deliveryCar.findUnique({
      where: { id: carId },
      include: {
        currentDelivery: {
          select: {
            id: true,
            deliveryStatus: true
          }
        }
      }
    });
    
    if (!car) {
      return res.status(404).json({ message: "Car not found." });
    }

    // Prevent changing status if the car is currently delivering
    if (car.currentDeliveryId && carStatus !== "Delivering") {
      return res.status(400).json({
        message:
          "Cannot change status while car is linked to an active delivery.",
      });
    }

    const updatedCar = await req.prisma.deliveryCar.update({
      where: { id: carId },
      data: { carStatus: carStatus },
      include: {
        driver: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        currentDelivery: {
          select: {
            id: true,
            deliveryStatus: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: `Car status updated to ${carStatus}.`,
      data: updatedCar,
    });
  } catch (error) {
    console.error("Error updating car status:", error);
    res
      .status(500)
      .json({ message: "Error updating car status", details: error.message });
  }
};
