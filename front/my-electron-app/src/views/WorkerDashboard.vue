<template>
  <div
    class="worker-dashboard-page pt-20 min-h-screen bg-zinc-950 text-white p-6 md:p-12"
  >
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-16">
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 mb-4"
        >
          <i class="bi bi-briefcase text-green-500 text-xs"></i>
          <span
            class="text-[10px] font-black uppercase tracking-widest text-green-500"
            >Ishchi Paneli</span
          >
        </div>
        <h1
          class="text-5xl font-black text-white tracking-tighter uppercase mb-2"
        >
          Ishchi Paneli
        </h1>
        <p class="text-zinc-500 text-lg">
          Buyurtmalarni qayta ishlash va zaxiralarni nazorat qiling.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          class="premium-card p-8 group relative overflow-hidden border-green-500/10"
        >
          <div
            class="w-14 h-14 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500 group-hover:text-white transition-all transform group-hover:rotate-12"
          >
            <i class="bi bi-box-seam text-3xl"></i>
          </div>
          <h2 class="text-2xl font-black mb-2 uppercase tracking-tight">
            Faol Buyurtmalar
          </h2>
          <p class="text-zinc-500 text-sm leading-relaxed mb-6">
            Hozirda sizda
            <span class="text-white font-bold"
              >{{ activeOrders.length }} ta</span
            >
            faol buyurtma mavjud.
          </p>
          <div class="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
            <div
              class="h-full bg-green-500 transition-all duration-1000"
              :style="{ width: Math.min(activeOrders.length * 10, 100) + '%' }"
            ></div>
          </div>
          <div
            class="absolute -right-2 -bottom-2 opacity-10 group-hover:opacity-20 transition-opacity"
          >
            <i class="bi bi-box-seam text-8xl"></i>
          </div>
        </div>

        <router-link
          to="/seller/sales"
          class="premium-card p-8 group relative overflow-hidden border-blue-500/10"
        >
          <div
            class="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition-all transform group-hover:-rotate-12"
          >
            <i class="bi bi-graph-up-arrow text-3xl"></i>
          </div>
          <h2 class="text-2xl font-black mb-2 uppercase tracking-tight">
            Sotuvlar Paneli
          </h2>
          <p class="text-zinc-500 text-sm leading-relaxed">
            Siz boshqarayotgan mahsulotlarning sotilish ko'rsatkichlarini
            kuzating.
          </p>
          <div
            class="absolute -right-2 -bottom-2 opacity-10 group-hover:opacity-20 transition-opacity"
          >
            <i class="bi bi-graph-up-arrow text-8xl"></i>
          </div>
        </router-link>

        <router-link
          to="/profile"
          class="premium-card p-8 group relative overflow-hidden border-purple-500/10"
        >
          <div
            class="w-14 h-14 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500 group-hover:text-white transition-all transform group-hover:scale-110"
          >
            <i class="bi bi-person-circle text-3xl"></i>
          </div>
          <h2 class="text-2xl font-black mb-2 uppercase tracking-tight">
            Mening Profilim
          </h2>
          <p class="text-zinc-500 text-sm leading-relaxed">
            Shaxsiy ma'lumotlaringiz va ishchi kodingizni tekshiring.
          </p>
          <div
            class="absolute -right-2 -bottom-2 opacity-10 group-hover:opacity-20 transition-opacity"
          >
            <i class="bi bi-person-circle text-8xl"></i>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "WorkerDashboard",
  data() {
    return {
      activeOrders: [],
      loading: true,
    };
  },
  mounted() {
    this.fetchActiveOrders();
  },
  methods: {
    async fetchActiveOrders() {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) return;

        // Use the /api/orders/admin endpoint which allows shop_worker access
        const response = await axios.get("/api/orders/admin", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          const allOrders = response.data.data;
          // Filter for active orders (pending, processing, on the way)
          this.activeOrders = allOrders.filter((order) =>
            ["Pending", "Processing", "Accepted", "On the way"].includes(
              order.orderStatus,
            ),
          );
        }
      } catch (err) {
        console.error("Failed to fetch active orders:", err);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.worker-dashboard-page {
  background: radial-gradient(
    circle at top right,
    rgba(34, 197, 94, 0.03),
    transparent 600px
  );
}
</style>
