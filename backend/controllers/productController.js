// Helper function to format product for frontend
const formatProductForFrontend = (product) => {
  if (!product) return product;
  
  // Parse images - handle both array and string formats
  let imagesArray = [];
  
  if (product.images && Array.isArray(product.images)) {
    // New format: images array
    imagesArray = product.images;
  } else if (product.image) {
    // Old format: single image string
    try {
      // Try to parse as JSON (if stored as JSON string)
      const parsed = JSON.parse(product.image);
      if (Array.isArray(parsed)) {
        imagesArray = parsed;
      } else {
        imagesArray = [parsed];
      }
    } catch {
      // Not JSON, treat as single string
      imagesArray = [product.image];
    }
  }
  
  // Filter out empty/null images and ensure we have at least one
  imagesArray = imagesArray.filter(img => img && img.trim());
  if (imagesArray.length === 0) {
    imagesArray = ["https://placehold.co/400x300?text=No+Image"];
  }
  
  return {
    ...product,
    shopAddress: product.shopAddress || "",
    images: imagesArray,
    image: undefined, // Remove old field
  };
};

// Helper function to format images for database
const formatImagesForDatabase = (images) => {
  if (!images) return null;
  
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
  }
  
  // Filter and clean up
  imagesArray = imagesArray.filter(img => img && img.trim()).slice(0, 5);
  
  if (imagesArray.length === 0) {
    return null;
  }
  
  // Store as JSON string for compatibility
  return JSON.stringify(imagesArray);
};

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
      orderBy: { createdAt: "desc" },
    });

    const formattedProducts = products.map(formatProductForFrontend);

    res.status(200).json({
      success: true,
      count: formattedProducts.length,
      data: formattedProducts,
    });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({
      success: false,
      message: "Mahsulotlarni olishda xatolik.",
      error: error.message,
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
      data: formatProductForFrontend(product),
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

    console.log("Received product data:", { name, price, images }); // Debug log

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

    // Format images for database
    const imageData = formatImagesForDatabase(images);
    
    console.log("Formatted image data:", imageData); // Debug log

    const ownerId = req.user.id;

    const product = await req.prisma.product.create({
      data: {
        name: name.trim(),
        price: parsedPrice,
        stock: parsedStock,
        description: description || null,
        category: category && category !== 'null' ? category : "Not Selected",
        image: imageData, // Store as JSON string
        weight: parsedWeight,
        unit: unit || "pcs",
        currency: currency || "UZS",
        deliveryPrice: parsedDeliveryPrice,
        isActive: isActive !== undefined ? isActive : true,
        shopAddress: shopAddress && shopAddress !== "null" ? shopAddress.trim() : "",
        ownerId: ownerId,
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

    console.log("Product created with image:", product.image); // Debug log

    res.status(201).json({
      success: true,
      message: "Mahsulot muvaffaqiyatli yaratildi.",
      data: formatProductForFrontend(product),
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Serverda xatolik yuz berdi.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const existingProduct = await req.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const updateData = { ...req.body };

    // Handle images
    if (updateData.images !== undefined) {
      updateData.image = formatImagesForDatabase(updateData.images);
      delete updateData.images;
    }

    // Remove unwanted fields
    delete updateData.id;
    delete updateData.ownerId;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // Validate price
    if (updateData.price !== undefined) {
      const parsedPrice = parseFloat(updateData.price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be a valid non-negative number.",
        });
      }
      updateData.price = parsedPrice;
    }

    // Validate stock
    if (updateData.stock !== undefined) {
      const parsedStock = parseInt(updateData.stock, 10);
      if (isNaN(parsedStock) || parsedStock < 0) {
        return res.status(400).json({
          success: false,
          message: "Stock must be a valid non-negative integer.",
        });
      }
      updateData.stock = parsedStock;
    }

    // Handle NULL values
    if (updateData.shopAddress === null || updateData.shopAddress === undefined) {
      updateData.shopAddress = "";
    }
    if (updateData.category === null || updateData.category === 'null') {
      updateData.category = "Not Selected";
    }

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
      data: formatProductForFrontend(updatedProduct),
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
// @access  Private
exports.deleteProduct = async (req, res) => {
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
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

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

// @desc    Get seller stats
// @route   GET /api/products/seller/stats
// @access  Private
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