// backend/controllers/orderController.js
// Using Prisma instead of Mongoose

// Helper: check if user is admin or shop_worker
const canManageOrder = (req, order) => {
  if (req.user.role === "administrator") return true;
  if (req.user.role === "shop_worker") return true;
  if (req.user.role === "shop_owner") return true;
  return false;
};

// @desc    Create new order & decrease inventory
// @route   POST /api/orders
// @access  Private (User/Customer)
exports.addOrderItems = async (req, res) => {
  const {
    orderItems: clientOrderItems,
    shippingAddress,
    paymentMethod,
    subtotalPrice,
    latitude,
    longitude,
    deliveryTypeId,
    preferredCourierId,
  } = req.body;

  if (!clientOrderItems || clientOrderItems.length === 0) {
    return res.status(400).json({ message: "No order items provided." });
  }
  if (
    !shippingAddress ||
    typeof shippingAddress !== "string" ||
    shippingAddress.trim().length < 5
  ) {
    return res
      .status(400)
      .json({ message: "Shipping address is required and must be valid." });
  }
  const parsedSubtotal = parseFloat(subtotalPrice);
  if (isNaN(parsedSubtotal) || parsedSubtotal < 0) {
    return res
      .status(400)
      .json({ message: "Subtotal price must be a valid non-negative number." });
  }

  try {
    let totalOrderWeight = 0;
    const sessionOrderItems = [];
    let originLat = null;
    let originLng = null;

    const order = await req.prisma.$transaction(async (prisma) => {
      for (const item of clientOrderItems) {
        const productId = parseInt(item.product, 10);
        const quantity = parseInt(item.quantity, 10);

        if (isNaN(productId))
          throw new Error(`Invalid product ID: ${item.product}`);
        if (isNaN(quantity) || quantity <= 0)
          throw new Error(`Invalid quantity for product: ${item.product}`);

        // DELIVERY SERVICE LOGIC (Product 9999)
        const isDeliveryService = productId === 9999;
        let product;

        if (isDeliveryService) {
          // Mock product for delivery service
          product = {
            id: 9999,
            name: "Yetkazib Berish Xizmati",
            price: 0,
            weight: 0,
            stock: 999999,
            owner: null,
          };

          // Use provided origin coordinates if available
          if (req.body.originLat && req.body.originLng) {
            originLat = parseFloat(req.body.originLat);
            originLng = parseFloat(req.body.originLng);
          }
        } else {
          // Normal Product
          product = await prisma.product.findUnique({
            where: { id: productId },
            include: { owner: true },
          });
          if (!product) throw new Error(`Product not found: ${item.product}`);

          // Use Owner's Shop Location if not set
          if (!originLat && product.owner && product.owner.latitude) {
            originLat = product.owner.latitude;
            originLng = product.owner.longitude;
          }

          // Check Stock
          if (product.stock < quantity)
            throw new Error(`Insufficient stock for ${product.name}`);
        }

        sessionOrderItems.push({
          name: product.name,
          quantity,
          price: product.price,
          weight: product.weight || 0,
          productId: product.id,
        });

        totalOrderWeight += (product.weight || 0) * quantity;

        // Decrease stock only for normal products
        if (!isDeliveryService) {
          await prisma.product.update({
            where: { id: product.id },
            data: { stock: product.stock - quantity },
          });
        }
      }

      // Haversine formula to calculate distance
      const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * (Math.PI / 180)) *
          Math.cos(lat2 * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };

      let deliveryDistance = 5.0; // Default fallback in km
      if (originLat && originLng && latitude && longitude) {
        deliveryDistance = getDistanceFromLatLonInKm(
          originLat,
          originLng,
          parseFloat(latitude),
          parseFloat(longitude),
        );
      }

      // Fetch delivery type
      let deliveryType;
      if (deliveryTypeId) {
        deliveryType = await prisma.deliveryType.findUnique({
          where: { id: parseInt(deliveryTypeId) },
        });
      } else {
        // Fallback to first available type
        deliveryType = await prisma.deliveryType.findFirst();
      }

      if (!deliveryType) {
        throw new Error("No delivery type available for calculation.");
      }

      // Calculate Shipping Price: Base Price + (Distance * Rate)
      const shippingPrice =
        deliveryType.basePrice + deliveryDistance * deliveryType.baseCostPerKm;
      const finalTotalPrice = parsedSubtotal + shippingPrice;

      // Create order first without items
      const newOrder = await prisma.order.create({
        data: {
          userId: req.user.id,
          shippingAddress: shippingAddress.trim(),
          paymentMethod,
          subtotalPrice: parsedSubtotal,
          shippingPrice,
          totalPrice: finalTotalPrice,
          deliveryTypeId: deliveryType.id,
          orderStatus: "Pending",
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          originLat: originLat,
          originLng: originLng,
        },
      });

      // Bypass strict Prisma Client validation if Render has cached an old schema
      if (preferredCourierId) {
        try {
          await prisma.$executeRawUnsafe(
            `UPDATE "Order" SET "preferredCourierId" = $1 WHERE id = $2`,
            parseInt(preferredCourierId),
            newOrder.id
          );
        } catch (rawErr) {
          console.error("Raw SQL update preferredCourierId failed:", rawErr);
        }
      }

      // If a preferred courier is chosen, create delivery record immediately
      if (preferredCourierId) {
        const delivery = await prisma.delivery.create({
          data: {
            orderId: newOrder.id,
            driverId: parseInt(preferredCourierId),
            deliveryStatus: "Pending",
            assignedAt: new Date(),
          },
        });
        
        // Link delivery to order
        await prisma.order.update({
          where: { id: newOrder.id },
          data: { deliveryId: delivery.id }
        });
      }

      // Then create order items with the order ID
      for (const item of sessionOrderItems) {
        await prisma.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            name: item.name,
            weight: item.weight,
          },
        });
      }

      // Return full order with items and relations
      return prisma.order.findUnique({
        where: { id: newOrder.id },
        include: {
          items: true,
          deliveryType: true,
          user: { select: { id: true, username: true, email: true } },
        },
      });
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Order creation failed:", error.message);
    res
      .status(500)
      .json({ message: error.message || "Order creation failed." });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private (Owner, Admin, Worker, or Assigned Driver)
