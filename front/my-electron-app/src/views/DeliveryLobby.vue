<template>
  <div
    class="delivery-lobby pt-20 min-h-screen bg-zinc-950 text-white p-6 md:p-12"
  >
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div
        class="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div>
          <div
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 mb-4"
          >
            <i class="bi bi-bicycle text-green-500 text-xs"></i>
            <span
              class="text-[10px] font-black uppercase tracking-widest text-green-500"
              >Kuryer Markazi</span
            >
          </div>
          <h1
            class="text-5xl font-black text-white tracking-tighter uppercase mb-2"
          >
            Buyurtmalar <span class="text-green-500">Pool-i</span>
          </h1>
          <p class="text-zinc-500 text-lg">
            Yetkazib berish uchun mavjud buyurtmalarni tanlang.
          </p>
        </div>
        <button
          @click="fetchOrders"
          class="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl border border-zinc-800 transition-all flex items-center gap-2"
        >
          <i
            class="bi bi-arrow-clockwise"
            :class="{ 'animate-spin': loading }"
          ></i>
          Yangilash
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div
          class="premium-card p-8 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/10"
        >
          <p
            class="text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-2"
          >
            Mavjud buyurtmalar
          </p>
          <p class="text-4xl font-black text-white">{{ orders.length }} ta</p>
        </div>
        <div class="premium-card p-8">
          <p
            class="text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-2"
          >
            Transport
          </p>
          <p class="text-xl font-black text-white uppercase">
            {{ user?.vehicleType || "Tanlanmagan" }}
          </p>
        </div>
      </div>

      <!-- Orders List -->
      <!-- Skeletons -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div v-for="i in 4" :key="i" class="premium-card p-8 bg-zinc-900/50">
          <div class="flex justify-between mb-6">
            <SkeletonLoader width="120px" height="28px" />
            <SkeletonLoader width="60px" height="24px" />
          </div>
          <div class="space-y-4 mb-8">
            <div class="flex gap-4">
              <SkeletonLoader width="32px" height="32px" borderRadius="8px" />
              <div class="flex-1 space-y-2">
                <SkeletonLoader width="80px" height="12px" />
                <SkeletonLoader width="60%" height="16px" />
              </div>
            </div>
            <div class="flex gap-4">
              <SkeletonLoader width="32px" height="32px" borderRadius="8px" />
              <div class="flex-1 space-y-2">
                <SkeletonLoader width="80px" height="12px" />
                <SkeletonLoader width="80%" height="16px" />
              </div>
            </div>
          </div>
          <div class="flex gap-3 mb-8">
            <SkeletonLoader width="100px" height="32px" />
            <SkeletonLoader width="100px" height="32px" />
          </div>
          <SkeletonLoader width="100%" height="48px" borderRadius="12px" />
        </div>
      </div>

      <div
        v-else-if="orders.length === 0"
        class="premium-card p-20 text-center"
      >
        <div
          class="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <i class="bi bi-inbox text-4xl text-zinc-700"></i>
        </div>
        <h3 class="text-2xl font-black uppercase mb-2">
          Hozircha buyurtmalar yo'q
        </h3>
        <p class="text-zinc-500 max-w-sm mx-auto">
          Yangi buyurtmalar tushishini kuting. Sahifani yangilab turing.
        </p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          v-for="(order, index) in orders"
          :key="order.id"
          class="premium-card p-8 group hover:border-green-500/50 transition-all flex flex-col justify-between animate-slide-up"
          :style="{ animationDelay: index * 0.05 + 's' }"
        >
          <div>
            <div class="flex justify-between items-start mb-6">
              <div>
                <h4
                  class="text-xl font-black text-white uppercase tracking-tight"
                >
                  #ORD-{{ order.id }}
                </h4>
                <p
                  class="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1"
                >
                  {{ formatDate(order.createdAt) }}
                </p>
              </div>
              <div
                class="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg"
              >
                <span
                  class="text-green-500 font-black text-[10px] uppercase tracking-widest"
                  >${{ order.totalPrice.toFixed(2) }}</span
                >
              </div>
            </div>

            <div class="space-y-4 mb-8">
              <div class="flex items-start gap-4">
                <div
                  class="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0"
                >
                  <i class="bi bi-shop"></i>
                </div>
                <div>
                  <p
                    class="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1"
                  >
                    Do'kon Joylashuvi
                  </p>
                  <p class="text-sm font-bold text-zinc-300">
                    {{
                      order.originLat
                        ? `${order.originLat.toFixed(4)}, ${order.originLng.toFixed(4)}`
                        : "Noma'lum"
                    }}
                  </p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div
                  class="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0"
                >
                  <i class="bi bi-geo-alt"></i>
                </div>
                <div>
                  <p
                    class="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1"
                  >
                    Yetkazib berish manzil
                  </p>
                  <p class="text-sm font-bold text-zinc-200">
                    {{ order.shippingAddress }}
                  </p>
                  <p
                    v-if="order.latitude"
                    class="text-[10px] text-zinc-600 font-bold mt-1"
                  >
                    Koordinatalar: {{ order.latitude.toFixed(4) }},
                    {{ order.longitude.toFixed(4) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Items List (Preview) -->
            <div class="flex flex-wrap gap-3 mb-8">
              <div
                v-for="item in order.items"
                :key="item.id"
                class="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg group-hover:border-zinc-700 transition"
              >
                <img
                  v-if="item.product && item.product.image"
                  :src="getProductImage(item.product.image)"
                  alt="Product"
                  class="w-8 h-8 rounded object-cover bg-zinc-800"
                  @error="$event.target.style.display = 'none'"
                />
                <div
                  v-else
                  class="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-zinc-600"
                >
                  <i class="bi bi-image"></i>
                </div>
                <div class="flex flex-col">
                  <span
                    class="text-[10px] font-bold text-zinc-300 leading-tight"
                    >{{ item.name }}</span
                  >
                  <span class="text-[9px] font-mono text-zinc-500"
                    >{{ item.quantity }}x</span
                  >
                </div>
              </div>
            </div>
          </div>

          <button
            @click="takeOrder(order.id)"
            class="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
          >
            <i class="bi bi-hand-index-thumb"></i> Buyurtmani olish
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import toast from "@/services/toast";
import SkeletonLoader from "@/components/SkeletonLoader.vue";
import { getProductImage } from "@/utils/imageUtils";
import { io } from "socket.io-client";

export default {
  name: "DeliveryLobby",
  components: { SkeletonLoader },
  data() {
    return {
      orders: [],
      loading: true,
      user: null,
      pollingInterval: null,
      socket: null,
    };
  },
  mounted() {
    this.fetchOrders();
    this.loadUser();

    // Socket.io connection
    const backendUrl = import.meta.env.VITE_API_URL || "https://chust-express-backend.onrender.com/api";
    const socketUrl = backendUrl.replace(/\/api$/, "");
    this.socket = io(socketUrl);

    this.socket.on("newOrder", (newOrder) => {
      console.log("New order received:", newOrder);
      const exists = this.orders.some((o) => o.id === newOrder.id);
      if (!exists) {
        this.orders.unshift(newOrder);
      }
    });

    this.socket.on("orderTaken", (takenOrderId) => {
      console.log("Order taken:", takenOrderId);
      this.orders = this.orders.filter((o) => o.id !== takenOrderId);
    });

    // Optional: keep polling as a backup
    this.pollingInterval = setInterval(() => {
      this.fetchOrders(false);
    }, 10000);
  },
  beforeUnmount() {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    if (this.socket) this.socket.disconnect();
  },
  methods: {
    getAuthToken() {
      return localStorage.getItem("token") || localStorage.getItem("userToken");
    },
    async loadUser() {
      try {
        const token = this.getAuthToken();
        const response = await axios.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          this.user = response.data.data;
        }
      } catch (err) {
        console.error("User error:", err);
        if (err.response?.status === 401) {
          this.$router.push("/login");
        }
      }
    },
    async fetchOrders(showLoading = true) {
      if (showLoading) this.loading = true;
      try {
        const token = this.getAuthToken();
        const response = await axios.get("/api/delivery/available", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          this.orders = response.data.data;
        }
      } catch (err) {
        console.error("Fetch error:", err);
        if (err.response?.status === 401) {
          this.$router.push("/login");
        }
      } finally {
        if (showLoading) this.loading = false;
      }
    },
    async takeOrder(orderId) {
      if (!confirm("Ushbu buyurtmani yetkazib berishni qabul qilasizmi?"))
        return;

      try {
        const token = this.getAuthToken();
        const response = await axios.post(
          `/api/delivery/take/${orderId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (response.data.success) {
          toast.success(
            "Buyurtma qabul qilindi! Endi yo'lga chiqishingiz mumkin.",
          );
          this.$router.push({
            name: "order-tracking",
            params: { id: orderId },
          });
        }
      } catch (err) {
        toast.error(
          err.response?.data?.message ||
            "Buyurtmani olishda xatolik yuz berdi.",
        );
        if (err.response?.status === 401) {
          this.$router.push("/login");
        }
      }
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleString("uz-UZ");
    },
    getProductImage,
  },
};
</script>

<style scoped>
.delivery-lobby {
  background: radial-gradient(
    circle at bottom right,
    rgba(34, 197, 94, 0.05),
    transparent 800px
  );
}
</style>
