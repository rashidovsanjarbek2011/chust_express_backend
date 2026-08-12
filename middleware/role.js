// middleware/role.js

// Authorization middleware: Checks if the user's role is in the allowed list
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not found.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.log(
        `⛔ ACCESS DENIED: User Role: '${req.user.role}' | Allowed: [${allowedRoles.join(", ")}] | User ID: ${req.user.id}`,
      );
      return res.status(403).json({
        success: false,
        message: `Forbidden: You do not have permission for this action. Your role is '${req.user.role}'.`,
      });
    }

    next();
  };
};

// requireRole - Single role check (wrapper for authorize)
const requireRole = (role) => {
  return authorize([role]);
};

// Shop Worker Ownership Check middleware
const isProductOwner = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id, 10);

    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    // Get Prisma from request
    if (!req.prisma) {
      console.error(
        "❌ req.prisma is not available in isProductOwner middleware",
      );
      return res.status(500).json({
        success: false,
        message: "Server configuration error.",
      });
    }

    const product = await req.prisma.product.findUnique({
      where: { id: productId },
      select: { ownerId: true },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Admins can manage everything
    if (req.user.role === "administrator") {
      console.log("✅ Admin access granted");
      return next();
    }

    // Workers and Owners can only manage their own products
    if (
      (req.user.role === "shop_worker" || req.user.role === "shop_owner") &&
      product.ownerId === req.user.id
    ) {
      console.log("✅ Product owner access granted");
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Forbidden: You do not have management rights for this product.",
    });
  } catch (error) {
    console.error("❌ isProductOwner middleware error:", error.message);
    console.error("Full error:", error);
    res.status(500).json({
      success: false,
      message: "Server error in authorization.",
      error: error.message,
    });
  }
};

module.exports = { authorize, requireRole, isProductOwner };
