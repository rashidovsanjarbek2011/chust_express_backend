// backend/controllers/deliveryController.js

// @desc    Get all available orders for delivery (Pending/Processing and no driver assigned)
// @route   GET /api/deliveries/available
// @access  Private (Delivery Driver)
exports.getAvailableOrders = async (req, res) => {
  try {
    const orders = await req.prisma.order.findMany({
      where: {
        orderStatus: { in: ["Pending", "Processing"] },
        deliveryId: null,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            latitude: true,
            longitude: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error("Error fetching available orders:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Serverda xatolik yuz berdi." });
  }
};

// @desc    Get all delivery types (Tariffs)
// @route   GET /api/delivery/types
// @access  Public
exports.getDeliveryTypes = async (req, res) => {
  try {
    const types = await req.prisma.deliveryType.findMany({
      orderBy: { baseCostPerKm: "asc" },
    });
    res.status(200).json({ success: true, count: types.length, data: types });
  } catch (error) {
    console.error("Error fetching delivery types:", error);
    res
      .status(500)
      .json({ success: false, message: "Tariflarni yuklab bo'lmadi." });
  }
};

// @desc    Courier accepts order
// @route   POST /api/deliveries/take/:orderId
exports.takeOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const parsedOrderId = parseInt(orderId, 10);
    if (isNaN(parsedOrderId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order ID" });
    }

    const result = await req.prisma.$transaction(async (prisma) => {
      const order = await prisma.order.findUnique({
        where: { id: parsedOrderId },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      if (order.deliveryId) {
        throw new Error(
          "This order has already been taken by another courier.",
        );
      }

      const delivery = await prisma.delivery.create({
        data: {
          deliveryStatus: "Accepted",
          driverId: req.user.id,
          orderId: parsedOrderId,
          assignedAt: new Date(),
        },
      });

      const updatedOrder = await prisma.order.update({
        where: { id: parsedOrderId },
        data: {
          orderStatus: "Processing",
          deliveryId: delivery.id,
        },
      });

      return { order: updatedOrder, delivery };
    });

    // 👇 NEW: Emit real-time events
    if (req.io) {
      req.io.emit("orderTaken", parsedOrderId);
      // Fetch full order with includes for the update event
      const fullOrder = await req.prisma.order.findUnique({
        where: { id: parsedOrderId },
        include: {
          user: true,
          items: { include: { product: true } },
          delivery: true,
        },
      });
      req.io.emit("orderUpdated", fullOrder);
    }

    res.status(200).json({
      success: true,
      message: "Buyurtma qabul qilindi. Do'kon tomon harakatlaning.",
      data: {
        orderId: result.order.id,
        status: result.order.orderStatus,
        deliveryId: result.delivery.id,
      },
    });
  } catch (error) {
    console.error("Error taking order:", error.message);
    const message =
      error.message === "Order not found" ||
      error.message === "This order has already been taken by another courier."
        ? error.message
        : "Serverda xatolik yuz berdi.";

    const status =
      error.message === "Order not found"
        ? 404
        : error.message ===
            "This order has already been taken by another courier."
          ? 400
          : 500;

    res.status(status).json({ success: false, message });
  }
};

// @desc    Update delivery status (e.g. "Picked Up")
// @route   PUT /api/deliveries/:id/status
exports.updateDeliveryStatus = async (req, res) => {
  const { status } = req.body;
  const deliveryId = parseInt(req.params.id, 10);

  try {
    const delivery = await req.prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { order: true },
    });

    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    if (delivery.driverId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updateData = { deliveryStatus: status };
    if (status === "Picked Up") {
      updateData.pickedUpAt = new Date();
    }

    const updatedDelivery = await req.prisma.delivery.update({
      where: { id: deliveryId },
      data: updateData,
    });

    // If Picked Up, update Order to "On the way"
    if (status === "Picked Up") {
      await req.prisma.order.update({
        where: { id: delivery.orderId },
        data: { orderStatus: "On the way" },
      });
    }

    // 👇 NEW: Fetch updated order and emit event
    const fullOrder = await req.prisma.order.findUnique({
      where: { id: delivery.orderId },
      include: {
        user: true,
        items: { include: { product: true } },
        delivery: true,
      },
    });
    if (req.io) req.io.emit("orderUpdated", fullOrder);

    res.json({ success: true, data: updatedDelivery });
  } catch (error) {
    console.error("Error updating delivery status:", error);
    res.status(500).json({ message: "Update failed" });
  }
};

// @desc    Kuryer buyurtmani topshirganini tasdiqlashi
// @route   POST /api/deliveries/complete/:orderId
// @access  Private (Delivery Driver)
exports.completeDelivery = async (req, res) => {
  const { orderId } = req.params;

  try {
    const parsedOrderId = parseInt(orderId, 10);
    const order = await req.prisma.order.findUnique({
      where: { id: parsedOrderId },
      include: { delivery: true },
    });

    if (!order || !order.delivery) {
      return res.status(404).json({
        success: false,
        message: "Buyurtma yoki yetkazib berish ma'lumotlari topilmadi.",
      });
    }

    if (order.delivery.driverId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Siz bu buyurtmaning kuryeri emassiz.",
      });
    }

    // Update Delivery
    await req.prisma.delivery.update({
      where: { id: order.delivery.id },
      data: {
        deliveryStatus: "Delivered",
        deliveredAt: new Date(),
      },
    });

    // Update Order
    await req.prisma.order.update({
      where: { id: parsedOrderId },
      data: {
        orderStatus: "Delivered",
      },
    });

    // 👇 NEW: Fetch updated order and emit event
    const fullOrder = await req.prisma.order.findUnique({
      where: { id: parsedOrderId },
      include: {
        user: true,
        items: { include: { product: true } },
        delivery: true,
      },
    });
    if (req.io) req.io.emit("orderUpdated", fullOrder);

    res.status(200).json({
      success: true,
      message: "Buyurtma muvaffaqiyatli topshirildi!",
    });
  } catch (error) {
    console.error("Error completing delivery:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Serverda xatolik yuz berdi." });
  }
};

