<template>
  <div
    class="add-product pt-20 min-h-screen bg-zinc-950 text-white p-6 md:p-12"
  >
    <div class="max-w-3xl pt-8 mx-auto">
      <div class="mb-10 text-center">
        <h1
          class="text-4xl font-black text-green-500 tracking-tighter uppercase mb-2"
        >
          Mahsulot Qo'shish
        </h1>
        <p class="text-zinc-500">
          Do'koningiz uchun yangi mahsulot ma'lumotlarini kiriting.
        </p>
      </div>

      <div class="premium-card p-8 md:p-12">
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

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Left Column: Basic Info -->
          <div class="space-y-6">
            <div>
              <label
                class="block text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-2"
                >Mahsulot Nomi</label
              >
              <input
                type="text"
                v-model="productName"
                placeholder="Masalan: Lavash"
                class="w-full bg-zinc-900/50 border border-zinc-800 focus:border-green-500 rounded-xl p-4 text-white outline-none transition-all font-bold"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label
                  class="block text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-2"
                  >Narxi ($)</label
                >
                <input
                  type="number"
                  step="0.01"
                  v-model="productPrice"
                  placeholder="0.00"
                  class="w-full bg-zinc-900/50 border border-zinc-800 focus:border-green-500 rounded-xl p-4 text-white outline-none transition-all font-bold"
                />
              </div>
              <div>
                <label
                  class="block text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-2"
                  >Yetkazib berish narxi</label
                >
                <input
                  type="number"
                  step="0.01"
                  v-model="deliveryPrice"
                  placeholder="0.00"
                  class="w-full bg-zinc-900/50 border border-zinc-800 focus:border-green-500 rounded-xl p-4 text-white outline-none transition-all font-bold"
                />
              </div>
              <div>
                <label
                  class="block text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-2"
                  >Birligi</label
                >
                <select
                  v-model="productUnit"
                  class="w-full bg-zinc-900/50 border border-zinc-800 focus:border-green-500 rounded-xl p-4 text-white outline-none transition-all font-bold appearance-none cursor-pointer"
                >
                  <option value="pcs" class="bg-zinc-950">Dona (pcs)</option>
                  <option value="kg" class="bg-zinc-950">Kilogram (kg)</option>
                  <option value="g" class="bg-zinc-950">Gram (g)</option>
                  <option value="l" class="bg-zinc-950">Litr (l)</option>
                  <option value="ml" class="bg-zinc-950">Millilitr (ml)</option>
                  <option value="m" class="bg-zinc-950">Metr (m)</option>
                  <option value="cm" class="bg-zinc-950">Santimetr (cm)</option>
                  <option value="pack" class="bg-zinc-950">Paket/Pachka</option>
                  <option value="box" class="bg-zinc-950">Quti (box)</option>
                  <option value="portion" class="bg-zinc-950">Porsiya</option>
                </select>
              </div>
              <div>
