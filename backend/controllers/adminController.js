const { PrismaClient } = require("@prisma/client");
const { getCurrentDeliveryCode } = require("../services/deliveryCodeService");

// Get all users
// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Managers should only see user info (including unique/legacy codes)
    // but must NOT see createdAt/updatedAt or be able to modify users.
    let users;
    let total;

    if (req.user && req.user.role === "manager") {
      total = await req.prisma.user.count();
      users = await req.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          uniqueCode: true,
          legacyCode: true,
          managerCode: true,
          deliveryCode: true,
          extraCode: true,
          isPaused: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      total = await req.prisma.user.count();
      users = await req.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          isDelivery: true,
          vehicleType: true,
          uniqueCode: true,
          legacyCode: true,
          managerCode: true,
          deliveryCode: true,
          extraCode: true,
          shopId: true,
          createdAt: true,
          updatedAt: true,
          isPaused: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// Get all orders
// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await req.prisma.order.count();

    const orders = await req.prisma.order.findMany({
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

// Get current delivery code
exports.getDeliveryCode = async (req, res) => {
  try {
    const code = await getCurrentDeliveryCode();

    res.status(200).json({
      success: true,
      data: code,
    });
  } catch (error) {
    console.error("Get delivery code error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch delivery code",
    });
  }
};

// Toggle user pause status
exports.toggleUserPause = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    const user = await req.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Optional: Prevent pausing admins, or other logic, but managers can pause specific roles
    // We already protect the route broadly, but checking again is safe.

    const updatedUser = await req.prisma.user.update({
      where: { id: userId },
      data: {
        isPaused: !user.isPaused, // Toggle the status
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isPaused: true,
      },
    });

    res.status(200).json({
      success: true,
      message: `User ${updatedUser.username} has been ${updatedUser.isPaused ? "paused" : "unpaused"}.`,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Toggle user pause error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle user pause status",
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await req.prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

module.exports = exports;
