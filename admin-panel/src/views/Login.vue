<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-4 sm:p-6"
  >
    <div class="premium-card p-6 md:p-12 max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-black uppercase tracking-tighter mb-2">
          Admin <span class="text-blue-500">Panel</span>
        </h1>
        <p class="text-zinc-500 text-sm">Control Panel Access</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label
            class="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2 block"
          >
            Email
          </label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
            placeholder="admin@gmail.com"
          />
        </div>

        <div>
          <label
            class="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2 block"
          >
            Password
          </label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label
            class="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2 block"
          >
            Admin Code
          </label>
          <input
            v-model="adminCode"
            type="text"
            class="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all font-mono tracking-wider"
            placeholder="ADMIN2024"
          />
          <p class="text-zinc-600 text-xs mt-1">
            Required for administrator access
          </p>
        </div>

        <!-- Manager Code (optional) -->
        <div>
          <label
            class="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2 block"
          >
            Manager Code
          </label>
          <input
            v-model="managerCode"
            type="text"
            class="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-yellow-500 transition-all font-mono tracking-wider"
            placeholder="Enter manager code (optional)"
          />
          <p class="text-zinc-600 text-xs mt-1">
            Optional — provides manager access
          </p>
        </div>

        <button type="submit" :disabled="loading" class="w-full btn-primary">
          {{ loading ? "Authenticating..." : "Login" }}
        </button>

        <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>
        <p v-if="successMessage" class="text-green-500 text-sm text-center">
          {{ successMessage }}
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

const API_URL = "/api";

export default {
  name: "Login",
  data() {
    return {
      email: "",
      password: "",
      adminCode: "",
      managerCode: "",
      loading: false,
      error: "",
      successMessage: "",
    };
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.error = "";
      this.successMessage = "";

      try {
        // Send credentials to backend with adminCode
        const response = await axios.post(`${API_URL}/auth/login`, {
          email: this.email,
          password: this.password,
          adminCode: this.adminCode, // Sent admin code
          managerCode: this.managerCode,
        });

        // Extract token and user data
        const token = response.data.token;
        const userData = response.data.data;

        if (!token) {
          throw new Error("No authentication token received from server");
        }

        // Allow administrators and managers to access the dashboard
        if (userData.role !== "administrator" && userData.role !== "manager") {
          throw new Error(
            `Access denied. Your role is "${userData.role}" and cannot access the admin panel.`,
          );
        }

        // ✅ SUCCESS! Store authentication data
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));

        // Set axios default authorization header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        this.successMessage = "Login successful! Redirecting...";

        // Redirect to dashboard after short delay
        setTimeout(() => {
          this.$router.push("/dashboard");
        }, 500);
      } catch (err) {
        console.error("=== LOGIN ERROR ===");
        console.error("Error:", err);
        console.error("Response:", err.response?.data);

        // Clear password and admin code for security
        this.password = "";
        this.adminCode = "";

        // User-friendly error messages
        if (err.response) {
          const status = err.response.status;
          const message =
            err.response.data?.message || err.response.data?.error;

          switch (status) {
            case 400:
              this.error =
                message || "Invalid request. Please check your input.";
              break;
            case 401:
              this.error = "Invalid email or password.";
              break;
            case 403:
              this.error = message || "Access denied. Invalid admin code.";
              break;
            case 404:
              this.error = "Login endpoint not found. Check backend.";
              break;
            case 500:
              this.error = "Server error. Please try again later.";
              break;
            default:
              this.error = message || `Login failed (Status: ${status})`;
          }
        } else if (err.request) {
          // Request was made but no response received
          this.error =
            "Cannot connect to backend server. Make sure backend is running on https://chust-express-backend.onrender.com";
        } else {
          // Other errors
          this.error = err.message || "Login failed";
        }
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    // Auto-redirect if already logged in as admin
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);

        // Only redirect if user is administrator
        if (user.role === "administrator") {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          this.$router.push("/dashboard");
        } else {
          // Clear non-admin session
          localStorage.clear();
        }
      } catch (e) {
        localStorage.clear();
      }
    }
  },
};
</script>

<style scoped>
.premium-card {
  background: rgba(15, 15, 15, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  padding: 14px 24px;
  border-radius: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary::after {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transition: left 0.5s;
}

.btn-primary:hover::after {
  left: 100%;
}
</style>
