const { prisma } = require("../config/db");
const AppError = require("../utils/ApiError");

class DeliveryCarService {
  // ✅ Yangi transport vositasi yaratish
  static async createDeliveryCar(carData) {
    const {
      courierId,
      type, // 'BIKE', 'MOTORCYCLE', 'CAR', 'VAN'
      brand,
      model,
      year,
      color,
      licensePlate,
      vinNumber,
      registrationNumber,
      engineNumber,
      fuelType, // 'PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID'
      transmission, // 'MANUAL', 'AUTOMATIC'
      mileage,
      capacity,
      features = [],
      documents = {},
      purchaseDate,
      purchasePrice,
      isActive = true,
    } = carData;

    return await prisma.$transaction(async (tx) => {
      // 1. Kurerning mavjudligini tekshirish
      const courier = await tx.user.findUnique({
        where: {
          id: courierId,
          role: "COURIER",
          isActive: true,
        },
      });

      if (!courier) {
        throw new AppError("Kurer topilmadi yoki faol emas", 404);
      }

      // 2. Raqamli plataning unique ekanligini tekshirish
      const existingCar = await tx.deliveryCar.findFirst({
        where: { licensePlate: { equals: licensePlate, mode: "insensitive" } },
      });

      if (existingCar) {
        throw new AppError("Bu raqamli plata allaqachon ro'yxatda", 400);
      }

      // 3. VIN raqamining unique ekanligini tekshirish (agar berilgan bo'lsa)
      if (vinNumber) {
        const existingVin = await tx.deliveryCar.findFirst({
          where: { vinNumber: { equals: vinNumber, mode: "insensitive" } },
        });

        if (existingVin) {
          throw new AppError("Bu VIN raqam allaqachon ro'yxatda", 400);
        }
      }

      // 4. Transport vositasi yaratish
      const deliveryCar = await tx.deliveryCar.create({
        data: {
          courierId,
          type,
          brand,
          model,
          year: Number(year),
          color,
          licensePlate: licensePlate.toUpperCase(),
          vinNumber: vinNumber?.toUpperCase(),
          registrationNumber: registrationNumber?.toUpperCase(),
          engineNumber: engineNumber?.toUpperCase(),
          fuelType,
          transmission,
          mileage: Number(mileage) || 0,
          capacity: Number(capacity) || 0,
          features: features || [],
          documents: {
            registrationExpiry: documents.registrationExpiry || null,
            insuranceExpiry: documents.insuranceExpiry || null,
            licenseExpiry: documents.licenseExpiry || null,
            technicalInspectionExpiry:
              documents.technicalInspectionExpiry || null,
            insurancePolicyNumber: documents.insurancePolicyNumber || null,
            insuranceCompany: documents.insuranceCompany || null,
          },
          purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
          purchasePrice: Number(purchasePrice) || null,
          isActive,
          status: "AVAILABLE",
        },
        include: {
          courier: {
            select: {
              id: true,
              fullName: true,
              phone: true,
            },
          },
        },
      });

      // 5. Tarix yaratish
      await tx.deliveryCarHistory.create({
        data: {
          deliveryCarId: deliveryCar.id,
          action: "CREATED",
          description: `${type} transport vositasi qo\'shildi`,
          details: {
            brand,
            model,
            licensePlate,
          },
          userId: courierId,
        },
      });

      return deliveryCar;
    });
  }

