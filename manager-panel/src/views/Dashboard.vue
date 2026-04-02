<template>
  <div class="min-h-screen bg-zinc-950 p-4 sm:p-6">
    <!-- Header -->
    <div class="max-w-7xl mx-auto mb-8">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1
            class="text-4xl font-black uppercase tracking-tighter text-blue-500"
          >
            Manager <span class="text-yellow-500">Panel</span>
          </h1>
          <p class="text-zinc-500 mt-1">
            Welcome,
            {{ managerUser?.username || managerUser?.email || "Manager" }}
          </p>
        </div>
        <div class="flex gap-4 flex-wrap">
          <router-link
            to="/extra-panel"
            class="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-xs rounded-lg transition-all"
          >
            🎚️ Resources
          </router-link>
          <button @click="logout" class="btn-danger">Logout</button>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="max-w-7xl mx-auto mb-6 flex gap-4 overflow-x-auto scrollbar-hide pb-2">
      <button
        @click="activeTab = 'users'"
        :class="[
          'px-6 py-3 rounded-xl font-bold uppercase tracking-wide transition-all whitespace-nowrap',
          activeTab === 'users'
            ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
            : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800',
        ]"
      >
        Users
      </button>
      <button
        @click="activeTab = 'orders'"
        :class="[
          'px-6 py-3 rounded-xl font-bold uppercase tracking-wide transition-all whitespace-nowrap',
          activeTab === 'orders'
            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
            : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800',
        ]"
      >
        Orders
      </button>
    </div>

    <!-- Content -->
    <div class="max-w-8xl mx-auto">
      <!-- USERS TAB -->
      <div v-if="activeTab === 'users'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-black text-white">User Information</h2>
          <button @click="fetchUsers" class="btn-primary" :disabled="loading">
            {{ loading ? "Loading..." : "Refresh Users" }}
          </button>
        </div>

        <div
          v-if="loading && !users.length"
          class="premium-card p-8 text-center"
        >
          <div
            class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"
          ></div>
        </div>

        <div v-else class="premium-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full bg-zinc-800">
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
                    User
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-zinc-400"
                  >
                    Role
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-zinc-400"
                  >
                    Codes
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-zinc-400"
                  >
                    Delivery
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-zinc-400"
                  >
                    Status
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-zinc-400"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-800">
                <tr
                  v-for="user in users"
                  :key="user.id"
                  class="hover:bg-zinc-900/50 transition-colors"
                >
                  <td class="px-6 py-4 text-sm text-zinc-500">#{{ user.id }}</td>
                  <td class="px-6 py-4">
                    <div class="text-sm font-bold text-white">
                      {{ user.username }}
                    </div>
                    <div class="text-xs text-zinc-500">{{ user.email }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <span :class="getRoleBadge(user.role)">{{ user.role }}</span>
                  </td>
                  <td class="px-6 py-4 space-y-1">
                    <div class="text-xs font-mono text-zinc-400">
                      Legacy:
                      <span class="text-white">{{ user.legacyCode || "-" }}</span>
                    </div>
                    <div class="text-xs font-mono text-zinc-400">
                      Unique:
                      <span class="text-white">{{ user.uniqueCode || "-" }}</span>
                    </div>
                    <div class="text-xs font-mono text-zinc-400">
                      Extra:
                      <span class="text-white">{{ user.extraCode || "-" }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-xs font-mono text-zinc-400">
                      Code:
                      <span class="text-yellow-500">{{
                        user.deliveryCode || "-"
                      }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span
                      class="px-3 py-1 rounded-lg text-xs font-bold uppercase whitespace-nowrap"
                      :class="user.isPaused ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'"
                    >
                      {{ user.isPaused ? "Paused" : "Active" }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <button
                      v-if="['shop_worker', 'shop_owner', 'delivery'].includes(user.role)"
                      @click="toggleUserPause(user)"
                      class="p-2 rounded-lg transition-all flex items-center justify-center transform hover:scale-110"
                      :class="user.isPaused ? 'text-green-500 hover:bg-green-500/20' : 'text-yellow-500 hover:bg-yellow-500/20'"
                      :title="user.isPaused ? 'Unpause User' : 'Pause User'"
                    >
                      <svg v-if="user.isPaused" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                        <path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" />
                      </svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                        <path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clip-rule="evenodd" />
                      </svg>
                    </button>
                    <span
                      v-else
                      class="text-xs text-zinc-600 italic"
                    >
                      N/A
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ORDERS TAB -->
      <div v-if="activeTab === 'orders'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-black text-white">Order Management</h2>
          <button @click="fetchOrders" class="btn-primary" :disabled="loading">
            {{ loading ? "Loading..." : "Refresh Orders" }}
          </button>
        </div>

        <div
          v-if="loading && !orders.length"
          class="premium-card p-8 text-center"
        >
          <div
            class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
          ></div>
        </div>

        <div v-else class="premium-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full bg-zinc-800">
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
                    Details
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-zinc-400"
                  >
                    Customer
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-zinc-400"
                  >
                    Total
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-zinc-400"
                  >
                    Status
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-zinc-400"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-800">
                <tr
                  v-for="order in orders"
                  :key="order.id"
                  class="hover:bg-zinc-900/50 transition-colors"
                >
                  <td class="px-6 py-4 text-sm text-zinc-500">#{{ order.id }}</td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-zinc-300">
                      {{ order.items?.length || 0 }} items
                    </div>
                    <div class="text-xs text-zinc-500">
                      {{ formatDate(order.createdAt) }}
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm font-bold text-white">
                      {{ order.user?.username || "Guest" }}
                    </div>
                    <div class="text-xs text-zinc-500">
                      {{ order.address || "No address" }}
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm font-mono text-green-500">
                    ${{ order.totalPrice?.toFixed(2) }}
                  </td>
                  <td class="px-6 py-4">
                    <span :class="getStatusBadge(order.orderStatus)">{{
                      order.orderStatus
                    }}</span>
                    <div v-if="order.delivery" class="text-xs text-zinc-500 mt-1">
                      Driver: {{ getDriverName(order.delivery.driverId) }}
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <button
                      v-if="
                        ['Pending', 'Processing'].includes(order.orderStatus) &&
                        !order.deliveryId
                      "
                      @click="openAssignModal(order)"
                      class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase rounded shadow-lg transition-all"
                    >
                      Assign Driver
                    </button>
                    <span v-else class="text-xs text-zinc-600 italic"
                      >No actions</span
                    >
                  </td>
                </tr>
                <tr v-if="orders.length === 0">
                  <td colspan="6" class="px-6 py-8 text-center text-zinc-500">
                    No orders found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- ASSIGN DRIVER MODAL -->
    <div
      v-if="showAssignModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div class="premium-card max-w-md w-full p-6 animate-scale-in">
        <h3 class="text-xl font-bold text-white mb-4">Assign Driver</h3>
        <p class="text-zinc-400 mb-6">
          Select a driver for Order #{{ selectedOrder?.id }}
        </p>

        <div class="space-y-4 mb-6">
          <label
            class="block text-xs font-bold uppercase text-zinc-500 tracking-widest"
            >Available Drivers</label
          >
          <select
            v-model="selectedDriverId"
            class="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
          >
            <option :value="null" disabled>Select user...</option>
            <option
              v-for="driver in availableDrivers"
              :key="driver.id"
              :value="driver.id"
            >
              {{ driver.username }} ({{ driver.role }}) - {{ driver.email }}
            </option>
          </select>
          <div
            v-if="availableDrivers.length === 0"
            class="text-red-500 text-sm"
          >
            No drivers found. Ensure users have "delivery" role or permission.
          </div>
        </div>

        <div class="flex gap-3 justify-end">
          <button
            @click="closeAssignModal"
            class="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            @click="assignDriver"
            :disabled="!selectedDriverId || assigning"
            class="btn-primary"
          >
            {{ assigning ? "Assigning..." : "Confirm Assignment" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Dashboard",
  data() {
    return {
      managerUser: null,
      loading: false,
      activeTab: "users", // 'users' | 'orders'

      // Data
      users: [],
      orders: [],

      // Modal
      showAssignModal: false,
      selectedOrder: null,
      selectedDriverId: null,
      assigning: false,
    };
  },
  computed: {
    availableDrivers() {
      // Filter users who are delivery role OR have isDelivery flag
      return this.users.filter((u) => u.role === "delivery" || u.isDelivery);
    },
  },
  mounted() {
    this.managerUser = JSON.parse(localStorage.getItem("user"));

    if (!this.managerUser || this.managerUser.role !== "manager") {
      this.$router.push("/login");
      return;
    }

    this.fetchUsers(); // Always fetch users first to get drivers
    this.fetchOrders();
  },
  methods: {
    getAuthHeaders() {
      const token = localStorage.getItem("token");
      return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
    },

    async fetchUsers() {
      this.loading = true;
      try {
        const response = await axios.get("/api/admin/users", {
          headers: this.getAuthHeaders(),
        });
        this.users = response.data.data || response.data || [];
      } catch (err) {
        console.error("Failed to fetch users:", err);
        if (err.response?.status === 401) this.logout();
      } finally {
        this.loading = false;
      }
    },

    async fetchOrders() {
      // Don't set loading true if switching tabs to avoid flicker if clean
      try {
        const response = await axios.get("/api/orders/admin", {
          headers: this.getAuthHeaders(),
        });
        this.orders = response.data.data || response.data || [];
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      }
    },

    getDriverName(driverId) {
      const driver = this.users.find((u) => u.id === driverId);
      return driver ? driver.username : `ID: ${driverId}`;
    },

    openAssignModal(order) {
      this.selectedOrder = order;
      this.selectedDriverId = null;
      this.showAssignModal = true;
    },

    closeAssignModal() {
      this.showAssignModal = false;
      this.selectedOrder = null;
      this.selectedDriverId = null;
    },

    async assignDriver() {
      if (!this.selectedOrder || !this.selectedDriverId) return;

      this.assigning = true;
      try {
        await axios.post(
          `/api/delivery/assign/${this.selectedOrder.id}`,
          { driverId: this.selectedDriverId },
          { headers: this.getAuthHeaders() },
        );

        // Refresh orders
        await this.fetchOrders();
        this.closeAssignModal();
        alert("Driver assigned successfully!");
      } catch (err) {
        console.error("Assignment failed:", err);
        alert(err.response?.data?.message || "Failed to assign driver");
      } finally {
        this.assigning = false;
      }
    },

    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.$router.push("/login");
    },

    async toggleUserPause(user) {
      try {
        const response = await axios.patch(`/api/admin/users/${user.id}/pause`, {}, {
          headers: this.getAuthHeaders(),
        });
        // Update locally
        user.isPaused = !user.isPaused;
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message;
        console.error("Toggle user pause error:", err);
        alert(`Failed to ${user.isPaused ? 'unpause' : 'pause'} user: ` + errorMsg);
      }
    },

    getRoleBadge(role) {
      const badges = {
        administrator:
          "px-2 py-0.5 bg-purple-500/20 text-purple-500 rounded text-xs font-bold uppercase",
        shop_owner:
          "px-2 py-0.5 bg-blue-500/20 text-blue-500 rounded text-xs font-bold uppercase",
        shop_worker:
          "px-2 py-0.5 bg-green-500/20 text-green-500 rounded text-xs font-bold uppercase",
        delivery:
          "px-2 py-0.5 bg-orange-500/20 text-orange-500 rounded text-xs font-bold uppercase",
        manager:
          "px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded text-xs font-bold uppercase",
        "extra-user":
          "px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-xs font-bold uppercase",
        user: "px-2 py-0.5 bg-zinc-500/20 text-zinc-500 rounded text-xs font-bold uppercase",
      };
      return badges[role] || badges.user;
    },

    getStatusBadge(status) {
      const badges = {
        Pending: "text-zinc-400 bg-zinc-800",
        Processing: "text-blue-400 bg-blue-900/30",
        "On the way": "text-yellow-400 bg-yellow-900/30",
        Delivered: "text-green-400 bg-green-900/30",
        Cancelled: "text-red-400 bg-red-900/30",
      };
      const baseClass = "px-2 py-1 rounded text-xs font-bold uppercase";
      const badgeClass = badges[status] || "text-gray-400 bg-gray-800";
      return `${baseClass} ${badgeClass}`;
    },

    formatDate(dateString) {
      if (!dateString) return "-";
      return new Date(dateString).toLocaleString();
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
  background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
  color: black;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(234, 179, 8, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(239, 68, 68, 0.3);
}

.animate-scale-in {
  animation: scaleIn 0.2s ease-out;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
