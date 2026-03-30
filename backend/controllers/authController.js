// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  generateUniqueCode,
  generateLegacyCode,
  generateDeliveryCode,
  generateManagerCode,
  generateExtraCode,
} = require("../utils/codeGenerator");
const { validateDeliveryCode } = require("../services/deliveryCodeService");

/**
 * JWT token yaratish
 */
const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable topilmadi!");
  }
  return jwt.sign({ id, role }, process.env.JWT_SECRET);
};

// ====================================
// 1. Oddiy foydalanuvchi ro'yxatdan o'tishi
// ====================================
const registerUser = async (req, res) => {
  const { username, email, password, cardNumber, address, phoneNumber, workingRegion } = req.body;

  if (!username || !email || !password || !cardNumber || !address || !phoneNumber) {
    return res.status(400).json({
      success: false,
      message:
        "Barcha maydonlar, jumladan karta raqami va manzil to'ldirilishi shart.",
    });
  }

  try {
    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.trim();

    // Email mavjudligini tekshirish
    const existingEmail = await req.prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Bu email allaqachon ro'yxatdan o'tgan.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await req.prisma.user.create({
      data: {
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        role: "user",
        uniqueCode: generateUniqueCode(),
        legacyCode: generateLegacyCode(),
        managerCode: generateManagerCode(),
        deliveryCode: generateDeliveryCode(),
        extraCode: generateExtraCode(),
        cardNumber: cardNumber.replace(/\s/g, ""), // Remove spaces
        address: address, // Save address
        phoneNumber: phoneNumber, // Save phone number
        workingRegion: workingRegion, // Save working region if provided
      },
    });

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        uniqueCode: user.uniqueCode,
        legacyCode: user.legacyCode,
        managerCode: user.managerCode,
        deliveryCode: user.deliveryCode,
        extraCode: user.extraCode,
        phoneNumber: user.phoneNumber,
      },
      token,
    });
  } catch (error) {
    console.error("❌ registerUser Error:", error);
    // Handle Prisma unique constraint error (duplicate username or email)
    if (error.code === "P2002" && error.meta) {
      const target = Array.isArray(error.meta.target)
        ? error.meta.target.join(", ")
        : error.meta.target;
      return res.status(400).json({
        success: false,
        message: `Unique constraint failed: ${target}`,
      });
    }
    const message =
      process.env.NODE_ENV === "development"
        ? error.message
        : "Serverda xatolik.";
    res.status(500).json({ success: false, message });
  }
};

// ====================================
// 2. Login (Hamma rollar uchun)
// ====================================
const loginUser = async (req, res) => {
  const {
    email,
    password,
    uniqueCode,
    legacyCode,
    deliveryCode,
    adminCode,
    managerCode,
    extraCode,
    workingRegion,
  } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Ma'lumotlar to'liq emas." });
  }

  try {
    const user = await req.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ success: false, message: "Email yoki parol noto'g'ri." });
    }

    let finalRole = user.role;

    // Admin, Shop Worker, Shop Owner, Extra User va Kuryer kodi tekshiruvlari
    if (adminCode && adminCode.trim() === process.env.ADMIN_CODE) {
      finalRole = "administrator";
    } else if (extraCode && extraCode.trim() === user.extraCode) {
      finalRole = "extra-user";
    } else if (uniqueCode && uniqueCode.trim() === user.uniqueCode) {
      finalRole = "shop_worker";
    } else if (legacyCode && legacyCode.trim() === user.legacyCode) {
      finalRole = "shop_owner";
    } else if (managerCode && managerCode.trim()) {
      const codeTrimmed = managerCode.trim();
      let isValidManager = false;
      
      // Check if it matches user's own manager code
      if (codeTrimmed === user.managerCode) {
        isValidManager = true;
      } else {
        // Otherwise check the global ManagerCode table
        const validManagerCode = await req.prisma.managerCode.findFirst({
          where: { code: codeTrimmed, isActive: true },
        });
        if (validManagerCode) isValidManager = true;
      }
      
      if (isValidManager) finalRole = "manager";
    } else if (deliveryCode && deliveryCode.trim()) {
      const codeTrimmed = deliveryCode.trim();
      let isValidDelivery = false;
      
      // Check if it matches user's own delivery code
      if (codeTrimmed === user.deliveryCode) {
        isValidDelivery = true;
      } else {
        // Otherwise check global DeliveryCode table
        const validDeliveryCode = await req.prisma.deliveryCode.findFirst({
          where: { code: codeTrimmed, isActive: true },
        });
        if (validDeliveryCode) isValidDelivery = true;
      }
      
      if (isValidDelivery) finalRole = "delivery";
    }

    // Rol o'zgargan bo'lsa yangilash
    // Shuningdek, agar login paytida isDelivery, address yoki workingRegion kelsa, ularni ham yangilash
    const { isDelivery, address, workingRegion } = req.body;
    const updateData = {};

    if (user.role !== finalRole) {
      updateData.role = finalRole;
    }
    if (isDelivery !== undefined) {
      updateData.isDelivery = isDelivery;
    }
    if (address !== undefined && address.trim() !== "") {
      updateData.address = address;
    }
    if (workingRegion !== undefined && workingRegion.trim() !== "") {
      updateData.workingRegion = workingRegion;
    }

    if (Object.keys(updateData).length > 0) {
      await req.prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
      // Update local user object to reflect changes in response
      if (updateData.role) user.role = updateData.role;
      if (updateData.isDelivery !== undefined)
        user.isDelivery = updateData.isDelivery;
      if (updateData.address) user.address = updateData.address;
      if (updateData.workingRegion) user.workingRegion = updateData.workingRegion;
    }

    const token = generateToken(user.id, finalRole);
    res.status(200).json({
      success: true,
      token,
      role: finalRole,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: finalRole,
        uniqueCode: user.uniqueCode,
        legacyCode: user.legacyCode,
        deliveryCode: user.deliveryCode,
        extraCode: user.extraCode,
        shopId: user.shopId,
        address: user.address,
        workingRegion: user.workingRegion,
        isDelivery: user.isDelivery,
        deliveryPrice: user.deliveryPrice, // Include deliveryPrice in the response
      },
    });
  } catch (error) {
    console.error("❌ loginUser Error:", error.message);
    res.status(500).json({ success: false, message: "Serverda xatolik." });
  }
};

