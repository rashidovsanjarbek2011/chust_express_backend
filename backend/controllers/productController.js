// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const products = await req.prisma.product.findMany({
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            address: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching products.",
    });
  }
};

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);

    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await req.prisma.product.findUnique({
      where: { id: productId },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            address: true,
          },
        },
        // orderItems removed - not needed for product details view
        // and causes severe performance issues for popular products
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching product.",
    });
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Shop Worker / Shop Owner / Admin)
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      stock,
      description,
      category,
      image,
      isActive,
      weight,
      shopAddress,
      unit,
      currency,
      deliveryPrice,
    } = req.body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Mahsulot nomi kamida 2 ta belgi bo'lishi kerak.",
      });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Narx noto'g'ri.",
      });
    }

    const parsedStock = stock ? parseInt(stock, 10) : 0;
    if (isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Soni noto'g'ri.",
      });
    }

    const parsedWeight = weight ? parseFloat(weight) : 1.0;
    const parsedDeliveryPrice = deliveryPrice ? parseFloat(deliveryPrice) : 0.0;

    // Get ownerId from authenticated user
    const ownerId = req.user.id;

    // Create product with ownerId
    const product = await req.prisma.product.create({
      data: {
        name: name.trim(),
        price: parsedPrice,
        stock: parsedStock,
        description: description || null,
        category: category && category !== 'null' ? category : "Not Selected",
        image: image || null,
        weight: parsedWeight,
        unit: unit || "pcs",
        currency: currency || "UZS",
        deliveryPrice: parsedDeliveryPrice,
        isActive: isActive !== undefined ? isActive : true,
        shopAddress: shopAddress && shopAddress !== "null" ? shopAddress.trim() : "",
        ownerId: ownerId, // CRITICAL: Link to user who created it
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            address: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Mahsulot muvaffaqiyatli yaratildi.",
      data: product,
    });
  } catch (error) {
    console.error("Error creating product:", error.message);
    console.error("Full error:", error);

    // Handle specific Prisma errors
    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: "Noto'g'ri foydalanuvchi ID si.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Serverda xatolik yuz berdi.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Shop Worker / Shop Owner / Admin)
exports.updateProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);

    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    // Check if product exists
    const product = await req.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Prepare update data
    const updateData = { ...req.body };

    // Remove unwanted fields
    delete updateData.id;
    delete updateData.ownerId; // Don't allow changing owner
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // Validate and convert price
    if (updateData.price) {
      const parsedPrice = parseFloat(updateData.price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be a valid non-negative number.",
        });
      }
      updateData.price = parsedPrice;
    }

    // Validate and convert stock
    if (updateData.stock) {
      const parsedStock = parseInt(updateData.stock, 10);
      if (isNaN(parsedStock) || parsedStock < 0) {
        return res.status(400).json({
          success: false,
          message: "Stock must be a valid non-negative integer.",
        });
      }
      updateData.stock = parsedStock;
    }

    // Validate and convert weight
    if (updateData.weight) {
      const parsedWeight = parseFloat(updateData.weight);
      if (isNaN(parsedWeight) || parsedWeight < 0) {
        return res.status(400).json({
          success: false,
          message: "Weight must be a valid non-negative number.",
        });
      }
      updateData.weight = parsedWeight;
    }

    if (updateData.category === null || updateData.category === 'null') {
      updateData.category = "Not Selected";
    }

    if (updateData.shopAddress === null || updateData.shopAddress === "null" || updateData.shopAddress === undefined) {
      updateData.shopAddress = "";
    } else if (typeof updateData.shopAddress === "string") {
      updateData.shopAddress = updateData.shopAddress.trim();
    }

    // Update the product
    const updatedProduct = await req.prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            address: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Mahsulot muvaffaqiyatli yangilandi.",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while updating product.",
    });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Shop Worker / Shop Owner / Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);

    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    // Check if product exists
    const product = await req.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Delete the product
    await req.prisma.product.delete({
      where: { id: productId },
    });

    res.status(200).json({
      success: true,
      message: "Mahsulot muvaffaqiyatli o'chirildi.",
    });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while deleting product.",
    });
  }
};

// @desc    Get stats for seller's products (sold count, revenue, etc.)
// @route   GET /api/products/seller/stats
// @access  Private (Shop Worker / Shop Owner / Admin)
exports.getSellerStats = async (req, res) => {
  try {
    const products = await req.prisma.product.findMany({
      where: { ownerId: req.user.id },
      include: {
        orderItems: {
          select: {
            quantity: true,
            price: true,
          },
        },
      },
    });

    const stats = products.map((product) => {
      const soldCount = product.orderItems.reduce(
        (acc, item) => acc + item.quantity,
        0,
      );
      const totalRevenue = product.orderItems.reduce(
        (acc, item) => acc + item.quantity * item.price,
        0,
      );
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        soldCount,
        totalRevenue,
        image: product.image,
        shopAddress: product.shopAddress,
        category: product.category,
        isActive: product.isActive,
      };
    });

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching seller stats:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching stats.",
    });
  }
};
