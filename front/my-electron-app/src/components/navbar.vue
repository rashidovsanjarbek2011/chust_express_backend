<template>
  <div>
    <nav
      class="blurmaker z-[9999] flex flex-col md:flex-row fixed w-full items-center justify-between px-4 sm:px-6 py-3 sm:py-4 text-white shadow-xl shadow-black/20 border-b border-zinc-800 gap-3 md:gap-4"
    >
      <!-- Logo -->
      <router-link to="/" class="flex-shrink-0">
        <img src="/logo_transparent.png" class="size-12 sm:size-16 rounded-full" alt="Logo" />
      </router-link>

      <!-- Search Bar - Visible on all screens -->
      <div
        class="search relative border-[2px] px-[0.1em] gap-4 rounded-md h-[40px] flex items-center justify-around text-white flex-grow max-w-xs md:max-w-sm"
      >
        <i class="bi bi-search pl-2 flex-shrink-0"></i>
        <input
          type="text"
          :placeholder="$t('search_placeholder')"
          v-model="searchQuery"
          @input="onSearchInput"
          class="bg-transparent rounded-r-md h-[90%] w-[90%] outline-none border-none text-sm"
        />
      </div>

      <!-- Right Section - Buttons and Controls -->
      <div class="flex items-center justify-center gap-2 sm:gap-3 flex-wrap md:flex-nowrap">
        <!-- Language Switcher - Visible on all screens -->
        <div class="relative lang-dropdown h-[40px]">
          <button
            @click="toggleLangList"
            class="flex items-center gap-1 sm:gap-2 h-full px-2 sm:px-3 border-2 border-zinc-800 rounded-md hover:bg-zinc-800 transition uppercase text-[9px] sm:text-[10px] font-black tracking-widest"
            title="Change Language"
          >
            <span class="hidden sm:inline">{{ currentLanguageLabel }}</span>
            <span class="sm:hidden">{{ $i18n.locale.toUpperCase() }}</span>
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

        <!-- Extra Button - Always Visible -->
        <button
          @click="openExtra"
          class="flex items-center justify-center text-lg h-[40px] w-[40px] text-orange-400 border-[2px] border-orange-500/30 rounded-md hover:bg-orange-500/10 hover:border-orange-500 transition flex-shrink-0"
          title="Resource Panel"
        >
          <i class="bi bi-sliders"></i>
        </button>

        <!-- Cart Section -->
        <router-link to="/cart" class="relative group flex-shrink-0">
          <div
            class="flex items-center justify-center text-xl h-[40px] w-[40px] text-white border-[2px] rounded-md dark:border-zinc-700 hover:bg-zinc-700 transition"
          >
            <i class="bi bi-cart3"></i>
            <span
              v-if="cartCount > 0"
              class="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-zinc-800"
            >
              {{ cartCount }}
            </span>
          </div>
        </router-link>

        <!-- Create Product (logged in users only) -->
        <router-link v-if="user" to="/createProduct" class="flex-shrink-0">
          <div
            class="flex items-center justify-center text-xl h-[40px] w-[40px] text-white border-[2px] rounded-md dark:border-zinc-700 hover:bg-zinc-700 transition"
            title="Add Product"
          >
            +
          </div>
        </router-link>

        <!-- Seller Sales shortcut -->
        <router-link v-if="isSeller" to="/seller/sales" class="flex-shrink-0">
          <div
            class="flex items-center justify-center text-xl h-[40px] w-[40px] text-green-500 border-[2px] border-green-500/30 rounded-md hover:bg-green-500/10 hover:border-green-500 transition"
            title="Sales"
          >
            <i class="bi bi-graph-up-arrow"></i>
          </div>
        </router-link>

        <!-- Delivery Lobby shortcut -->
        <router-link v-if="isDelivery" to="/delivery/lobby" class="flex-shrink-0">
          <div
            class="flex items-center justify-center text-xl h-[40px] w-[40px] text-green-500 border-[2px] border-green-500/30 rounded-md hover:bg-blue-500/10 hover:border-green-500 transition"
            title="Delivery Panel"
          >
            <i class="bi bi-bicycle"></i>
          </div>
        </router-link>

        <!-- Auth section -->
        <div v-if="user" class="flex items-center gap-2 flex-shrink-0">
          <router-link
            to="/profile"
            class="flex items-center justify-center text-sm h-[40px] text-white border-[2px] rounded-md dark:border-zinc-700 px-2 sm:px-3 hover:bg-zinc-700 transition whitespace-nowrap"
            title="Profile"
          >
            <i class="bi bi-person-fill"></i>
            <span class="hidden sm:inline ml-1 text-xs">{{ displayName }}</span>
          </router-link>
        </div>
        <div v-else class="flex items-center gap-2 flex-shrink-0">
          <router-link
            to="/register"
            class="flex items-center justify-center text-sm h-[40px] w-[40px] text-white border-[2px] rounded-md dark:border-zinc-700 hover:bg-zinc-700 transition"
            title="Register / Login"
          >
            <i class="bi bi-person-fill"></i>
          </router-link>
        </div>
      </div>
    </nav>
    <Extra ref="extraComponent" />
  </div>
</template>

<script>
// import mode from "./mode.vue";
import axios from "axios";
import Extra from "./Extra.vue";

export default {
  name: "Navbar",
  components: {
    // mode,
    Extra,
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
    openExtra() {
      this.$refs.extraComponent?.openModal();
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