// ====================================
// 3. GET /api/auth/me - FIXED VERSION
// ====================================
const getMe = async (req, res) => {
  try {
    // console.log("🔍 Getting user with ID:", req.user.id);

    // Boshqa barcha ma'lumotlarni Raw Query orqali olish (Schema sync xatoliklarini chetlab o'tish uchun)
    const users = await req.prisma.$queryRaw`SELECT * FROM "User" WHERE id = ${req.user.id}`;
    const user = users && users.length > 0 ? users[0] : null;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Foydalanuvchi topilmadi.",
      });
    }

    // Password'ni olib tashlash
    delete user.password;

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("❌ getMe error:", error.message);
    console.error("Full error:", error);
    res.status(500).json({
      success: false,
      message: "Serverda xatolik yuz berdi.",
      error: error.message,
    });
  }
};

// ====================================
// 4. Do'kon xodimi ro'yxatdan o'tishi
// ====================================
const registerShopWorker = async (req, res) => {
  const { username, email, password, address, isDelivery } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const worker = await req.prisma.user.create({
      data: {
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "shop_worker",
        uniqueCode: generateUniqueCode(),
        address,
        isDelivery: !!isDelivery,
      },
    });

    res.status(201).json({ success: true, data: worker });
  } catch (error) {
    console.error("❌ registerShopWorker error:", error.message);
    res.status(500).json({ success: false, message: "Xatolik." });
  }
};

// ====================================
// 5. Do'kon egasi ro'yxatdan o'tishi
// ====================================
const registerShopOwner = async (req, res) => {
  const { username, email, password, address, isDelivery } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const owner = await req.prisma.user.create({
      data: {
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "shop_owner",
        legacyCode: generateLegacyCode(),
        address,
        isDelivery: !!isDelivery,
      },
    });

    res.status(201).json({ success: true, data: owner });
  } catch (error) {
    console.error("❌ registerShopOwner error:", error.message);
    res.status(500).json({ success: false, message: "Xatolik." });
  }
};

// ====================================
// 6. Kuryer ro'yxatdan o'tishi
// ====================================
const registerDelivery = async (req, res) => {
  const { username, email, password, workingRegion } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    // Unikal kuryer kodi yaratish
    let uniqueDeliveryCode = generateDeliveryCode();

    const user = await req.prisma.user.create({
      data: {
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "delivery",
        isDelivery: true,
        deliveryCode: uniqueDeliveryCode,
        workingRegion: workingRegion,
      },
    });

    const token = generateToken(user.id, user.role);
    res.status(201).json({ success: true, data: user, token });
  } catch (error) {
    console.error("❌ registerDelivery error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Kuryer ro'yxatdan o'tmadi." });
  }
};

