<template>
  <div
    class="seller-sales pt-20 min-h-screen bg-zinc-950 text-white p-6 md:p-12"
  >
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6"
      >
        <div>
          <h1
            class="text-4xl font-black text-green-500 tracking-tighter uppercase"
          >
            Sotuvlar Paneli
          </h1>
          <p class="text-zinc-500 text-sm">
            Mahsulotlaringiz sotilish ko'rsatkichlari va tahlili
          </p>
        </div>
        <div class="flex gap-4">
          <router-link
            to="/owner-dashboard"
            class="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all border border-zinc-800 flex items-center gap-2"
          >
            <i class="bi bi-speedometer2"></i>
            Dashbord
          </router-link>
          <button
            @click="fetchStats"
            class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all shadow-lg shadow-green-500/20 flex items-center gap-2"
          >
            <i
              class="bi bi-arrow-clockwise"
              :class="{ 'animate-spin': loading }"
            ></i>
            Yangilash
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading && products.length === 0"
        class="flex justify-center py-32"
      >
        <div
          class="animate-spin rounded-full h-16 w-16 border-t-2 border-green-500"
        ></div>
      </div>

      <div v-else class="space-y-8">
        <!-- Seller Info Card -->
        <div
          class="premium-card p-8 flex flex-col md:flex-row items-center justify-between gap-8 border-green-500/10 bg-gradient-to-br from-zinc-900 to-zinc-950"
        >
          <div class="flex items-center gap-8">
            <div
              class="w-24 h-24 bg-green-500 rounded-3xl flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-green-500/20"
            >
              {{ seller?.username?.charAt(0).toUpperCase() || "S" }}
            </div>
            <div>
              <div class="flex items-center gap-3 mb-1">
                <h2 class="text-3xl font-black uppercase tracking-tight">
                  {{ seller?.username || "Sotuvchi" }}
                </h2>
                <span
                  class="px-2 py-0.5 bg-green-500 text-black text-[9px] font-black uppercase rounded"
                  >Active</span
                >
              </div>
              <p
                class="text-zinc-500 font-bold uppercase text-[10px] tracking-widest"
              >
                ID: #USR-{{ seller?.id }} |
                {{ seller?.role?.replace("_", " ") }}
              </p>
            </div>
          </div>
          <div
            class="text-center md:text-right px-8 py-4 bg-zinc-950/50 rounded-2xl border border-zinc-800"
          >
            <p
              class="text-zinc-500 text-[10px] uppercase font-black tracking-[0.2em] mb-1"
            >
              Hamkorlik boshlangan
            </p>
            <p class="text-white font-black font-mono">
              {{ formatDate(seller?.createdAt) }}
            </p>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="premium-card p-8 group overflow-hidden relative">
            <div class="relative z-10">
              <div
                class="w-12 h-12 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-500 group-hover:text-white transition-all"
              >
                <i class="bi bi-currency-dollar text-2xl"></i>
              </div>
              <p
                class="text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-1"
              >
                Umumiy Tushum
              </p>
              <p class="text-4xl font-black tracking-tighter">
                ${{ totalRevenue.toFixed(2) }}
              </p>
            </div>
            <div
              class="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity"
            >
              <i class="bi bi-currency-dollar text-9xl"></i>
            </div>
          </div>

          <div class="premium-card p-8 group overflow-hidden relative">
            <div class="relative z-10">
              <div
                class="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition-all"
              >
                <i class="bi bi-cart-check text-2xl"></i>
              </div>
              <p
                class="text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-1"
              >
                Sotilganlar
              </p>
              <p class="text-4xl font-black tracking-tighter">
                {{ totalItemsSold }}
                <span class="text-sm text-zinc-600 font-medium">ta</span>
              </p>
            </div>
            <div
              class="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity"
            >
              <i class="bi bi-cart-check text-9xl"></i>
            </div>
          </div>

          <div class="premium-card p-8 group overflow-hidden relative">
            <div class="relative z-10">
              <div
                class="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-500 group-hover:text-white transition-all"
              >
                <i class="bi bi-box-seam text-2xl"></i>
              </div>
              <p
                class="text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-1"
              >
                Mahsulotlar
              </p>
              <p class="text-4xl font-black tracking-tighter">
                {{ products.length }}
                <span class="text-sm text-zinc-600 font-medium">ta</span>
              </p>
            </div>
            <div
              class="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity"
            >
              <i class="bi bi-box-seam text-9xl"></i>
            </div>
          </div>
        </div>

        <!-- Products Table -->
        <div class="premium-card overflow-hidden">
          <div
            class="p-8 border-b border-zinc-800 flex flex-wrap justify-between items-center gap-4"
          >
            <h2 class="text-2xl font-black uppercase tracking-tight">
              Mahsulotlar Ro'yxati
            </h2>
            <div
              class="px-4 py-2 bg-zinc-950 rounded-xl border border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-500"
            >
              Jami: {{ products.length }} ta
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr
                  class="bg-zinc-950/50 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-zinc-800"
                >
                  <th class="px-8 py-6">Mahsulot</th>
                  <th class="px-8 py-6 text-center">Narx</th>
                  <th class="px-8 py-6 text-center text-green-500">Sotilgan</th>
                  <th class="px-8 py-6 text-center">Tushum</th>
                  <th class="px-8 py-6 text-center">Zaxira</th>
                  <th class="px-8 py-6 text-right">Amal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-800/50">
                <tr
                  v-for="product in products"
                  :key="product.id"
                  class="hover:bg-zinc-900/50 transition-colors group"
                >
                  <td class="px-8 py-6">
                    <div class="flex items-center gap-4">
                      <div
                        class="w-12 h-12 rounded-xl overflow-hidden border border-zinc-800 relative group-hover:border-green-500/50 transition-colors"
                      >
                        <img
                          :src="getProductImage(product.image)"
                          class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div
                          v-if="product.stock <= 0"
                          class="absolute inset-0 bg-red-500/60 flex items-center justify-center"
                        >
                          <i class="bi bi-x-circle text-white"></i>
                        </div>
                      </div>
                      <div>
                        <p
                          class="font-black text-white group-hover:text-green-500 transition-colors"
                        >
                          {{ product.name }}
                        </p>
                        <p
                          class="text-[9px] text-zinc-600 font-black uppercase tracking-widest"
                        >
                          {{ product.category || "General" }}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td class="px-8 py-6 text-center">
                    <span class="font-bold text-zinc-300"
                      >${{ product.price }}</span
                    >
                  </td>
                  <td class="px-8 py-6 text-center">
                    <div
                      class="inline-flex flex-col items-center px-4 py-1 bg-green-500/5 rounded-xl border border-green-500/10"
                    >
                      <span class="text-xl font-black text-green-500">{{
                        product.soldCount
                      }}</span>
                    </div>
                  </td>
                  <td class="px-8 py-6 text-center">
                    <p class="font-black text-white">
                      ${{ (product.soldCount * product.price).toFixed(2) }}
                    </p>
                  </td>
                  <td class="px-8 py-6 text-center">
                    <span
                      :class="
                        product.stock < 5
                          ? 'text-red-500 bg-red-500/10'
                          : 'text-zinc-500 bg-zinc-950'
                      "
                      class="px-3 py-1 rounded-lg text-[10px] font-black border border-zinc-800"
                    >
                      {{ product.stock }} TA
                    </span>
                  </td>
                  <td class="px-8 py-6 text-right">
                    <router-link
                      :to="'/food/' + product.id"
                      class="w-10 h-10 bg-zinc-950 border border-zinc-800 rounded-xl inline-flex items-center justify-center hover:bg-green-500 hover:text-white hover:border-green-500 transition-all"
                    >
                      <i class="bi bi-eye text-lg"></i>
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>

            <div
              v-if="products.length === 0"
              class="py-32 text-center text-zinc-600"
            >
              <i class="bi bi-inbox text-6xl mb-6 block opacity-20"></i>
              <p class="text-xl font-black uppercase tracking-tight">
                Hozircha sotuvlar yo'q
              </p>
              <p class="text-sm mt-2">
                Mahsulotlaringiz sotila boshlaganda bu yerda ko'rinadi.
              </p>
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
  name: "SellerSales",
  data() {
    return {
      products: [],
      seller: null,
      loading: true,
      error: null,
    };
  },
  computed: {
    totalRevenue() {
      return this.products.reduce((acc, p) => acc + p.soldCount * p.price, 0);
    },
    totalItemsSold() {
      return this.products.reduce((acc, p) => acc + p.soldCount, 0);
    },
  },
  mounted() {
    this.loadSeller();
    this.fetchStats();
  },
  methods: {
    loadSeller() {
      const user = localStorage.getItem("user");
      if (user) {
        this.seller = JSON.parse(user);
      }
    },
    formatDate(dateString) {
      if (!dateString) return "Ma'lumot yo'q";
      return new Date(dateString).toLocaleDateString("uz-UZ", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
    async fetchStats() {
      this.loading = true;
      this.error = null;
      try {
        const token = localStorage.getItem("userToken");
        if (!token) {
          this.$router.push("/login");
          return;
        }

        const response = await axios.get("/api/products/seller/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          this.products = response.data.data;
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
        this.error = "Ma'lumotlarni yuklashda xatolik yuz berdi";
        if (err.response?.status === 401 || err.response?.status === 403) {
          toast.warning("Ruxsat berilmagan! Iltimos qayta kiring.");
          this.$router.push("/login");
        }
      } finally {
        this.loading = false;
      }
    },
    getProductImage,
  },
};
</script>

<style scoped>
.font-black {
  font-weight: 900;
}
</style>
