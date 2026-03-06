exports.registerShopOwner = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Barcha maydonlar majburiy." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Avvalgi shoplar sonini hisoblash
    const shopCount = await req.prisma.shop.count();

    // ✅ Yangi shopId = shopCount + 1
    const newShopId = shopCount + 1;

    // ✅ Do‘kon yaratish
    const shop = await req.prisma.shop.create({
      data: {
        id: newShopId,
        name: `${username} do‘koni`,
      },
    });

    // ✅ Foydalanuvchini shop_owner sifatida yaratish
    const owner = await req.prisma.user.create({
      data: {
        username: username.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: "shop_owner",
        shopId: shop.id,
        uniqueCode: generateUniqueCode(),
      },
    });

    res.status(201).json({
      success: true,
      data: {
        _id: owner.id,
        username: owner.username,
        email: owner.email,
        role: owner.role,
        shopId: owner.shopId,
        uniqueCode: owner.uniqueCode,
        token: generateToken(owner.id, owner.role),
      },
    });
  } catch (error) {
    console.error("Shop owner ro‘yxatdan o‘tishda xato:", error.message);
    res.status(500).json({ message: "Serverda xatolik yuz berdi." });
  }
};