// ====================================
// 7. Profilni yangilash
// ====================================
const updateProfile = async (req, res) => {
  const { username, email, phoneNumber, address, workingRegion, cardNumber } = req.body;
  
  try {
    const updateData = {};
    
    if (username) updateData.username = username.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (address) updateData.address = address;
    if (workingRegion) updateData.workingRegion = workingRegion;
    if (cardNumber) updateData.cardNumber = cardNumber.replace(/\s/g, "");
    
    // Check if email is being changed and if it already exists
    if (email) {
      const existingUser = await req.prisma.user.findFirst({
        where: {
          email: email.toLowerCase().trim(),
          NOT: { id: req.user.id }
        }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Bu email allaqachon ro'yxatdan o'tgan",
        });
      }
    }
    
    // Check if username is being changed and if it already exists
    if (username) {
      const existingUser = await req.prisma.user.findFirst({
        where: {
          username: username.trim(),
          NOT: { id: req.user.id }
        }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Bu username allaqachon ro'yxatdan o'tgan",
        });
      }
    }
    
    const updatedUser = await req.prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        phoneNumber: true,
        address: true,
        workingRegion: true,
        cardNumber: true,
        uniqueCode: true,
        legacyCode: true,
        deliveryCode: true,
        managerCode: true,
        isDelivery: true,
        deliveryPrice: true,
        shopId: true,
      }
    });
    
    res.status(200).json({
      success: true,
      data: updatedUser,
      message: "Profil muvaffaqiyatli yangilandi",
    });
  } catch (error) {
    console.error("❌ updateProfile error:", error.message);
    
    // Handle Prisma unique constraint error
    if (error.code === "P2002" && error.meta?.target) {
      const target = Array.isArray(error.meta.target) 
        ? error.meta.target.join(", ") 
        : error.meta.target;
      return res.status(400).json({
        success: false,
        message: `${target} allaqachon ro'yxatdan o'tgan`,
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Profilni yangilashda xatolik yuz berdi",
    });
  }
};

// ====================================
// 8. Kuryer transport turini tanlashi
// ====================================
const updateDeliveryVehicle = async (req, res) => {
  const { vehicleType } = req.body;
  try {
    const user = await req.prisma.user.update({
      where: { id: req.user.id },
      data: { vehicleType },
    });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("❌ updateDeliveryVehicle error:", error.message);
    res.status(500).json({ success: false, message: "Xatolik." });
  }
};

// ====================================
// 9. Kuryer kodini tekshirish (Real-time)
// ====================================
const validateDeliveryCodeAction = async (req, res) => {
  const { email, code } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: "Kod kiritilmadi." });
  }

  try {
    const codeTrimmed = code.trim();
    let isValid = false;

    // 1. Agar email bo'lsa, foydalanuvchining o'z kodini tekshirish
    if (email) {
      const user = await req.prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        select: { deliveryCode: true },
      });
      if (user && user.deliveryCode === codeTrimmed) {
        isValid = true;
      }
    }

    // 2. Agar foydalanuvchi kodi bo'lmasa, global jadvaldan qidirish
    if (!isValid) {
      const globalCode = await req.prisma.deliveryCode.findFirst({
        where: { code: codeTrimmed, isActive: true },
      });
      if (globalCode) isValid = true;
    }

    res.status(200).json({ success: true, isValid });
  } catch (error) {
    console.error("❌ validateDeliveryCode Error:", error.message);
    res.status(500).json({ success: false, message: "Serverda xatolik." });
  }
};

// ====================================
// 10. Region bo'yicha kuryerlarni olish
// ====================================
const getCouriersByRegion = async (req, res) => {
  const { region } = req.params;
  try {
    const couriers = await req.prisma.user.findMany({
      where: {
        role: "delivery",
        isPaused: false,
        workingRegion: {
          contains: region,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        username: true,
        workingRegion: true,
        deliveryPrice: true,
        vehicleType: true,
      },
    });

    res.status(200).json({ success: true, data: couriers });
  } catch (error) {
    console.error("❌ getCouriersByRegion error:", error.message);
    res.status(500).json({ success: false, message: "Kuryerlarni olishda xatolik." });
  }
};

// --- EKSPORTLAR ---
module.exports = {
  registerUser,
  loginUser,
  getMe,
  registerShopWorker,
  registerShopOwner,
  registerDelivery,
  updateProfile,
  updateDeliveryVehicle,
  validateDeliveryCodeAction,
  getCouriersByRegion,
};