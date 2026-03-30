<template>
  <div class="min-h-screen bg-zinc-950 p-4 sm:p-6">
    <!-- Header -->
    <div class="max-w-7xl mx-auto mb-8">
      <div
        class="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left"
      >
        <div>
          <h1
            class="text-2xl md:text-4xl font-black uppercase tracking-tighter"
          >
            Admin <span class="text-blue-500">Control Panel</span>
          </h1>
          <p class="text-zinc-500 mt-1">
            Welcome, {{ adminUser?.username || adminUser?.email || "Admin" }}
          </p>
        </div>
        <div class="flex gap-4 items-center flex-wrap justify-center">
          <!-- Auto Logging Toggle -->
          <label
            class="flex items-center gap-3 premium-card px-4 py-2 cursor-pointer"
          >
            <span class="text-sm font-bold text-zinc-400">AUTO LOG</span>
            <input
              type="checkbox"
              v-model="autoLogging"
              @change="toggleAutoLogging"
              class="w-5 h-5 accent-blue-500"
            />
          </label>
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

    <!-- Tabs -->
    <div class="max-w-7xl mx-auto mb-8">
      <div
        class="flex gap-4 border-b border-zinc-800 overflow-x-auto pb-2 scrollbar-hide"
      >
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-6 py-3 font-bold uppercase text-sm tracking-widest transition-all whitespace-nowrap',
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
    <div class="max-w-8xl mx-auto">
      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'" class="space-y-6">
        <h2 class="text-2xl font-black">System Overview</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="premium-card p-6">
            <p
              class="text-zinc-500 uppercase tracking-widest text-xs font-bold"
            >
              Total Users
            </p>
            <p class="text-4xl font-black text-blue-500 mt-2">
              {{ users.length }}
            </p>
          </div>
          <div class="premium-card p-6">
            <p
              class="text-zinc-500 uppercase tracking-widest text-xs font-bold"
            >
              Total Orders
            </p>
            <p class="text-4xl font-black text-green-500 mt-2">
              {{ orders.length }}
            </p>
          </div>
          <div class="premium-card p-6">
            <p
              class="text-zinc-500 uppercase tracking-widest text-xs font-bold"
            >
              Total Revenue (Est.)
            </p>
            <p class="text-4xl font-black text-yellow-500 mt-2">
              ${{
                orders
                  .reduce((sum, o) => sum + (o.totalPrice || o.total || 0), 0)
                  .toFixed(2)
              }}
            </p>
          </div>
        </div>
        <div class="premium-card p-6 text-center">
          <p class="text-zinc-500 mb-4">Quick Actions</p>
          <div class="flex gap-4 justify-center">
            <button
              @click="
                fetchUsers();
                fetchOrders();
              "
              class="btn-primary"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      <!-- Users Tab -->
      <div v-if="activeTab === 'users'" class="space-y-6">
        <div
          class="flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <h2 class="text-2xl font-black">User Management</h2>
          <div class="flex gap-2">
            <button @click="fetchUsers" class="btn-primary" :disabled="loading">
              {{ loading ? "Loading..." : "Refresh" }}
            </button>
            <button @click="testBackendConnection" class="btn-secondary">
              Test Connection
            </button>
          </div>
        </div>

        <!-- Connection Status -->
        <div
          v-if="connectionStatus"
          class="premium-card p-4"
          :class="
            connectionStatus.type === 'success'
              ? 'bg-green-900/20'
              : 'bg-red-900/20'
          "
        >
          <p
            :class="
              connectionStatus.type === 'success'
                ? 'text-green-400'
                : 'text-red-400'
            "
          >
            {{ connectionStatus.message }}
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="premium-card p-8 text-center">
          <div
            class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
          ></div>
          <p class="text-zinc-400 mt-4">Loading users...</p>
        </div>

        <!-- Users Table -->
        <div v-else class="premium-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
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
                    Username
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-zinc-400"
                  >
                    Email
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-zinc-400"
                  >
                    Role
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-zinc-400"
                  >
                    Status
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-zinc-400"
                  >
                    Unique Code
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-zinc-400"
                  >
                    Legacy Code
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-zinc-400"
                  >
                    Manager Code
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-zinc-400"
                  >
                    Delivery Code
                  </th>
                  <th
                    v-if="adminUser?.role !== 'manager'"
                    class="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-zinc-400"
                  >
                    Created
                  </th>
                  <th
                    v-if="adminUser?.role === 'administrator'"
                    class="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-zinc-400"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-800">
                <tr
                  v-for="user in users"
                  :key="user.id"
                  class="hover:bg-zinc-900/50"
                >
                  <td class="px-6 py-4 text-sm">{{ user.id }}</td>
                  <td class="px-6 py-4 text-sm font-bold">
                    {{ user.username || "N/A" }}
                  </td>
                  <td class="px-6 py-4 text-sm text-zinc-400">
                    {{ user.email || "N/A" }}
                  </td>
                  <td class="px-6 py-4">
                    <span :class="getRoleBadge(user.role)">{{
                      user.role || "user"
                    }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <span
                      class="px-3 py-1 rounded-lg text-xs font-bold uppercase whitespace-nowrap"
                      :class="user.isPaused ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'"
                    >
                      {{ user.isPaused ? "Paused" : "Active" }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-zinc-400">
                    {{ user.uniqueCode || "N/A" }}
                  </td>
                  <td class="px-6 py-4 text-sm text-zinc-400">
                    {{ user.legacyCode || "N/A" }}
                  </td>
                  <td class="px-6 py-4 text-sm text-zinc-400 font-mono">
                    {{ user.managerCode || "N/A" }}
                  </td>
                  <td class="px-6 py-4 text-sm text-zinc-400 font-mono">
                    {{ user.deliveryCode || "N/A" }}
                  </td>
                  <td
                    v-if="adminUser?.role !== 'manager'"
                    class="px-6 py-4 text-sm text-zinc-400"
                  >
                    {{ formatDate(user.createdAt) }}
                  </td>
                  <td
                    v-if="adminUser?.role === 'administrator'"
                    class="px-6 py-4 flex items-center gap-3"
                  >
                    <button
                      @click="toggleUserPause(user)"
                      class="p-2 rounded-lg transition-all flex items-center justify-center transform hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-transparent"
                      :class="user.isPaused ? 'text-green-500 hover:bg-green-500/20' : 'text-yellow-500 hover:bg-yellow-500/20'"
                      :disabled="user.role === 'administrator'"
                      :title="user.isPaused ? 'Unpause User' : 'Pause User'"
                    >
                      <svg v-if="user.isPaused" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                        <path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" />
                      </svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                        <path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clip-rule="evenodd" />
                      </svg>
                    </button>
                    <button
                      @click="deleteUser(user.id)"
                      class="text-red-500 hover:text-red-400 text-sm font-bold"
                      :disabled="user.role === 'administrator'"
                    >
                      {{
                        user.role === "administrator" ? "Protected" : "Delete"
                      }}
                    </button>
                  </td>
                </tr>
                <tr v-if="users.length === 0">
                  <td
                    :colspan="adminUser?.role === 'manager' ? 8 : 10"
                    class="px-6 py-8 text-center text-zinc-500"
                  >
                    No users found. Make sure backend is running on port 5000.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Orders Tab -->
      <div v-if="activeTab === 'orders'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-black">Order Management</h2>
          <button @click="fetchOrders" class="btn-primary" :disabled="loading">
            {{ loading ? "Loading..." : "Refresh" }}
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="premium-card p-8 text-center">
          <div
            class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
          ></div>
          <p class="text-zinc-400 mt-4">Loading orders...</p>
        </div>

        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div v-for="order in orders" :key="order.id" class="premium-card p-6">
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-xl font-black">#ORD-{{ order.id }}</h3>
              <span
                :class="getStatusBadge(order.status || order.orderStatus)"
                >{{ order.status || order.orderStatus || "Pending" }}</span
              >
            </div>
            <div class="space-y-2 text-sm">
              <p>
                <span class="text-zinc-500">User:</span>
                {{ order.user?.username || order.userId || "Unknown" }}
              </p>
              <p>
                <span class="text-zinc-500">Total:</span> ${{
                  order.totalPrice || order.total || 0
                }}
              </p>
              <p>
                <span class="text-zinc-500">Address:</span>
                {{ order.shippingAddress || order.address || "No address" }}
              </p>
              <p>
                <span class="text-zinc-500">Created:</span>
                {{ formatDate(order.createdAt) }}
              </p>
            </div>
          </div>
          <div
            v-if="orders.length === 0"
            class="premium-card p-8 col-span-full text-center"
          >
            <p class="text-zinc-500">
              No orders found. Make sure backend is running.
            </p>
          </div>
        </div>
      </div>

      <!-- Delivery Code Tab -->
      <div v-if="activeTab === 'delivery'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-black">Delivery Code Management</h2>
          <button
            @click="fetchDeliveryCode"
            class="btn-primary"
            :disabled="loading"
          >
            {{ loading ? "Loading..." : "Refresh" }}
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="premium-card p-8 text-center">
          <div
            class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
          ></div>
          <p class="text-zinc-400 mt-4">Loading delivery code...</p>
        </div>

        <div v-else class="premium-card p-8">
          <div v-if="deliveryCode" class="text-center">
            <p class="text-zinc-500 text-sm uppercase tracking-widest mb-4">
              Current Monthly Code
            </p>
            <p
              class="text-4xl md:text-6xl font-black text-green-500 tracking-widest mb-6 break-all"
            >
              {{ deliveryCode.code || deliveryCode }}
            </p>
            <div
              v-if="deliveryCode.expiresAt || deliveryCode.expires"
              class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto"
            >
              <div class="premium-card p-4">
                <p class="text-zinc-500 text-xs uppercase mb-1">Expires</p>
                <p class="font-bold">
                  {{
                    formatDate(deliveryCode.expiresAt || deliveryCode.expires)
                  }}
                </p>
              </div>
              <div class="premium-card p-4">
                <p class="text-zinc-500 text-xs uppercase mb-1">Status</p>
                <p
                  class="font-bold"
                  :class="
                    deliveryCode.isActive ? 'text-green-500' : 'text-red-500'
                  "
                >
                  {{ deliveryCode.isActive ? "Active" : "Inactive" }}
                </p>
              </div>
            </div>
          </div>
          <div v-else class="text-center">
            <p class="text-zinc-500">No delivery code found</p>
          </div>
        </div>
      </div>

      <!-- Logs Tab -->
      <div v-if="activeTab === 'logs'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-black">System Logs</h2>
          <div class="flex gap-4">
            <button @click="clearLogs" class="btn-danger">Clear Logs</button>
            <button @click="downloadLogs" class="btn-success">Download</button>
          </div>
        </div>

        <div class="premium-card p-6 max-h-[600px] overflow-y-auto">
          <div class="font-mono text-sm space-y-1">
            <div
              v-for="(log, index) in logs"
              :key="index"
              :class="getLogColor(log.type)"
              class="py-1"
            >
              <span class="text-zinc-600">[{{ log.timestamp }}]</span>
              <span class="font-bold ml-2">[{{ log.type }}]</span>
              <span class="ml-2">{{ log.message }}</span>
            </div>
            <div
              v-if="logs.length === 0"
              class="text-center text-zinc-500 py-4"
            >
              No logs yet
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

// API Base URL
// API Base URL handled by global axios config

export default {
  name: "Dashboard",
  data() {
    return {
      adminUser: null,
      activeTab: "overview",
      autoLogging: false,
      connectionStatus: null,
      loading: false,
      tabs: [
        { id: "overview", name: "Overview" },
        { id: "users", name: "Users" },
        { id: "orders", name: "Orders" },
        { id: "delivery", name: "Delivery Code" },
        { id: "logs", name: "Logs" },
      ],
      users: [],
      orders: [],
      deliveryCode: null,
      logs: [],
    };
  },
  mounted() {
    this.adminUser = JSON.parse(localStorage.getItem("user"));

    // Only allow administrators
    if (!this.adminUser || this.adminUser.role !== "administrator") {
      this.$router.push("/login");
      return;
    }

    this.fetchUsers();
    this.fetchOrders();
    this.loadAutoLoggingState();
    this.addLog("INFO", "Admin dashboard loaded");
  },
  methods: {
    getAuthHeaders() {
      const token = localStorage.getItem("token");
      return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
    },

    async testBackendConnection() {
      try {
        this.addLog("INFO", "Testing backend connection...");
        const response = await axios.get("/api/auth/me", {
          headers: this.getAuthHeaders(),
        });
        this.connectionStatus = {
          type: "success",
          message: `Backend connected! User: ${response.data.data.username}, Role: ${response.data.data.role}`,
        };
        this.addLog("SUCCESS", "Backend connection successful");
      } catch (err) {
        this.connectionStatus = {
          type: "error",
          message: `Backend connection failed: ${err.response?.data?.message || err.message}`,
        };
        this.addLog(
          "ERROR",
          "Backend connection failed: " +
            (err.response?.data?.message || err.message),
        );
      }
    },

    async fetchUsers() {
      this.loading = true;
      try {
        const response = await axios.get("/api/admin/users", {
          headers: this.getAuthHeaders(),
        });
        this.users = response.data.data || response.data || [];
        this.addLog("INFO", `Fetched ${this.users.length} users`);
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message;
        this.addLog("ERROR", "Failed to fetch users: " + errorMsg);
        console.error("Fetch users error:", err.response?.data || err);

        // If unauthorized, redirect to login
        if (err.response?.status === 401) {
          this.addLog("ERROR", "Session expired. Please login again.");
          localStorage.clear();
          this.$router.push("/login");
        }
      } finally {
        this.loading = false;
      }
    },

    async fetchOrders() {
      this.loading = true;
      try {
        const response = await axios.get("/api/admin/orders", {
          headers: this.getAuthHeaders(),
        });
        this.orders = response.data.data || response.data || [];
        this.addLog("INFO", `Fetched ${this.orders.length} orders`);
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message;
        this.addLog("ERROR", "Failed to fetch orders: " + errorMsg);
        console.error("Fetch orders error:", err.response?.data || err);
      } finally {
        this.loading = false;
      }
    },

    async fetchDeliveryCode() {
      this.loading = true;
      try {
        const response = await axios.get("/api/admin/delivery-code", {
          headers: this.getAuthHeaders(),
        });
        this.deliveryCode = response.data.data || response.data;
        this.addLog(
          "INFO",
          `Current delivery code: ${this.deliveryCode?.code || this.deliveryCode}`,
        );
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message;
        this.addLog("ERROR", "Failed to fetch delivery code: " + errorMsg);
        console.error("Fetch delivery code error:", err.response?.data || err);
      } finally {
        this.loading = false;
      }
    },

    async deleteUser(userId) {
      if (!confirm("Are you sure you want to delete this user?")) return;

      try {
        await axios.delete(`/api/admin/users/${userId}`, {
          headers: this.getAuthHeaders(),
        });
        this.addLog("WARNING", `Deleted user ID: ${userId}`);
        this.fetchUsers();
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message;
        this.addLog("ERROR", "Failed to delete user: " + errorMsg);
        console.error("Delete user error:", err.response?.data || err);
      }
    },

    async toggleUserPause(user) {
      try {
        const response = await axios.patch(`/api/admin/users/${user.id}/pause`, {}, {
          headers: this.getAuthHeaders(),
        });
        this.addLog("SUCCESS", `User ID: ${user.id} ${user.isPaused ? 'unpaused' : 'paused'} successfully`);
        // Update user locally to avoid full refresh
        user.isPaused = !user.isPaused;
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message;
        this.addLog("ERROR", `Failed to ${user.isPaused ? 'unpause' : 'pause'} user: ` + errorMsg);
        console.error("Toggle user pause error:", err.response?.data || err);
      }
    },

    toggleAutoLogging() {
      localStorage.setItem("autoLogging", this.autoLogging);
      this.addLog(
        "INFO",
        `Auto-logging ${this.autoLogging ? "enabled" : "disabled"}`,
      );
    },

    loadAutoLoggingState() {
      this.autoLogging = localStorage.getItem("autoLogging") === "true";
    },

    addLog(type, message) {
      const timestamp = new Date().toLocaleTimeString();
      const log = { type, message, timestamp };
      this.logs.unshift(log);

      if (this.autoLogging) {
        console.log(`[${timestamp}] [${type}] ${message}`);
      }

      if (this.logs.length > 100) {
        this.logs = this.logs.slice(0, 100);
      }
    },

    clearLogs() {
      this.logs = [];
      this.addLog("INFO", "Logs cleared");
    },

    downloadLogs() {
      const logText = this.logs
        .map((log) => `[${log.timestamp}] [${log.type}] ${log.message}`)
        .join("\n");

      const blob = new Blob([logText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `admin-logs-${new Date().toISOString()}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      this.addLog("INFO", "Logs downloaded");
    },

    logout() {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        this.addLog("INFO", "Logout successful");
        this.$router.push("/login");
      } catch (error) {
        console.error("Logout error:", error);
        localStorage.clear();
        this.$router.push("/login");
      }
    },

    formatDate(date) {
      if (!date) return "N/A";
      return new Date(date).toLocaleString();
    },

    getRoleBadge(role) {
      const badges = {
        administrator:
          "px-3 py-1 bg-purple-500/20 text-purple-500 rounded-lg text-xs font-bold uppercase",
        shop_owner:
          "px-3 py-1 bg-blue-500/20 text-blue-500 rounded-lg text-xs font-bold uppercase",
        shop_worker:
          "px-3 py-1 bg-green-500/20 text-green-500 rounded-lg text-xs font-bold uppercase",
        delivery:
          "px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-lg text-xs font-bold uppercase",
        "extra-user":
          "px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-xs font-bold uppercase",
        user: "px-3 py-1 bg-zinc-500/20 text-zinc-500 rounded-lg text-xs font-bold uppercase",
      };
      return badges[role] || badges.user;
    },

    getStatusBadge(status) {
      const badges = {
        Pending:
          "px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-lg text-xs font-bold uppercase",
        Processing:
          "px-3 py-1 bg-blue-500/20 text-blue-500 rounded-lg text-xs font-bold uppercase",
        "On the way":
          "px-3 py-1 bg-purple-500/20 text-purple-500 rounded-lg text-xs font-bold uppercase",
        Delivered:
          "px-3 py-1 bg-green-500/20 text-green-500 rounded-lg text-xs font-bold uppercase",
        Cancelled:
          "px-3 py-1 bg-red-500/20 text-red-500 rounded-lg text-xs font-bold uppercase",
      };
      return badges[status] || badges.Pending;
    },

    getLogColor(type) {
      const colors = {
        INFO: "text-blue-400",
        WARNING: "text-yellow-400",
        ERROR: "text-red-400",
        SUCCESS: "text-green-400",
      };
      return colors[type] || "text-zinc-400";
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

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(59, 130, 246, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(239, 68, 68, 0.3);
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-success:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
