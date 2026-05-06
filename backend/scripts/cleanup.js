// routes/adminRoutes.js
router.delete("/wipe-all", protect, authorize(["administrator"]), wipeAllData);

// controllers/adminController.js
exports.wipeAllData = async (req, res) => {
  try {
    await req.prisma.delivery.deleteMany();
    await req.prisma.order.deleteMany();
    await req.prisma.product.deleteMany();
    await req.prisma.deliveryCar.deleteMany();
    await req.prisma.deliveryType.deleteMany();
    await req.prisma.user.deleteMany({ where: { role: "shop_worker" } });

    res
      .status(200)
      .json({ success: true, message: "Barcha ma’lumotlar tozalandi." });
  } catch (error) {
    console.error("Tozalashda xato:", error.message);
    res.status(500).json({ message: "Tozalashda xato yuz berdi." });
  }
};
