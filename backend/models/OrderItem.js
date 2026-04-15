const { prisma } = require("../config/db");
const AppError = require("../utils/ApiError");

class OrderItemService {
  // ✅ Buyurtma pozitsiyasini yaratish
  static async createOrderItem(orderData) {
    const { orderId, productId, quantity, notes } = orderData;

    // Tranzaksiya bilan ishlash
    return await prisma.$transaction(async (tx) => {
      // 1. Buyurtma mavjudligini tekshirish
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
          restaurant: true,
        },
      });

      if (!order) {
        throw new AppError("Buyurtma topilmadi", 404);
      }

      // Buyurtma holatini tekshirish
      if (["CANCELLED", "DELIVERED"].includes(order.status)) {
        throw new AppError("Bu buyurtma yakunlangan yoki bekor qilingan", 400);
      }

      // 2. Mahsulot mavjudligini tekshirish
      const product = await tx.product.findUnique({
        where: { id: productId },
        include: {
          category: {
            include: { restaurant: true },
          },
        },
      });

      if (!product) {
        throw new AppError("Mahsulot topilmadi", 404);
      }

      if (!product.isAvailable) {
        throw new AppError("Mahsulot hozirda mavjud emas", 400);
      }

      // 3. Mahsulot shu reystorandami tekshirish
      if (product.category.restaurantId !== order.restaurantId) {
        throw new AppError("Mahsulot boshqa reystorandan", 400);
      }

      // 4. Pozitsiya allaqachon mavjudmi tekshirish
      const existingItem = await tx.orderItem.findFirst({
        where: {
          orderId,
          productId,
        },
      });

