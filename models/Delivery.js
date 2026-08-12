const { prisma } = require("../config/db");
const AppError = require("../utils/ApiError");

class DeliveryService {
  // ✅ Yangi yetkazib berish yaratish
  static async createDelivery(deliveryData) {
    const {
      orderId,
      deliveryTypeId,
      customerAddress,
      deliveryInstructions,
      scheduledTime,
      priority = "NORMAL",
    } = deliveryData;

    return await prisma.$transaction(async (tx) => {
      // 1. Buyurtma mavjudligini tekshirish
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          user: true,
          restaurant: true,
          deliveryAddress: true,
        },
      });

      if (!order) {
        throw new AppError("Buyurtma topilmadi", 404);
      }

      // 2. Buyurtma holatini tekshirish
      if (order.status !== "CONFIRMED" && order.status !== "PREPARING") {
        throw new AppError(
          "Bu buyurtma yetkazib berish uchun tayyor emas",
          400
        );
      }

      // 3. Yetkazib berish turi mavjudligini tekshirish
      const deliveryType = await tx.deliveryType.findUnique({
        where: { id: deliveryTypeId },
      });

      if (!deliveryType || !deliveryType.isActive) {
        throw new AppError(
          "Yetkazib berish turi topilmadi yoki faol emas",
          404
        );
      }

