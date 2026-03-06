// middleware/auth.js
const jwt = require("jsonwebtoken");

/**
 * 🔐 Protect middleware - JWT token tekshirish
 * Foydalanuvchi tizimga kirganmi yoki yo'qmi tekshiradi
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // 1. Token headerdan olish
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2. Token mavjud emasligini tekshirish
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Iltimos, avval tizimga kiring.",
      });
    }

    // 3. Tokenni tekshirish va decode qilish
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Foydalanuvchi ma'lumotlarini bazadan olish (ENG YANGI ROL UCHUN)
    // NOTE: This requires req.prisma to be available. Ensure verifyDB middleware runs before this or import prisma here.
    // Assuming req.prisma is available or using global Prisma instance.
    // If req.prisma is not reliable here, we should require the prisma client directly.

    // Better to use the prisma instance attached to req if server.js sets it up,
    // BUT common practice in this project seems to be using req.prisma.
    // However, protect might run before req.prisma is set if order is wrong.
    // Let's use the standard request attachment if available, or fallback.

    if (!req.prisma) {
      // Fallback if req.prisma isn't there yet (though server.js likely sets it)
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();
      req.prisma = prisma;
    }

    const user = await req.prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        role: true,
        email: true,
        username: true,
        shopId: true,
        isPaused: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Ushbu token egasi tizimda topilmadi.",
      });
    }

    if (
      user.isPaused &&
      ["shop_worker", "shop_owner", "delivery"].includes(user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are permanantly paused, please pay to unpause",
      });
    }

    // 5. Foydalanuvchi ma'lumotlarini requestga qo'shish
    req.user = user;

    // 6. Keyingi middleware yoki controllerga o'tish
    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error.message);

    // Token muddati tugagan yoki noto'g'ri
    return res.status(401).json({
      success: false,
      message: "Token noto'g'ri yoki muddati tugagan.",
    });
  }
};

/**
 * 👮 Authorize middleware - Rolni tekshirish
 * Ma'lum rollarga ega foydalanuvchilarni kiritadi
 *
 * Misol: authorize(['administrator', 'shop_owner'])
 */
exports.authorize = (allowedRoles) => {
  return (req, res, next) => {
    // Handle both array and spread arguments
    const rolesArray = Array.isArray(allowedRoles)
      ? allowedRoles
      : [allowedRoles];

    // Foydalanuvchi kiritilgan rollardan biriga ega emasligini tekshirish
    if (!rolesArray.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Rol '${req.user.role}' bu amalni bajarish uchun ruxsat berilmagan.`,
      });
    }
    next();
  };
};
