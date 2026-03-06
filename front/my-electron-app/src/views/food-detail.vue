<template>
  <div class="food-detail pt-20 min-h-screen bg-zinc-950 text-white">
    <!-- Loading state -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-32">
      <div
        class="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"
      ></div>
      <p class="mt-4 text-zinc-500 font-bold uppercase tracking-widest text-xs">
        Yuklanmoqda...
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
            Qayta urinish
          </button>
          <router-link
            to="/"
            class="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-black uppercase text-xs rounded-xl transition-all"
          >
            Bosh sahifa
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
            <img
              :src="getProductImage(food.image)"
              :alt="food.name"
              class="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700"
            />
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
          </div>

          <!-- Quick Actions Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <div class="premium-card p-6 flex flex-col justify-between">
              <span
                class="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-4"
                >Sotib olish</span
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
                Savatga qo'shish
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
            <label class="block text-sm font-medium mb-1">Rasm (URL):</label>
            <input
              v-model="editForm.image"
              type="text"
              class="w-full p-3 rounded-xl bg-zinc-700 border border-zinc-600 outline-none focus:border-blue-500"
            />
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
import { getProductImage } from "@/utils/imageUtils";



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
      editForm: {
        name: "",
        price: 0,
        stock: 0,
        weight: 1.0,
        category: "",
        image: "",
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
  },
  methods: {
    async fetchFoodDetails() {
      this.loading = true;
      this.error = null;

      try {
        const id = this.route.params.id;

        // Fetch from your backend API
        const response = await axios.get(`/api/products/${id}`, {
          timeout: 5000,
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
        image: this.food.image,
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

      this.saving = true;
      try {
        const token = localStorage.getItem("userToken");
        const response = await axios.put(
          `/api/products/${this.food.id}`,
          this.editForm,
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
