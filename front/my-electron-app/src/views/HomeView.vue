<template>
  <div
    class="home-view pt-16 md:pt-24 min-h-screen bg-zinc-950 text-white pb-20"
  >
    <!-- Hero Section -->
    <div class="relative overflow-hidden mb-12 px-6">
      <div
        class="max-w-7xl mx-auto pt-16 pb-20 relative z-10 text-center md:text-left"
      >
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 mb-6 mx-auto md:mx-0"
        >
          <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span
            class="text-[10px] font-black uppercase tracking-widest text-green-500"
            >{{ $t('delivery_text') }}</span
          >
        </div>
        <h1
          class="text-4xl md:text-8xl font-black tracking-tighter uppercase leading-[0.9] mb-8"
        >
          {{ $t('hero_title_1') }} <br />
          <span class="text-green-500">{{ $t('hero_title_2') }}</span>
        </h1>
        <p
          class="max-w-xl text-zinc-500 text-lg mb-10 mx-auto md:mx-0 font-medium"
        >
          {{ $t('hero_subtitle') }}
        </p>
        <div
          class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
        >
          <button
            @click="scrollToProducts"
            class="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-xl shadow-green-500/20"
          >
            {{ $t('start_shopping') }}
          </button>
          <router-link
            to="/cart"
            class="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-black uppercase tracking-widest text-xs rounded-xl transition-all border border-zinc-800"
          >
            {{ $t('view_cart') }}
          </router-link>
        </div>
      </div>

      <!-- Background Decor -->
      <div
        class="absolute top-0 right-0 w-1/2 h-full hidden lg:block opacity-20 pointer-events-none"
      >
        <div
          class="absolute inset-0 bg-gradient-to-l from-green-500/20 via-transparent to-transparent"
        ></div>
        <div
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-500/10 rounded-full blur-[120px]"
        ></div>
      </div>
    </div>

    <!-- Category Menu -->
    <div class="max-w-7xl mx-auto px-6 mb-12">
      <div class="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar border-b border-zinc-900">
        <button
          @click="selectCategory('')"
          :class="[
            'px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border',
            !activeCategory
              ? 'bg-green-500 text-white border-green-400 shadow-lg shadow-green-500/20'
              : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300'
          ]"
        >
          {{ $t('all') }}
        </button>
        <button
          v-for="cat in categories"
          :key="cat"
          @click="selectCategory(cat)"
          :class="[
            'px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border capitalize',
            activeCategory === cat
              ? 'bg-green-500 text-white border-green-400 shadow-lg shadow-green-500/20'
              : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300'
          ]"
        >
          {{ formatCategory(cat) }}
        </button>
      </div>
    </div>

    <!-- Product Section -->
    <div id="products-section" class="max-w-7xl mx-auto px-6">
      <div
        class="flex items-end justify-between mb-12 border-b border-zinc-900 pb-8"
      >
        <div>
          <h2
            class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2"
          >
            {{ activeSearchQuery ? $t('active_search') : $t('products') }}
          </h2>
          <div class="flex items-center gap-4">
            <h3 class="text-3xl md:text-5xl font-black uppercase tracking-tighter">
              {{ activeSearchQuery ? `"${activeSearchQuery}"` : $t('products') }}
            </h3>
            <span
              class="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-400"
            >
              {{ products.length }} {{ $t('items') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Products Grid -->
      <div
        v-if="!loading && products.length === 0"
        class="py-20 text-center border-2 border-dashed border-zinc-900 rounded-3xl"
      >
        <p class="text-zinc-600 font-black uppercase tracking-widest text-xs">
          {{ $t('no_results') }}
        </p>
      </div>

      <!-- Loading/Error States -->
      <div
        v-if="loading"
        class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8"
      >
        <div
          v-for="i in 8"
          :key="i"
          class="premium-card h-[350px] animate-pulse bg-zinc-900/50"
        ></div>
      </div>

      <div
        v-else-if="error"
        class="premium-card p-12 text-center bg-red-500/5 border-red-500/20"
      >
        <i
          class="bi bi-exclamation-octagon text-5xl text-red-500 mb-6 inline-block"
        ></i>
        <h3 class="text-xl font-bold text-white mb-2 uppercase">{{ error }}</h3>
        <button
          @click="fetchProducts"
          class="text-green-500 font-black text-[10px] uppercase tracking-widest hover:underline mt-4"
        >
          Qayta urinish
        </button>
      </div>

      <!-- Product Grid -->
      <div
        v-else
        class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8"
      >
        <router-link
          v-for="item in products"
          :key="item.id"
          :to="{ name: 'food-detail', params: { id: item.id } }"
          class="premium-card group"
        >
          <div class="aspect-[4/3] overflow-hidden rounded-t-2xl relative">
            <img
              :src="getProductImage(item.image)"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              alt=""
            />
            <div
              class="absolute top-4 right-4 bg-zinc-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-zinc-800"
            >
              <span class="text-green-500 font-black text-sm font-mono">
                {{ formatPrice(item.price, item.currency) }}
              </span>
            </div>
            <div
              class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-0 group-hover:opacity-60 transition-opacity"
            ></div>
          </div>

          <div class="p-4 sm:p-6">
            <div class="mb-4">
              <span
                class="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1 block"
                >{{ item.category || "Katalog" }}</span
              >
              <h3
                class="text-sm sm:text-xl font-black text-white group-hover:text-green-500 transition-colors uppercase tracking-tight leading-tight"
              >
                {{ item.name }}
              </h3>
            </div>

            <div
              class="flex items-center justify-between pt-4 border-t border-zinc-900"
            >
              <span
                class="text-[10px] font-bold text-zinc-600 uppercase tracking-widest"
              >
                {{ item.unit || "Dona" }}
              </span>
              <div
                class="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-500 border border-zinc-800 shadow-sm group-hover:bg-green-500 group-hover:text-white group-hover:border-green-400 transition-all transform group-hover:scale-110"
              >
                <i class="bi bi-arrow-right-short text-2xl"></i>
              </div>
            </div>
          </div>
        </router-link>

        <!-- Empty State -->
        <div
          v-if="products.length === 0 && !loading"
          class="col-span-full py-32 text-center text-zinc-600"
        >
          <i class="bi bi-search text-6xl mb-6 block opacity-20"></i>
          <p class="text-xl font-black uppercase tracking-tight mb-2">
            <template v-if="$route.query.search">
              "{{ $route.query.search }}" bo'yicha natija topilmadi
            </template>
            <template v-else>Hozircha do'kon bo'sh...</template>
          </p>
          <p class="text-sm font-medium">
            <template v-if="$route.query.search">Boshqa so'z bilan qidiring.</template>
            <template v-else>Tez orada yangi mahsulotlar qo'shiladi.</template>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import loader from "@/components/loader.vue";
import { getProductImage } from "@/utils/imageUtils";



export default {
  name: "HomeView",
  components: {
    loader,
  },
  data() {
    return {
      products: [],
      categories: [],
      activeCategory: "",
      loading: false,
      error: null,
    };
  },
  mounted() {
    this.fetchCategories();
    this.activeCategory = this.$route.query.category || "";
    this.fetchProducts(this.$route.query.search || "", this.activeCategory);
  },
  watch: {
    "$route.query.search"(newVal) {
      this.fetchProducts(newVal || "", this.activeCategory);
    },
    "$route.query.category"(newVal) {
      this.activeCategory = newVal || "";
      this.fetchProducts(this.$route.query.search || "", newVal || "");
    },
  },
  methods: {
    getProductImage,
    async fetchCategories() {
      try {
        const response = await axios.get("/api/products/categories");
        if (response.data.success) {
          this.categories = response.data.data;
        }
      } catch (err) {
        console.error("Fetch categories failed:", err);
      }
    },
    async fetchProducts(search = "", category = "") {
      this.loading = true;
      this.error = null;
      try {
        const params = {};
        if (search) params.search = search;
        if (category) params.category = category;
        params.lang = this.$i18n.locale;

        const response = await axios.get("/api/products", {
          params,
          timeout: 60000,
        });

        if (response.data.success) {
          this.products = response.data.data;
        } else if (Array.isArray(response.data)) {
          this.products = response.data;
        }
      } catch (err) {
        console.error("Fetch products failed:", err);
        this.error =
          err.response?.data?.message ||
          "Mahsulotlarni yuklashda xatolik yuz berdi.";
      } finally {
        this.loading = false;
      }
    },
    formatPrice(price, currency) {
      if (!price) return "0";
      if (currency === "UZS") return `${price.toLocaleString()} SO'M`;
      const symbol = currency === "USD" ? "$" : currency === "RUB" ? "₽" : "$";
      return `${symbol}${price}`;
    },
    scrollToProducts() {
      document
        .getElementById("products-section")
        ?.scrollIntoView({ behavior: "smooth" });
    },
    selectCategory(category) {
      const query = { ...this.$route.query };
      if (category) {
        query.category = category;
      } else {
        delete query.category;
      }
      this.$router.push({ query });
    },
    formatCategory(cat) {
      if (!cat) return "";
      return cat.replace(/-/g, " ");
    },
  },
};
</script>
<style scoped>
.home-view {
  background: radial-gradient(
    circle at top right,
    rgba(34, 197, 94, 0.03),
    transparent 800px
  );
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
