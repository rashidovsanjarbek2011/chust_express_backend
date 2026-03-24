<template>
  <div
    class="auth-page pt-12 min-h-screen bg-zinc-950 flex items-center justify-center p-6"
  >
    <div class="premium-card w-full max-w-md p-8 md:p-10">
      <div class="text-center mb-10">
        <h1
          class="text-4xl font-black text-green-500 tracking-tighter uppercase mb-2"
        >
          Kirish
        </h1>
        <p class="text-zinc-500 text-sm">
          Xush kelibsiz! Tizimga kirish uchun ma'lumotlarni kiriting.
        </p>
      </div>

      <!-- Error & Success Messages -->
      <div
        v-if="error"
        class="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3"
      >
        <i class="bi bi-exclamation-circle text-xl"></i>
        <span class="font-bold text-sm">{{ error }}</span>
      </div>
      <div
        v-if="success"
        class="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl flex items-center gap-3"
      >
        <i class="bi bi-check-circle text-xl"></i>
        <span class="font-bold text-sm">{{ success }}</span>
      </div>

      <div class="space-y-6">
        <div>
          <label
            class="block text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-2"
            >E-pochta</label
          >
          <input
            v-model="formData.email"
            type="email"
            placeholder="email@example.com"
            class="w-full bg-zinc-900/50 border border-zinc-800 focus:border-green-500 rounded-xl p-4 text-white outline-none transition-all font-bold placeholder:text-zinc-700"
          />
        </div>

        <div>
          <label
            class="block text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-2"
            >Parol</label
          >
          <div class="relative">
            <input
              v-model="formData.password"
              :type="slashed ? 'password' : 'text'"
              placeholder="••••••••"
              class="w-full bg-zinc-900/50 border border-zinc-800 focus:border-green-500 rounded-xl p-4 text-white outline-none transition-all font-bold placeholder:text-zinc-700"
            />
            <button
              @click="slashed = !slashed"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-green-500 transition-colors"
            >
              <i
                :class="slashed ? 'bi bi-eye-slash' : 'bi bi-eye'"
                class="text-xl"
              ></i>
            </button>
          </div>
        </div>

        <!-- Ko'dlar uchun bo'lim -->
        <div class="space-y-4 pt-4 border-t border-zinc-900">
          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4 text-center">Xodimlar uchun maxsus kodlar</p>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-zinc-500 font-black uppercase text-[9px] tracking-widest mb-1.5">Ishchi Kodi</label>
              <input
                v-model="formData.uniqueCode"
                type="text"
                placeholder="Worker"
                class="w-full bg-zinc-900/30 border border-zinc-800/50 focus:border-green-500/50 rounded-lg p-3 text-white outline-none transition-all font-bold placeholder:text-zinc-800 text-xs"
              />
            </div>
            <div>
              <label class="block text-zinc-500 font-black uppercase text-[9px] tracking-widest mb-1.5">Ega Kodi</label>
              <input
                v-model="formData.legacyCode"
                type="text"
                placeholder="Owner"
                class="w-full bg-zinc-900/30 border border-zinc-800/50 focus:border-green-500/50 rounded-lg p-3 text-white outline-none transition-all font-bold placeholder:text-zinc-800 text-xs"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-zinc-500 font-black uppercase text-[9px] tracking-widest mb-1.5">Menejer</label>
              <input
                v-model="formData.managerCode"
                type="text"
                placeholder="Manager"
                class="w-full bg-zinc-900/30 border border-zinc-800/50 focus:border-green-500/50 rounded-lg p-3 text-white outline-none transition-all font-bold placeholder:text-zinc-800 text-xs"
              />
            </div>
            <div>
              <label class="block text-zinc-500 font-black uppercase text-[9px] tracking-widest mb-1.5">Kuryer Kodi</label>
              <input
                v-model="formData.deliveryCode"
                type="text"
                placeholder="Delivery"
                class="w-full bg-zinc-900/30 border border-zinc-800/50 focus:border-green-500/50 rounded-lg p-3 text-white outline-none transition-all font-bold placeholder:text-zinc-800 text-xs"
              />
            </div>
          </div>

          <!-- Ish Maydoni faqat kuryer kodi TO'G'RI bo'lganda chiqadi -->
          <transition name="fade">
            <div v-if="isDeliveryCodeValid" class="mt-4 p-4 bg-green-500/5 border border-green-500/10 rounded-xl">
              <label class="block text-green-500/70 font-black uppercase text-[9px] tracking-widest mb-2">Ish Maydoni (Xaritalash uchun)</label>
              <input
                v-model="formData.workingRegion"
                type="text"
                placeholder="Masalan: Chilonzor, Yunusobod..."
                class="w-full bg-zinc-900 border border-green-500/20 focus:border-green-500 rounded-xl p-4 text-white outline-none transition-all font-bold placeholder:text-zinc-700 text-sm"
              />
              <p class="text-[9px] text-zinc-600 mt-2 italic">* Kuryer sifatida ishlash uchun hududni kiriting</p>
            </div>
          </transition>
        </div>

        <button
          @click="login"
          :disabled="loading"
          class="w-full py-5 bg-green-600 hover:bg-green-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all shadow-xl shadow-green-500/20 mt-4"
        >
          <span v-if="loading" class="animate-pulse">Yuborilmoqda...</span>
          <span v-else>Kirish</span>
        </button>

        <p
          class="text-center text-zinc-500 text-xs font-bold uppercase tracking-widest mt-8"
        >
          Ro'yxatdan o'tmaganmisiz?
          <router-link
            :to="{ name: 'register' }"
            class="text-green-500 hover:text-green-400 transition-colors ml-1"
            >Ro'yxatdan o'tish</router-link
          >
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Login",
  data() {
    return {
      slashed: true,
      formData: {
        email: "",
        password: "",
        uniqueCode: "",
        legacyCode: "",
        deliveryCode: "",
        managerCode: "",
        workingRegion: "",
      },
      isDeliveryCodeValid: false,
      error: null,
      success: null,
      loading: false,
    };
  },
  methods: {
    async login() {
      this.error = null;
      this.success = null;

      const { email, password, uniqueCode, legacyCode, deliveryCode, managerCode, workingRegion } =
        this.formData;
      const cleanUniqueCode = uniqueCode ? uniqueCode.trim() : null;
      const cleanLegacyCode = legacyCode ? legacyCode.trim() : null;
      const cleanDeliveryCode = deliveryCode ? deliveryCode.trim() : null;
      const cleanManagerCode = managerCode ? managerCode.trim() : null;
      const cleanWorkingRegion = workingRegion ? workingRegion.trim() : null;

      if (!email || !password) {
        this.error = "Email va parol majburiy.";
        return;
      }

      this.loading = true;

      try {
        const response = await axios.post(
          "/api/auth/login",
          {
            email,
            password,
            uniqueCode: cleanUniqueCode,
            legacyCode: cleanLegacyCode,
            deliveryCode: cleanDeliveryCode,
            managerCode: cleanManagerCode,
            workingRegion: cleanWorkingRegion,
          },
          {
            headers: { "Content-Type": "application/json" },
          },
        );

        const { token, role, data } = response.data;

        // Store token with consistent key
        localStorage.setItem("userToken", token);
        localStorage.setItem("token", token);
        localStorage.setItem("userRole", role);

        // Store user data
        if (data) {
          localStorage.setItem("user", JSON.stringify(data));
        }

        this.success = "Kirish muvaffaqiyatli!";
        window.dispatchEvent(new Event("userLoggedIn"));

        setTimeout(() => {
          if (role === "shop_owner") {
            this.$router.push({ name: "owner-dashboard" });
          } else if (role === "shop_worker") {
            this.$router.push({ name: "worker-dashboard" });
          } else if (role === "delivery") {
            this.$router.push({ name: "delivery-lobby" });
          } else if (role === "manager") {
            this.$router.push({ name: "monitor-panel" });
          } else {
            this.$router.push({ name: "user-dashboard" });
          }
        }, 1000);
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          "Login jarayonida xatolik yuz berdi.";
      } finally {
        this.loading = false;
      }
    },
    async checkDeliveryCode() {
      if (!this.formData.deliveryCode || this.formData.deliveryCode.trim().length < 4) {
        this.isDeliveryCodeValid = false;
        return;
      }

      try {
        const response = await axios.post("/api/auth/validate-delivery-code", {
          email: this.formData.email,
          code: this.formData.deliveryCode,
        });
        this.isDeliveryCodeValid = response.data.isValid;
      } catch (error) {
        console.error("Code validation error", error);
        this.isDeliveryCodeValid = false;
      }
    },
  },
  watch: {
    "formData.deliveryCode": {
      handler() {
        // Simple debounce
        if (this.validationTimeout) clearTimeout(this.validationTimeout);
        this.validationTimeout = setTimeout(() => {
          this.checkDeliveryCode();
        }, 500);
      },
    },
    "formData.email": {
      handler() {
        if (this.formData.deliveryCode) {
          this.checkDeliveryCode();
        }
      },
    },
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.premium-card {
  background: rgba(15, 15, 15, 0.8);
  backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.5);
}
</style>
