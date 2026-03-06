const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// JWT token yaratish
const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable topilmadi!");
  }
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// @desc    Create user (alternative to auth/register)
// @route   POST /api/users
// @access  Public
router.post("/", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Barcha maydonlar to'ldirilishi shart." });
  }

  try {
    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.trim();

    // Email formatini tekshirish
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(cleanEmail)) {
      return res.status(400).json({ message: "Email manzili noto‘g‘ri." });
    }

    // Username formatini tekshirish
    const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernamePattern.test(cleanUsername)) {
      return res.status(400).json({
        message: "Username faqat harf, raqam yoki _ bo‘lishi kerak (3-20 belgi).",
      });
    }

    // Email unikal bo‘lishi kerak
    const existingUser = await req.prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      return res.status(400).json({ message: "Bu email allaqachon ro‘yxatdan o‘tgan." });
    }

    // Username unikal bo‘lishi kerak
    const existingUsername = await req.prisma.user.findUnique({ where: { username: cleanUsername } });
    if (existingUsername) {
      return res.status(400).json({ message: "Bu username allaqachon band." });
    }

    // Parolni hash qilish
    const hashedPassword = await bcrypt.hash(password, 12);

    // Foydalanuvchini yaratish
    const user = await req.prisma.user.create({
      data: {
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        role: "user",
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Token qaytarish
    res.status(201).json({
      _id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      token: generateToken(user.id, user.role),
    });
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).json({ message: "Serverda xatolik yuz berdi." });
  }
});

module.exports = router;
