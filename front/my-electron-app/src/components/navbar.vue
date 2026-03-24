<template>
  <nav
    class="blurmaker z-[9999] flex fixed w-full items-center justify-between px-6 py-4 text-white shadow-xl shadow-black/20 border-b border-zinc-800"
  >
    <router-link to="/">
      <img src="/logo_transparent.png" class="size-16 rounded-full" alt="" />
    </router-link>
    <div
      class="search relative border-[2px] px-[0.1em] gap-4 rounded-md h-[40px] hidden md:flex items-center justify-around text-white"
    >
      <i class="bi bi-search pl-2"></i>
      <div
        class="hider absolute w-[10%] z-[-1] h-[90%] bg-transparent left-[2.2em]"
      ></div>
      <input
        type="text"
        :placeholder="$t('search_placeholder')"
        v-model="searchQuery"
        @input="onSearchInput"
        class="bg-transparent rounded-r-md h-[90%] w-[90%] outline-none border-none"
      />
    </div>

    <div class="flex items-center justify-center gap-[1em]">
      <!-- Language Switcher -->
      <div class="relative lang-dropdown h-[40px] hidden sm:block">
        <button
          @click="toggleLangList"
          class="flex items-center gap-2 h-full px-3 border-2 border-zinc-800 rounded-md hover:bg-zinc-800 transition uppercase text-[10px] font-black tracking-widest"
        >
          <span>{{ currentLanguageLabel }}</span>
          <i class="bi bi-chevron-down text-[8px]"></i>
        </button>
        <div
          v-if="showLangList"
          class="absolute top-[120%] right-0 w-32 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-2 z-[10000] overflow-hidden"
        >
          <button
            v-for="(label, lang) in languages"
            :key="lang"
            @click="changeLanguage(lang)"
            :class="[
              'w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-green-500/10',
              $i18n.locale === lang ? 'text-green-500' : 'text-zinc-500 hover:text-white'
            ]"
          >
            {{ label }}
          </button>
        </div>
      </div>
      <!-- <mode /> -->

      <!-- Cart Section -->
      <router-link to="/cart" class="relative group">
        <div
          class="flex items-center text-xl h-[40px] text-white border-[2px] rounded-md dark:border-zinc-700 px-[10px] hover:bg-zinc-700 transition"
        >
          <i class="bi bi-cart3"></i>
          <span
            v-if="cartCount > 0"
            class="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-zinc-800"
          >
            {{ cartCount }}
          </span>
        </div>
      </router-link>

      <!-- Create Product faqat login qilganlar uchun -->
      <router-link v-if="user" to="/createProduct">
        <div
          class="flex items-center text-xl h-[40px] text-white border-[2px] rounded-md dark:border-zinc-700 px-[10px]"
        >
          +
        </div>
      </router-link>

      <!-- Seller Sales shortcut -->
      <router-link v-if="isSeller" to="/seller/sales">
        <div
          class="flex items-center text-xl h-[40px] text-green-500 border-[2px] border-green-500/30 rounded-md px-[10px] hover:bg-green-500/10 hover:border-green-500 transition"
          title="Sotuvlar"
        >
          <i class="bi bi-graph-up-arrow"></i>
        </div>
      </router-link>

      <!-- Delivery Lobby shortcut -->
      <router-link v-if="isDelivery" to="/delivery/lobby">
        <div
          class="flex items-center text-xl h-[40px] text-green-500 border-[2px] border-green-500/30 rounded-md px-[10px] hover:bg-blue-500/10 hover:border-green-500 transition"
          title="Kuryer Paneli"
        >
          <i class="bi bi-bicycle"></i>
        </div>
      </router-link>
      <!-- Auth section -->
      <div v-if="user" class="flex items-center gap-4">
        <!-- <router-link
          to="/user-dashboard"
          class="flex items-center text-sm h-[40px] text-white border-[2px] rounded-md dark:border-zinc-700 px-[10px] hover:bg-zinc-700"
        >
          <i class="bi bi-speedometer2"></i>
          <span class="hidden md:inline"></span>
        </router-link> -->
        <router-link
          to="/profile"
          class="flex items-center text-sm h-[40px] text-white border-[2px] rounded-md dark:border-zinc-700 px-[10px] hover:bg-zinc-700"
        >
          <i class="bi bi-person-fill"></i>
          <span class="hidden md:inline">{{ displayName }}</span>
        </router-link>
      </div>
      <div v-else class="flex items-center gap-2">
        <router-link
          to="/register"
          class="flex items-center text-sm h-[40px] text-white border-[2px] rounded-md dark:border-zinc-700 px-[10px] hover:bg-zinc-700"
        >
          <i class="bi bi-person-fill"></i>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script>
// import mode from "./mode.vue";
import axios from "axios";

