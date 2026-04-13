// ==================================================
// productController.js
// ==================================================
// Uses req.prisma injected by server.js middleware
// All database operations are safe and compatible with Render
// ==================================================

// Helper function to format product for frontend
const formatProductForFrontend = (product) => {
  if (!product) return product;

  let imagesArray = [];

  // Use the existing 'image' column from database
  if (product.image) {
    try {
      // Try to parse as JSON string (if stored as JSON)
      const parsed = JSON.parse(product.image);
      if (Array.isArray(parsed)) {
        imagesArray = parsed;
      } else {
        imagesArray = [parsed];
      }
    } catch (e) {
      // Not JSON, treat as single image string
      imagesArray = [product.image];
    }
  }

  // Filter out empty/null images
  imagesArray = imagesArray.filter(img => img && img.trim());

  // Ensure we have at least one image
  if (imagesArray.length === 0) {
    imagesArray = ["https://placehold.co/400x300?text=No+Image"];
  }

  return {
    ...product,
    shopAddress: product.shopAddress || "",
    images: imagesArray,   // frontend expects 'images' array
    image: undefined,      // remove the old singular field
  };
};

// Helper function to format images for database (stores as JSON string in 'image' column)
const formatImagesForDatabase = (images) => {
  if (!images) return JSON.stringify(["https://placehold.co/400x300?text=No+Image"]);

  let imagesArray = [];

  // Handle different input formats
  if (Array.isArray(images)) {
    imagesArray = images;
  } else if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images);
      imagesArray = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      imagesArray = [images];
    }
  } else {
    imagesArray = [String(images)];
  }

  // Filter and clean up
  imagesArray = imagesArray.filter(img => {
    if (!img || typeof img !== 'string') return false;
    const trimmed = img.trim();
    return trimmed.length > 0;
  });

  // Limit to 5 images
  imagesArray = imagesArray.slice(0, 5);

  if (imagesArray.length === 0) {
    imagesArray = ["https://placehold.co/400x300?text=No+Image"];
  }

  // Store as JSON string in the 'image' column
  return JSON.stringify(imagesArray);
};

// ==================================================
// CONTROLLER FUNCTIONS
// ==================================================

// @desc    Fetch all products with pagination & filtering
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;

    // Build where clause for filtering
    const where = {};

    if (category && category !== 'all' && typeof category === 'string' && category.trim()) {
      where.category = category;
    }

    if (search && typeof search === 'string' && search.trim()) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Parse pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const total = await req.prisma.product.count({ where });

    // Fetch products
    const products = await req.prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        description: true,
        category: true,
        image: true,
        weight: true,
        unit: true,
        currency: true,
        deliveryPrice: true,
        isActive: true,
        shopAddress: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
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
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    });

    const formattedProducts = products.map(formatProductForFrontend);

    res.status(200).json({
      success: true,
      count: formattedProducts.length,
      total: total,
      data: {
        products: formattedProducts,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Mahsulotlarni olishda xatolik.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
      return res.status(400).json({ success: false, message: "Invalid product ID." });
    }

    const product = await req.prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        description: true,
        category: true,
        image: true,
        weight: true,
        unit: true,
        currency: true,
        deliveryPrice: true,
        isActive: true,
        shopAddress: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
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

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    res.status(200).json({
      success: true,
      data: formatProductForFrontend(product),
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching product.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      stock,
      description,
      category,
      images,
      isActive,
      weight,
      shopAddress,
      unit,
      currency,
      deliveryPrice,
    } = req.body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: "Mahsulot nomi kamida 2 ta belgi bo'lishi kerak." });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ success: false, message: "Narx noto'g'ri." });
    }

    const parsedStock = stock ? parseInt(stock, 10) : 0;
    if (isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({ success: false, message: "Soni noto'g'ri." });
    }

    const parsedWeight = weight ? parseFloat(weight) : 1.0;
    const parsedDeliveryPrice = deliveryPrice ? parseFloat(deliveryPrice) : 0.0;
    const imageData = formatImagesForDatabase(images);

    const product = await req.prisma.product.create({
      data: {
        name: name.trim(),
        price: parsedPrice,
        stock: parsedStock,
        description: description || null,
        category: category && category !== 'null' ? category : "Not Selected",
        image: imageData,
        weight: parsedWeight,
        unit: unit || "pcs",
        currency: currency || "UZS",
        deliveryPrice: parsedDeliveryPrice,
        isActive: isActive !== undefined ? isActive : true,
        shopAddress: shopAddress && shopAddress !== "null" ? shopAddress.trim() : "",
        ownerId: req.user.id,
      },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        description: true,
        category: true,
        image: true,
        weight: true,
        unit: true,
        currency: true,
        deliveryPrice: true,
        isActive: true,
        shopAddress: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
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
      data: formatProductForFrontend(product),
    });
  } catch (error) {
    console.error("Error creating product:", error);
    if (error.code === "P2002") {
      return res.status(400).json({ success: false, message: "Bu nomdagi mahsulot allaqachon mavjud." });
    }
    if (error.code === "P2003") {
      return res.status(400).json({ success: false, message: "Foydalanuvchi topilmadi. Iltimos qayta login qiling." });
    }
    res.status(500).json({
      success: false,
      message: "Mahsulot yaratishda xatolik: " + error.message,
    });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
exports.updateProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID." });
    }

    const existingProduct = await req.prisma.product.findUnique({ where: { id: productId } });
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    if (existingProduct.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: "Siz faqat o'zingizning mahsulotingizni tahrirlashingiz mumkin." });
    }

    const updateData = { ...req.body };
    if (updateData.images !== undefined) {
      updateData.image = formatImagesForDatabase(updateData.images);
      delete updateData.images;
    }
    delete updateData.id;
    delete updateData.ownerId;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    if (updateData.price !== undefined) {
      const parsed = parseFloat(updateData.price);
      if (isNaN(parsed) || parsed < 0) return res.status(400).json({ success: false, message: "Price must be a valid non-negative number." });
      updateData.price = parsed;
    }
    if (updateData.stock !== undefined) {
      const parsed = parseInt(updateData.stock, 10);
      if (isNaN(parsed) || parsed < 0) return res.status(400).json({ success: false, message: "Stock must be a valid non-negative integer." });
      updateData.stock = parsed;
    }
    if (updateData.weight !== undefined) {
      const parsed = parseFloat(updateData.weight);
      if (isNaN(parsed) || parsed < 0) return res.status(400).json({ success: false, message: "Weight must be a valid non-negative number." });
      updateData.weight = parsed;
    }
    if (updateData.shopAddress === null || updateData.shopAddress === undefined) updateData.shopAddress = "";
    if (updateData.category === null || updateData.category === 'null') updateData.category = "Not Selected";

    const updatedProduct = await req.prisma.product.update({
      where: { id: productId },
      data: updateData,
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        description: true,
        category: true,
        image: true,
        weight: true,
        unit: true,
        currency: true,
        deliveryPrice: true,
        isActive: true,
        shopAddress: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
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
      data: formatProductForFrontend(updatedProduct),
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: "Server error while updating product." });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
exports.deleteProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID." });
    }

    const product = await req.prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    if (product.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: "Siz faqat o'zingizning mahsulotingizni o'chira olasiz." });
    }

    await req.prisma.product.delete({ where: { id: productId } });
    res.status(200).json({ success: true, message: "Mahsulot muvaffaqiyatli o'chirildi." });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ success: false, message: "Server error while deleting product." });
  }
};

