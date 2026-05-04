<template>
  <div
    class="add-product pt-20 min-h-screen bg-zinc-950 text-white p-6 md:p-12"
  >
    <div class="max-w-3xl pt-8 mx-auto">
      <div class="mb-10 text-center">
        <h1
          class="text-4xl font-black text-green-500 tracking-tighter uppercase mb-2"
        >
          {{ $t('products.add_product_title') }}
        </h1>
        <p class="text-zinc-500">
          {{ $t('products.add_product_subtitle') }}
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
                >{{ $t('products.product_name') }}</label
              >
              <input
                type="text"
                v-model="productName"
                :placeholder="$t('products.product_name_placeholder')"
                class="w-full bg-zinc-900/50 border border-zinc-800 focus:border-green-500 rounded-xl p-4 text-white outline-none transition-all font-bold"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label
                  class="block text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-2"
                  >{{ $t('products.price') }}</label
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
                  >{{ $t('products.delivery_price') }}</label
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
                  >{{ $t('products.unit') }}</label
                >
                <select
                  v-model="productUnit"
                  class="w-full bg-zinc-900/50 border border-zinc-800 focus:border-green-500 rounded-xl p-4 text-white outline-none transition-all font-bold appearance-none cursor-pointer"
                >
                  <option value="pcs" class="bg-zinc-950">{{ $t('units.pcs') }}</option>
                  <option value="kg" class="bg-zinc-950">{{ $t('units.kg') }}</option>
                  <option value="g" class="bg-zinc-950">{{ $t('units.g') }}</option>
                  <option value="l" class="bg-zinc-950">{{ $t('units.l') }}</option>
                  <option value="ml" class="bg-zinc-950">{{ $t('units.ml') }}</option>
                  <option value="m" class="bg-zinc-950">{{ $t('units.m') }}</option>
                  <option value="cm" class="bg-zinc-950">{{ $t('units.cm') }}</option>
                  <option value="pack" class="bg-zinc-950">{{ $t('units.pack') }}</option>
                  <option value="box" class="bg-zinc-950">{{ $t('units.box') }}</option>
                  <option value="portion" class="bg-zinc-950">{{ $t('units.portion') }}</option>
                </select>
              </div>
              <div>
                <label for="category" class="block text-sm mb-[0.3em] font-bold text-gray-500">{{ $t('products.category') }}</label>
                <select
                  id="category"
                  v-model="category"
                  class="w-full bg-zinc-900/50 border border-zinc-800 focus:border-green-500 rounded-xl p-4 text-white outline-none transition-all font-bold appearance-none cursor-pointer"
                >
                  <option value="" selected disabled class="block text-white w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    {{ $t('products.select_category') }}
                  </option>
                  <option value="electronics">{{ $t('categories.electronics') }}</option>
                  <option class="bg-zinc-950" value="food">{{ $t('categories.food') }}</option>
                  <option class="bg-zinc-950" value="clothing">{{ $t('categories.clothing') }}</option>
                  <option class="bg-zinc-950" value="home-garden">{{ $t('categories.home_garden') }}</option>
                  <option class="bg-zinc-950" value="beauty-health">{{ $t('categories.beauty_health') }}</option>
                  <option class="bg-zinc-950" value="sports">{{ $t('categories.sports') }}</option>
                  <option class="bg-zinc-950" value="toys-games">{{ $t('categories.toys_games') }}</option>
                  <option class="bg-zinc-950" value="books">{{ $t('categories.books') }}</option>
                  <option class="bg-zinc-950" value="automotive">{{ $t('categories.automotive') }}</option>
                  <option class="bg-zinc-950" value="pets">{{ $t('categories.pets') }}</option>
                  <option class="bg-zinc-950" value="baby-products">{{ $t('categories.baby_products') }}</option>
                  <option class="bg-zinc-950" value="office-supplies">{{ $t('categories.office_supplies') }}</option>
                  <option class="bg-zinc-950" value="jewelry">{{ $t('categories.jewelry') }}</option>
                  <option class="bg-zinc-950" value="music">{{ $t('categories.music') }}</option>
                  <option class="bg-zinc-950" value="movies">{{ $t('categories.movies') }}</option>
                  <option class="bg-zinc-950" value="tools">{{ $t('categories.tools') }}</option>
                  <option class="bg-zinc-950" value="groceries">{{ $t('categories.groceries') }}</option>
                  <option class="bg-zinc-950" value="furniture">{{ $t('categories.furniture') }}</option>
                  <option class="bg-zinc-950" value="shoes">{{ $t('categories.shoes') }}</option>
                  <option class="bg-zinc-950" value="bags-accessories">{{ $t('categories.bags_accessories') }}</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div v-if="productUnit === 'pcs'">
                <label
                  class="block text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-2"
                  >{{ $t('products.weight_kg') }}</label
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
                  >{{ $t('products.stock') }}</label
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
                >{{ $t('products.stock') }}</label
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
                >{{ $t('products.description') }}</label
              >
              <textarea
                v-model="description"
                :placeholder="$t('products.description_placeholder')"
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
                >{{ $t('products.product_images') }}</label
              >

              <!-- Multiple Images Grid -->
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div
                  v-for="(image, index) in productImages"
                  :key="index"
                  class="relative aspect-square rounded-xl border-2 border-zinc-800 overflow-hidden group cursor-pointer"
                  @click="selectImageSlot(index)"
                >
                  <img
                    :src="image"
                    class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  <!-- Remove button -->
                  <button
                    @click.stop="removeImage(index)"
                    class="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <i class="bi bi-x text-xs"></i>
                  </button>

                  <!-- Overlay for hover -->
                  <div
                    class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <span
                      class="px-3 py-1 bg-white text-black font-black uppercase text-[8px] rounded-full shadow-xl"
                      >{{ $t('products.change') }}</span
                    >
                  </div>
                </div>

                <!-- Add new image slot -->
                <div
                  v-if="productImages.length < 5"
                  class="relative aspect-square rounded-xl border-2 border-dashed border-zinc-800 hover:border-green-500/50 transition-all overflow-hidden flex flex-col items-center justify-center bg-zinc-900/30 group cursor-pointer"
                  @click="selectImageSlot(productImages.length)"
                >
                  <div class="text-center p-4 text-zinc-600">
                    <i class="bi bi-plus-lg text-3xl mb-2 block"></i>
                    <span
                      class="font-black uppercase text-[8px] tracking-widest block"
                      >{{ $t('products.add_image') }}</span
                    >
                  </div>
                </div>
              </div>

              <!-- Hidden file input -->
              <input
                type="file"
                ref="fileInput"
                hidden
                accept="image/*"
                multiple
                @change="onFilesSelected"
              />

              <!-- Camera button -->
              <div class="flex gap-4 mb-4">
                <button
                  @click="openCamera"
                  class="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg transition-all text-sm"
                >
                  <i class="bi bi-camera"></i>
                  {{ $t('products.camera') }}
                </button>
              </div>

              <p
                class="text-[10px] text-zinc-600 font-bold uppercase tracking-widest text-center italic"
              >
                {{ $t('products.image_format_hint') }}
              </p>

              <!-- URL Inputs - Dynamic list -->
              <div class="mt-6 border-t border-zinc-800 pt-6">
                <label
                  class="block text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-4"
                  >{{ $t('products.image_urls') }}</label
                >

                <!-- Dynamic URL input fields -->
                <div class="space-y-3">
                  <div
                    v-for="(urlInput, index) in imageUrlInputs"
                    :key="index"
                    class="relative"
                  >
                    <input
                      type="text"
                      v-model="imageUrlInputs[index]"
                      @input="onUrlInput(index)"
                      :placeholder="$t('products.image_url_placeholder', { n: index + 1 })"
                      class="w-full bg-zinc-900/50 border border-zinc-800 focus:border-green-500 rounded-xl p-4 pl-10 pr-10 text-white outline-none transition-all font-bold text-sm"
                    />
                    <i
                      class="bi bi-link-45deg absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xl"
                    ></i>

                    <!-- Remove button for additional inputs -->
                    <button
                      v-if="imageUrlInputs.length > 1"
                      @click="removeUrlInput(index)"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-red-500 transition-colors"
                      :title="$t('products.remove_url_field')"
                    >
                      <i class="bi bi-x-circle text-lg"></i>
                    </button>
                  </div>
                </div>

                <!-- Add another URL input button -->
                <button
                  v-if="imageUrlInputs.length < 5"
                  @click="addUrlInput"
                  class="mt-3 flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-all text-sm"
                >
                  <i class="bi bi-plus-circle"></i>
                  {{ $t('products.add_more_urls') }}
                </button>

                <label
                  class="block mt-[1em] text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-2"
                  >{{ $t('products.shop_address') }}</label
                >
                <div class="relative">
                  <input
                    type="text"
                    v-model="shopAddress"
                    @input="updateShopAddress"
                    :placeholder="$t('products.shop_address_placeholder')"
                    class="w-full bg-zinc-900/50 border border-zinc-800 focus:border-green-500 rounded-xl p-4 pl-10 text-white outline-none transition-all font-bold text-sm"
                  />
                  <i
                    class="bi bi-geo-alt absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xl"
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
                {{ $t('products.take_photo') }}
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
            <span v-if="loading" class="animate-pulse">{{ $t('products.saving') }}</span>
            <span v-else>{{ $t('products.save') }}</span>
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
      productImages: [],
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
      imageUrlInputs: [""],
      selectedImageIndex: null,
    };
  },
  mounted() {
    window.addEventListener("paste", this.handlePaste);
  },
  methods: {
    selectImageSlot(index) {
      this.selectedImageIndex = index;
      this.$refs.fileInput.click();
    },

    async onFilesSelected(event) {
      const files = Array.from(event.target.files);
      if (!files.length) return;

      for (const file of files) {
        if (file.size > 2 * 1024 * 1024) {
          this.error = this.$t('products.image_size_error');
          return;
        }
      }

      this.error = null;

      for (const file of files) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (this.selectedImageIndex !== null) {
            this.productImages[this.selectedImageIndex] = e.target.result;
            this.selectedImageIndex = null;
          } else {
            if (this.productImages.length < 5) {
              this.productImages.push(e.target.result);
            }
          }
        };
        reader.readAsDataURL(file);
      }

      event.target.value = '';
    },

    removeImage(index) {
      this.productImages.splice(index, 1);
    },

    addUrlInput() {
      if (this.imageUrlInputs.length < 5) {
        this.imageUrlInputs.push("");
      }
    },

    removeUrlInput(index) {
      if (this.imageUrlInputs.length > 1) {
        this.imageUrlInputs.splice(index, 1);
        if (this.productImages[index]) {
          this.productImages.splice(index, 1);
        }
      }
    },

    onUrlInput(index) {
      const url = this.imageUrlInputs[index]?.trim();

      if (!url) {
        if (this.productImages[index]) {
          this.productImages.splice(index, 1);
        }
        return;
      }

      const isValidImageUrl = /^(https?:\/\/|data:)/i.test(url);
      if (!isValidImageUrl) {
        this.error = this.$t('products.invalid_url_error');
        return;
      }

      this.error = null;

      if (this.productImages.length <= index) {
        this.productImages.push(url);
      } else {
        this.productImages[index] = url;
      }

      if (index === this.imageUrlInputs.length - 1 && this.imageUrlInputs.length < 5) {
        this.addUrlInput();
      }
    },

    async openCamera() {
      this.error = null;
      this.showCamera = true;
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        this.$nextTick(() => {
          if (this.$refs.video) {
            this.$refs.video.srcObject = this.stream;
          }
        });
      } catch (err) {
        console.error("Camera error:", err);
        this.error = this.$t('products.camera_permission_error');
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

      const imageData = canvas.toDataURL("image/webp", 0.8);

      if (this.selectedImageIndex !== null) {
        this.productImages[this.selectedImageIndex] = imageData;
        this.selectedImageIndex = null;
      } else {
        if (this.productImages.length < 5) {
          this.productImages.push(imageData);
        }
      }

      this.closeCamera();
    },

    closeCamera() {
      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
        this.stream = null;
      }
      this.showCamera = false;
    },

    onCameraCapture(imageData) {
      if (this.selectedImageIndex !== null && this.selectedImageIndex < 5) {
        this.productImages[this.selectedImageIndex] = imageData;
        this.selectedImageIndex = null;
      } else if (this.productImages.length < 5) {
        this.productImages.push(imageData);
      }
    },

    async productSaver() {
      this.error = null;
      this.success = null;

      if (
        !this.productName ||
        this.productImages.length === 0 ||
        !this.productPrice ||
        !this.productStock ||
        !this.shopAddress ||
        !this.category
      ) {
        this.error = this.$t('products.fill_all_fields_error');
        return;
      }

      const invalidImage = this.productImages.some((img) => {
        if (!img || !img.toString().trim()) return true;
        return !/^(https?:\/\/|data:)/i.test(img);
      });

      if (invalidImage) {
        this.error = this.$t('products.invalid_image_format_error');
        return;
      }

      try {
        this.loading = true;

        const token = localStorage.getItem("userToken");

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
          this.error = this.$t('products.token_not_found_error');
          return;
        }

        const response = await axios.post(
          "/api/products",
          {
            name: this.productName,
            images: this.productImages,
            description: this.description,
            price: parseFloat(this.productPrice),
            deliveryPrice: parseFloat(this.deliveryPrice) || 0,
            stock: parseInt(this.productStock, 10) || 0,
            weight: this.productUnit === "pcs" ? parseFloat(this.productWeight) : 1.0,
            unit: this.productUnit,
            currency: this.productCurrency,
            shopAddress: this.shopAddress,
            category: this.category ? String(this.category) : "Not Selected",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.data.success) {
          this.success = this.$t('products.product_added_success');
          this.productName = "";
          this.productImages = [];
          this.imageUrlInputs = [""];
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
        this.error = err.response?.data?.message || this.$t('products.general_error');
      } finally {
        this.loading = false;
      }
    },

    updateImageFromUrl() {
      // Handled by onUrlInput
    },

    handlePaste(event) {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (item.type.indexOf("image") !== -1) {
          event.preventDefault();
          const file = item.getAsFile();
          if (!file) continue;

          if (file.size > 2 * 1024 * 1024) {
            this.error = this.$t('products.image_size_error');
            setTimeout(() => (this.error = null), 3000);
            return;
          }

          this.error = null;
          const reader = new FileReader();
          reader.onload = (e) => {
            if (this.productImages.length < 5) {
              this.productImages.push(e.target.result);
              this.success = this.$t('products.image_added_success');
              setTimeout(() => (this.success = null), 2000);
            } else {
              this.error = this.$t('products.max_images_error');
              setTimeout(() => (this.error = null), 3000);
            }
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    },
  },
  beforeUnmount() {
    this.closeCamera();
    window.removeEventListener("paste", this.handlePaste);
  },
};
</script>

<style scoped lang="scss">
/* No extra scoped styles needed due to Global main.css and Tailwind */
</style>