export default {
  name: "Navbar",
  components: {
    // mode,
  },
  data() {
    return {
      list: false,
      searchQuery: "",
      searchDebounceTimer: null,
      user: null,
      userName: "",
      loading: false,
      cartCount: 0,
      showLangList: false,
      languages: {
        ru: "Русский",
        en: "English",
        zh: "Chinese",
        uz: "O'zbekcha",
      },
    };
  },
  watch: {
    "$route.query.search"(newVal) {
      this.searchQuery = newVal || "";
    },
  },
  computed: {
    currentLanguageLabel() {
      return this.languages[this.$i18n.locale] || "RU";
    },
    displayName() {
      if (!this.user) return "";
      return (
        this.user.name ||
        this.user.username ||
        this.user.email.split("@")[0] ||
        this.user.email
      );
    },
    isSeller() {
      if (!this.user) return false;
      return ["shop_worker", "shop_owner", "administrator"].includes(
        this.user.role,
      );
    },
    isDelivery() {
      if (!this.user) return false;
      return this.user.role === "delivery";
    },
  },
  mounted() {
    this.loadUser();
    this.updateCartCount();
    this.searchQuery = this.$route.query.search || "";
    window.addEventListener("userLoggedIn", this.loadUser);
    window.addEventListener("storage", this.handleStorageChange);
    window.addEventListener("cartUpdated", this.updateCartCount);
    document.addEventListener("click", this.closeDropdowns);
  },
  beforeUnmount() {
    window.removeEventListener("userLoggedIn", this.loadUser);
    window.removeEventListener("storage", this.handleStorageChange);
    window.removeEventListener("cartUpdated", this.updateCartCount);
    document.removeEventListener("click", this.closeDropdowns);
  },
  methods: {
    toggleLangList() {
      this.showLangList = !this.showLangList;
    },
    closeDropdowns(e) {
      if (!e.target.closest(".lang-dropdown")) {
        this.showLangList = false;
      }
    },
    changeLanguage(lang) {
      this.$i18n.locale = lang;
      localStorage.setItem("lang", lang);
      this.showLangList = false;
    },
    // Real-time debounced search
    onSearchInput() {
      clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = setTimeout(() => {
        const query = this.searchQuery.trim();
        if (this.$route.path !== "/") {
          this.$router.push({ path: "/", query: query ? { search: query } : {} });
        } else {
          this.$router.replace({ query: query ? { search: query } : {} });
        }
      }, 300);
    },

    // LocalStorage o'zgarishini kuzatish
    handleStorageChange(event) {
      if (event && event.key === "user") {
        try {
          this.user = JSON.parse(event.newValue);
        } catch (e) {
          /* ignore */
        }
      } else if (event && event.key === "cart") {
        this.updateCartCount();
      } else {
        // Fallback for non-specific events or other keys
        this.updateCartCount();
        // Do NOT call loadUser() here to avoid loop
      }
    },

    updateCartCount() {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      this.cartCount = cart.reduce((count, item) => count + item.quantity, 0);
    },

    // User ma'lumotlarini yuklash
    async loadUser() {
      try {
        // Avval localStorage'dan yuklash
        const savedUser = localStorage.getItem("user");
        const token =
          localStorage.getItem("token") || localStorage.getItem("userToken");

        if (savedUser) {
          try {
            this.user = JSON.parse(savedUser);
          } catch (e) {
            console.error("User ma'lumotlarini parse qilishda xato:", e);
          }
        }

        // Token bo'lsa, serverdan yangilash
        if (token) {
          this.loading = true;
          const response = await axios.get(`/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          // Prisma backend strukturasi
          if (response.data.success && response.data.user) {
            this.user = response.data.user;
            localStorage.setItem("user", JSON.stringify(response.data.user));
          } else if (response.data.data) {
            // Agar data ichida bo'lsa
            this.user = response.data.data;
            localStorage.setItem("user", JSON.stringify(response.data.data));
          } else {
            // Token yaroqsiz bo'lishi mumkin
            this.clearAuthData();
          }
        } else {
          this.user = null;
        }
      } catch (error) {
        console.error("Foydalanuvchini olishda xato:", error);

        // 401 yoki 403 xatolari
        if (error.response?.status === 401 || error.response?.status === 403) {
          this.clearAuthData();
        }
      } finally {
        this.loading = false;
      }
    },

    // Logout
    async logout() {
      try {
        const token =
          localStorage.getItem("token") || localStorage.getItem("userToken");

        // Backend logout API ga so'rov (agar mavjud bo'lsa)
        if (token) {
          await axios
            .post(
              `/api/auth/logout`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            )
            .catch((err) => {
              // Logout endpoint bo'lmasa ham davom et
              console.log(
                "Logout endpoint mavjud emas yoki xatolik:",
                err.message,
              );
            });
        }
      } catch (error) {
        console.error("Logout xatosi:", error);
      } finally {
        // Har holatda local datani tozalash
        this.clearAuthData();

        // Login sahifasiga yo'naltirish
        this.$router.push("/login");
      }
    },

    // Auth datani tozalash
    clearAuthData() {
      localStorage.removeItem("token");
      localStorage.removeItem("userToken");
      localStorage.removeItem("user");
      delete axios.defaults.headers.common["Authorization"];
      this.user = null;

      // Boshqa komponentlarga xabar berish
      window.dispatchEvent(new Event("userLoggedOut"));
    },
  },
};
</script>

<style scoped>
.blurmaker {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.search {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
}

.search input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

/* Responsive */
@media (max-width: 768px) {
  .search {
    display: none !important;
  }
}

/* Hover effects */
.router-link-active {
  opacity: 0.9;
}

button:hover,
.router-link:hover {
  opacity: 0.8;
  transition: opacity 0.2s;
}
</style>