exports.getOrderById = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    if (isNaN(orderId))
      return res.status(400).json({ message: "Invalid order ID." });

    const order = await req.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, username: true, email: true } },
        deliveryType: { select: { typeName: true, baseCostPerKm: true } },
        items: {
          include: {
            product: {
              include: {
                owner: true,
              },
            },
          },
        },
        delivery: true,
      },
    });
    if (!order) return res.status(404).json({ message: "Order not found." });

    const isOwner = order.userId === req.user.id;
    const isAdminOrWorker = canManageOrder(req, order);
    const isAssignedDriver =
      order.delivery && Number(order.delivery.driverId) === Number(req.user.id);

    if (!(isOwner || isAdminOrWorker || isAssignedDriver)) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this order." });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order:", error.message);
    res.status(500).json({ message: "Error fetching order." });
  }
};

// @desc    Update order to paid status
// @route   PUT /api/orders/:id/pay
// @access  Private (Owner only)
exports.updateOrderToPaid = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    if (isNaN(orderId))
      return res.status(400).json({ message: "Invalid order ID." });

    const order = await req.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ message: "Order not found." });
    if (order.userId !== req.user.id)
      return res.status(403).json({ message: "Not authorized." });
    if (order.isPaid)
      return res.status(400).json({ message: "Order already paid." });

    const paymentResult = {
      id: req.body.id || "PAY_SIM_" + Date.now(),
      status: req.body.status || "COMPLETED",
      update_time: new Date().toISOString(),
      email_address: req.user.email,
    };

    const updatedOrder = await req.prisma.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paidAt: new Date(),
        orderStatus: "Processing",
        notes: JSON.stringify(paymentResult),
      },
      include: {
        user: { select: { id: true, username: true, email: true } },
        items: { include: { product: true } },
      },
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error("Payment update failed:", error.message);
    res.status(500).json({ message: "Payment update failed." });
  }
};

// @desc    ADMIN/WORKER: Update order status (Processing, Shipped, Delivered)
// @route   PUT /api/orders/:id/status
// @access  Private (Admin/Shop Worker/Shop Owner)
exports.updateOrderStatus = async (req, res) => {
  const { orderStatus } = req.body;
  if (!orderStatus)
    return res.status(400).json({ message: "Order status required." });

  try {
    const orderId = parseInt(req.params.id, 10);
    if (isNaN(orderId))
      return res.status(400).json({ message: "Invalid order ID." });

    const order = await req.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ message: "Order not found." });
    if (!canManageOrder(req, order))
      return res.status(403).json({ message: "Not authorized." });

    const updateData = { orderStatus };
    if (orderStatus === "Delivered") {
      updateData.isDelivered = true;
      updateData.deliveredAt = new Date();
    }

    const updatedOrder = await req.prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        user: { select: { id: true, username: true, email: true } },
        items: { include: { product: true } },
      },
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error("Status update failed:", error.message);
    res.status(500).json({ message: "Status update failed." });
  }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/myorders
// @access  Private (User/Customer)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await req.prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        user: { select: { id: true, username: true, email: true } },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                category: true,
                shopAddress: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error("Error fetching user orders:", error.message);
    res.status(500).json({ message: "Error fetching user orders." });
  }
};

// @desc    Get ALL orders
// @route   GET /api/orders/admin
// @access  Private (Admin sees all, Worker sees all)
exports.getAllOrders = async (req, res) => {
  try {
    if (
      req.user.role !== "administrator" &&
      req.user.role !== "shop_worker" &&
      req.user.role !== "shop_owner"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view all orders." });
    }

    const orders = await req.prisma.order.findMany({
      include: {
        user: { select: { id: true, username: true, email: true } },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                category: true,
                stock: true,
                shopAddress: true,
              },
            },
          },
        },
        delivery: { select: { id: true, deliveryStatus: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error("Error fetching all orders:", error.message);
    res.status(500).json({ message: "Error fetching all orders." });
  }
};