// @desc    Kuryer lokatsiyasini yangilash
// @route   PUT /api/deliveries/:id/location
// @access  Private (Delivery Driver)
exports.updateLocation = async (req, res) => {
  const { latitude, longitude } = req.body;
  const deliveryId = parseInt(req.params.id, 10);

  try {
    const delivery = await req.prisma.delivery.findUnique({
      where: { id: deliveryId },
    });

    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    if (delivery.driverId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await req.prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        currentLatitude: parseFloat(latitude),
        currentLongitude: parseFloat(longitude),
      },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({ message: "Location update failed" });
  }
};

// @desc    Get courier's active orders
// @route   GET /api/deliveries/active
// @access  Private (Delivery Driver)
exports.getMyActiveOrders = async (req, res) => {
  try {
    const orders = await req.prisma.order.findMany({
      where: {
        delivery: {
          driverId: req.user.id,
        },
        orderStatus: {
          in: ["Processing", "On the way", "Accepted"], // Exclude "Delivered", "Cancelled"
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        delivery: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error("Error fetching active orders:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Serverda xatolik yuz berdi." });
  }
};

// @desc    Assign a driver to an order (Manager/Admin)
// @route   POST /api/deliveries/assign/:orderId
// @access  Private (Manager/Admin)
exports.assignDriver = async (req, res) => {
  const { orderId } = req.params;
  const { driverId } = req.body;

  try {
    const parsedOrderId = parseInt(orderId, 10);
    const parsedDriverId = parseInt(driverId, 10);

    const order = await req.prisma.order.findUnique({
      where: { id: parsedOrderId },
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Buyurtma topilmadi." });
    }

    if (order.deliveryId) {
      return res.status(400).json({
        success: false,
        message: "Bu buyurtma allaqachon kuryerga biriktirilgan.",
      });
    }

    const driver = await req.prisma.user.findUnique({
      where: { id: parsedDriverId },
    });

    if (!driver || !driver.isDelivery) {
      return res.status(400).json({
        success: false,
        message: "Kuryer topilmadi yoki yetkazib berish huquqiga ega emas.",
      });
    }

    const delivery = await req.prisma.delivery.create({
      data: {
        deliveryStatus: "Accepted",
        driverId: parsedDriverId,
        orderId: parsedOrderId,
        assignedAt: new Date(),
      },
    });

    const updatedOrder = await req.prisma.order.update({
      where: { id: parsedOrderId },
      data: {
        orderStatus: "Processing",
        deliveryId: delivery.id,
      },
    });

    // 👇 Optionally emit events here as well (if you want admin actions to be real-time)
    if (req.io) {
      req.io.emit("orderTaken", parsedOrderId);
      const fullOrder = await req.prisma.order.findUnique({
        where: { id: parsedOrderId },
        include: {
          user: true,
          items: { include: { product: true } },
          delivery: true,
        },
      });
      req.io.emit("orderUpdated", fullOrder);
    }

    res.status(200).json({
      success: true,
      message: "Kuryer muvaffaqiyatli biriktirildi.",
      data: {
        orderId: updatedOrder.id,
        status: updatedOrder.orderStatus,
        deliveryId: delivery.id,
        driverId: parsedDriverId,
      },
    });
  } catch (error) {
    console.error("Error assigning driver:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Serverda xatolik yuz berdi." });
  }
};