<label for="category" class="block text-sm mb-[0.3em] font-bold text-gray-500">Category</label>
    <select
      id="category"
      v-model="category"
      class=" w-full bg-zinc-900/50 border border-zinc-800 focus:border-green-500 rounded-xl p-4 text-white outline-none transition-all font-bold appearance-none cursor-pointer"
    >
      <option value="" selected disabled class="block text-white w-full px-4 py-2  bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">Select a category</option>
      <option value="electronics">Electronics</option>
      <option class="bg-zinc-950" value="food">Food</option>
      <option class="bg-zinc-950" value="clothing">Clothing</option>
      <option class="bg-zinc-950" value="home-garden">Home & Garden</option>
      <option class="bg-zinc-950" value="beauty-health">Beauty & Health</option>
      <option class="bg-zinc-950" value="sports">Sports</option>
      <option class="bg-zinc-950" value="toys-games">Toys & Games</option>
      <option class="bg-zinc-950" value="books">Books</option>
      <option class="bg-zinc-950" value="automotive">Automotive</option>
      <option class="bg-zinc-950" value="pets">Pets</option>
      <option class="bg-zinc-950" value="baby-products">Baby Products</option>
      <option class="bg-zinc-950" value="office-supplies">Office Supplies</option>
      <option class="bg-zinc-950" value="jewelry">Jewelry</option>
      <option class="bg-zinc-950" value="music">Music</option>
      <option class="bg-zinc-950" value="movies">Movies</option>
      <option class="bg-zinc-950" value="tools">Tools</option>
      <option class="bg-zinc-950" value="groceries">Groceries</option>
      <option class="bg-zinc-950" value="furniture">Furniture</option>
      <option class="bg-zinc-950" value="shoes">Shoes</option>
      <option class="bg-zinc-950" value="bags-accessories">Bags & Accessories</option>
    </select>
              </div>
              
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div v-if="productUnit === 'pcs'">
                <label
                  class="block text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-2"
                  >Vazni (kg)</label
                >
                <input
                  type="number"
                  step="0.01"
                  v-model="productWeight"
                  placeholder="1.0"
                  class="w-full bg-zinc-900/50 border border-zinc-800 focus:border-green-500 rounded-xl p-4 text-white outline-none transition-all font-bold"
                />
              </div>
              <div v-else>
                <label
                  class="block text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-2"
                  >Zaxira (Soni / Vazni)</label
                >
                <input
                  type="number"
                  v-model="productStock"
                  placeholder="0"
                  class="w-full bg-zinc-900/50 border border-zinc-800 focus:border-green-500 rounded-xl p-4 text-white outline-none transition-all font-bold"
                />
              </div>
            </div>

            <div v-if="productUnit === 'pcs'">
              <label
                class="block text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-2"
                >Zaxira (Soni / Vazni)</label
              >
              <input
                type="number"
                v-model="productStock"
                placeholder="0"
                class="w-full bg-zinc-900/50 border border-zinc-800 focus:border-green-500 rounded-xl p-4 text-white outline-none transition-all font-bold"
              />
            </div>

            <div>
              <label
                class="block text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-2"
                >Tavsif</label
              >
              <textarea
                v-model="description"
                placeholder="Mahsulot haqida qisqacha..."
                rows="4"
                class="w-full bg-zinc-900/50 border border-zinc-800 focus:border-green-500 rounded-xl p-4 text-white outline-none transition-all font-bold resize-none"
              ></textarea>
            </div>
          </div>

          <!-- Right Column: Image Selection -->
          <div class="space-y-6">
            <div>
              <label
                class="block text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-2"
                >Mahsulot Rasmi</label
              >
              <div class="flex gap-4">
                <div
                  class="relative flex-1 aspect-square rounded-2xl border-2 border-dashed border-zinc-800 hover:border-green-500/50 transition-all overflow-hidden flex flex-col items-center justify-center bg-zinc-900/30 group cursor-pointer"
                  @click="$refs.fileInput.click()"
                >
                  <img
                    v-if="productImage"
                    :src="productImage"
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div v-else class="text-center p-6 text-zinc-600">
                    <i class="bi bi-cloud-arrow-up text-5xl mb-2 block"></i>
                    <span
                      class="font-black uppercase text-[10px] tracking-widest block mb-2"
                      >Rasm tanlang</span
                    >
                    <span
                      class="text-[8px] text-zinc-700 font-bold uppercase tracking-widest"
                      >yoki Ctrl+V bilan qo'ying</span
                    >
                  </div>

                  <!-- Overlay for hover -->
                  <div
                    class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <span
                      class="px-4 py-2 bg-white text-black font-black uppercase text-[10px] rounded-full shadow-xl"
                      >O'zgartirish</span
                    >
                  </div>
                </div>

                <div
                  @click="openCamera"
                  class="w-20 aspect-square rounded-2xl border-2 border-zinc-800 hover:border-green-500/50 hover:bg-green-500/5 transition-all flex flex-col items-center justify-center cursor-pointer group"
                >
                  <i
                    class="bi bi-camera text-2xl text-zinc-600 group-hover:text-green-500 transition-colors"
                  ></i>
                  <span
                    class="text-[8px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-green-500 mt-1"
                    >Kamera</span
                  >
                </div>
              </div>
              <input
                type="file"
                ref="fileInput"
                hidden
                accept="image/*"
                @change="onFileSelected"
              />
              <p
                class="mt-4 text-[10px] text-zinc-600 font-bold uppercase tracking-widest text-center italic"
              >
                JPG, PNG yoki WEBP mavjud
              </p>

              <!-- URL Input -->
              <div class="mt-6 border-t border-zinc-800 pt-6">
                <label
                  class="block text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-2"
                  >Yoki Rasm URL Manzili</label
                >
                <div class="relative">
                  <input
                    type="text"
                    v-model="imageUrlInput"
                    @input="updateImageFromUrl"
                    placeholder="https://example.com/image.jpg"
                    class="w-full bg-zinc-900/50 border border-zinc-800 focus:border-green-500 rounded-xl p-4 pl-10 text-white outline-none transition-all font-bold text-sm"
                  />
                  <i
                    class="bi bi-link-45deg absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xl"
                  ></i>
                </div>
                <label
                  class="block mt-[1em] text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-2"
                  >Do'konning aniq manzili</label
                >
                <div class="relative">
                  <input
                    type="text"
                    v-model="shopAddress"
                    @input="updateShopAddress"
                    placeholder="viloyat: ... shahar: ... ko'cha: ... uy: ..."
                    class="w-full bg-zinc-900/50 border border-zinc-800 focus:border-green-500 rounded-xl p-4 pl-10 text-white outline-none transition-all font-bold text-sm"
                  />
                  <i
                    class="bi bi-link-45deg absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xl"
                  ></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Camera Modal -->
        <div
          v-if="showCamera"
          class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div
            class="absolute inset-0 bg-black/90 backdrop-blur-sm"
            @click="closeCamera"
          ></div>
          <div
            class="relative w-full max-w-lg bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl"
          >
            <div
              class="p-6 border-b border-zinc-800 flex justify-between items-center"
            >
              <h3
                class="text-lg font-black uppercase tracking-widest text-white"
              >
                Rasmga Olish
              </h3>
              <button
                @click="closeCamera"
                class="text-zinc-500 hover:text-white transition-colors"
              >
                <i class="bi bi-x-lg text-xl"></i>
              </button>
            </div>

            <div class="relative aspect-square bg-black">
              <video
                ref="video"
                autoplay
                playsinline
                class="w-full h-full object-cover"
              ></video>
            </div>

            <div class="p-8 flex justify-center items-center gap-6">
              <button
                @click="capturePhoto"
                class="w-16 h-16 rounded-full bg-white border-4 border-zinc-300 hover:bg-zinc-100 transition-all flex items-center justify-center"
              >
                <div
                  class="w-12 h-12 rounded-full border-2 border-black/10"
                ></div>
              </button>
            </div>
          </div>
          <canvas ref="canvas" style="display: none"></canvas>
        </div>

        <div class="mt-12">
          <button
            @click="productSaver"
            :disabled="loading"
            class="w-full py-5 bg-green-600 hover:bg-green-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-black uppercase tracking-[0.2em] text-sm rounded-2xl transition-all shadow-xl shadow-green-500/20 flex items-center justify-center gap-3"
          >
            <i v-if="!loading" class="bi bi-plus-lg text-lg"></i>
            <span v-if="loading" class="animate-pulse">Yuborilmoqda...</span>
            <span v-else>Saqlash</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      productName: "",
      productImage: "",
      productPrice: "",
      deliveryPrice: "",
      productStock: "",
      shopAddress: "",
      productUnit: "pcs",
      category: "",
      productCurrency: "UZS",
      productWeight: 1.0,
      description: "",
      error: null,
      success: null,
      loading: false,
      showCamera: false,
      stream: null,
      imageUrlInput: "",
    };
  },
  mounted() {
    // Global paste event listener for the entire page
    window.addEventListener("paste", this.handlePaste);
  },
  methods: {
    async onFileSelected(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        // 2MB Limit
        this.error = "Rasm hajmi 2MB dan oshmasligi kerak.";
        return;
      }

      this.error = null;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.productImage = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    async openCamera() {
      this.error = null;
      this.showCamera = true;
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }, // Use back camera if available
        });
        this.$nextTick(() => {
          if (this.$refs.video) {
            this.$refs.video.srcObject = this.stream;
          }
        });
      } catch (err) {
        console.error("Camera error:", err);
        this.error = "Kameraga ruxsat berilmadi yoki kamera topilmadi.";
        this.showCamera = false;
      }
    },

    capturePhoto() {
      const video = this.$refs.video;
      const canvas = this.$refs.canvas;
      if (!video || !canvas) return;

      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      this.productImage = canvas.toDataURL("image/webp", 0.8);
      this.closeCamera();
    },

    closeCamera() {
      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
        this.stream = null;
      }
      this.showCamera = false;
    },

    async productSaver() {
      this.error = null;
      this.success = null;

      if (
        !this.productName ||
        !this.productImage ||
        !this.productPrice ||
        !this.productStock ||
        !this.shopAddress ||
        !this.category
      ) {
        this.error = "Iltimos barcha maydonlarni to‘ldiring.";
        return;
      }

      try {
        this.loading = true;

        const token = localStorage.getItem("userToken");

        // Try to capture and update seller location automatically
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              await axios.put(
                "/api/auth/profile",
                { latitude, longitude },
                {
                  headers: { Authorization: `Bearer ${token}` },
                },
              );
            } catch (pErr) {
              console.error("Seller profile location update failed:", pErr);
            }
          });
        }

        if (!token) {
          this.error = "Token topilmadi. Iltimos qayta login qiling.";
          return;
        }

        const response = await axios.post(
          "/api/products",
          {
            name: this.productName,
            image: this.productImage, // Base64 or URL
            description: this.description,
            price: parseFloat(this.productPrice),
            deliveryPrice: parseFloat(this.deliveryPrice) || 0,
            stock: parseInt(this.productStock),
            weight:
              this.productUnit === "pcs" ? parseFloat(this.productWeight) : 1.0,
            unit: this.productUnit,
            currency: this.productCurrency,
            shopAddress: this.shopAddress,
            category: String(this.category),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.data.success) {
          this.success = "Mahsulot muvaffaqiyatli qo‘shildi!";
          // Formani tozalash
          this.productName = "";
          this.productImage = "";
          this.imageUrlInput = "";
          this.description = "";
          this.productPrice = "";
          this.deliveryPrice = "";
          this.productStock = "";
          this.productWeight = 1.0;
          this.productUnit = "pcs";
          this.productCurrency = "UZS";
          this.shopAddress = "";
        }
      } catch (err) {
        console.error("Xatolik:", err.response?.data || err.message);
        this.error = err.response?.data?.message || "Xatolik yuz berdi.";
      } finally {
        this.loading = false;
      }
    },
    updateImageFromUrl() {
      if (this.imageUrlInput) {
        this.productImage = this.imageUrlInput;
      }
    },
    handlePaste(event) {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // Check if clipboard contains an image
        if (item.type.indexOf("image") !== -1) {
          event.preventDefault();
          const file = item.getAsFile();
          if (!file) continue;

          // Check file size (2MB limit)
          if (file.size > 2 * 1024 * 1024) {
            this.error = "Rasm hajmi 2MB dan oshmasligi kerak.";
            setTimeout(() => (this.error = null), 3000);
            return;
          }

          this.error = null;
          // Convert to base64
          const reader = new FileReader();
          reader.onload = (e) => {
            this.productImage = e.target.result;
            this.success = "Rasm muvaffaqiyatli qo'shildi!";
            setTimeout(() => (this.success = null), 2000);
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    },
  },
  beforeUnmount() {
    this.closeCamera();
    // Remove paste event listener
    window.removeEventListener("paste", this.handlePaste);
  },
};
</script>

<style scoped lang="scss">
/* No extra scoped styles needed due to Global main.css and Tailwind */
</style>
