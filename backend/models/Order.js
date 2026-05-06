class Order {
  constructor(id, userId, items, totalAmount, createdAt = new Date()) {
    this.id = id;
    this.userId = userId;
    this.items = items; // [{productId, quantity, price}]
    this.totalAmount = totalAmount;
    this.createdAt = createdAt;
    this.updatedAt = createdAt;
    this.status = "pending"; // pending, confirmed, shipped, delivered, cancelled
    this.paymentStatus = "pending"; // pending, paid, failed, refunded
    this.paymentMethod = null;
    this.shippingAddress = null;
    this.shippingCost = 0;
    this.discount = 0;
    this.tax = 0;
    this.trackingNumber = null;
    this.notes = null;
  }

  // Buyurtma narxini hisoblash
  calculateTotal() {
    const itemsTotal = this.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    this.totalAmount =
      itemsTotal + this.shippingCost + this.tax - this.discount;
    return this.totalAmount;
  }

  // Holatni yangilash
  updateStatus(newStatus) {
    const validStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (validStatuses.includes(newStatus)) {
      this.status = newStatus;
      this.updatedAt = new Date();
      return true;
    }
    return false;
  }

  // To'lov holatini yangilash
  updatePaymentStatus(newStatus) {
    const validStatuses = ["pending", "paid", "failed", "refunded"];
    if (validStatuses.includes(newStatus)) {
      this.paymentStatus = newStatus;
      this.updatedAt = new Date();
      return true;
    }
    return false;
  }

  // Element qo'shish
  addItem(productId, quantity, price) {
    const existingItem = this.items.find(
      (item) => item.productId === productId
    );
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        productId,
        quantity,
        price,
        subtotal: quantity * price,
      });
    }
    this.calculateTotal();
    this.updatedAt = new Date();
    return this.items;
  }

  // Elementni olib tashlash
  removeItem(productId) {
    this.items = this.items.filter((item) => item.productId !== productId);
    this.calculateTotal();
    this.updatedAt = new Date();
    return this.items;
  }

  // Yetkazib berish manzilini o'rnatish
  setShippingAddress(address) {
    this.shippingAddress = address;
    this.updatedAt = new Date();
    return this.shippingAddress;
  }

  // Yetkazib berish narxini o'rnatish
  setShippingCost(cost) {
    this.shippingCost = cost;
    this.calculateTotal();
    this.updatedAt = new Date();
    return this.shippingCost;
  }

  // Chegirmani o'rnatish
  setDiscount(amount) {
    this.discount = amount;
    this.calculateTotal();
    this.updatedAt = new Date();
    return this.discount;
  }

  // Soliq o'rnatish
  setTax(amount) {
    this.tax = amount;
    this.calculateTotal();
    this.updatedAt = new Date();
    return this.tax;
  }

  // Kuzatish raqamini o'rnatish
  setTrackingNumber(number) {
    this.trackingNumber = number;
    this.updatedAt = new Date();
    return this.trackingNumber;
  }

  // Izoh qo'shish
  addNotes(notes) {
    this.notes = notes;
    this.updatedAt = new Date();
    return this.notes;
  }

  // Buyurtma yakunlanganmi
  isCompleted() {
    return this.status === "delivered";
  }

  // Buyurtma bekor qilinganmi
  isCancelled() {
    return this.status === "cancelled";
  }

  // To'langanmi
  isPaid() {
    return this.paymentStatus === "paid";
  }

  // Ma'lumotlarni olish
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      items: this.items,
      totalAmount: this.totalAmount,
      status: this.status,
      paymentStatus: this.paymentStatus,
      paymentMethod: this.paymentMethod,
      shippingAddress: this.shippingAddress,
      shippingCost: this.shippingCost,
      discount: this.discount,
      tax: this.tax,
      trackingNumber: this.trackingNumber,
      notes: this.notes,
      isCompleted: this.isCompleted(),
      isCancelled: this.isCancelled(),
      isPaid: this.isPaid(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = Order;
