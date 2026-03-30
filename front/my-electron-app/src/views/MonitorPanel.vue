<template>
  <div class="min-h-screen bg-zinc-950 p-6 pt-20">
    <!-- Header -->
    <div class="max-w-7xl mx-auto mb-8">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-4xl font-black uppercase tracking-tighter">
            <span class="text-blue-500">Kuzatuv</span> Paneli
          </h1>
          <p class="text-zinc-500 mt-1">Faqat ma'lumotlarni ko'rish</p>
        </div>
        <div class="flex gap-4 items-center">
          <div class="premium-card px-4 py-2">
            <span class="text-sm font-bold text-green-500">READ-ONLY</span>
          </div>
          <button @click="logout" class="btn-secondary">Chiqish</button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div
      v-if="loading"
      class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
    >
      <div
        v-for="i in 3"
        :key="i"
        class="premium-card p-6 flex flex-col items-center gap-2"
      >
        <SkeletonLoader width="60px" height="36px" />
        <SkeletonLoader width="120px" height="14px" />
      </div>
    </div>
    <div
      v-else
      class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
    >
      <div class="premium-card p-6 text-center">
        <div class="text-3xl font-black text-blue-500 mb-2">
          {{ usersPagination.total }}
        </div>
        <div class="text-sm text-zinc-400 uppercase tracking-wider">
          Foydalanuvchilar
        </div>
      </div>
      <div class="premium-card p-6 text-center">
        <div class="text-3xl font-black text-green-500 mb-2">
          {{ ordersPagination.total }}
        </div>
        <div class="text-sm text-zinc-400 uppercase tracking-wider">
          Buyurtmalar
        </div>
      </div>
      <div class="premium-card p-6 text-center">
        <div class="text-3xl font-black text-purple-500 mb-2">
          {{ deliveryCode ? deliveryCode.code : "00-000" }}
        </div>
        <div class="text-sm text-zinc-400 uppercase tracking-wider">
          Yetkazish Kodi
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="max-w-7xl mx-auto mb-8">
      <div class="flex gap-4 border-b border-zinc-800">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-6 py-3 font-bold uppercase text-sm tracking-widest transition-all',
            activeTab === tab.id
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-zinc-500 hover:text-zinc-300',
          ]"
        >
          {{ tab.name }}
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-7xl mx-auto">
      <!-- Users Tab -->
      <div v-if="activeTab === 'users'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-black">Foydalanuvchilar Ro'yxati</h2>
          <div class="flex gap-2">
            <div class="premium-card px-4 py-2">
              <span class="text-xs text-zinc-400"
                >Jami: {{ usersPagination.total }}</span
              >
            </div>
            <button @click="fetchUsers" class="btn-primary">Yangilash</button>
          </div>
        </div>

        <div v-if="loading" class="premium-card p-6">
          <div class="space-y-4">
            <div
              v-for="i in 5"
              :key="i"
              class="flex justify-between items-center gap-4"
            >
              <SkeletonLoader width="40px" height="20px" />
              <SkeletonLoader width="150px" height="20px" />
              <SkeletonLoader width="200px" height="20px" />
              <SkeletonLoader width="100px" height="20px" borderRadius="12px" />
              <SkeletonLoader width="80px" height="20px" />
            </div>
          </div>
        </div>

        <div v-else class="premium-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full min-w-max">
              <thead class="bg-zinc-900">
                <tr>
                  <th
                    class="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-zinc-400"
                  >
                    ID
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-zinc-400"
                  >
                    Ism
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-zinc-400"
                  >
                    Email
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-zinc-400"
                  >
                    Rol
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-zinc-400"
                  >
                    Ro'yxatdan o'tgan
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-800">
                <tr
                  v-for="(user, index) in users"
                  :key="user.id"
                  class="hover:bg-zinc-900/50 animate-slide-up"
                  :style="{ animationDelay: index * 0.03 + 's' }"
                >
                  <td class="px-6 py-4 text-sm text-zinc-300">{{ user.id }}</td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div
                        class="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center"
                      >
                        <span class="text-xs font-bold">{{
                          getInitials(user.username)
                        }}</span>
                      </div>
                      <span class="font-medium">{{ user.username }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm text-zinc-400">
                    {{ user.email }}
                  </td>
                  <td class="px-6 py-4">
                    <span :class="getRoleBadge(user.role)">{{
                      getRoleName(user.role)
                    }}</span>
                  </td>
                  <td class="px-6 py-4 text-sm text-zinc-400">
                    {{ formatDate(user.createdAt) }}
                  </td>
                </tr>
                <tr v-if="users.length === 0">
                  <td colspan="5" class="px-6 py-12 text-center text-zinc-500">
                    <div class="flex flex-col items-center gap-2">
                      <div class="text-4xl">📭</div>
                      <p>Foydalanuvchilar topilmadi</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Pagination -->
          <div
            class="flex justify-between items-center px-6 py-4 border-t border-zinc-800"
          >
            <button
              @click="fetchUsers(usersPagination.page - 1)"
              :disabled="usersPagination.page === 1"
              class="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-bold"
            >
              Oldingi
            </button>
            <span class="text-zinc-400 text-xs uppercase tracking-widest">
              Sahifa {{ usersPagination.page }} /
              {{ usersPagination.totalPages }}
            </span>
            <button
              @click="fetchUsers(usersPagination.page + 1)"
              :disabled="usersPagination.page >= usersPagination.totalPages"
              class="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-bold"
            >
              Keyingi
            </button>
          </div>
        </div>
      </div>

      <!-- Orders Tab -->
      <div v-if="activeTab === 'orders'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-black">Buyurtmalar</h2>
          <div class="flex gap-2">
            <div class="premium-card px-4 py-2">
              <span class="text-xs text-zinc-400"
                >Jami: {{ ordersPagination.total }}</span
              >
            </div>
            <button @click="fetchOrders" class="btn-primary">Yangilash</button>
          </div>
        </div>

        <div
          v-if="loading"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div v-for="i in 3" :key="i" class="premium-card p-6 space-y-4">
            <div class="flex justify-between">
              <SkeletonLoader width="80px" height="24px" />
              <SkeletonLoader width="100px" height="20px" borderRadius="12px" />
            </div>
            <SkeletonLoader width="100%" height="20px" />
            <div class="flex items-center gap-3 pt-4 border-t border-zinc-800">
              <SkeletonLoader width="32px" height="32px" borderRadius="50%" />
              <SkeletonLoader width="120px" height="16px" />
            </div>
          </div>
        </div>

        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div
            v-for="(order, index) in orders"
            :key="order.id"
            class="premium-card p-6 animate-slide-up"
            :style="{ animationDelay: index * 0.05 + 's' }"
          >
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-xl font-black">#{{ order.id }}</h3>
                <p class="text-sm text-zinc-500 mt-1">
                  {{ formatDate(order.createdAt) }}
                </p>
              </div>
              <span :class="getStatusBadge(order.status)">{{
                getStatusName(order.status)
              }}</span>
            </div>

            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-zinc-500">Jami:</span>
                <span class="font-bold text-lg">${{ order.totalPrice }}</span>
              </div>

              <div class="pt-4 border-t border-zinc-800">
                <div class="text-sm text-zinc-500 mb-2">Foydalanuvchi:</div>
                <div class="flex items-center gap-2">
                  <div
                    class="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center"
                  >
                    <span class="text-xs">{{
                      getInitials(order.user?.username || "N/A")
                    }}</span>
                  </div>
                  <span class="text-sm">{{
                    order.user?.username || "Noma'lum"
                  }}</span>
                </div>
              </div>

              <div v-if="order.shippingAddress" class="text-sm">
                <div class="text-zinc-500 mb-1">Manzil:</div>
                <div class="text-zinc-300">{{ order.shippingAddress }}</div>
              </div>
            </div>
          </div>

          <div
            v-if="orders.length === 0"
            class="premium-card p-8 col-span-full text-center"
          >
            <div class="flex flex-col items-center gap-4">
              <div class="text-5xl">📦</div>
              <p class="text-zinc-500">Hozircha buyurtmalar yo'q</p>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex justify-between items-center mt-6 p-4 premium-card">
          <button
            @click="fetchOrders(ordersPagination.page - 1)"
            :disabled="ordersPagination.page === 1"
            class="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-bold"
          >
            Oldingi
          </button>
          <span class="text-zinc-400 text-xs uppercase tracking-widest">
            Sahifa {{ ordersPagination.page }} /
            {{ ordersPagination.totalPages }}
          </span>
          <button
            @click="fetchOrders(ordersPagination.page + 1)"
            :disabled="ordersPagination.page >= ordersPagination.totalPages"
            class="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-bold"
          >
            Keyingi
          </button>
        </div>
      </div>

      <!-- Delivery Code Tab -->
      <div v-if="activeTab === 'delivery'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-black">Yetkazish Kodi</h2>
          <button @click="fetchDeliveryCode" class="btn-primary">
            Yangilash
          </button>
        </div>

        <div v-if="loading" class="premium-card p-8 flex flex-col items-center">
          <SkeletonLoader
            width="120px"
            height="32px"
            borderRadius="16px"
            class="mb-6"
          />
          <SkeletonLoader width="300px" height="80px" class="mb-4" />
          <SkeletonLoader width="150px" height="20px" class="mb-8" />
          <div class="grid grid-cols-2 gap-4 w-full max-w-md">
            <SkeletonLoader width="100%" height="80px" borderRadius="16px" />
            <SkeletonLoader width="100%" height="80px" borderRadius="16px" />
          </div>
        </div>

        <div v-else class="premium-card p-8">
          <div v-if="deliveryCode" class="text-center">
            <div class="inline-block premium-card px-6 py-2 mb-6">
              <span class="text-sm font-bold text-zinc-400">Oylik Kod</span>
            </div>

            <div class="mb-8">
              <p
                class="text-7xl font-black text-green-500 tracking-widest mb-2"
              >
                {{ deliveryCode.code }}
              </p>
              <p class="text-zinc-500">Hozirgi faol kod</p>
            </div>

            <div class="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div class="premium-card p-4">
                <p class="text-zinc-500 text-xs uppercase mb-2">
                  Amal qilish muddati
                </p>
                <p class="font-bold text-lg">
                  {{ formatDate(deliveryCode.expiresAt) }}
                </p>
              </div>
              <div class="premium-card p-4">
                <p class="text-zinc-500 text-xs uppercase mb-2">Holati</p>
                <p
                  class="font-bold text-lg"
                  :class="
                    deliveryCode.isActive ? 'text-green-500' : 'text-red-500'
                  "
                >
                  {{ deliveryCode.isActive ? "Faol" : "Faol emas" }}
                </p>
              </div>
            </div>
          </div>
          <div v-else class="text-center">
            <div class="text-5xl mb-4">🔒</div>
            <p class="text-zinc-500">Yetkazish kodi yuklanmoqda...</p>
          </div>
        </div>
      </div>

      <!-- System Info Tab -->
      <div v-if="activeTab === 'system'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-black">Tizim Ma'lumotlari</h2>
          <button @click="refreshAll" class="btn-primary">
            Hammasini yangilash
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="premium-card p-6">
            <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
              <span>📊</span> Statistikalar
            </h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-zinc-500">Foydalanuvchilar:</span>
                <span class="font-bold">{{ users.length }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-zinc-500">Buyurtmalar:</span>
                <span class="font-bold">{{ orders.length }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-zinc-500">Faol buyurtmalar:</span>
                <span class="font-bold">{{ activeOrdersCount }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-zinc-500">Yetkazish kodi:</span>
                <span class="font-bold text-green-500">{{
                  deliveryCode ? deliveryCode.code : "N/A"
                }}</span>
              </div>
            </div>
          </div>

          <div class="premium-card p-6">
            <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
              <span>👤</span> Admin Ma'lumotlari
            </h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-zinc-500">Email:</span>
                <span class="font-bold">{{ adminUser?.email }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-zinc-500">Rol:</span>
                <span class="font-bold text-purple-500">Kuzatuvchi</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-zinc-500">Kirish vaqti:</span>
                <span class="font-bold">{{ loginTime }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import SkeletonLoader from "@/components/SkeletonLoader.vue";

export default {
  name: "MonitorPanel",
  components: { SkeletonLoader },
  data() {
    return {
      adminUser: null,
      activeTab: "users",
      tabs: [
        { id: "users", name: "Foydalanuvchilar" },
        { id: "orders", name: "Buyurtmalar" },
        { id: "delivery", name: "Yetkazish Kodi" },
        { id: "system", name: "Tizim Ma'lumotlari" },
      ],
      users: [],
      orders: [],
      deliveryCode: null,
      loginTime: new Date().toLocaleString(),
      loading: true,
      usersPagination: {
        page: 1,
        limit: 10,
        totalPages: 1,
        total: 0,
      },
      ordersPagination: {
        page: 1,
        limit: 10,
        totalPages: 1,
        total: 0,
      },
    };
  },
  computed: {
    activeOrdersCount() {
      return this.orders.filter(
        (order) => order.status !== "Delivered" && order.status !== "Cancelled",
      ).length;
    },
  },
  mounted() {
    this.checkAuth();
    const adminUserStr = localStorage.getItem("adminUser");
    if (adminUserStr) {
      try {
        this.adminUser = JSON.parse(adminUserStr);
      } catch (e) {
        console.error("Failed to parse admin user", e);
      }
    }
    this.loadAllData();
  },
  methods: {
    checkAuth() {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        this.$router.push("/login");
      }
    },

    async loadAllData() {
      this.loading = true;
      try {
        await Promise.all([
          this.fetchUsers(),
          this.fetchOrders(),
          this.fetchDeliveryCode(),
        ]);
      } finally {
        this.loading = false;
      }
    },

    async fetchUsers(page = 1) {
      try {
        this.loading = true;
        const token = localStorage.getItem("adminToken");
        const response = await axios.get("/api/admin/users", {
          params: { page, limit: this.usersPagination.limit },
          headers: { Authorization: `Bearer ${token}` },
        });
        const { data, page: currentPage, pages, total } = response.data;
        this.users = data || [];
        this.usersPagination.page = currentPage;
        this.usersPagination.totalPages = pages;
        this.usersPagination.total = total;
      } catch (err) {
        console.error("Foydalanuvchilarni yuklashda xato:", err);
      } finally {
        this.loading = false;
      }
    },

    async fetchOrders(page = 1) {
      try {
        this.loading = true;
        const token = localStorage.getItem("adminToken");
        const response = await axios.get("/api/admin/orders", {
          params: { page, limit: this.ordersPagination.limit },
          headers: { Authorization: `Bearer ${token}` },
        });
        const { data, page: currentPage, pages, total } = response.data;
        this.orders = data || [];
        this.ordersPagination.page = currentPage;
        this.ordersPagination.totalPages = pages;
        this.ordersPagination.total = total;
      } catch (err) {
        console.error("Buyurtmalarni yuklashda xato:", err);
      } finally {
        this.loading = false;
      }
    },

    async fetchDeliveryCode() {
      try {
        const token = localStorage.getItem("adminToken");
        const response = await axios.get("/api/admin/delivery-code", {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.deliveryCode = response.data.data;
      } catch (err) {
        console.error("Yetkazish kodini yuklashda xato:", err);
      }
    },

    refreshAll() {
      this.loadAllData();
    },

    logout() {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      this.$router.push("/login");
    },

    formatDate(date) {
      if (!date) return "N/A";
      return new Date(date).toLocaleDateString("uz-UZ");
    },

    getInitials(name) {
      if (!name) return "?";
      return name.charAt(0).toUpperCase();
    },

    getRoleBadge(role) {
      const badges = {
        administrator:
          "px-3 py-1 bg-purple-500/20 text-purple-500 rounded-lg text-xs font-bold",
        admin:
          "px-3 py-1 bg-purple-500/20 text-purple-500 rounded-lg text-xs font-bold",
        shop_owner:
          "px-3 py-1 bg-blue-500/20 text-blue-500 rounded-lg text-xs font-bold",
        shop_worker:
          "px-3 py-1 bg-green-500/20 text-green-500 rounded-lg text-xs font-bold",
        delivery:
          "px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-lg text-xs font-bold",
        "extra-user":
          "px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-xs font-bold",
        user: "px-3 py-1 bg-zinc-500/20 text-zinc-500 rounded-lg text-xs font-bold",
      };
      return badges[role] || badges.user;
    },

    getRoleName(role) {
      const names = {
        administrator: "Administrator",
        admin: "Admin",
        shop_owner: "Do'kon egasi",
        shop_worker: "Do'kon xodimi",
        delivery: "Yetkazib beruvchi",
        user: "Foydalanuvchi",
      };
      return names[role] || role;
    },

    getStatusBadge(status) {
      const badges = {
        Pending:
          "px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-lg text-xs font-bold",
        Processing:
          "px-3 py-1 bg-blue-500/20 text-blue-500 rounded-lg text-xs font-bold",
        "On the way":
          "px-3 py-1 bg-purple-500/20 text-purple-500 rounded-lg text-xs font-bold",
        Delivered:
          "px-3 py-1 bg-green-500/20 text-green-500 rounded-lg text-xs font-bold",
        Cancelled:
          "px-3 py-1 bg-red-500/20 text-red-500 rounded-lg text-xs font-bold",
      };
      return badges[status] || badges.Pending;
    },

    getStatusName(status) {
      const names = {
        Pending: "Kutilyapti",
        Processing: "Tayyorlanmoqda",
        "On the way": "Yo'lda",
        Delivered: "Yetkazilgan",
        Cancelled: "Bekor qilingan",
      };
      return names[status] || status;
    },
  },
};
</script>

<style scoped>
.premium-card {
  background: rgba(15, 15, 15, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(59, 130, 246, 0.3);
}

.btn-secondary {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(107, 114, 128, 0.3);
}
</style>