      if (existingItem) {
        // Agar mavjud bo'lsa, miqdorini oshirish
        const updatedItem = await tx.orderItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + quantity,
            notes: notes || existingItem.notes,
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
              },
            },
          },
        });

        // Buyurtma umumiy narxini yangilash
        await this.updateOrderTotal(tx, orderId);

        return updatedItem;
      }

      // 5. Yangi pozitsiya yaratish
      const orderItem = await tx.orderItem.create({
        data: {
          orderId,
          productId,
          quantity,
          price: product.price,
          notes: notes || null,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              imageUrl: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      // 6. Buyurtma umumiy narxini yangilash
      await this.updateOrderTotal(tx, orderId);

      return orderItem;
    });
  }

  // ✅ Buyurtma pozitsiyasini yangilash
  static async updateOrderItem(itemId, updateData, userId = null) {
    const { quantity, notes } = updateData;

    return await prisma.$transaction(async (tx) => {
      const orderItem = await tx.orderItem.findUnique({
        where: { id: itemId },
        include: {
          order: true,
        },
      });

      if (!orderItem) {
        throw new AppError("Pozitsiya topilmadi", 404);
      }

      // Foydalanuvchi huquqini tekshirish
      if (userId && orderItem.order.userId !== userId) {
        throw new AppError("Bu pozitsiyani o'zgartirish huquqingiz yo'q", 403);
      }

      // Buyurtma holatini tekshirish
      if (["CANCELLED", "DELIVERED"].includes(orderItem.order.status)) {
        throw new AppError("Bu buyurtma yakunlangan yoki bekor qilingan", 400);
      }

      // Miqdor tekshirish
      if (quantity !== undefined && quantity < 1) {
        throw new AppError("Miqdor 1 dan kam bo'lishi mumkin emas", 400);
      }

      const updatedItem = await tx.orderItem.update({
        where: { id: itemId },
        data: {
          ...(quantity !== undefined && { quantity }),
          ...(notes !== undefined && { notes }),
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              imageUrl: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      // Buyurtma umumiy narxini yangilash
      await this.updateOrderTotal(tx, orderItem.orderId);

      return updatedItem;
    });
  }

  // ✅ Buyurtma pozitsiyasini o'chirish
  static async deleteOrderItem(itemId, userId = null) {
    return await prisma.$transaction(async (tx) => {
      const orderItem = await tx.orderItem.findUnique({
        where: { id: itemId },
        include: {
          order: true,
        },
      });

      if (!orderItem) {
        throw new AppError("Pozitsiya topilmadi", 404);
      }

      // Foydalanuvchi huquqini tekshirish
      if (userId && orderItem.order.userId !== userId) {
        throw new AppError("Bu pozitsiyani o'chirish huquqingiz yo'q", 403);
      }

      // Buyurtma holatini tekshirish
      if (["CANCELLED", "DELIVERED"].includes(orderItem.order.status)) {
        throw new AppError("Bu buyurtma yakunlangan yoki bekor qilingan", 400);
      }

      await tx.orderItem.delete({
        where: { id: itemId },
      });

      // Buyurtma umumiy narxini yangilash
      await this.updateOrderTotal(tx, orderItem.orderId);

      return { message: "Pozitsiya muvaffaqiyatli o'chirildi" };
    });
  }

  // ✅ Buyurtma barcha pozitsiyalarini olish
  static async getOrderItems(orderId, userId = null) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                imageUrl: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
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
            logoUrl: true,
            address: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      throw new AppError("Buyurtma topilmadi", 404);
    }

    // Foydalanuvchi huquqini tekshirish
    if (userId && order.userId !== userId) {
      throw new AppError("Bu buyurtmani ko'rish huquqingiz yo'q", 403);
    }

    // Hisoblashlar
    const totalItems = order.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const subtotal = order.items.reduce((sum, item) => {
      return sum + Number(item.price) * item.quantity;
    }, 0);

    return {
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
        estimatedDeliveryTime: order.estimatedDeliveryTime,
        notes: order.notes,
      },
      restaurant: order.restaurant,
      customer: order.user,
      items: order.items,
      summary: {
        totalItems,
        subtotal: Number(subtotal.toFixed(2)),
        deliveryFee: Number(order.deliveryFee),
        totalAmount: Number(order.totalAmount),
      },
    };
  }

  // ✅ Buyurtma pozitsiyalarini tozalash
  static async clearOrderItems(orderId, userId = null) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new AppError("Buyurtma topilmadi", 404);
      }

      // Foydalanuvchi huquqini tekshirish
      if (userId && order.userId !== userId) {
        throw new AppError("Bu buyurtmani tozalash huquqingiz yo'q", 403);
      }

      // Buyurtma holatini tekshirish
      if (["CANCELLED", "DELIVERED"].includes(order.status)) {
        throw new AppError("Bu buyurtma yakunlangan yoki bekor qilingan", 400);
      }

      await tx.orderItem.deleteMany({
        where: { orderId },
      });

      // Buyurtma umumiy narxini 0 ga o'rnatish
      await tx.order.update({
        where: { id: orderId },
        data: {
          totalAmount: 0,
          deliveryFee: 0,
        },
      });

      return { message: "Barcha pozitsiyalar o'chirildi" };
    });
  }

  // ✅ Miqdor oshirish/kamaytirish
  static async adjustQuantity(itemId, adjustment, userId = null) {
    if (adjustment !== "increment" && adjustment !== "decrement") {
      throw new AppError("Noto'g'ri operatsiya", 400);
    }

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: itemId },
      include: { order: true },
    });

    if (!orderItem) {
      throw new AppError("Pozitsiya topilmadi", 404);
    }

    // Foydalanuvchi huquqini tekshirish
    if (userId && orderItem.order.userId !== userId) {
      throw new AppError("Bu pozitsiyani o'zgartirish huquqingiz yo'q", 403);
    }

    // Buyurtma holatini tekshirish
    if (["CANCELLED", "DELIVERED"].includes(orderItem.order.status)) {
      throw new AppError("Bu buyurtma yakunlangan yoki bekor qilingan", 400);
    }

    let newQuantity = orderItem.quantity;

    if (adjustment === "increment") {
      newQuantity += 1;
    } else {
      newQuantity -= 1;
      if (newQuantity <= 0) {
        // Agar miqdor 0 dan kam bo'lsa, pozitsiyani o'chirish
        return await this.deleteOrderItem(itemId, userId);
      }
    }

    return await this.updateOrderItem(
      itemId,
      { quantity: newQuantity },
      userId
    );
  }

  // ✅ Buyurtma umumiy narxini yangilash (yordamchi funksiya)
  static async updateOrderTotal(tx, orderId) {
    const items = await tx.orderItem.findMany({
      where: { orderId },
    });

    const subtotal = items.reduce((sum, item) => {
      return sum + Number(item.price) * item.quantity;
    }, 0);

    // Yetkazib berish narxi (masalan, 5000 so'm)
    const deliveryFee = subtotal > 50000 ? 0 : 5000; // 50,000 so'mdan yuqori bo'lsa bepul

    const totalAmount = subtotal + deliveryFee;

    await tx.order.update({
      where: { id: orderId },
      data: {
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        totalAmount: totalAmount,
      },
    });

    return { subtotal, deliveryFee, totalAmount };
  }

  // ✅ Ko'p mahsulot qo'shish (batch)
  static async addMultipleItems(orderId, itemsData, userId = null) {
    const { items } = itemsData;

    if (!Array.isArray(items) || items.length === 0) {
      throw new AppError("Mahsulotlar ro'yxati bo'sh", 400);
    }

    const results = [];
    const errors = [];

    for (const itemData of items) {
      try {
        const result = await this.createOrderItem({
          orderId,
          productId: itemData.productId,
          quantity: itemData.quantity || 1,
          notes: itemData.notes,
        });
        results.push(result);
      } catch (error) {
        errors.push({
          productId: itemData.productId,
          error: error.message,
        });
      }
    }

    return {
      successful: results,
      errors,
      summary: {
        totalAdded: results.length,
        totalErrors: errors.length,
      },
    };
  }

  // ✅ Buyurtma pozitsiyalarini nusxalash (yangi buyurtma uchun)
  static async copyOrderItems(fromOrderId, toOrderId, userId = null) {
    const fromItems = await this.getOrderItems(fromOrderId, userId);

    if (!fromItems.items.length) {
      throw new AppError("Nusxalanadigan pozitsiyalar topilmadi", 404);
    }

    const copyResults = [];

    for (const item of fromItems.items) {
      try {
        const result = await this.createOrderItem({
          orderId: toOrderId,
          productId: item.product.id,
          quantity: item.quantity,
          notes: item.notes,
        });
        copyResults.push(result);
      } catch (error) {
        console.error(`Pozitsiya nusxalashda xato: ${error.message}`);
      }
    }

    return {
      copiedItems: copyResults,
      totalCopied: copyResults.length,
      sourceOrderId: fromOrderId,
      targetOrderId: toOrderId,
    };
  }
}

module.exports = OrderItemService;
