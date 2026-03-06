<template>
  <div class="order-tracking pt-20 min-h-screen bg-zinc-950 text-white p-6 md:p-12">
    <div class="max-w-4xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <router-link
            to="/user-dashboard"
            class="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 mb-2"
          >
            <i class="bi bi-arrow-left"></i> Orqaga
          </router-link>
          <h1
            class="text-3xl md:text-4xl font-black text-green-500 tracking-tighter uppercase"
          >
            Buyurtmani Kuzatish
          </h1>
          <p v-if="order" class="text-zinc-500">ID: #ORD-{{ order.id }}</p>
        </div>
        <div
          v-if="order"
          class="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl"
        >
          <span
            class="text-white font-black uppercase text-xs tracking-widest"
            >{{ order.orderStatus }}</span
          >
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-20">
        <div
          class="animate-spin rounded-full h-16 w-16 border-t-2 border-green-500"
        ></div>
      </div>

      <div v-else-if="error" class="premium-card p-12 text-center">
        <i
          class="bi bi-exclamation-triangle text-5xl text-red-500 mb-6 block"
        ></i>
        <h2 class="text-2xl font-black uppercase mb-4">{{ error }}</h2>
        <router-link
          to="/user-dashboard"
          class="text-green-500 font-bold uppercase tracking-widest hover:underline"
          >Orqaga qaytish</router-link
        >
      </div>

      <div v-else-if="order">
        <!-- Order Details Card -->
        <div class="premium-card p-8 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p class="text-zinc-500 text-xs uppercase tracking-widest mb-1">
                Buyurtma Holati
              </p>
              <p class="text-2xl font-black text-green-400">
                {{ order.orderStatus }}
              </p>
            </div>
            <div>
              <p class="text-zinc-500 text-xs uppercase tracking-widest mb-1">
                Umumiy Summa
              </p>
              <p class="text-2xl font-black text-white">
                {{ order.totalPrice?.toLocaleString() || 0 }} UZS
              </p>
            </div>
          </div>

          <!-- 🆕 Pickup Location (Seller) -->
          <div class="border-t border-zinc-800 pt-6">
            <p
              class="text-zinc-500 text-xs uppercase tracking-widest mb-3 flex items-center gap-2"
            >
              <i class="bi bi-shop text-blue-500"></i> Olish Manzili (Do'kon)
            </p>
            <div class="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
              <p
                v-if="order.items?.[0]?.product?.shopAddress"
                class="text-white font-bold"
              >
                {{ order.items[0].product.shopAddress }}
              </p>
              <p v-else class="text-zinc-400 text-sm italic">
                Do'kon manzili kiritilmagan
              </p>
            </div>
          </div>

          <!-- Delivery Location -->
          <div class="border-t border-zinc-800 pt-6">
            <p
              class="text-zinc-500 text-xs uppercase tracking-widest mb-3 flex items-center gap-2"
            >
              <i class="bi bi-geo-alt text-red-500"></i> Yetkazib Berish Manzili
            </p>
            <div class="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
              <p class="text-white font-bold">{{ order.shippingAddress }}</p>
              <p v-if="order.latitude" class="text-zinc-400 text-sm mt-1">
                Koordinatalar: {{ order.latitude.toFixed(6) }},
                {{ order.longitude.toFixed(6) }}
              </p>
            </div>
          </div>

          <!-- Items List -->
          <div class="border-t border-zinc-800 pt-6">
            <p class="text-zinc-500 text-xs uppercase tracking-widest mb-3">
              Mahsulotlar
            </p>
            <div class="space-y-3">
              <div
                v-for="item in order.items"
                :key="item.id"
                class="flex justify-between items-center py-2 border-b border-zinc-800/50 last:border-0"
              >
                <div>
                  <p class="font-bold">{{ item.name }}</p>
                  <p class="text-sm text-zinc-400">Soni: {{ item.quantity }}</p>
                </div>
                <p class="text-green-400">{{ item.price }} UZS</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="premium-card p-6 bg-zinc-900 border-t border-zinc-800">
          <div class="flex justify-between items-end mb-2">
            <p class="text-sm font-bold text-white">
              {{ order.orderStatus }}
            </p>
            <p class="text-xs text-zinc-500 font-mono">{{ progress }}%</p>
          </div>
          <div class="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              class="h-full bg-green-500 transition-all duration-500"
              :style="{ width: progress + '%' }"
            ></div>
          </div>
        </div>

        <!-- Driver Controls -->
        <div v-if="isDriver()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Step 1: Pick Up -->
          <button
            v-if="
              order.orderStatus === 'Processing' ||
              order.orderStatus === 'Accepted'
            "
            @click="pickupOrder"
            class="p-6 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-all text-left group"
          >
            <div class="flex items-center gap-4 mb-2">
              <div
                class="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors"
              >
                <i class="bi bi-box-seam text-xl"></i>
              </div>
              <span
                class="text-sm font-black uppercase tracking-widest text-zinc-400"
                >1-qadam</span
              >
            </div>
            <h3 class="text-xl font-black text-white">Mahsulotni Olish</h3>
            <p class="text-sm text-zinc-500 mt-1">
              Do'kondan mahsulotni olganingizda bosing.
            </p>
          </button>

          <!-- Step 2: Complete -->
          <button
            v-if="
              order.orderStatus === 'On the way' ||
              order.orderStatus === 'Picked Up'
            "
            @click="completeDelivery"
            class="p-6 rounded-2xl bg-zinc-800 hover:bg-green-600 border border-zinc-700 hover:border-green-500 transition-all text-left group"
          >
            <div class="flex items-center gap-4 mb-2">
              <div
                class="w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center group-hover:bg-white group-hover:text-green-600 transition-colors"
              >
                <i class="bi bi-geo-alt text-xl"></i>
              </div>
              <span
                class="text-sm font-black uppercase tracking-widest text-zinc-400 group-hover:text-green-200"
                >2-qadam</span
              >
            </div>
            <h3 class="text-xl font-black text-white">Yetkazib Berish</h3>
            <p class="text-sm text-zinc-500 mt-1 group-hover:text-green-100">
              Mijozga topshirganingizda bosing.
            </p>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import toast from "@/services/toast"; // Ensure you have this or use alert
import { io } from "socket.io-client";

export default {
  name: "OrderTracking",
  data() {
    return {
      order: null,
      loading: true,
      error: null,
      progress: 0,
      watchId: null,
      socket: null,
    };
  },
  mounted() {
    this.fetchOrder();

    // Socket.io connection
    const backendUrl = import.meta.env.VITE_API_URL || "https://chust-express-backend.onrender.com/api";
    const socketUrl = backendUrl.replace(/\/api$/, "");
    this.socket = io(socketUrl);

    this.socket.on("orderUpdated", (updatedOrder) => {
      if (updatedOrder.id === this.order?.id) {
        console.log("Order updated via socket:", updatedOrder);
        this.order = updatedOrder;
        this.updateProgress();
      }
    });
  },
  beforeUnmount() {
    if (this.watchId) navigator.geolocation.clearWatch(this.watchId);
    if (this.socket) this.socket.disconnect();
  },
  methods: {
    getAuthToken() {
      return localStorage.getItem("token") || localStorage.getItem("userToken");
    },
    async fetchOrder(silent = false) {
      if (!silent) this.loading = true;
      try {
        const id = this.$route.params.id;
        const token = this.getAuthToken();
        if (!token) {
          this.error = "Iltimos, avval tizimga kiring.";
          this.$router.push("/login");
          return;
        }
        const response = await axios.get(`/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.order = response.data;
        this.updateProgress();

        if (this.isDriver() && !this.watchId) {
          this.startLocationTracking();
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        if (err.response?.status === 401) {
          this.error = "Avtorizatsiyadan o'tmagan. Iltimos, qayta kiring.";
          this.$router.push("/login");
        } else if (err.response?.status === 404) {
          this.error = "Buyurtma topilmadi.";
        } else {
          this.error = "Buyurtma ma'lumotlarini yuklab bo'lmadi.";
        }
      } finally {
        if (!silent) this.loading = false;
      }
    },
    updateProgress() {
      if (!this.order) return;
      if (this.order.orderStatus === "Delivered") this.progress = 100;
      else if (this.order.orderStatus === "On the way") this.progress = 75;
      else if (this.order.orderStatus === "Picked Up") this.progress = 50;
      else if (this.order.orderStatus === "Processing") this.progress = 25;
      else if (this.order.orderStatus === "Accepted") this.progress = 25;
      else this.progress = 10;
    },
    isDriver() {
      if (!this.order || !this.order.delivery) return false;
      const user = JSON.parse(
        localStorage.getItem("user") ||
          localStorage.getItem("userData") ||
          "{}",
      );
      const userId = user.id || user.data?.id;
      return this.order.delivery.driverId === userId;
    },
    isPickedUp() {
      return ["Picked Up", "On the way", "Delivered"].includes(
        this.order.orderStatus,
      );
    },
    startLocationTracking() {
      if ("geolocation" in navigator) {
        this.watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            this.updateDriverLocation(latitude, longitude);
          },
          (err) => console.warn(err),
          { enableHighAccuracy: true },
        );
      }
    },
    async updateDriverLocation(lat, lng) {
      if (!this.order || !this.order.delivery) return;
      const token = this.getAuthToken();
      try {
        await axios.put(
          `/api/delivery/${this.order.delivery.id}/location`,
          { latitude: lat, longitude: lng },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } catch (e) {
        console.error(e);
      }
    },
    async pickupOrder() {
      if (!confirm("Olishni tasdiqlaysizmi?")) return;
      try {
        const token = this.getAuthToken();
        await axios.put(
          `/api/delivery/${this.order.delivery.id}/status`,
          { status: "Picked Up" },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        toast.success("Buyurtma olindi!");
      } catch (e) {
        console.error(e);
        toast.error("Yangilashda xatolik");
      }
    },
    async completeDelivery() {
      if (!confirm("Yetkazib berishni tasdiqlaysizmi?")) return;
      try {
        const token = this.getAuthToken();
        await axios.post(
          `/api/delivery/complete/${this.order.id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
        toast.success("Buyurtma yetkazildi!");
      } catch (e) {
        console.error(e);
        toast.error("Yakunlashda xatolik");
      }
    },
  },
};
</script>

<style scoped>
.order-tracking {
  background: radial-gradient(
    circle at top right,
    rgba(34, 197, 94, 0.05),
    transparent 600px
  );
}
</style>
