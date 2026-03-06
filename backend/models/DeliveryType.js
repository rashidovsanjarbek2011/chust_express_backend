const prisma = require("../config/database");
const AppError = require("../utils/appError");

class DeliveryTypeService {
  // ✅ Yetkazib berish turini yaratish
  static async createDeliveryType(typeData) {
    const {
      name,
      description,
      basePrice,
      freeDeliveryThreshold = 0,
      estimatedMinutes,
      maxDistanceKm,
      isActive = true,
      color = "#007bff",
      icon = "truck",
    } = typeData;

    // Unique name tekshirish
    const existingType = await prisma.deliveryType.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });

    if (existingType) {
      throw new AppError("Bu nomdagi yetkazib berish turi mavjud", 400);
    }

    // Slug yaratish
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();

    const deliveryType = await prisma.deliveryType.create({
      data: {
        name,
        description,
        slug,
        basePrice: Number(basePrice),
        freeDeliveryThreshold: Number(freeDeliveryThreshold),
        estimatedMinutes: Number(estimatedMinutes),
        maxDistanceKm: Number(maxDistanceKm),
        isActive,
        color,
        icon,
      },
    });

    return deliveryType;
  }

  // ✅ Barcha yetkazib berish turlarini olish
  static async getAllDeliveryTypes(filters = {}) {
    const { isActive, search, city } = filters;

    const where = {
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(city && {
        deliveryZones: {
          some: {
            city: { contains: city, mode: "insensitive" },
            isActive: true,
          },
        },
      }),
    };

    const deliveryTypes = await prisma.deliveryType.findMany({
      where,
      include: {
        deliveryZones: {
          where: { isActive: true },
          select: {
            id: true,
            city: true,
            district: true,
            basePrice: true,
            pricePerKm: true,
          },
        },
        _count: {
          select: {
            deliveryZones: { where: { isActive: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return deliveryTypes;
  }

  // ✅ ID bo'yicha yetkazib berish turini olish
  static async getDeliveryTypeById(id) {
    const deliveryType = await prisma.deliveryType.findUnique({
      where: { id },
      include: {
        deliveryZones: {
          where: { isActive: true },
          orderBy: [{ city: "asc" }, { district: "asc" }],
        },
        _count: {
          select: {
            orders: true,
            deliveryZones: { where: { isActive: true } },
          },
        },
      },
    });

    if (!deliveryType) {
      throw new AppError("Yetkazib berish turi topilmadi", 404);
    }

    return deliveryType;
  }

  // ✅ Yetkazib berish turini yangilash
  static async updateDeliveryType(id, updateData) {
    const existingType = await prisma.deliveryType.findUnique({
      where: { id },
    });

    if (!existingType) {
      throw new AppError("Yetkazib berish turi topilmadi", 404);
    }

    // Nom o'zgargan bo'lsa, uniqueness tekshirish
    if (updateData.name && updateData.name !== existingType.name) {
      const nameExists = await prisma.deliveryType.findFirst({
        where: {
          name: { equals: updateData.name, mode: "insensitive" },
          NOT: { id },
        },
      });

      if (nameExists) {
        throw new AppError("Bu nomdagi yetkazib berish turi mavjud", 400);
      }

      // Slug yangilash
      const newSlug = updateData.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .trim();

      updateData.slug = newSlug;
    }

    const updatedType = await prisma.deliveryType.update({
      where: { id },
      data: {
        ...updateData,
        ...(updateData.basePrice && {
          basePrice: Number(updateData.basePrice),
        }),
        ...(updateData.freeDeliveryThreshold && {
          freeDeliveryThreshold: Number(updateData.freeDeliveryThreshold),
        }),
        ...(updateData.estimatedMinutes && {
          estimatedMinutes: Number(updateData.estimatedMinutes),
        }),
        ...(updateData.maxDistanceKm && {
          maxDistanceKm: Number(updateData.maxDistanceKm),
        }),
        updatedAt: new Date(),
      },
    });

    return updatedType;
  }

  // ✅ Yetkazib berish turini o'chirish
  static async deleteDeliveryType(id) {
    const deliveryType = await prisma.deliveryType.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!deliveryType) {
      throw new AppError("Yetkazib berish turi topilmadi", 404);
    }

    // Faol buyurtmalar borligini tekshirish
    if (deliveryType._count.orders > 0) {
      throw new AppError(
        `Bu turda ${deliveryType._count.orders} ta buyurtma mavjud. Avval ularni o'zgartiring.`,
        400
      );
    }

    await prisma.deliveryType.delete({
      where: { id },
    });

    return { message: "Yetkazib berish turi muvaffaqiyatli o'chirildi" };
  }

  // ✅ Yetkazib berish narxini hisoblash
  static async calculateDeliveryPrice(
    typeId,
    distanceKm,
    orderAmount,
    address
  ) {
    const deliveryType = await prisma.deliveryType.findUnique({
      where: { id: typeId },
      include: {
        deliveryZones: {
          where: { isActive: true },
        },
      },
    });

    if (!deliveryType) {
      throw new AppError("Yetkazib berish turi topilmadi", 404);
    }

    if (!deliveryType.isActive) {
      throw new AppError("Bu yetkazib berish turi hozirda faol emas", 400);
    }

    // Masofa cheklovini tekshirish
    if (distanceKm > deliveryType.maxDistanceKm) {
      throw new AppError(
        `Bu yetkazib berish turi maksimal ${deliveryType.maxDistanceKm} km masofagacha`,
        400
      );
    }

    let finalPrice = Number(deliveryType.basePrice);
    let appliedZone = null;

    // Manzil bo'yicha zona qidirish
    if (address) {
      const zone = deliveryType.deliveryZones.find((z) => {
        const cityMatch =
          !z.city || address.city?.toLowerCase().includes(z.city.toLowerCase());
        const districtMatch =
          !z.district ||
          address.district?.toLowerCase().includes(z.district.toLowerCase());
        return cityMatch && districtMatch;
      });

      if (zone) {
        appliedZone = zone;
        finalPrice = Number(zone.basePrice);

        // Qo'shimcha masofa narxi
        if (distanceKm > 5) {
          // 5 km dan ortiq masofa uchun
          const extraDistance = distanceKm - 5;
          finalPrice += extraDistance * Number(zone.pricePerKm);
        }
      }
    } else {
      // Standart narx qo'shish
      if (distanceKm > 5) {
        const extraDistance = distanceKm - 5;
        finalPrice += extraDistance * 2000; // Har km uchun 2000 so'm
      }
    }

    // Bepul yetkazib berish tekshiruvi
    let isFree = false;
    if (orderAmount >= Number(deliveryType.freeDeliveryThreshold)) {
      finalPrice = 0;
      isFree = true;
    }

    // Vaqtni hisoblash
    const estimatedTime = this.calculateEstimatedTime(
      deliveryType.estimatedMinutes,
      distanceKm,
      appliedZone
    );

    return {
      deliveryType: {
        id: deliveryType.id,
        name: deliveryType.name,
        description: deliveryType.description,
      },
      pricing: {
        basePrice: Number(deliveryType.basePrice),
        finalPrice: Number(finalPrice.toFixed(2)),
        isFree,
        currency: "UZS",
      },
      delivery: {
        distanceKm: Number(distanceKm.toFixed(1)),
        estimatedMinutes: estimatedTime,
        estimatedTime: this.formatEstimatedTime(estimatedTime),
      },
      zone: appliedZone
        ? {
            city: appliedZone.city,
            district: appliedZone.district,
            basePrice: Number(appliedZone.basePrice),
          }
        : null,
    };
  }

  // ✅ Mavjud yetkazib berish turlarini olish (faqat faol)
  static async getAvailableTypes(orderAmount, address) {
    const types = await prisma.deliveryType.findMany({
      where: { isActive: true },
      include: {
        deliveryZones: {
          where: { isActive: true },
        },
      },
      orderBy: [{ basePrice: "asc" }, { estimatedMinutes: "asc" }],
    });

    const availableTypes = [];

    for (const type of types) {
      try {
        // Har bir tur uchun narx hisoblash
        const pricing = await this.calculateDeliveryPrice(
          type.id,
          address?.distanceKm || 5, // Default masofa
          orderAmount,
          address
        );

        availableTypes.push({
          ...type,
          pricing: pricing.pricing,
          delivery: pricing.delivery,
          isAvailable: pricing.finalPrice !== null,
        });
      } catch (error) {
        // Agar tur mavjud bo'lmasa, o'tkazib ketish
        continue;
      }
    }

    // Faqat mavjud turlarni qaytarish
    return availableTypes.filter((type) => type.isAvailable);
  }

  // ✅ Yetkazib berish zonasi qo'shish
  static async addDeliveryZone(typeId, zoneData) {
    const { city, district, basePrice, pricePerKm = 2000 } = zoneData;

    const deliveryType = await prisma.deliveryType.findUnique({
      where: { id: typeId },
    });

    if (!deliveryType) {
      throw new AppError("Yetkazib berish turi topilmadi", 404);
    }

    // Zona allaqachon mavjudligini tekshirish
    const existingZone = await prisma.deliveryZone.findFirst({
      where: {
        deliveryTypeId: typeId,
        city: { equals: city, mode: "insensitive" },
        district: { equals: district, mode: "insensitive" },
      },
    });

    if (existingZone) {
      throw new AppError("Bu zona allaqachon mavjud", 400);
    }

    const deliveryZone = await prisma.deliveryZone.create({
      data: {
        deliveryTypeId: typeId,
        city,
        district,
        basePrice: Number(basePrice),
        pricePerKm: Number(pricePerKm),
        isActive: true,
      },
    });

    return deliveryZone;
  }

  // ✅ Yetkazib berish zonasi olish
  static async getDeliveryZones(typeId) {
    const zones = await prisma.deliveryZone.findMany({
      where: { deliveryTypeId: typeId },
      orderBy: [{ city: "asc" }, { district: "asc" }],
    });

    return zones;
  }

  // ✅ Yetkazib berish zonasini yangilash
  static async updateDeliveryZone(zoneId, updateData) {
    const zone = await prisma.deliveryZone.findUnique({
      where: { id: zoneId },
    });

    if (!zone) {
      throw new AppError("Yetkazib berish zonasi topilmadi", 404);
    }

    const updatedZone = await prisma.deliveryZone.update({
      where: { id: zoneId },
      data: {
        ...updateData,
        ...(updateData.basePrice && {
          basePrice: Number(updateData.basePrice),
        }),
        ...(updateData.pricePerKm && {
          pricePerKm: Number(updateData.pricePerKm),
        }),
      },
    });

    return updatedZone;
  }

  // ✅ Yetkazib berish zonasini o'chirish
  static async deleteDeliveryZone(zoneId) {
    const zone = await prisma.deliveryZone.findUnique({
      where: { id: zoneId },
    });

    if (!zone) {
      throw new AppError("Yetkazib berish zonasi topilmadi", 404);
    }

    await prisma.deliveryZone.delete({
      where: { id: zoneId },
    });

    return { message: "Yetkazib berish zonasi muvaffaqiyatli o'chirildi" };
  }

  // ✅ Yetkazib berish vaqtini hisoblash (yordamchi funksiya)
  static calculateEstimatedTime(baseMinutes, distanceKm, zone = null) {
    let totalMinutes = Number(baseMinutes);

    // Masofa bo'yicha qo'shimcha vaqt
    if (distanceKm > 5) {
      const extraMinutes = Math.ceil((distanceKm - 5) * 2); // Har km uchun 2 daqiqa
      totalMinutes += extraMinutes;
    }

    // Zona bo'yicha qo'shimcha vaqt
    if (zone && zone.extraMinutes) {
      totalMinutes += Number(zone.extraMinutes);
    }

    return totalMinutes;
  }

  // ✅ Vaqtni formatlash (yordamchi funksiya)
  static formatEstimatedTime(minutes) {
    if (minutes < 60) {
      return `${minutes} daqiqa`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;

      if (remainingMinutes === 0) {
        return `${hours} soat`;
      } else {
        return `${hours} soat ${remainingMinutes} daqiqa`;
      }
    }
  }

  // ✅ Yetkazib berish statistikasi
  static async getDeliveryStats(typeId, startDate, endDate) {
    const where = {
      deliveryTypeId: typeId,
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
    };

    const [totalOrders, totalRevenue, averageRating] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.aggregate({
        where: { ...where, status: "DELIVERED" },
        _sum: { deliveryFee: true },
      }),
      prisma.review.aggregate({
        where: {
          order: { deliveryTypeId: typeId },
        },
        _avg: { rating: true },
      }),
    ]);

    return {
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.deliveryFee || 0),
      averageRating: Number(averageRating._avg.rating || 0),
      period: {
        startDate,
        endDate,
      },
    };
  }
}

module.exports = DeliveryTypeService;
