const prisma = require("../config/database");
const AppError = require("../utils/appError");

class ShopService {
  // ✅ Barcha reystoranlarni olish (sahifalash bilan)
  static async getAllShops(page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;
    const { search, category, city, isActive = true } = filters;

    const where = {
      isActive,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(city && { address: { contains: city, mode: "insensitive" } }),
    };

    const [shops, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        skip,
        take: limit,
        include: {
          categories: {
            where: { isActive: true },
            take: 5,
            select: {
              id: true,
              name: true,
              slug: true,
              _count: { select: { products: true } },
            },
          },
          _count: {
            select: {
              products: { where: { isAvailable: true } },
              reviews: true,
            },
          },
        },
        orderBy: { rating: "desc" },
      }),
      prisma.restaurant.count({ where }),
    ]);

    return {
      shops,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  // ✅ ID bo'yicha bitta reystoran olish
  static async getShopById(id) {
    const shop = await prisma.restaurant.findUnique({
      where: { id, isActive: true },
      include: {
        categories: {
          where: { isActive: true },
          include: {
            products: {
              where: { isAvailable: true },
              orderBy: { name: "asc" },
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                imageUrl: true,
                isAvailable: true,
                _count: { select: { orderItems: true } },
              },
            },
          },
        },
        reviews: {
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            products: { where: { isAvailable: true } },
            reviews: true,
          },
        },
      },
    });

    if (!shop) {
      throw new AppError("Reystoran topilmadi", 404);
    }

    // Reytingni qayta hisoblash
    const ratingData = await prisma.review.aggregate({
      where: { restaurantId: id },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      ...shop,
      rating: ratingData._avg.rating || 0,
      reviewCount: ratingData._count.rating,
    };
  }

  // ✅ Yangi reystoran yaratish
  static async createShop(shopData) {
    const {
      name,
      description,
      address,
      phone,
      email,
      logoUrl,
      coverUrl,
      ownerId,
      workingHours,
    } = shopData;

    // Slug yaratish (URL uchun)
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    // Unique slug tekshirish
    const existingShop = await prisma.restaurant.findFirst({
      where: { slug },
    });

    if (existingShop) {
      throw new AppError("Bu nomdagi reystoran mavjud", 400);
    }

    const shop = await prisma.restaurant.create({
      data: {
        name,
        description,
        address,
        phone,
        email,
        logoUrl,
        coverUrl,
        slug,
        workingHours: workingHours || "09:00-22:00",
        // ownerId: ownerId, // Keyinchalik qo'shiladi
      },
    });

    return shop;
  }

  // ✅ Reystoran ma'lumotlarini yangilash
  static async updateShop(id, updateData, ownerId = null) {
    const shop = await prisma.restaurant.findUnique({
      where: { id },
    });

    if (!shop) {
      throw new AppError("Reystoran topilmadi", 404);
    }

    // Egalik huquqini tekshirish (agar ownerId berilgan bo'lsa)
    if (ownerId && shop.ownerId && shop.ownerId !== ownerId) {
      throw new AppError("Bu reystoranni o'zgartirish huquqingiz yo'q", 403);
    }

    // Slug yangilash (agar nom o'zgargan bo'lsa)
    if (updateData.name && updateData.name !== shop.name) {
      const newSlug = updateData.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .trim();

      // Yangi slug unique ekanligini tekshirish
      const existingShop = await prisma.restaurant.findFirst({
        where: { slug: newSlug, NOT: { id } },
      });

      if (existingShop) {
        throw new AppError("Bu nomdagi reystoran mavjud", 400);
      }

      updateData.slug = newSlug;
    }

    const updatedShop = await prisma.restaurant.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    return updatedShop;
  }

  // ✅ Reystorani o'chirish (soft delete)
  static async deleteShop(id, ownerId = null) {
    const shop = await prisma.restaurant.findUnique({
      where: { id },
    });

    if (!shop) {
      throw new AppError("Reystoran topilmadi", 404);
    }

    // Egalik huquqini tekshirish
    if (ownerId && shop.ownerId && shop.ownerId !== ownerId) {
      throw new AppError("Bu reystoranni o'chirish huquqingiz yo'q", 403);
    }

    // Faol buyurtmalar borligini tekshirish
    const activeOrders = await prisma.order.count({
      where: {
        restaurantId: id,
        status: {
          in: [
            "PENDING",
            "CONFIRMED",
            "PREPARING",
            "READY_FOR_DELIVERY",
            "ON_THE_WAY",
          ],
        },
      },
    });

    if (activeOrders > 0) {
      throw new AppError(
        "Faol buyurtmalar mavjud. Avval ularni yakunlang.",
        400
      );
    }

    await prisma.restaurant.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ✅ Reystoran statistikasi
  static async getShopStats(id) {
    const shop = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            orders: true,
            reviews: true,
          },
        },
      },
    });

    if (!shop) {
      throw new AppError("Reystoran topilmadi", 404);
    }

    // Oxirgi 30 kundagi buyurtmalar
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrders = await prisma.order.count({
      where: {
        restaurantId: id,
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    const totalRevenue = await prisma.order.aggregate({
      where: {
        restaurantId: id,
        status: "DELIVERED",
      },
      _sum: { totalAmount: true },
    });

    const averageRating = await prisma.review.aggregate({
      where: { restaurantId: id },
      _avg: { rating: true },
    });

    return {
      shopId: shop.id,
      shopName: shop.name,
      totalProducts: shop._count.products,
      totalOrders: shop._count.orders,
      totalReviews: shop._count.reviews,
      recentOrders: recentOrders,
      totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
      averageRating: Number(averageRating._avg.rating || 0),
      isActive: shop.isActive,
    };
  }

  // ✅ Reystoran kategorialarini olish
  static async getShopCategories(shopId) {
    const categories = await prisma.category.findMany({
      where: {
        restaurantId: shopId,
        isActive: true,
      },
      include: {
        _count: {
          select: {
            products: { where: { isAvailable: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return categories;
  }

  // ✅ Reystoran mahsulotlarini qidirish
  static async searchShopProducts(shopId, searchTerm, categoryId = null) {
    const where = {
      category: {
        restaurantId: shopId,
        isActive: true,
      },
      isAvailable: true,
      ...(searchTerm && {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
        ],
      }),
      ...(categoryId && { categoryId }),
    };

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return products;
  }

  // ✅ Mashhur reystoranlar
  static async getPopularShops(limit = 10) {
    const shops = await prisma.restaurant.findMany({
      where: { isActive: true },
      take: limit,
      include: {
        categories: {
          take: 3,
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            products: { where: { isAvailable: true } },
            reviews: true,
          },
        },
      },
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
    });

    return shops;
  }

  // ✅ Reystoran reytingini yangilash
  static async updateShopRating(shopId) {
    const ratingData = await prisma.review.aggregate({
      where: { restaurantId: shopId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const newRating = ratingData._avg.rating || 0;
    const reviewCount = ratingData._count.rating || 0;

    await prisma.restaurant.update({
      where: { id: shopId },
      data: {
        rating: newRating,
        updatedAt: new Date(),
      },
    });

    return { rating: newRating, reviewCount };
  }
}

module.exports = ShopService;
