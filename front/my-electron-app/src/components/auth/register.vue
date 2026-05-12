<template>
  <div
    class="auth-page pt-12 min-h-screen bg-zinc-950 flex items-center justify-center p-6"
  >
    <div class="premium-card w-full max-w-md p-8 md:p-10">
      <div class="text-center mb-10">
        <h1
          class="text-2xl sm:text-3xl md:text-4xl font-black text-green-500 tracking-tight uppercase mb-2 break-words"
        >
          {{$t('register')}}
        </h1>
        <p class="text-zinc-500 text-sm">
          {{$t('register_welcome')}}
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
            >{{$t('username')}}</label
          >
          <input
            v-model="formData.username"
            type="text"
            :placeholder="$t('username_placeholder')"
            class="w-full bg-zinc-900/50 border border-zinc-800 focus:border-green-500 rounded-xl p-4 text-white outline-none transition-all font-bold placeholder:text-zinc-700"
          />
        </div>

        <div>
          <label
            class="block text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-2"
            >{{$t('email')}}</label
          >
          <input
            v-model="formData.email"
            type="email"
            :placeholder="$t('email_placeholder')"
            class="w-full bg-zinc-900/50 border border-zinc-800 focus:border-green-500 rounded-xl p-4 text-white outline-none transition-all font-bold placeholder:text-zinc-700"
          />
        </div>

        <div>
          <label
            class="block text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-2"
            >{{$t('phone_number')}}</label
          >
          <input
            v-model="formData.phoneNumber"
            type="tel"
            :placeholder="$t('phone_number_placeholder')"
            class="w-full bg-zinc-900/50 border border-zinc-800 focus:border-green-500 rounded-xl p-4 text-white outline-none transition-all font-bold placeholder:text-zinc-700"
          />
        </div>

        <div>
           <label
            class="block text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-2"
            >{{$t('address')}}</label
          >
          <input
            v-model="formData.address"
            type="text"
            :placeholder="$t('address_placeholder')"
            class="w-full bg-zinc-900/50 border border-zinc-800 focus:border-green-500 rounded-xl p-4 text-white outline-none transition-all font-bold placeholder:text-zinc-700"
          />
        </div>

        <div>
          <label
            class="block text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-2"
            >{{$t('card_number')}}</label
          >
          <input
            v-model="formData.cardNumber"
            type="text"
            :placeholder="$t('card_number_placeholder')"
            maxlength="19"
            @input="formatCardNumber"
            class="w-full bg-zinc-900/50 border border-zinc-800 focus:border-green-500 rounded-xl p-4 text-white outline-none transition-all font-bold placeholder:text-zinc-700"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              class="block text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-2"
              >{{$t('password')}}</label
            >
            <div class="relative">
              <input
                v-model="formData.password"
                :type="slashed ? 'password' : 'text'"
                :placeholder="$t('password_placeholder')"
                class="w-full bg-zinc-900/50 border border-zinc-800 focus:border-green-500 rounded-xl p-4 text-white outline-none transition-all font-bold placeholder:text-zinc-700 text-sm"
              />
              <button
                @click="slashed = !slashed"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-green-500 transition-colors"
                type="button"
              >
                <i
                  :class="slashed ? 'bi bi-eye-slash' : 'bi bi-eye'"
                  class="text-lg"
                ></i>
              </button>
            </div>
          </div>
          <div>
            <label
              class="block text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-2"
              >{{$t('confirm')}}</label
            >
            <div class="relative">
              <input
                v-model="formData.confirmPassword"
                :type="slashed ? 'password' : 'text'"
                :placeholder="$t('password_placeholder')"
                class="w-full bg-zinc-900/50 border border-zinc-800 focus:border-green-500 rounded-xl p-4 text-white outline-none transition-all font-bold placeholder:text-zinc-700 text-sm"
              />
            </div>
          </div>
        </div>

        <button
          @click="register"
          :disabled="loading"
          class="w-full py-5 bg-green-600 hover:bg-green-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all shadow-xl shadow-green-500/20 mt-4"
        >
          <span v-if="loading" class="animate-pulse">{{$t('sending')}}...</span>
          <span v-else>{{$t('register')}}</span>
        </button>

        <p
          class="text-center text-zinc-500 text-xs font-bold uppercase tracking-widest mt-8"
        >
          {{$t('already_registered')}}
          <router-link
            :to="{ name: 'login' }"
            class="text-green-500 hover:text-green-400 transition-colors ml-1"
            >{{$t('login')}}</router-link
          >
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Register",
  watch: {
    '$i18n.locale'() {
      this.$forceUpdate();
    }
  },
  data() {
    return {
      slashed: true,
      formData: {
        username: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
        cardNumber: "",
        address: "",
        workingRegion: "",
      },
      error: null,
      success: null,
      loading: false,
    };
  },
  methods: {
    async register() {
      this.error = null;
      this.success = null;

      const {
        username,
        email,
        password,
        confirmPassword,
        cardNumber,
        address,
        phoneNumber,
      } = this.formData;

      if (
        !username ||
        !email ||
        !password ||
        !confirmPassword ||
        !cardNumber ||
        !address ||
        !phoneNumber
      ) {
        this.error =
          this.$t('error_fill_all_fields');
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  // Actually this might be fine in JS;
      if (!emailPattern.test(email)) {
        this.error = this.$t('error_invalid_email');
        return;
      }

      if (password !== confirmPassword) {
        this.error = this.$t('error_passwords_do_not_match');
        return;
      }

      this.loading = true;

      try {
        const response = await axios.post(
          "/api/auth/register",
          { username, email, password, cardNumber, address, phoneNumber },
          {
            headers: { "Content-Type": "application/json" },
          },
        );

        if (response.data.success) {
          this.success =
            response.data.message || "Muvaffaqiyatli ro'yxatdan o'tildi!";
          const user = response.data.data;
          const token = response.data.token;

          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("userToken", token);
          localStorage.setItem("token", token);
          localStorage.setItem("userRole", user.role);

          window.dispatchEvent(new Event("userLoggedIn"));

          setTimeout(() => {
            this.$router.push({ name: "user-dashboard" });
          }, 1500);
        }
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          "Ro'yxatdan o'tishda xatolik yuz berdi.";
      } finally {
        this.loading = false;
      }
    },
    async formatCardNumber(event) {
      let value = event.target.value.replace(/\D/g, "");
      if (value.length > 16) value = value.slice(0, 16);
      this.formData.cardNumber = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    },
  },
};
</script>

<style scoped>
/* Scoped styles kept minimal as main components are in main.css and Tailwind */
</style>
