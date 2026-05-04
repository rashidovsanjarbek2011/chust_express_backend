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
            'px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border',
            activeCategory === cat
              ? 'bg-green-500 text-white border-green-400 shadow-lg shadow-green-500/20'
              : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300'
          ]"
        >
          {{ getCategoryTranslation(cat) }}
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
              :src="getProductMainImage(item)"
              @error="handleImageError"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              :alt="item.name"
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
                >{{ item.category ? getCategoryTranslation(item.category) : $t('catalog') }}</span
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
                {{ item.unit ? $t(`units.${item.unit}`) : $t('units.pcs') }}
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
              {{$t('no_results_for')}} "{{$route.query.search}}"
            </template>
            <template v-else>{{$t('shop_empty')}}</template>
          </p>
          <p class="text-sm font-medium">
            <template v-if="$route.query.search">{{$t('try_another_word')}}</template>
            <template v-else>{{$t('products_coming_soon')}}</template>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import loader from "@/components/loader.vue";

// Category translations for all 4 languages
const categoryTranslations = {
  // English
  en: {
    products: 'Products',
    items: 'items',
    catalog: 'Catalog',
    pcs: 'pcs',
    error_loading_products: 'Error loading products',
    no_results_for: 'No results for',
    shop_empty: 'Shop is empty',
    try_another_word: 'Try another word',
    products_coming_soon: 'Products coming soon',
    'furniture': 'Furniture',
    'electronics': 'Electronics',
    'food': 'Food',
    'clothing': 'Clothing',
    'home-garden': 'Home & Garden',
    'beauty-health': 'Beauty & Health',
    'sports': 'Sports',
    'toys-games': 'Toys & Games',
    'books': 'Books',
    'automotive': 'Automotive',
    'pets': 'Pets',
    'baby-products': 'Baby Products',
    'office-supplies': 'Office Supplies',
    'jewelry': 'Jewelry',
    'music': 'Music',
    'movies': 'Movies',
    'tools': 'Tools',
    'groceries': 'Groceries',
    'bags-accessories': 'Bags & Accessories',
    'shoes': 'Shoes',
  },
  // Uzbek
  uz: {
    products: 'Mahsulotlar',
    items: 'mahsulot',
    catalog: 'Katalog',
    pcs: 'dona',
    error_loading_products: 'Mahsulotlarni yuklashda xatolik',
    no_results_for: 'uchun natija topilmadi',
    shop_empty: 'Do\'kon bo\'sh',
    try_another_word: 'Boshqa so\'zni sinab ko\'ring',
    products_coming_soon: 'Mahsulotlar tez kunda',
    'furniture': 'Mebel',
    'electronics': 'Elektronika',
    'food': 'Oziq-ovqat',
    'clothing': 'Kiyim',
    'home-garden': 'Uy va Bog\'',
    'beauty-health': 'Go\'zallik va Salomatlik',
    'sports': 'Sport',
    'toys-games': 'O\'yinchoqlar va O\'yinlar',
    'books': 'Kitoblar',
    'automotive': 'Avtomobil',
    'pets': 'Uy hayvonlari',
    'baby-products': 'Bolalar mahsulotlari',
    'office-supplies': 'Ofis jihozlari',
    'jewelry': 'Zargarlik',
    'music': 'Musiqa',
    'movies': 'Filmlar',
    'tools': 'Asboblar',
    'groceries': 'Oziq-ovqat mahsulotlari',
    'bags-accessories': 'Sumkalar va aksessuarlar',
    'shoes': 'Poyabzallar',
  },
  // Russian
  ru: {
    products: 'Продукты',
    items: 'товаров',
    catalog: 'Каталог',
    pcs: 'шт',
    error_loading_products: 'Ошибка загрузки товаров',
    no_results_for: 'Нет результатов для',
    shop_empty: 'Магазин пуст',
    try_another_word: 'Попробуйте другое слово',
    products_coming_soon: 'Товары скоро появятся',
    'furniture': 'Мебель',
    'electronics': 'Электроника',
    'food': 'Еда',
    'clothing': 'Одежда',
    'home-garden': 'Дом и сад',
    'beauty-health': 'Красота и здоровье',
    'sports': 'Спорт',
    'toys-games': 'Игрушки и игры',
    'books': 'Книги',
    'automotive': 'Автомобили',
    'pets': 'Домашние животные',
    'baby-products': 'Детские товары',
    'office-supplies': 'Офисные принадлежности',
    'jewelry': 'Ювелирные изделия',
    'music': 'Музыка',
    'movies': 'Фильмы',
    'tools': 'Инструменты',
    'groceries': 'Бакалея',
    'bags-accessories': 'Сумки и аксессуары',
    'shoes': 'Обувь',
  },
  // Chinese (Simplified)
  zh: {
    products: '产品',
    items: '件产品',
    catalog: '目录',
    pcs: '件',
    error_loading_products: '加载产品时出错',
    no_results_for: '没有结果',
    shop_empty: '商店是空的',
    try_another_word: '尝试另一个词',
    products_coming_soon: '产品即将推出',
    'furniture': '家具',
    'electronics': '电子产品',
    'food': '食品',
    'clothing': '服装',
    'home-garden': '家居与园艺',
    'beauty-health': '美容与健康',
    'sports': '体育用品',
    'toys-games': '玩具与游戏',
    'books': '图书',
    'automotive': '汽车用品',
    'pets': '宠物用品',
    'baby-products': '婴儿用品',
    'office-supplies': '办公用品',
    'jewelry': '珠宝',
    'music': '音乐',
    'movies': '电影',
    'tools': '工具',
    'groceries': '杂货',
    'bags-accessories': '箱包与配饰',
    'shoes': '鞋类',
  }
};

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
      activeSearchQuery: "",
      loading: false,
      error: null,
      page: 1,
      limit: 20,
      totalProducts: 0,
    };
  },
  mounted() {
    this.fetchCategories();
    // ✅ Defensive: ensure search is a string
    const searchParam = this.$route.query.search;
    this.activeSearchQuery = (typeof searchParam === 'string' ? searchParam : '') || "";
    const categoryParam = this.$route.query.category;
    this.activeCategory = (typeof categoryParam === 'string' ? categoryParam : '') || "";
    this.fetchProducts(this.activeSearchQuery, this.activeCategory);
  },
  watch: {
    "$route.query.search"(newVal) {
      // ✅ Defensive: ensure newVal is a string
      const search = (typeof newVal === 'string' ? newVal : '') || "";
      this.activeSearchQuery = search;
      this.fetchProducts(search, this.activeCategory);
    },
    "$route.query.category"(newVal) {
      // ✅ Defensive: ensure newVal is a string
      const category = (typeof newVal === 'string' ? newVal : '') || "";
      this.activeCategory = category;
      this.fetchProducts(this.activeSearchQuery, category);
    },
  },
  methods: {
    /**
     * Get translated category name based on current language
     * Supports: English, Uzbek, Russian, Chinese
     */
    getCategoryTranslation(categoryKey) {
      if (!categoryKey) return '';
      
      // Get current language from i18n (default to 'en')
      const currentLang = this.$i18n?.locale || 'en';
      
      // Normalize the category key (lowercase for lookup)
      const normalizedKey = categoryKey.toLowerCase();
      
      // Try to get translation from the mapping
      const translation = categoryTranslations[currentLang]?.[normalizedKey];
      
      if (translation) {
        return translation;
      }
      
      // If no translation found, try English as fallback
      const englishTranslation = categoryTranslations.en?.[normalizedKey];
      if (englishTranslation) {
        return englishTranslation;
      }
      
      // Ultimate fallback: format the original string nicely
      return normalizedKey
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    },

    /**
     * Get the main product image URL
     * Handles both old format (single image string) and new format (images array)
     */
    getProductMainImage(product) {
      // Check for images array (new format with multiple images)
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        return product.images[0];
      }
      
      // Check for single image string (old format)
      if (product.image && typeof product.image === 'string' && product.image.trim()) {
        return product.image;
      }
      
      // Check if image is a JSON string (from database)
      if (product.image && typeof product.image === 'string') {
        try {
          const parsed = JSON.parse(product.image);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0];
          }
        } catch (e) {
          // Not JSON, treat as regular string
          return product.image;
        }
      }
      
      // Fallback to placeholder
      return 'https://placehold.co/400x300?text=No+Image';
    },

    handleImageError(event) {
      event.target.src = 'https://placehold.co/400x300?text=No+Image';
    },

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

    async fetchProducts(search = "", category = "", page = 1) {
      // ✅ Ensure search and category are strings
      const safeSearch = typeof search === 'string' ? search : '';
      const safeCategory = typeof category === 'string' ? category : '';
      
      this.loading = true;
      this.error = null;
      try {
        const params = {
          page: this.page,
          limit: this.limit,
          lang: this.$i18n?.locale || 'en',
        };
        if (safeSearch) params.search = safeSearch;
        if (safeCategory) params.category = safeCategory;

        const response = await axios.get("/api/products", {
          params,
          timeout: 60000,
        });

        if (response.data.success) {
          let productsData = response.data.data.products || response.data.data;
          
          // Normalize product data to ensure consistent format
          this.products = productsData.map(product => ({
            ...product,
            // Ensure images array exists (convert from image if needed)
            images: product.images || (product.image ? [product.image] : []),
            // Keep image field for backward compatibility (first image as main)
            image: product.images?.[0] || product.image || null
          }));
          
          this.totalProducts = response.data.data.total || this.products.length;
        } else if (Array.isArray(response.data)) {
          this.products = response.data.map(product => ({
            ...product,
            images: product.images || (product.image ? [product.image] : []),
            image: product.images?.[0] || product.image || null
          }));
          this.totalProducts = this.products.length;
        }
      } catch (err) {
        console.error("Fetch products failed:", err);
        this.error = err.response?.data?.message || this.$t('error_loading_products');
      } finally {
        this.loading = false;
      }
    },

    nextPage() {
      if (this.products.length < this.limit) return;
      this.page++;
      this.fetchProducts(this.activeSearchQuery, this.activeCategory, this.page);
    },

    prevPage() {
      if (this.page === 1) return;
      this.page--;
      this.fetchProducts(this.activeSearchQuery, this.activeCategory, this.page);
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

    // Legacy formatCategory method (kept for compatibility, but use getCategoryTranslation instead)
    formatCategory(cat) {
      return this.getCategoryTranslation(cat);
    },
  },
};
</script>

<style scoped lang="scss">
/* No extra scoped styles needed due to Global main.css and Tailwind */
</style>