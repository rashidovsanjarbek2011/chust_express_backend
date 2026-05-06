class Product {
  constructor(id, name, description, price, categoryId, imageUrl, createdAt = new Date()) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.categoryId = categoryId;
    this.imageUrl = imageUrl;
    this.createdAt = createdAt;
    this.updatedAt = createdAt;
    this.isActive = true;
    this.category = category;
    this.stock = 0;
    this.sku = null;
    this.brand = null;
    this.rating = 0;
    this.reviewCount = 0;
    this.discountPrice = null;
    this.tags = [];
    this.specifications = {};
  }

  // Narxni olish (chegirma bor bo'lsa, chegirma narxini)
  getCurrentPrice() {
    return this.discountPrice || this.price;
  }

  // Chegirma foizini hisoblash
  getDiscountPercentage() {
    if (!this.discountPrice) return 0;
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }

  // Chegirma mavjudmi
  hasDiscount() {
    return this.discountPrice !== null;
  }
  
  // Omborda bormi
  isInStock() {
    return this.stock > 0;
  }

  // Mahsulotni aktivlashtirish/o'chirish
  toggleActive() {
    this.isActive = !this.isActive;
    this.updatedAt = new Date();
    return this.isActive;
  }

  // Omborni yangilash
  updateStock(quantity) {
    this.stock += quantity;
    this.updatedAt = new Date();
    return this.stock;
  }

  // Reytingni yangilash
  updateRating(newRating) {
    const totalRating = this.rating * this.reviewCount + newRating;
    this.reviewCount += 1;
    this.rating = Math.round((totalRating / this.reviewCount) * 10) / 10;
    this.updatedAt = new Date();
    return this.rating;
  }

  // Tag qo'shish
  addTag(tag) {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
      this.updatedAt = new Date();
    }
    return this.tags;
  }

  // Texnik xususiyat qo'shish
  addSpecification(key, value) {
    this.specifications[key] = value;
    this.updatedAt = new Date();
    return this.specifications;
  }

  // Ma'lumotlarni olish
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.price,
      currentPrice: this.getCurrentPrice(),
      hasDiscount: this.hasDiscount(),
      discountPercentage: this.getDiscountPercentage(),
      categoryId: this.categoryId,
      imageUrl: this.imageUrl,
      isActive: this.isActive,
      stock: this.stock,
      sku: this.sku,
      brand: this.brand,
      rating: this.rating,
      reviewCount: this.reviewCount,
      tags: this.tags,
      specifications: this.specifications,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Product;