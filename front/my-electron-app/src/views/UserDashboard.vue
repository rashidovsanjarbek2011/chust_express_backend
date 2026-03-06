<template>
  <div
    class="user-dashboard-page pt-20 min-h-screen bg-zinc-950 text-white p-6 md:p-12"
  >
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-16">
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4"
        >
          <i class="bi bi-shield-check text-blue-500 text-xs"></i>
          <span
            class="text-[10px] font-black uppercase tracking-widest text-blue-500"
            >Mijoz Paneli</span
          >
        </div>
        <h1
          class="text-5xl font-black text-white tracking-tighter uppercase mb-2"
        >
          Boshqaruv Paneli
        </h1>
        <p class="text-zinc-500 text-lg">
          Buyurtmalaringiz va hisobingiz holatini kuzating.
        </p>
      </div>

      <!-- Quick Stats / Navigation -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <router-link
          :to="{ name: 'home' }"
          class="premium-card p-8 group relative overflow-hidden"
        >
          <div
            class="w-14 h-14 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500 group-hover:text-white transition-all transform group-hover:rotate-6"
          >
            <i class="bi bi-shop text-3xl"></i>
          </div>
          <h2 class="text-2xl font-black mb-2 uppercase tracking-tight">
            Katalog
          </h2>
          <p class="text-zinc-500 text-sm leading-relaxed">
            Yangi va mazali taomlarni qidiring va buyurtma bering.
          </p>
          <div
            class="absolute -right-2 -bottom-2 opacity-10 group-hover:opacity-20 transition-opacity"
          >
            <i class="bi bi-shop text-8xl"></i>
          </div>
        </router-link>

        <router-link
          to="/cart"
          class="premium-card p-8 group relative overflow-hidden"
        >
          <div
            class="w-14 h-14 bg-yellow-500/10 text-yellow-500 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-yellow-500 group-hover:text-white transition-all transform group-hover:-rotate-6"
          >
            <i class="bi bi-cart3 text-3xl"></i>
          </div>
          <h2 class="text-2xl font-black mb-2 uppercase tracking-tight">
            Mening Savatim
          </h2>
          <p class="text-zinc-500 text-sm leading-relaxed">
            Savatdagi mahsulotlarni ko'ring va xaridni davom ettiring.
          </p>
          <div
            class="absolute -right-2 -bottom-2 opacity-10 group-hover:opacity-20 transition-opacity"
          >
            <i class="bi bi-cart3 text-8xl"></i>
          </div>
        </router-link>

        <router-link
          to="/profile"
          class="premium-card p-8 group relative overflow-hidden"
        >
          <div
            class="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition-all transform group-hover:scale-110"
          >
            <i class="bi bi-person-badge text-3xl"></i>
          </div>
          <h2 class="text-2xl font-black mb-2 uppercase tracking-tight">
            Profil
          </h2>
          <p class="text-zinc-500 text-sm leading-relaxed">
            Shaxsiy ma'lumotlaringizni boshqaring va yangilang.
          </p>
          <div
            class="absolute -right-2 -bottom-2 opacity-10 group-hover:opacity-20 transition-opacity"
          >
            <i class="bi bi-person-badge text-8xl"></i>
          </div>
        </router-link>
      </div>

      <!-- Orders Section -->
      <div class="space-y-8">
        <div
          class="flex items-center justify-between border-b border-zinc-900 pb-6"
        >
          <h2 class="text-3xl font-black uppercase tracking-tight">
            Mening Buyurtmalarim
          </h2>
          <div
            v-if="orders.length > 0"
            class="px-4 py-1.5 bg-zinc-900 rounded-full border border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-500"
          >
            {{ orders.length }} ta buyurtma
          </div>
        </div>

        <div v-if="loading" class="grid grid-cols-1 gap-6">
          <div
            v-for="i in 3"
            :key="i"
            class="premium-card p-8 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div class="flex items-center gap-8 w-full md:w-auto">
              <SkeletonLoader width="64px" height="64px" borderRadius="16px" />
              <div class="flex-1 space-y-2">
                <SkeletonLoader width="150px" height="24px" />
                <SkeletonLoader width="200px" height="16px" />
              </div>
            </div>
            <div class="w-full md:w-32">
              <SkeletonLoader width="100%" height="40px" />
            </div>
          </div>
        </div>

        <div
          v-else-if="orders.length === 0"
          class="premium-card p-20 text-center bg-zinc-900/50"
        >
          <i class="bi bi-bag-x text-6xl text-zinc-800 mb-6 block"></i>
          <p class="text-xl font-black uppercase tracking-tight text-zinc-500">
            Sizda hali buyurtmalar yo'q
          </p>
          <router-link
            to="/"
            class="mt-6 inline-block text-green-500 font-black text-xs uppercase tracking-[0.2em] hover:underline"
          >
            Hoziroq buyurtma bering
          </router-link>
        </div>

        <div v-else class="grid grid-cols-1 gap-6">
          <router-link
            v-for="(order, index) in orders"
            :key="order.id"
            :to="{ name: 'order-tracking', params: { id: order.id } }"
            class="premium-card p-8 flex flex-col md:flex-row items-start md:items-center justify-between hover:border-green-500/50 transition-all group animate-slide-up"
            :style="{ animationDelay: index * 0.1 + 's' }"
          >
            <div class="flex items-center gap-8 w-full md:w-auto">
              <div
                class="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800 group-hover:border-green-500/30 transition-colors"
              >
                <i class="bi bi-box-seam text-2xl text-green-500"></i>
              </div>
              <div>
                <div class="flex items-center gap-3 mb-1">
                  <h4
                    class="text-xl font-black text-white uppercase tracking-tight"
                  >
                    ORD-#{{ order.id }}
                  </h4>
                  <span
                    :class="statusBgColor(order.orderStatus)"
                    class="px-2 py-0.5 text-[9px] font-black uppercase rounded"
                  >
                    {{ order.orderStatus }}
                  </span>
                </div>
                <p class="text-xs text-zinc-500 font-medium">
                  {{ formatDate(order.createdAt) }} •
                  {{ order.items.length }} ta mahsulot
                </p>
                <div class="flex gap-2 mt-3 overflow-hidden">
                  <div
                    v-for="item in order.items.slice(0, 3)"
                    :key="item.id"
                    class="px-2 py-1 bg-zinc-900 rounded border border-zinc-800 text-[9px] font-bold text-zinc-400 capitalize"
                  >
                    {{ item.name }}
                  </div>
                  <div
                    v-if="order.items.length > 3"
                    class="px-2 py-1 bg-zinc-900 rounded border border-zinc-800 text-[9px] font-bold text-zinc-400"
                  >
                    +{{ order.items.length - 3 }}
                  </div>
                </div>
              </div>
            </div>

            <div
              class="flex items-center justify-between md:justify-end gap-12 w-full md:w-auto mt-8 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-zinc-900"
            >
              <div class="text-left md:text-right">
                <p
                  class="text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-1"
                >
                  Jami Summa
                </p>
                <p class="text-2xl font-black tracking-tighter text-white">
                  ${{ order.totalPrice.toFixed(2) }}
                </p>
              </div>
              <div
                class="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white group-hover:border-green-500 transition-all transform group-hover:translate-x-2"
              >
                <i class="bi bi-arrow-right text-xl"></i>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import SkeletonLoader from "@/components/SkeletonLoader.vue";

export default {
  name: "UserDashboard",
  components: { SkeletonLoader },
  data() {
    return {
      orders: [],
      loading: true,
    };
  },
  mounted() {
    this.fetchOrders();
  },
  methods: {
    async fetchOrders() {
      try {
        const token = localStorage.getItem("userToken");
        const response = await axios.get("/api/orders/myorders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          this.orders = response.data.data;
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString("uz-UZ", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    statusBgColor(status) {
      switch (status) {
        case "Delivered":
          return "bg-green-500/20 text-green-500";
        case "Shipped":
          return "bg-blue-500/20 text-blue-500";
        case "Processing":
          return "bg-yellow-500/20 text-yellow-500";
        case "Pending":
          return "bg-purple-500/20 text-purple-500";
        default:
          return "bg-zinc-800 text-zinc-400";
      }
    },
  },
};
</script>

<style scoped>
.user-dashboard-page {
  background:
    radial-gradient(
      circle at top left,
      rgba(34, 197, 94, 0.03),
      transparent 600px
    ),
    radial-gradient(
      circle at bottom right,
      rgba(59, 130, 246, 0.03),
      transparent 600px
    );
}
</style>