// @desc    Get seller's products stats
// @route   GET /api/products/seller/stats
// @access  Private
exports.getSellerStats = async (req, res) => {
  try {
    const products = await req.prisma.product.findMany({
      where: { ownerId: req.user.id },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        image: true,
        shopAddress: true,
        category: true,
        isActive: true,
        orderItems: {
          select: { quantity: true, price: true },
        },
      },
    });

    const stats = products.map((product) => {
      const soldCount = product.orderItems.reduce((acc, item) => acc + item.quantity, 0);
      const totalRevenue = product.orderItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
      const formatted = formatProductForFrontend(product);
      return {
        id: formatted.id,
        name: formatted.name,
        price: formatted.price,
        stock: formatted.stock,
        soldCount,
        totalRevenue,
        images: formatted.images,
        shopAddress: formatted.shopAddress,
        category: formatted.category,
        isActive: formatted.isActive,
      };
    });

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("Error fetching seller stats:", error);
    res.status(500).json({ success: false, message: "Server error while fetching stats." });
  }
};

// @desc    Get all categories
// @route   GET /api/products/categories/list
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await req.prisma.product.findMany({
      where: { category: { not: "Not Selected" } },
      distinct: ['category'],
      select: { category: true },
    });

    const categoryList = categories.map(c => c.category).filter(Boolean);
    res.status(200).json({ success: true, data: categoryList });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, message: "Server error while fetching categories." });
  }
};

// @desc    Toggle product active status
// @route   PATCH /api/products/:id/toggle
// @access  Private
exports.toggleProductStatus = async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID." });
    }

    const product = await req.prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    if (product.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: "Siz faqat o'zingizning mahsulotingizni o'zgartira olasiz." });
    }

    const updatedProduct = await req.prisma.product.update({
      where: { id: productId },
      data: { isActive: !product.isActive },
      select: {
        id: true,
        name: true,
        image: true,
        isActive: true,
        owner: { select: { id: true, username: true } },
      },
    });

    res.status(200).json({
      success: true,
      message: `Mahsulot ${updatedProduct.isActive ? 'faollashtirildi' : 'faolsizlantirildi'}.`,
      data: formatProductForFrontend(updatedProduct),
    });
  } catch (error) {
    console.error("Error toggling product status:", error);
    res.status(500).json({ success: false, message: "Server error while toggling product status." });
  }
};