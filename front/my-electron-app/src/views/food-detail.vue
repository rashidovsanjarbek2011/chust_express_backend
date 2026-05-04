<template>
  <div class="food-detail pt-20 min-h-screen bg-zinc-950 text-white">
    <!-- Loading state -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-32">
      <div
        class="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"
      ></div>
      <p class="mt-4 text-zinc-500 font-bold uppercase tracking-widest text-xs">
        {{$t('loading')}}
      </p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="max-w-4xl mx-auto p-4 py-20">
      <div class="premium-card p-10 text-center">
        <div
          class="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <i class="bi bi-exclamation-triangle text-4xl"></i>
        </div>
        <h3 class="text-2xl font-black mb-2 uppercase">Xatolik yuz berdi</h3>
        <p class="text-zinc-500 mb-8">{{ error }}</p>
        <div class="flex gap-4 justify-center">
          <button
            @click="fetchFoodDetails"
            class="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs rounded-xl transition-all"
          >
            {{$t('retry')}}
          </button>
          <router-link
            to="/"
            class="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-black uppercase text-xs rounded-xl transition-all"
          >
            {{$t('home')}}
          </router-link>
        </div>
      </div>
    </div>

    <!-- Food details -->
    <div v-else-if="food" class="max-w-7xl mx-auto p-6 lg:p-12">
      <!-- Layout container -->
      <div class="flex flex-col lg:flex-row gap-12">
        <!-- Left: Image Section -->
        <div class="lg:w-1/2">
          <div class="premium-card overflow-hidden group relative">
            <!-- Main Image Display -->
            <div
              class="relative w-full aspect-[4/3] overflow-hidden"
              @touchstart="handleTouchStart"
              @touchend="handleTouchEnd"
            >
              <img
                v-if="currentImage && currentImage !== 'https://placehold.co/400x300?text=No+Image'"
                :src="currentImage"
                :alt="food?.name || 'Product image'"
                class="w-full h-full object-cover transition-transform duration-500"
                :class="{ 'scale-105': isImageZoomed }"
                @error="handleImageError"
              />
              <!-- Fallback for broken images -->
              <div
                v-else
                class="w-full h-full bg-zinc-800 flex items-center justify-center"
              >
                <div class="text-center text-zinc-500">
                  <i class="bi bi-image text-6xl mb-4 block"></i>
                  <p class="text-sm font-bold uppercase tracking-widest">Rasm mavjud emas</p>
                    <p class="text-sm font-bold uppercase tracking-widest">{{$t('no_image')}}</p>
                  <span v-if="food && food.image" class="block text-xs mt-2">(Image data: {{ food.image }})</span>
                </div>
              </div>

              <!-- Loading overlay for image transitions -->
              <div
                v-if="imageLoading"
                class="absolute inset-0 bg-zinc-900/50 flex items-center justify-center"
              >
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            </div>

            <div class="absolute top-6 right-6">
              <span
                v-if="food.stock > 0"
                class="px-4 py-2 bg-green-500 text-white font-black uppercase text-xs rounded-full shadow-lg"
              >
                {{ food.stock }}
                {{
                  food.unit === "pcs"
                    ? "ta"
                    : food.unit === "kg"
                      ? "kg"
                      : food.unit === "g"
                        ? "g"
                        : food.unit === "l"
                          ? "l"
                          : food.unit === "ml"
                            ? "ml"
                            : food.unit === "m"
                              ? "m"
                              : food.unit === "cm"
                                ? "cm"
                                : food.unit
                }}
                qoldi
              </span>
              <span
                v-else
                class="px-4 py-2 bg-red-600 text-white font-black uppercase text-xs rounded-full shadow-lg"
              >
                Tugagan
              </span>
            </div>

            <!-- Navigation Arrows (only show if multiple images) -->
            <div v-if="validImages.length > 1" class="absolute inset-0 flex items-center justify-between px-4">
              <button
                @click="previousImage"
                class="w-12 h-12 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all transform hover:scale-110 shadow-lg"
              >
                <i class="bi bi-chevron-left text-xl"></i>
              </button>
              <button
                @click="nextImage"
                class="w-12 h-12 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all transform hover:scale-110 shadow-lg"
              >
                <i class="bi bi-chevron-right text-xl"></i>
              </button>
            </div>

            <!-- Image Counter -->
            <div v-if="validImages.length > 1" class="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div class="bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                <span class="text-white text-sm font-bold">
                  {{ currentImageIndex + 1 }} / {{ validImages.length }}
                </span>
              </div>
            </div>
          </div>

          <!-- Image Thumbnails Slider -->
          <div v-if="validImages.length > 1" class="mt-4">
            <div class="relative">
              <!-- Thumbnail Navigation -->
              <button
                v-if="canScrollLeft"
                @click="scrollThumbnails('left')"
                class="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all"
              >
                <i class="bi bi-chevron-left"></i>
              </button>

              <!-- Thumbnails Container -->
              <div
                ref="thumbnailsContainer"
                class="flex gap-2 overflow-x-auto scrollbar-hide px-10"
                style="scroll-behavior: smooth;"
              >
                <button
                  v-for="(image, index) in validImages"
                  :key="index"
                  @click="goToImage(index)"
                  class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all transform hover:scale-105"
                  :class="currentImageIndex === index ? 'border-green-500 ring-2 ring-green-500/30' : 'border-zinc-700 hover:border-zinc-500'"
                >
                  <img
                    :src="image"
                    :alt="`${food?.name || 'Product'} ${index + 1}`"
                    class="w-full h-full object-cover"
                    @error="handleThumbnailError(index)"
                  />
                </button>
              </div>

              <button
                v-if="canScrollRight"
                @click="scrollThumbnails('right')"
                class="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all"
              >
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>

          <!-- Dot Indicators (alternative to thumbnails for mobile) -->
          <div v-if="validImages.length > 1" class="flex justify-center gap-2 mt-4 lg:hidden">
            <button
              v-for="(image, index) in validImages"
              :key="index"
              @click="goToImage(index)"
              class="w-3 h-3 rounded-full transition-all"
              :class="currentImageIndex === index ? 'bg-green-500' : 'bg-zinc-600 hover:bg-zinc-500'"
            ></button>
          </div>

          <!-- Quick Actions Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <div class="premium-card p-6 flex flex-col justify-between">
              <span
                class="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-4"
                >{{$t('buy')}}</span
              >
              <div class="flex items-center gap-4 mb-6">
                <button
                  @click="quantity > 1 ? quantity-- : null"
                  class="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition"
                >
                  -
                </button>
                <input
                  v-model.number="quantity"
                  readonly
                  class="bg-transparent text-center text-xl font-black w-12 outline-none"
                />
                <button
                  @click="quantity < food.stock ? quantity++ : null"
                  class="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition"
                >
                  +
                </button>
              </div>
              <button
                @click="addToCart"
                :disabled="food.stock === 0"
                class="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
              >
                <i class="bi bi-cart-plus text-lg"></i>
                {{$t('add_to_cart')}}
              </button>
            </div>

            <div class="flex flex-col gap-4">
              <button
                @click="shareProduct"
                class="premium-card flex-1 p-6 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
              >
                <div class="flex items-center gap-4">
                  <div
                    class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center"
                  >
                    <i class="bi bi-share"></i>
                  </div>
                  <span class="font-black uppercase text-xs tracking-widest"
                    >Ulashish</span
                  >
                </div>
                <i class="bi bi-chevron-right text-zinc-600"></i>
              </button>

              <button
                v-if="canManageProduct"
                @click="openEditModal"
                class="premium-card flex-1 p-6 flex items-center justify-between hover:bg-zinc-800/50 transition-colors border-blue-500/20"
              >
                <div class="flex items-center gap-4">
                  <div
                    class="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center"
                  >
                    <i class="bi bi-pencil-square"></i>
                  </div>
                  <span class="font-black uppercase text-xs tracking-widest"
                    >Tahrirlash</span
                  >
                </div>
                <i class="bi bi-chevron-right text-zinc-600"></i>
              </button>

              <button
                v-if="canManageProduct"
                @click="removeProduct"
                class="premium-card flex-1 p-6 flex items-center justify-between hover:bg-red-500/10 transition-colors border-red-500/20 group/del"
              >
                <div class="flex items-center gap-4 text-red-500">
                  <div
                    class="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/20"
                  >
                    <i class="bi bi-trash"></i>
                  </div>
                  <span class="font-black uppercase text-xs tracking-widest"
                    >O'chirish</span
                  >
                </div>
                <i
                  class="bi bi-chevron-right text-zinc-600 group-hover/del:text-red-500"
                ></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Right: Info Section -->
        <div class="lg:w-1/2 space-y-8">
          <div>
            <div class="flex items-center gap-3 mb-4">
              <span
                class="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase rounded-full tracking-widest"
                >Trendda</span
              >
              <span
                class="px-3 py-1 bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase rounded-full tracking-widest"
                >{{ food.category || "Maxsulot" }}</span
              >
            </div>
            <h1
              class="text-5xl lg:text-6xl font-black mb-4 uppercase tracking-tighter leading-tight"
            >
              {{ food.name }}
            </h1>
            <p class="text-5xl font-black text-green-500 tracking-tighter">
              {{
                food.currency = "UZS"
                  
              }}{{ food.price }}
              <span v-if="food.currency" class="text-2xl opacity-70"
                >{{ food.currency }}</span
              >
              <span class="text-xl text-zinc-500 lowercase"
                >/{{ food.unit || "pcs" }}</span
              > 

            </p>
          </div>

          <div class="premium-card p-8">
            <h3
              class="text-zinc-500 font-black uppercase text-xs tracking-[0.2em] mb-4"
            >
              Tavsif
            </h3>
            <p class="text-zinc-300 leading-relaxed text-lg">
              {{
                food.description ||
                "Ushbu mahsulot uchun tavsif hali kiritilmagan. Batafsil ma'lumot olish uchun do'kon egasi bilan bog'laning."
              }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div v-if="food.unit === 'pcs'" class="premium-card p-6">
              <p
                class="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-1"
              >
                Vazn
              </p>
              <p class="text-2xl font-black">
                {{ food.weight || 1.0 }}
                <span class="text-sm font-normal text-zinc-500 uppercase"
                  >kg</span
                >
              </p>
            </div>
            <div
              :class="[
                food.unit === 'pcs'
                  ? 'premium-card p-6'
                  : 'premium-card p-6 col-span-2',
              ]"
            >
              <p
                class="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-1"
              >
                Holati
              </p>
              <div
                v-if="food.isActive"
                class="flex items-center gap-2 text-green-500"
              >
                <span
                  class="w-2 h-2 rounded-full bg-green-500 animate-pulse"
                ></span>
                <span class="text-xl font-black uppercase">Sotuvda</span>
              </div>
              <div v-else class="flex items-center gap-2 text-red-500">
                <span class="w-2 h-2 rounded-full bg-red-500"></span>
                <span class="text-xl font-black uppercase">To'xtatilgan</span>
              </div>
            </div>
          </div>

          <div
            v-if="food.owner"
            class="premium-card p-8 flex items-center justify-between"
          >
            <div class="flex items-center gap-6">
              <div
                class="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-green-500/20"
              >
                {{ food.owner.username?.charAt(0).toUpperCase() || "U" }}
              </div>
              <div>
                <p
                  class="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-1"
                >
                  Sotuvchi
                </p>
                <h4 class="text-2xl font-black">{{ food.owner.username }}</h4>
              </div>
            </div>
            <div class="hidden sm:block text-right">
              <p
                class="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-1"
              >
                Kontakt
              </p>
              <p class="font-black text-xs text-zinc-300">
                {{ food.owner.email }}
              </p>
            </div>
          </div>
          <div
            v-if="food.owner"
            class="adress premium-card p-8 flex items-center justify-between"
          >
            <div class="flex items-center gap-6">
              <div
                class="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-green-500/20"
              >
                ✔
              </div>
              <div>
                <p
                  class="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-1"
                >
                  Do'kon manzili
                </p>
                <h4 class="text-2xl font-black">{{ food.shopAddress || food.owner?.address || "N / A" }}</h4>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>

    <!-- Not found (if handled by v-else-if above) -->

    <!-- Not found -->
    <div v-else class="max-w-4xl mx-auto p-4 text-center py-12">
      <svg
        class="mx-auto h-16 w-16 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">
        Mahsulot topilmadi
      </h3>
      <p class="mt-2 text-gray-600 dark:text-gray-300">
        Iltimos, bosh sahifadan mahsulot tanlang.
      </p>
      <div class="mt-6">
        <router-link
          to="/"
          class="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:outline-none focus:border-blue-700 focus:ring ring-blue-300 disabled:opacity-25 transition ease-in-out duration-150"
        >
          Bosh sahifaga qaytish
        </router-link>
      </div>
    </div>

    <!-- Edit Modal -->
    <div
      v-if="editMode"
      class="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <div
        class="bg-zinc-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 md:p-8 text-white"
      >
        <div
          class="flex justify-between items-center mb-6 border-b border-zinc-700 pb-4"
        >
          <h2 class="text-2xl font-bold">Mahsulotni tahrirlash</h2>
          <button
            @click="editMode = false"
            class="text-gray-400 hover:text-white text-3xl"
          >
            &times;
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Nomi:</label>
            <input
              v-model="editForm.name"
              type="text"
              class="w-full p-3 rounded-xl bg-zinc-700 border border-zinc-600 outline-none focus:border-blue-500"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Narxi ($):</label>
              <input
                v-model.number="editForm.price"
                type="number"
                step="0.01"
                class="w-full p-3 rounded-xl bg-zinc-700 border border-zinc-600 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1"
                >Yetkazib berish ($):</label
              >
              <input
                v-model.number="editForm.deliveryPrice"
                type="number"
                step="0.01"
                class="w-full p-3 rounded-xl bg-zinc-700 border border-zinc-600 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1"
                >Soni (Stock):</label
              >
              <input
                v-model.number="editForm.stock"
                type="number"
                class="w-full p-3 rounded-xl bg-zinc-700 border border-zinc-600 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div
            class="grid"
            :class="[food.unit === 'pcs' ? 'grid-cols-2 gap-4' : 'grid-cols-1']"
          >
            <div v-if="food.unit === 'pcs'">
              <label class="block text-sm font-medium mb-1">Vazni (kg):</label>
              <input
                v-model.number="editForm.weight"
                type="number"
                step="0.1"
                class="w-full p-3 rounded-xl bg-zinc-700 border border-zinc-600 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Kategoriya:</label>
              <input
                v-model="editForm.category"
                type="text"
                class="w-full p-3 rounded-xl bg-zinc-700 border border-zinc-600 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Do'kon manzili:</label>
            <input
              v-model="editForm.shopAddress"
              type="text"
              class="w-full p-3 rounded-xl bg-zinc-700 border border-zinc-600 outline-none focus:border-blue-500"
            />
          </div>

          <!-- Currency and Unit -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Valyuta:</label>
              <select
                v-model="editForm.currency"
                class="w-full p-3 rounded-xl bg-zinc-700 border border-zinc-600 outline-none focus:border-blue-500"
              >
                <option value="UZS">UZS (So'm)</option>
                <option value="USD">USD ($)</option>
                <option value="RUB">RUB (₽)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Birligi:</label>
              <select
                v-model="editForm.unit"
                class="w-full p-3 rounded-xl bg-zinc-700 border border-zinc-600 outline-none focus:border-blue-500"
              >
                <option value="pcs">Dona (pcs)</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="g">Gram (g)</option>
                <option value="l">Litr (l)</option>
                <option value="ml">Millilitr (ml)</option>
                <option value="m">Metr (m)</option>
                <option value="cm">Santimetr (cm)</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Rasmlar (URL):</label>
            <div v-for="(img, idx) in editForm.images" :key="idx" class="flex items-center gap-2 mb-2">
              <input
                v-model="editForm.images[idx]"
                type="text"
                placeholder="Rasm URL..."
                class="flex-1 p-3 rounded-xl bg-zinc-700 border border-zinc-600 outline-none focus:border-blue-500"
              />
              <button
                v-if="editForm.images.length > 1"
                @click.prevent="editForm.images.splice(idx, 1)"
                class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                title="Rasmni olib tashlash"
              >-</button>
            </div>
            <button
              @click.prevent="editForm.images.push('')"
              class="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >+ Rasm qo'shish</button>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Tavsif:</label>
            <textarea
              v-model="editForm.description"
              rows="4"
              class="w-full p-3 rounded-xl bg-zinc-700 border border-zinc-600 outline-none focus:border-blue-500 resize-none"
            ></textarea>
          </div>

          <div class="flex items-center gap-2">
            <input
              v-model="editForm.isActive"
              type="checkbox"
              id="isActive"
              class="w-5 h-5 accent-blue-500"
            />
            <label for="isActive" class="text-sm font-medium"
              >Sotuvda faol (Active)</label
            >
          </div>
        </div>

        <div class="mt-8 flex gap-4">
          <button
            @click="editMode = false"
            class="flex-1 py-3 px-6 rounded-xl bg-zinc-700 hover:bg-zinc-600 font-bold transition"
          >
            Bekor qilish
          </button>
          <button
            @click="saveChanges"
            :disabled="saving"
            class="flex-1 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold transition disabled:opacity-50"
          >
            {{ saving ? "Saqlanmoqda..." : "Saqlash" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRoute } from "vue-router";
import axios from "axios";
import toast from "@/services/toast";
import { getProductImage, getAllProductImages } from "@/utils/imageUtils";



export default {
  setup() {
    const route = useRoute();
    return { route };
  },
  data() {
    return {
      food: null,
      loading: false,
      error: null,
      quantity: 1,
      currentUser: null,
      editMode: false,
      saving: false,
      currentImageIndex: 0, // For image gallery navigation
      imageLoading: false,
      isImageZoomed: false,
      touchStartX: 0,
      touchEndX: 0,
      editForm: {
        name: "",
        price: 0,
        stock: 0,
        weight: 1.0,
        category: "",
        images: [""],
        description: "",
        isActive: true,
        currency: "UZS",
        deliveryPrice: 0,
        unit: "pcs",
        shopAddress: "",
      },
    };
  },
  computed: {
    canManageProduct() {
      if (!this.currentUser || !this.food) return false;
      const isAllowedRole = [
        "shop_worker",
        "shop_owner",
        "administrator",
      ].includes(this.currentUser.role);
      const isOwner = this.currentUser.id === this.food.ownerId;
      const isAdmin = this.currentUser.role === "administrator";
      return isAllowedRole && (isOwner || isAdmin);
    },
    foodImages() {
      if (!this.food) return [];
      // Prefer images array, fallback to image string for legacy
      if (this.food.images && Array.isArray(this.food.images)) {
        return getProductImage(this.food.images, true);
      }
      return getProductImage(this.food.image, true);
    },
    validImages() {
      // Filter out null, undefined, or placeholder images
      return this.foodImages.filter(img =>
        img &&
        img !== 'https://placehold.co/400x300?text=No+Image' &&
        img !== 'null' &&
        img !== 'undefined'
      );
    },
    currentImage() {
      if (!this.food) return "";

      if (this.validImages.length > 0) {
        const safeIndex = Math.min(this.currentImageIndex, this.validImages.length - 1);
        return this.validImages[safeIndex];
      }

      // If there are no valid images, fall back to the first returned image (including placeholder)
      const firstImage = this.foodImages[0] || "https://placehold.co/400x300?text=No+Image";
      return firstImage;
    },
    canScrollLeft() {
      if (!this.$refs.thumbnailsContainer) return false;
      return this.$refs.thumbnailsContainer.scrollLeft > 0;
    },
    canScrollRight() {
      if (!this.$refs.thumbnailsContainer) return false;
      const container = this.$refs.thumbnailsContainer;
      return container.scrollLeft < container.scrollWidth - container.clientWidth;
    },
  },
  mounted() {
    this.loadCurrentUser();
    this.fetchFoodDetails();
  },
  watch: {
    "$route.params.id": {
      handler() {
        this.fetchFoodDetails();
      },
      immediate: true,
    },
    food(newFood, oldFood) {
      if (!oldFood || newFood?.id !== oldFood?.id) {
        // reset image index when product changes
        this.currentImageIndex = 0;
      }
    },
    validImages(newImages) {
      if (newImages.length > 0 && this.currentImageIndex >= newImages.length) {
        this.currentImageIndex = 0;
      }
    },
  },
  methods: {
    handleImageError(e) {
      e.target.src = 'https://placehold.co/400x300?text=No+Image';
      // eslint-disable-next-line no-console
      if (this.food && this.food.name) {
        console.warn(`Main image missing or broken for food: ${this.food.name} (ID: ${this.food.id})`, this.food.image);
      }
    },
    handleThumbnailError(index) {
      return (e) => {
        e.target.src = 'https://placehold.co/400x300?text=No+Image';
        // eslint-disable-next-line no-console
        if (this.food && this.food.name) {
          console.warn(`Thumbnail image missing or broken for food: ${this.food.name} (ID: ${this.food.id}), index: ${index}`, this.validImages);
        }
      };
    },
    // Touch/swipe handling for mobile
    handleTouchStart(e) {
      this.touchStartX = e.changedTouches[0].screenX;
    },
    handleTouchEnd(e) {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    },
    handleSwipe() {
      if (this.validImages.length <= 1) return;

      const swipeThreshold = 50;
      const swipeDistance = this.touchStartX - this.touchEndX;

      if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
          // Swipe left - next image
          this.nextImage();
        } else {
          // Swipe right - previous image
          this.previousImage();
        }
      }
    },

    // Image navigation methods
    previousImage() {
      if (this.validImages.length <= 1) return;
      this.imageLoading = true;
      this.currentImageIndex = this.currentImageIndex > 0
        ? this.currentImageIndex - 1
        : this.validImages.length - 1;
      setTimeout(() => this.imageLoading = false, 300);
    },
    nextImage() {
      if (this.validImages.length <= 1) return;
      this.imageLoading = true;
      this.currentImageIndex = this.currentImageIndex < this.validImages.length - 1
        ? this.currentImageIndex + 1
        : 0;
      setTimeout(() => this.imageLoading = false, 300);
    },
    goToImage(index) {
      if (index < 0 || index >= this.validImages.length) return;
      this.imageLoading = true;
      this.currentImageIndex = index;
      setTimeout(() => this.imageLoading = false, 300);
    },

    // Thumbnail scrolling
    scrollThumbnails(direction) {
      if (!this.$refs.thumbnailsContainer) return;
      const container = this.$refs.thumbnailsContainer;
      const scrollAmount = 200; // Adjust scroll distance as needed

      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    },

    // Error handling
    handleImageError() {
      console.warn('Main image failed to load:', this.currentImage);
      // Could implement fallback logic here
    },
    handleThumbnailError(index) {
      console.warn(`Thumbnail ${index} failed to load:`, this.validImages[index]);
      // Could replace with placeholder or remove from array
    },
    async fetchFoodDetails() {
      this.loading = true;
      this.error = null;

      try {
        const productId = this.route.params.id;

        // Fetch from your backend API
        const response = await axios.get(`/api/products/${productId}`, {
          params: { lang: this.$i18n.locale },
          timeout: 60000,
        });

        // Handle different response formats
        if (response.data.success && response.data.data) {
          this.food = response.data.data;
        } else if (response.data) {
          // Backwards compatibility
          this.food = response.data;
        } else {
          throw new Error("Mahsulot topilmadi");
        }
      } catch (err) {
        console.error("Error fetching food details:", err);

        if (err.response?.status === 404) {
          this.error = "Mahsulot topilmadi";
        } else if (err.response?.data?.message) {
          this.error = err.response.data.message;
        } else if (err.code === "ECONNABORTED") {
          this.error = "Serverga ulanish vaqti tugadi";
        } else if (err.request) {
          this.error =
            "Serverga ulanib bo'lmadi. Server ishlayotganiga ishonch hosil qiling.";
        } else {
          this.error = "Mahsulotni yuklashda xato yuz berdi";
        }

        this.food = null;
      } finally {
        this.loading = false;
      }
    },

    formatDate(dateString) {
      if (!dateString) return "Noma'lum";
      const date = new Date(dateString);
      return date.toLocaleDateString("uz-UZ", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    addToCart() {
      if (!this.food || this.food.stock === 0) {
        toast.error("Mahsulot tugagan yoki mavjud emas!");
        return;
      }

      if (this.quantity < 1 || this.quantity > this.food.stock) {
        toast.warning("Noto'g'ri miqdor kiritildi!");
        return;
      }

      // Get existing cart
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");

      // Check if item already exists
      const existingItemIndex = cart.findIndex(
        (item) => item.id === this.food.id,
      );

      if (existingItemIndex > -1) {
        // Update quantity (but not beyond stock)
        const newQuantity = cart[existingItemIndex].quantity + this.quantity;
        if (newQuantity > this.food.stock) {
          cart[existingItemIndex].quantity = this.food.stock;
        } else {
          cart[existingItemIndex].quantity = newQuantity;
        }
      } else {
        // Add new item
        cart.push({
          id: this.food.id,
          name: this.food.name,
          price: this.food.price,
          image: this.food.image,
          quantity: this.quantity,
          stock: this.food.stock,
          currency: this.food.currency,
          unit: this.food.unit,
          shopAddress: this.food.shopAddress || "",
          deliveryPrice: this.food.deliveryPrice || 0,
        });
      }

      // Save to localStorage
      localStorage.setItem("cart", JSON.stringify(cart));

      // Dispatch event to update navbar
      window.dispatchEvent(new Event("cartUpdated"));

      toast.success(
        `"${this.food.name}"dan ${this.quantity} ta savatga qo'shildi!`,
      );
    },

    loadCurrentUser() {
      try {
        const user = localStorage.getItem("user");
        if (user) {
          this.currentUser = JSON.parse(user);
        }
      } catch (e) {
        console.error("Error loading user from localStorage:", e);
      }
    },

    openEditModal() {
      this.editForm = {
        name: this.food.name,
        price: this.food.price,
        stock: this.food.stock,
        weight: this.food.weight,
        category: this.food.category,
        images: Array.isArray(this.food.images)
          ? [...this.food.images]
          : (this.food.image ? [this.food.image] : [""]),
        description: this.food.description,
        isActive: this.food.isActive,
        currency: this.food.currency || "UZS",
        deliveryPrice: this.food.deliveryPrice || 0,
        unit: this.food.unit || "pcs",
        shopAddress: this.food.shopAddress || this.food.owner?.address || "",
      };
      this.editMode = true;
    },

    async saveChanges() {
      if (!this.editForm.name || !this.editForm.price) {
        toast.warning("Nom va narx majburiy!");
        return;
      }

      // Clean up images: remove empty strings, trim, etc.
      const images = (this.editForm.images || [])
        .map(img => String(img).trim())
        .filter(img => img);

      this.saving = true;
      try {
        const token = localStorage.getItem("userToken");
        const payload = { ...this.editForm, images };
        delete payload.image; // Remove legacy field if present
        const response = await axios.put(
          `/api/products/${this.food.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.data.success) {
          toast.success("Mahsulot muvaffaqiyatli yangilandi.");
          this.editMode = false;
          this.fetchFoodDetails(); // Refresh details
        }
      } catch (err) {
        console.error("Error saving product:", err);
        toast.error(
          err.response?.data?.message ||
            "Mahsulotni yangilashda xatolik yuz berdi.",
        );
      } finally {
        this.saving = false;
      }
    },

    async removeProduct() {
      if (!confirm("Haqiqatan ham ushbu mahsulotni o'chirmoqchimisiz?")) return;

      try {
        const token = localStorage.getItem("userToken");
        const response = await axios.delete(`/api/products/${this.food.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          toast.success("Mahsulot muvaffaqiyatli o'chirildi.");
          this.$router.push("/");
        } else {
          toast.error(response.data.message || "Xatolik yuz berdi.");
        }
      } catch (err) {
        console.error("Error removing product:", err);
        toast.error(
          err.response?.data?.message ||
            "Mahsulotni o'chirishda xatolik yuz berdi.",
        );
      }
    },

    validateQuantity() {
      if (this.quantity < 1) this.quantity = 1;
      if (this.quantity > this.food.stock) this.quantity = this.food.stock;
    },

    shareProduct() {
      if (navigator.share) {
        navigator.share({
          title: this.food.name,
          text: `"${this.food.name}" narxi: $${this.food.price}`,
          url: window.location.href,
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(window.location.href);
        toast.info("Havola nusxalandi!");
      }
    },
    getProductImage,
  },
};
</script>

<style scoped>
.food-detail {
  min-height: calc(100vh - 5em);
}

/* Hide scrollbar for thumbnail container */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}

/* Smooth transitions for image changes */
.image-transition {
  transition: opacity 0.3s ease-in-out;
}

/* Touch feedback for mobile */
@media (hover: none) and (pointer: coarse) {
  .premium-card button {
    min-height: 44px;
    min-width: 44px;
  }
}
.bg {
  background: rgba(219, 219, 219, 0);
}
img {
  background-color: #f5f5f5;
  transition: transform 0.3s ease;
}

img:hover {
  transform: scale(1.02);
}

.dark img {
  background-color: #2d3748;
}
</style>



