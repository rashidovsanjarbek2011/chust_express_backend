<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-950 via-yellow-900 to-yellow-950 p-4 sm:p-6"
  >
    <div class="premium-card p-6 md:p-12 max-w-md w-full">
      <div class="text-center mb-8">
        <h1
          class="text-4xl font-bold text-gray-700 uppercase tracking-tighter mb-2"
        >
          Manager <span class="text-yellow-500">Panel</span>
        </h1>
        <p class="text-zinc-500 text-sm">Manager Access Portal</p>
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
            class="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-yellow-500 transition-all"
            placeholder="manager@example.com"
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
            class="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-yellow-500 transition-all"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label
            class="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2 block"
          >
            Extra Code (Optional)
          </label>
          <input
            v-model="extraCode"
            type="text"
            class="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-orange-500 transition-all font-mono tracking-wider"
            placeholder="EXT-XXXXXX"
          />
          <p class="text-zinc-600 text-xs mt-1">For extra-user access</p>
        </div>

        <div>
          <label
            class="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2 block"
          >
            Manager Code
          </label>
          <input
            v-model="managerCode"
            type="text"
            required
            class="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-yellow-500 transition-all font-mono tracking-wider"
            placeholder="MGR-XXXXX"
          />
          <p class="text-zinc-600 text-xs mt-1">Your unique manager code</p>
        </div>

        <div class="flex items-center gap-3">
          <input
            v-model="isDelivery"
            type="checkbox"
            id="isDelivery"
            class="w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-yellow-500 focus:ring-yellow-500"
          />
          <label
            for="isDelivery"
            class="text-zinc-400 text-sm font-bold uppercase tracking-wide cursor-pointer select-none"
          >
            Is Delivery Available?
          </label>
        </div>

        <button type="submit" :disabled="loading" class="w-full btn-primary">
          {{ loading ? "Authenticating..." : "Login as Manager" }}
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

export default {
  name: "Login",
  data() {
    return {
      email: "",
      password: "",
      extraCode: "",
      managerCode: "",
      isDelivery: false,
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
        const response = await axios.post("/api/auth/login", {
          email: this.email,
          password: this.password,
          managerCode: this.managerCode,
          extraCode: this.extraCode,
          isDelivery: this.isDelivery,
        });

        const token = response.data.token;
        const userData = response.data.data;

        if (!token) {
          throw new Error("No authentication token received from server");
        }

        if (userData.role !== "manager" && userData.role !== "extra-user") {
          throw new Error(
            `Access denied. Your role is "${userData.role}" but manager or extra-user access is required.`,
          );
        }

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        this.successMessage = "Login successful! Redirecting...";

        setTimeout(() => {
          this.$router.push("/dashboard");
        }, 500);
      } catch (err) {
        this.password = "";
        this.managerCode = "";
        this.extraCode = "";

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
              this.error = message || "Access denied. Invalid manager code.";
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
          this.error =
            "Cannot connect to backend server. Make sure backend is running on https://chust-express-backend.onrender.com";
        } else {
          this.error = err.message || "Login failed";
        }
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);

        if (user.role === "manager") {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          this.$router.push("/dashboard");
        } else {
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
  background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
  color: black;
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
  box-shadow: 0 10px 25px rgba(234, 179, 8, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