      // 4. Yetkazib berish raqamini yaratish
      const deliveryNumber = `DLV-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;

      // 5. Yetkazib berish yaratish
      const delivery = await tx.delivery.create({
        data: {
          deliveryNumber,
          orderId,
          deliveryTypeId,
          customerName: order.user.fullName,
          customerPhone: order.user.phone,
          deliveryAddress: order.deliveryAddress.address,
          deliveryInstructions: deliveryInstructions || order.notes,
          scheduledTime: scheduledTime || new Date(Date.now() + 30 * 60000), // 30 daqiqadan keyin
          priority,
          status: "PENDING",
          estimatedDeliveryTime: this.calculateEstimatedTime(
            deliveryType,
            order.deliveryAddress
          ),
        },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              totalAmount: true,
              items: {
                include: {
                  product: {
                    select: { name: true, quantity: true },
                  },
                },
              },
            },
          },
          deliveryType: {
            select: {
              id: true,
              name: true,
              estimatedMinutes: true,
              basePrice: true,
            },
          },
          courier: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              rating: true,
            },
          },
        },
      });

      // 6. Buyurtma holatini yangilash
      await tx.order.update({
        where: { id: orderId },
        data: { status: "READY_FOR_DELIVERY" },
      });

      return delivery;
    });
  }

  // ✅ Yetkazib berishni olish (ID bo'yicha)
  static async getDeliveryById(id) {
    const delivery = await prisma.delivery.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                phone: true,
              },
            },
            restaurant: {
              select: {
                id: true,
                name: true,
                address: true,
                phone: true,
                logoUrl: true,
              },
            },
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    imageUrl: true,
                  },
                },
              },
            },
          },
        },
        deliveryType: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
        courier: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            avatarUrl: true,
            rating: true,
            vehicle: true,
          },
        },
        deliveryHistory: {
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!delivery) {
      throw new AppError("Yetkazib berish topilmadi", 404);
    }

    return delivery;
  }

  // ✅ Yetkazib berish holatini yangilash
  static async updateDeliveryStatus(id, status, userId = null, notes = null) {
    const validStatuses = [
      "PENDING",
      "ASSIGNED",
      "PICKED_UP",
      "ON_THE_WAY",
      "DELIVERED",
      "FAILED",
      "CANCELLED",
    ];

    if (!validStatuses.includes(status)) {
      throw new AppError("Noto'g'ri holat", 400);
    }

    return await prisma.$transaction(async (tx) => {
      const delivery = await tx.delivery.findUnique({
        where: { id },
        include: { order: true },
      });

      if (!delivery) {
        throw new AppError("Yetkazib berish topilmadi", 404);
      }

      // Foydalanuvchi huquqini tekshirish (kerak bo'lsa)
      if (userId && delivery.courierId && delivery.courierId !== userId) {
        throw new AppError(
          "Bu yetkazib berishni o'zgartirish huquqingiz yo'q",
          403
        );
      }

      // Holat o'zgarishining to'g'riligini tekshirish
      this.validateStatusTransition(delivery.status, status);

      // Yetkazib berishni yangilash
      const updatedDelivery = await tx.delivery.update({
        where: { id },
        data: {
          status,
          ...(status === "DELIVERED" && { deliveredAt: new Date() }),
          ...(status === "FAILED" && { failedAt: new Date() }),
          updatedAt: new Date(),
        },
      });

      // Tarix yaratish
      await tx.deliveryHistory.create({
        data: {
          deliveryId: id,
          status,
          notes: notes || this.getStatusMessage(status),
          userId,
        },
      });

      // Buyurtma holatini yangilash
      await this.updateOrderStatus(tx, delivery.orderId, status);

      return updatedDelivery;
    });
  }

  // ✅ Kurerni tayinlash
  static async assignCourier(deliveryId, courierId, assignedBy = null) {
    return await prisma.$transaction(async (tx) => {
      // 1. Yetkazib berish va kurerni tekshirish
      const [delivery, courier] = await Promise.all([
        tx.delivery.findUnique({
          where: { id: deliveryId },
        }),
        tx.user.findUnique({
          where: { id: courierId, role: "COURIER" },
        }),
      ]);

      if (!delivery) {
        throw new AppError("Yetkazib berish topilmadi", 404);
      }

      if (!courier) {
        throw new AppError("Kurer topilmadi yoki kurer emas", 404);
      }

      if (!courier.isActive) {
        throw new AppError("Kurer faol emas", 400);
      }

      // 2. Kurer band emasligini tekshirish
      const activeDeliveries = await tx.delivery.count({
        where: {
          courierId,
          status: {
            in: ["ASSIGNED", "PICKED_UP", "ON_THE_WAY"],
          },
        },
      });

      if (activeDeliveries > 0) {
        throw new AppError("Kurerda faol yetkazib berishlar mavjud", 400);
      }

      // 3. Yetkazib berishni yangilash
      const updatedDelivery = await tx.delivery.update({
        where: { id: deliveryId },
        data: {
          courierId,
          status: "ASSIGNED",
          assignedAt: new Date(),
          assignedBy,
        },
        include: {
          courier: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              rating: true,
              vehicle: true,
            },
          },
        },
      });

      // 4. Tarix yaratish
      await tx.deliveryHistory.create({
        data: {
          deliveryId,
          status: "ASSIGNED",
          notes: `Kurer tayinlandi: ${courier.fullName}`,
          userId: assignedBy,
        },
      });

      return updatedDelivery;
    });
  }

  // ✅ Kurer uchun yetkazib berishlar ro'yxati
  static async getCourierDeliveries(
    courierId,
    status = null,
    page = 1,
    limit = 10
  ) {
    const skip = (page - 1) * limit;

    const where = {
      courierId,
      ...(status && { status }),
    };

    const [deliveries, total] = await Promise.all([
      prisma.delivery.findMany({
        where,
        skip,
        take: limit,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              totalAmount: true,
              items: {
                take: 3,
                include: {
                  product: {
                    select: {
                      name: true,
                      imageUrl: true,
                    },
                  },
                },
              },
            },
          },
          deliveryType: {
            select: {
              name: true,
              icon: true,
              color: true,
            },
          },
        },
        orderBy: [
          { priority: "desc" },
          { scheduledTime: "asc" },
          { createdAt: "asc" },
        ],
      }),
      prisma.delivery.count({ where }),
    ]);

    return {
      deliveries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // ✅ Mijoz uchun yetkazib berishlarni kuzatish
  static async trackDelivery(deliveryNumber) {
    const delivery = await prisma.delivery.findUnique({
      where: { deliveryNumber },
      include: {
        courier: {
          select: {
            fullName: true,
            phone: true,
            vehicle: true,
            rating: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            items: {
              take: 5,
              include: {
                product: {
                  select: {
                    name: true,
                    imageUrl: true,
                  },
                },
              },
            },
          },
        },
        deliveryType: {
          select: {
            name: true,
            icon: true,
          },
        },
      },
    });

    if (!delivery) {
      throw new AppError("Yetkazib berish topilmadi", 404);
    }

    return {
      trackingInfo: {
        deliveryNumber: delivery.deliveryNumber,
        status: delivery.status,
        estimatedDeliveryTime: delivery.estimatedDeliveryTime,
        scheduledTime: delivery.scheduledTime,
      },
      courier: delivery.courier
        ? {
            name: delivery.courier.fullName,
            phone: delivery.courier.phone,
            vehicle: delivery.courier.vehicle,
            rating: delivery.courier.rating,
          }
        : null,
      delivery: delivery.deliveryType,
      order: delivery.order,
      currentLocation: delivery.currentLocation,
      deliveryInstructions: delivery.deliveryInstructions,
    };
  }

  // ✅ Yetkazib berish tarixi
  static async getDeliveryHistory(orderId) {
    const history = await prisma.deliveryHistory.findMany({
      where: { orderId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return history;
  }

  // ✅ Yetkazib berishni bekor qilish
  static async cancelDelivery(id, reason, cancelledBy = null) {
    return await prisma.$transaction(async (tx) => {
      const delivery = await tx.delivery.findUnique({
        where: { id },
        include: { order: true },
      });

      if (!delivery) {
        throw new AppError("Yetkazib berish topilmadi", 404);
      }

      // Bekor qilish mumkin holatlari
      const cancellableStatuses = ["PENDING", "ASSIGNED"];
      if (!cancellableStatuses.includes(delivery.status)) {
        throw new AppError("Bu holatda bekor qilish mumkin emas", 400);
      }

      // Yetkazib berishni bekor qilish
      const cancelledDelivery = await tx.delivery.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancellationReason: reason,
          cancelledBy,
        },
      });

      // Tarix yaratish
      await tx.deliveryHistory.create({
        data: {
          deliveryId: id,
          status: "CANCELLED",
          notes: `Sabab: ${reason}`,
          userId: cancelledBy,
        },
      });

      // Buyurtma holatini qayta tiklash
      await tx.order.update({
        where: { id: delivery.orderId },
        data: { status: "CONFIRMED" },
      });

      return cancelledDelivery;
    });
  }

  // ✅ Yetkazib berish statistikasi
  static async getDeliveryStats(
    courierId = null,
    startDate = null,
    endDate = null
  ) {
    const where = {
      ...(courierId && { courierId }),
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
    };

    const [
      totalDeliveries,
      completedDeliveries,
      failedDeliveries,
      averageTime,
      totalRevenue,
    ] = await Promise.all([
      prisma.delivery.count({ where }),
      prisma.delivery.count({
        where: { ...where, status: "DELIVERED" },
      }),
      prisma.delivery.count({
        where: { ...where, status: "FAILED" },
      }),
      prisma.delivery.aggregate({
        where: {
          ...where,
          status: "DELIVERED",
          deliveredAt: { not: null },
        },
        _avg: {
          // PostgreSQL-da timestamp farqi hisoblash murakkab
          // Bu yerda oddiy ko'rsatkich
        },
      }),
      prisma.order.aggregate({
        where: {
          ...(courierId && { courierId }),
          status: "DELIVERED",
          ...(startDate &&
            endDate && {
              deliveredAt: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
            }),
        },
        _sum: { deliveryFee: true },
      }),
    ]);

    const successRate =
      totalDeliveries > 0
        ? ((completedDeliveries / totalDeliveries) * 100).toFixed(1)
        : 0;

    return {
      totalDeliveries,
      completedDeliveries,
      failedDeliveries,
      successRate: Number(successRate),
      totalRevenue: Number(totalRevenue._sum.deliveryFee || 0),
      period: { startDate, endDate },
    };
  }

  // ✅ Yordamchi funksiyalar
  static calculateEstimatedTime(deliveryType, address) {
    const baseMinutes = deliveryType.estimatedMinutes;
    // Masofa va manzil bo'yicha qo'shimcha vaqt hisoblash
    return new Date(Date.now() + baseMinutes * 60000);
  }

  static validateStatusTransition(currentStatus, newStatus) {
    const transitions = {
      PENDING: ["ASSIGNED", "CANCELLED"],
      ASSIGNED: ["PICKED_UP", "CANCELLED"],
      PICKED_UP: ["ON_THE_WAY"],
      ON_THE_WAY: ["DELIVERED", "FAILED"],
      DELIVERED: [],
      FAILED: [],
      CANCELLED: [],
    };

    if (!transitions[currentStatus]?.includes(newStatus)) {
      throw new AppError(
        `${currentStatus} dan ${newStatus} ga o'tish mumkin emas`,
        400
      );
    }
  }

  static getStatusMessage(status) {
    const messages = {
      PENDING: "Yetkazib berish kutish holatida",
      ASSIGNED: "Kurer tayinlandi",
      PICKED_UP: "Buyurtma olingan",
      ON_THE_WAY: "Yetkazib berish yo'lida",
      DELIVERED: "Muvaffaqiyatli yetkazib berildi",
      FAILED: "Yetkazib berish muvaffaqiyatsiz",
      CANCELLED: "Yetkazib berish bekor qilindi",
    };
    return messages[status] || "Holat o'zgartirildi";
  }

  static async updateOrderStatus(tx, orderId, deliveryStatus) {
    const statusMap = {
      PICKED_UP: "ON_THE_WAY",
      ON_THE_WAY: "ON_THE_WAY",
      DELIVERED: "DELIVERED",
      FAILED: "CONFIRMED", // Qayta qilish mumkin
      CANCELLED: "CONFIRMED",
    };

    const newStatus = statusMap[deliveryStatus];
    if (newStatus) {
      await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus },
      });
    }
  }

  // ✅ Real-time lokatsiya yangilash
  static async updateDeliveryLocation(
    deliveryId,
    latitude,
    longitude,
    accuracy = null
  ) {
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
    });

    if (!delivery) {
      throw new AppError("Yetkazib berish topilmadi", 404);
    }

    const locationData = {
      latitude: Number(latitude),
      longitude: Number(longitude),
      ...(accuracy && { accuracy: Number(accuracy) }),
      updatedAt: new Date(),
    };

    const updatedDelivery = await prisma.delivery.update({
      where: { id: deliveryId },
      data: { currentLocation: locationData },
    });

    // Tarix yaratish (ixtiyoriy)
    await prisma.deliveryHistory.create({
      data: {
        deliveryId,
        status: delivery.status,
        notes: `Lokatsiya yangilandi: ${latitude}, ${longitude}`,
      },
    });

    return updatedDelivery;
  }
}

module.exports = DeliveryService;
