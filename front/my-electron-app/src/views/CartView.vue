<template>
  <div class="cart-view pt-20 min-h-screen bg-zinc-950 text-white p-6 md:p-12">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-12">
        <div>
          <h1
            class="text-4xl font-black text-green-500 tracking-tighter uppercase"
          >
            {{ $t('cart') }}
          </h1>
          <p class="text-zinc-500 text-sm">
            {{ $t('cart_subtitle') }}
          </p>
        </div>
        <div class="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl">
          <span
            class="text-zinc-400 font-bold uppercase text-[10px] tracking-widest"
            >{{ cartItems.length }} {{ $t('items_unit_short') }}</span
          >
        </div>
      </div>

      <div
        v-if="cartItems.length === 0"
        class="premium-card py-20 text-center flex flex-col items-center justify-center"
      >
        <div
          class="w-24 h-24 bg-zinc-800 text-zinc-500 rounded-full flex items-center justify-center mb-6"
        >
          <i class="bi bi-cart-x text-5xl"></i>
        </div>
        <h2 class="text-2xl font-black text-zinc-400 uppercase tracking-tight">
          {{ $t('empty_cart') }}
        </h2>
        <p class="text-zinc-600 mb-8 max-w-xs">
          {{ $t('empty_cart_hint') }}
        </p>
        <router-link
          to="/"
          class="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg shadow-green-500/20"
        >
          {{ $t('start_shopping') }}
        </router-link>
      </div>

      <div v-else class="flex flex-col lg:flex-row gap-12">
        <!-- Cart Items List -->
        <div class="flex-grow space-y-4">
          <div
            v-for="(item, index) in cartItems"
            :key="item.id"
            class="premium-card p-4 flex items-center gap-6 group hover:border-green-500/30 transition-all"
          >
            <div
              class="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-xl border border-zinc-800"
            >
              <img
                :src="getProductImage(item.image)"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>

            <div class="flex-grow">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h3 class="text-xl font-bold uppercase tracking-tight">
                    {{ item.name }}
                  </h3>
                  <p
                    class="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1"
                  >
                    {{ $t('price_label') }}:
                    <span class="text-green-500">
                      {{
                        item.currency = "UZS"
                         
                      }}{{ item.price }}
                      <span
                        v-if="item.currency === 'UZS'"
                        class="text-[10px] opacity-70"
                        >{{ $t('currency_uzs_short') }}</span
                      >
                      <span class="text-[10px] opacity-60"
                        >/ {{ item.unit || "pcs" }}</span
                      >
                    </span>
                  </p>
                  <p
                    v-if="item.deliveryPrice > 0"
                    class="text-zinc-500 text-[10px] uppercase tracking-widest mt-1"
                  >
                    {{ $t('delivery_per_unit') }}:
                    <span class="text-blue-500">
                      {{
                        item.currency = "UZS"
                         
                      }}{{ item.deliveryPrice }}
                      <span
                        v-if="item.currency === 'UZS'"
                        class="text-[8px] opacity-70"
                        >SO'M</span
                      >
                    </span>
                  </p>
                </div>
                <button
                  @click="removeItem(index)"
                  class="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>

              <div class="flex items-center justify-between mt-4">
                <div
                  class="flex items-center gap-3 bg-zinc-950 p-1 rounded-xl border border-zinc-800"
                >
                  <button
                    @click="decreaseQuantity(index)"
                    class="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center transition"
                  >
                    <i class="bi bi-dash"></i>
                  </button>
                  <span class="w-8 text-center font-black text-sm">{{
                    item.quantity
                  }}</span>
                  <button
                    @click="increaseQuantity(index)"
                    class="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center transition"
                  >
                    <i class="bi bi-plus"></i>
                  </button>
                </div>
                <p class="text-2xl font-black text-white tracking-tighter">
                  {{
                    item.currency === "UZS"
                      ? ""
                      : item.currency === "USD"
                        ? "$"
                        : item.currency === "RUB"
                          ? "₽"
                          : "$"
                  }}{{ (item.price * item.quantity).toFixed(2) }}
                  <span
                    v-if="item.currency === 'UZS'"
                    class="text-sm opacity-70 font-normal"
                    >SO'M</span
                  >
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary Column -->
        <div class="lg:w-96">
          <div class="premium-card p-8 sticky top-32">
            <h3
              class="text-zinc-500 font-black uppercase text-xs tracking-[0.2em] mb-8"
            >
              {{ $t('checkout_title') }}
            </h3>

            <!-- Shipping Info -->
            <div class="space-y-4 mb-8">
              <div>
                <label
                  class="block text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-2"
                  >{{ $t('delivery_address_label') }}</label
                >
                <textarea
                  v-model="shippingAddress"
                  :placeholder="$t('shipping_placeholder')"
                  rows="2"
                  class="w-full bg-zinc-950 border border-zinc-800 focus:border-green-500 rounded-xl p-3 text-white text-sm outline-none transition-all resize-none"
                ></textarea>
              </div>

              <div>
                <label
                  class="block text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-2"
                  >{{ $t('payment_method') }}</label
                >
                <select
                  v-model="paymentMethod"
                  class="w-full bg-zinc-950 border border-zinc-800 focus:border-green-500 rounded-xl p-3 text-white text-sm outline-none transition-all cursor-pointer"
                >
                  <option value="Kelishuv asosida">{{ $t('payment_negotiable') }}</option>
                  <option value="Naqd pul">{{ $t('payment_cash') }}</option>
                  <option value="Karta orqali">{{ $t('payment_card') }}</option>
                </select>
              </div>

              <!-- Location Status -->
              <div class="flex items-center gap-2 py-2">
                <div
                  :class="[location ? 'bg-green-500' : 'bg-zinc-600']"
                  class="w-2 h-2 rounded-full"
                ></div>
                <span
                  class="text-[10px] font-bold uppercase tracking-widest"
                  :class="[location ? 'text-green-500' : 'text-zinc-500']"
                >
                  {{
                    location ? $t('location_detected') : $t('getting_location')
                  }}
                </span>
              </div>
            </div>

            <div class="space-y-4 mb-8">
              <div class="flex justify-between text-sm">
                <span class="text-zinc-500 font-bold uppercase tracking-widest"
                  >{{ $t('subtotal') }}</span
                >
                <span class="font-black text-zinc-300 font-mono">
                  {{
                    cartItems[0]?.currency === "UZS"
                      ? ""
                      : cartItems[0]?.currency === "USD"
                        ? "$"
                        : cartItems[0]?.currency === "RUB"
                          ? "₽"
                          : "$"
                  }}{{ totalPrice.toFixed(2) }}
                  <span
                    v-if="cartItems[0]?.currency === 'UZS'"
                    class="text-[10px] opacity-70"
                    >SO'M</span
                  >
                </span>
              </div>
              <!-- <div class="flex justify-between text-sm">
                <span class="text-zinc-500 font-bold uppercase tracking-widest"
                  >Yetkazib berish</span
                >
                <span class="font-black text-blue-500 font-mono">
                  {{
                    totalDeliveryPrice > 0
                      ? (cartItems[0]?.currency === "UZS"
                          ? ""
                          : cartItems[0]?.currency === "USD"
                            ? "$"
                            : cartItems[0]?.currency === "RUB"
                              ? "₽"
                              : "$") + totalDeliveryPrice.toFixed(2)
                      : "BEPUL"
                  }}
                  <span
                    v-if="
                      totalDeliveryPrice > 0 && cartItems[0]?.currency === 'UZS'
                    "
                    class="text-[10px] opacity-70"
                    >SO'M</span
                  >
                </span>
              </div> -->
              <div class="h-px bg-zinc-800 w-full mt-4"></div>
              <div class="flex justify-between items-end pt-4">
                <span
                  class="text-zinc-400 font-black uppercase text-xs tracking-[0.2em]"
                  >{{ $t('grand_total') }}</span
                >
                <span
                  class="text-4xl font-black text-green-500 tracking-tighter font-mono"
                >
                  {{
                    cartItems[0]?.currency === "UZS"
                      ? ""
                      : cartItems[0]?.currency === "USD"
                        ? "$"
                        : cartItems[0]?.currency === "RUB"
                          ? "₽"
                          : "$"
                  }}{{ totalPrice.toFixed(2) }}
                  <span
                    v-if="cartItems[0]?.currency === 'UZS'"
                    class="text-xl opacity-70"
                    >SO'M</span
                  >
                </span>
              </div>
            </div>

            <div class="space-y-4">
              <button
                @click="checkout"
                :disabled="loading"
                :class="{ 'opacity-50 cursor-not-allowed': loading }"
                class="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
              >
                <i
                  v-if="loading"
                  class="bi bi-arrow-repeat animate-spin text-lg"
                ></i>
                <i v-else class="bi bi-credit-card text-lg"></i>
                {{ loading ? $t('processing') : $t('place_order') }}
              </button>
              <button
                @click="clearCart"
                class="w-full py-4 bg-zinc-950 hover:bg-red-500 hover:text-white text-zinc-500 font-black uppercase tracking-widest text-xs rounded-xl border border-zinc-800 hover:border-red-500 transition-all"
              >
                {{ $t('clear_cart') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import toast from "@/services/toast";
import { getProductImage } from "@/utils/imageUtils";

export default {
  name: "CartView",
  data() {
    return {
      cartItems: [],
      shippingAddress: "",
      paymentMethod: "Cash",
      location: null,
      loading: false,
    };
  },
  computed: {
    totalPrice() {
      return this.cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
    },
    totalDeliveryPrice() {
      return this.cartItems.reduce(
        (sum, item) => sum + (item.deliveryPrice || 0) * item.quantity,
        0,
      );
    },
    grandTotal() {
      return this.totalPrice + this.totalDeliveryPrice;
    },
  },
  mounted() {
    this.loadCart();
    // Geolocation is requested lazily on checkout to avoid surprising the
    // user with a permission prompt the moment they open the cart.
  },
  methods: {
    loadCart() {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        try {
          this.cartItems = JSON.parse(savedCart);
        } catch (e) {
          console.error("Cart loading error:", e);
          this.cartItems = [];
        }
      }
    },
    saveCart() {
      localStorage.setItem("cart", JSON.stringify(this.cartItems));
      window.dispatchEvent(new Event("cartUpdated"));
    },
    increaseQuantity(index) {
      if (this.cartItems[index].quantity < this.cartItems[index].stock) {
        this.cartItems[index].quantity++;
        this.saveCart();
      } else {
        toast.warning(this.$t("stock_limit_reached"));
      }
    },
    decreaseQuantity(index) {
      if (this.cartItems[index].quantity > 1) {
        this.cartItems[index].quantity--;
        this.saveCart();
      }
    },
    removeItem(index) {
      if (confirm(this.$t("confirm_remove_item"))) {
        this.cartItems.splice(index, 1);
        this.saveCart();
      }
    },
    clearCart() {
      if (confirm(this.$t("confirm_clear_cart"))) {
        this.cartItems = [];
        this.saveCart();
      }
    },
    // New dedicated function to send order to backend
    async sendOrderToBackend(orderData) {
      const token = localStorage.getItem("userToken");
      const response = await axios.post("/api/orders", orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    async checkout() {
      if (!this.shippingAddress || this.shippingAddress.length < 5) {
        toast.warning(this.$t("address_required"));
        return;
      }

      // Ask for location only when the user is actually placing an order.
      if (!this.location) {
        this.getLocation();
      }

      try {
        this.loading = true;
        const token = localStorage.getItem("userToken");

        if (!token) {
          toast.warning(this.$t("please_login_first"));
          this.$router.push("/login");
          return;
        }

        const orderData = {
          orderItems: this.cartItems.map((item) => ({
            product: item.id,
            quantity: item.quantity,
          })),
          shippingAddress: this.shippingAddress,
          paymentMethod: this.paymentMethod,
          subtotalPrice: this.totalPrice,
          deliveryPrice: this.totalDeliveryPrice,
          totalPrice: this.grandTotal,
          latitude: this.location?.lat,
          longitude: this.location?.lng,
        };

        // Use the new sendOrderToBackend function
        const result = await this.sendOrderToBackend(orderData);

        toast.success(this.$t("order_success"));
        localStorage.removeItem("cart");
        this.cartItems = [];
        this.saveCart();

        if (result && result.id) {
          this.$router.push(`/`);
        } else {
          this.$router.push("/user-dashboard");
        }
      } catch (err) {
        console.error("Order error:", err.response?.data || err.message);
        toast.error(
          err.response?.data?.message || this.$t("order_error"),
        );
      } finally {
        this.loading = false;
      }
    },
    getLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
          },
          (error) => {
            console.error("Geolocation error:", error);
            toast.warning(this.$t("location_unavailable"));
          },
        );
      }
    },
    getProductImage,
  },
};
</script>

<style scoped>
.cart-view {
  min-height: 100vh;
}
</style>