  // ✅ Transport vositasini olish (ID bo'yicha)
  static async getDeliveryCarById(id) {
    const car = await prisma.deliveryCar.findUnique({
      where: { id },
      include: {
        courier: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            rating: true,
          },
        },
        maintenanceRecords: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        usageStatistics: {
          where: {
            date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          }, // Oxirgi 30 kun
        },
        deliveryHistory: {
          take: 20,
          orderBy: { createdAt: "desc" },
          include: {
            order: {
              select: {
                id: true,
                orderNumber: true,
                totalAmount: true,
              },
            },
          },
        },
      },
    });

    if (!car) {
      throw new AppError("Transport vositasi topilmadi", 404);
    }

    // Hozirgi holatni yangilash
    await this.updateCarStatus(car.id);

    return car;
  }

  // ✅ Kurerning transport vositalarini olish
  static async getCourierCars(courierId, includeInactive = false) {
    const where = {
      courierId,
      ...(!includeInactive && { isActive: true }),
    };

    const cars = await prisma.deliveryCar.findMany({
      where,
      include: {
        _count: {
          select: {
            deliveryHistory: true,
            maintenanceRecords: true,
          },
        },
      },
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    });

    // Har bir mashina uchun hozirgi holatni yangilash
    for (const car of cars) {
      await this.updateCarStatus(car.id);
    }

    return cars;
  }

  // ✅ Barcha transport vositalarini olish (filtr bilan)
  static async getAllCars(filters = {}) {
    const {
      type,
      courierId,
      isActive = true,
      status,
      city,
      registrationExpiry,
      insuranceExpiry,
      page = 1,
      limit = 10,
    } = filters;

    const skip = (page - 1) * limit;

    const where = {
      ...(type && { type }),
      ...(courierId && { courierId }),
      ...(isActive !== undefined && { isActive }),
      ...(status && { status }),
      ...(registrationExpiry && {
        "documents.registrationExpiry": {
          lte: new Date(registrationExpiry),
        },
      }),
      ...(insuranceExpiry && {
        "documents.insuranceExpiry": {
          lte: new Date(insuranceExpiry),
        },
      }),
      ...(city && {
        courier: {
          addresses: {
            some: {
              city: { contains: city, mode: "insensitive" },
              isPrimary: true,
            },
          },
        },
      }),
    };

    const [cars, total] = await Promise.all([
      prisma.deliveryCar.findMany({
        where,
        skip,
        take: limit,
        include: {
          courier: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              rating: true,
            },
          },
          _count: {
            select: {
              deliveryHistory: true,
              maintenanceRecords: true,
            },
          },
        },
        orderBy: [{ isActive: "desc" }, { type: "asc" }, { brand: "asc" }],
      }),
      prisma.deliveryCar.count({ where }),
    ]);

    return {
      cars,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // ✅ Transport vositasini yangilash
  static async updateDeliveryCar(id, updateData, userId = null) {
    const existingCar = await prisma.deliveryCar.findUnique({
      where: { id },
      include: { courier: true },
    });

    if (!existingCar) {
      throw new AppError("Transport vositasi topilmadi", 404);
    }

    // Foydalanuvchi huquqini tekshirish
    if (userId && existingCar.courierId !== userId) {
      throw new AppError(
        "Bu transport vositasini o'zgartirish huquqingiz yo'q",
        403
      );
    }

    // Raqamli plata o'zgargan bo'lsa, unique tekshirish
    if (
      updateData.licensePlate &&
      updateData.licensePlate !== existingCar.licensePlate
    ) {
      const plateExists = await prisma.deliveryCar.findFirst({
        where: {
          licensePlate: {
            equals: updateData.licensePlate,
            mode: "insensitive",
          },
          NOT: { id },
        },
      });

      if (plateExists) {
        throw new AppError("Bu raqamli plata allaqachon mavjud", 400);
      }

      updateData.licensePlate = updateData.licensePlate.toUpperCase();
    }

    const updatedCar = await prisma.deliveryCar.update({
      where: { id },
      data: {
        ...updateData,
        ...(updateData.year && { year: Number(updateData.year) }),
        ...(updateData.mileage && { mileage: Number(updateData.mileage) }),
        ...(updateData.capacity && { capacity: Number(updateData.capacity) }),
        ...(updateData.purchasePrice && {
          purchasePrice: Number(updateData.purchasePrice),
        }),
        updatedAt: new Date(),
      },
    });

    // Tarix yaratish
    await prisma.deliveryCarHistory.create({
      data: {
        deliveryCarId: id,
        action: "UPDATED",
        description: "Transport vositasi ma'lumotlari yangilandi",
        details: updateData,
        userId,
      },
    });

    return updatedCar;
  }

  // ✅ Transport vositasini o'chirish (soft delete)
  static async deleteDeliveryCar(id, userId = null) {
    const car = await prisma.deliveryCar.findUnique({
      where: { id },
      include: { courier: true },
    });

    if (!car) {
      throw new AppError("Transport vositasi topilmadi", 404);
    }

    // Foydalanuvchi huquqini tekshirish
    if (userId && car.courierId !== userId) {
      throw new AppError(
        "Bu transport vositasini o'chirish huquqingiz yo'q",
        403
      );
    }

    // Faol yetkazib berishlar borligini tekshirish
    const activeDeliveries = await prisma.delivery.count({
      where: {
        courierId: car.courierId,
        status: {
          in: ["ASSIGNED", "PICKED_UP", "ON_THE_WAY"],
        },
      },
    });

    if (activeDeliveries > 0) {
      throw new AppError(
        "Faol yetkazib berishlar mavjud. Avval ularni yakunlang.",
        400
      );
    }

    // Soft delete
    const deletedCar = await prisma.deliveryCar.update({
      where: { id },
      data: {
        isActive: false,
        status: "INACTIVE",
      },
    });

    // Tarix yaratish
    await prisma.deliveryCarHistory.create({
      data: {
        deliveryCarId: id,
        action: "DELETED",
        description: "Transport vositasi o'chirildi",
        userId,
      },
    });

    return { message: "Transport vositasi muvaffaqiyatli o'chirildi" };
  }

  // ✅ Texnik xizmat qo'shish
  static async addMaintenanceRecord(carId, maintenanceData) {
    const {
      type, // 'ROUTINE', 'REPAIR', 'INSPECTION'
      description,
      cost,
      mileage,
      nextMaintenanceDate,
      nextMaintenanceMileage,
      serviceProvider,
      parts = [],
      warrantyExpiry,
      documents = [],
      performedBy,
    } = maintenanceData;

    return await prisma.$transaction(async (tx) => {
      const car = await tx.deliveryCar.findUnique({
        where: { id: carId },
      });

      if (!car) {
        throw new AppError("Transport vositasi topilmadi", 404);
      }

      // Xizmat yaratish
      const maintenanceRecord = await tx.maintenanceRecord.create({
        data: {
          deliveryCarId: carId,
          type,
          description,
          cost: Number(cost) || 0,
          mileage: Number(mileage) || car.mileage,
          nextMaintenanceDate: nextMaintenanceDate
            ? new Date(nextMaintenanceDate)
            : null,
          nextMaintenanceMileage: Number(nextMaintenanceMileage) || null,
          serviceProvider,
          parts: parts || [],
          warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
          documents: documents || [],
          performedBy,
          status: "COMPLETED",
        },
      });

      // Mashina пробegini yangilash
      if (mileage && mileage > car.mileage) {
        await tx.deliveryCar.update({
          where: { id: carId },
          data: { mileage: Number(mileage) },
        });
      }

      // Tarix yaratish
      await tx.deliveryCarHistory.create({
        data: {
          deliveryCarId: carId,
          action: "MAINTENANCE",
          description: `${type} xizmat ko\'rsatildi: ${description}`,
          details: {
            type,
            cost,
            mileage,
            serviceProvider,
          },
          userId: performedBy,
        },
      });

      return maintenanceRecord;
    });
  }

  // ✅ Transport vositasi holatini yangilash
  static async updateCarStatus(carId) {
    const car = await prisma.deliveryCar.findUnique({
      where: { id: carId },
      include: {
        maintenanceRecords: {
          where: { status: "COMPLETED" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!car) {
      return null;
    }

    let newStatus = car.status;

    // Hujjatlar muddati tekshirish
    const now = new Date();
    const docs = car.documents || {};

    if (docs.registrationExpiry && new Date(docs.registrationExpiry) < now) {
      newStatus = "DOCUMENT_EXPIRED";
    } else if (docs.insuranceExpiry && new Date(docs.insuranceExpiry) < now) {
      newStatus = "INSURANCE_EXPIRED";
    } else if (docs.licenseExpiry && new Date(docs.licenseExpiry) < now) {
      newStatus = "LICENSE_EXPIRED";
    } else if (!car.isActive) {
      newStatus = "INACTIVE";
    } else {
      // Oxirgi texnik xizmatni tekshirish
      const lastMaintenance = car.maintenanceRecords[0];
      if (lastMaintenance) {
        const daysSinceMaintenance = Math.floor(
          (now - lastMaintenance.createdAt) / (1000 * 60 * 60 * 24)
        );
        const maintenanceInterval = this.getMaintenanceInterval(car.type);

        if (daysSinceMaintenance > maintenanceInterval) {
          newStatus = "MAINTENANCE_DUE";
        } else {
          newStatus = "AVAILABLE";
        }
      } else {
        newStatus = "MAINTENANCE_DUE";
      }
    }

    // Holat o'zgargan bo'lsa, yangilash
    if (newStatus !== car.status) {
      await prisma.deliveryCar.update({
        where: { id: carId },
        data: { status: newStatus },
      });

      // Tarix yaratish
      await prisma.deliveryCarHistory.create({
        data: {
          deliveryCarId: carId,
          action: "STATUS_CHANGE",
          description: `Holat o\'zgartirildi: ${car.status} → ${newStatus}`,
          details: { oldStatus: car.status, newStatus },
        },
      });
    }

    return newStatus;
  }

  // ✅ Transport vositasi ishlatish statistikasi
  static async getCarUsageStats(carId, startDate = null, endDate = null) {
    const where = {
      deliveryCarId: carId,
      ...(startDate &&
        endDate && {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
    };

    const [usageStats, deliveryStats, maintenanceStats] = await Promise.all([
      prisma.carUsageStatistics.findMany({
        where,
        orderBy: { date: "desc" },
      }),
      prisma.delivery.count({
        where: {
          courier: {
            deliveryCars: { some: { id: carId } },
          },
          ...(startDate &&
            endDate && {
              createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
            }),
        },
      }),
      prisma.maintenanceRecord.aggregate({
        where: {
          deliveryCarId: carId,
          ...(startDate &&
            endDate && {
              createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
            }),
        },
        _sum: { cost: true },
        _count: true,
      }),
    ]);

    // Hisoblashlar
    const totalDistance = usageStats.reduce(
      (sum, stat) => sum + (stat.distanceKm || 0),
      0
    );
    const totalFuel = usageStats.reduce(
      (sum, stat) => sum + (stat.fuelUsed || 0),
      0
    );
    const totalTime = usageStats.reduce(
      (sum, stat) => sum + (stat.workingHours || 0),
      0
    );
    const totalDeliveries = deliveryStats;

    const averageFuelConsumption =
      totalDistance > 0 ? ((totalFuel / totalDistance) * 100).toFixed(2) : 0;

    return {
      period: { startDate, endDate },
      usage: {
        totalDistance: Number(totalDistance.toFixed(2)),
        totalFuel: Number(totalFuel.toFixed(2)),
        totalTime: Number(totalTime.toFixed(2)),
        averageFuelConsumption: Number(averageFuelConsumption),
        totalDeliveries,
      },
      maintenance: {
        totalCost: Number(maintenanceStats._sum.cost || 0),
        totalServices: maintenanceStats._count,
      },
      dailyStats: usageStats.map((stat) => ({
        date: stat.date,
        distanceKm: stat.distanceKm,
        fuelUsed: stat.fuelUsed,
        workingHours: stat.workingHours,
        deliveries: stat.deliveriesCount,
      })),
    };
  }

  // ✅ Hujjatlar muddatini tekshirish
  static async checkDocumentExpiry(days = 30) {
    const expiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const cars = await prisma.deliveryCar.findMany({
      where: {
        isActive: true,
        OR: [
          {
            "documents.registrationExpiry": {
              lte: expiryDate,
              gte: new Date(),
            },
          },
          {
            "documents.insuranceExpiry": {
              lte: expiryDate,
              gte: new Date(),
            },
          },
          {
            "documents.licenseExpiry": {
              lte: expiryDate,
              gte: new Date(),
            },
          },
        ],
      },
      include: {
        courier: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
      },
    });

    const expiringDocuments = [];

    for (const car of cars) {
      const docs = car.documents || {};
      const notifications = [];

      if (
        docs.registrationExpiry &&
        new Date(docs.registrationExpiry) <= expiryDate
      ) {
        notifications.push({
          type: "REGISTRATION",
          expiryDate: docs.registrationExpiry,
          daysLeft: Math.ceil(
            (new Date(docs.registrationExpiry) - new Date()) /
              (1000 * 60 * 60 * 24)
          ),
        });
      }

      if (
        docs.insuranceExpiry &&
        new Date(docs.insuranceExpiry) <= expiryDate
      ) {
        notifications.push({
          type: "INSURANCE",
          expiryDate: docs.insuranceExpiry,
          daysLeft: Math.ceil(
            (new Date(docs.insuranceExpiry) - new Date()) /
              (1000 * 60 * 60 * 24)
          ),
        });
      }

      if (docs.licenseExpiry && new Date(docs.licenseExpiry) <= expiryDate) {
        notifications.push({
          type: "LICENSE",
          expiryDate: docs.licenseExpiry,
          daysLeft: Math.ceil(
            (new Date(docs.licenseExpiry) - new Date()) / (1000 * 60 * 60 * 24)
          ),
        });
      }

      if (notifications.length > 0) {
        expiringDocuments.push({
          car: {
            id: car.id,
            brand: car.brand,
            model: car.model,
            licensePlate: car.licensePlate,
          },
          courier: car.courier,
          notifications,
        });
      }
    }

    return expiringDocuments;
  }

  // ✅ Texnik xizmat eslatmalari
  static async getMaintenanceReminders(carId = null) {
    const where = carId ? { deliveryCarId: carId } : {};
    const cars = await prisma.deliveryCar.findMany({
      where: { ...where, isActive: true },
      include: {
        courier: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
        maintenanceRecords: {
          where: { status: "COMPLETED" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    const reminders = [];

    for (const car of cars) {
      const lastMaintenance = car.maintenanceRecords[0];
      const now = new Date();
      const maintenanceInterval = this.getMaintenanceInterval(car.type);

      let needsMaintenance = false;
      let reason = "";

      if (!lastMaintenance) {
        needsMaintenance = true;
        reason = "Texnik xizmat ko'rsatilmagan";
      } else {
        const daysSinceMaintenance = Math.floor(
          (now - lastMaintenance.createdAt) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceMaintenance > maintenanceInterval) {
          needsMaintenance = true;
          reason = `${daysSinceMaintenance} kun o\'tgan (maksimum ${maintenanceInterval} kun)`;
        }
      }

      if (needsMaintenance) {
        reminders.push({
          car: {
            id: car.id,
            brand: car.brand,
            model: car.model,
            licensePlate: car.licensePlate,
            type: car.type,
          },
          courier: car.courier,
          reason,
          lastMaintenance: lastMaintenance?.createdAt,
          recommendedDate: new Date(
            now.getTime() + maintenanceInterval * 24 * 60 * 60 * 1000
          ),
        });
      }
    }

    return reminders;
  }

  // ✅ Yordamchi funksiyalar
  static getMaintenanceInterval(carType) {
    const intervals = {
      BIKE: 90, // 3 oy
      MOTORCYCLE: 60, // 2 oy
      CAR: 180, // 6 oy
      VAN: 120, // 4 oy
    };
    return intervals[carType] || 90;
  }

  // ✅ Ishlatish statistikasi qo'shish
  static async addUsageStatistics(carId, statsData) {
    const { date, distanceKm, fuelUsed, workingHours, deliveriesCount, notes } =
      statsData;

    const usageStat = await prisma.carUsageStatistics.create({
      data: {
        deliveryCarId: carId,
        date: date ? new Date(date) : new Date(),
        distanceKm: Number(distanceKm) || 0,
        fuelUsed: Number(fuelUsed) || 0,
        workingHours: Number(workingHours) || 0,
        deliveriesCount: Number(deliveriesCount) || 0,
        notes: notes || null,
      },
    });

    // Mashina пробegini yangilash
    const car = await prisma.deliveryCar.findUnique({
      where: { id: carId },
    });

    if (car && distanceKm) {
      await prisma.deliveryCar.update({
        where: { id: carId },
        data: { mileage: car.mileage + Number(distanceKm) },
      });
    }

    return usageStat;
  }
}

module.exports = DeliveryCarService;
