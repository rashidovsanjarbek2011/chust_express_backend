<template>
  <div
    class="h-[calc(100vh-6rem)] flex flex-col md:flex-row overflow-hidden bg-zinc-950 text-white font-inter"
  >
    <!-- Sidebar / Control Panel -->
    <div
      class="w-full md:w-1/3 lg:w-1/4 h-1/2 md:h-full glass-panel z-20 flex flex-col shadow-2xl overflow-y-auto relative"
    >
      <div class="p-6 md:p-8 space-y-6">
        <!-- Header -->
        <div>
          <router-link
            to="/"
            class="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-4 text-xs font-bold uppercase tracking-widest"
          >
            <i class="bi bi-arrow-left"></i> Bosh sahifa
          </router-link>
          <h1
            class="text-3xl font-black text-green-500 tracking-tighter uppercase mb-1"
          >
            Yuk Tashish
          </h1>
          <p class="text-zinc-500 text-sm font-medium">
            Do'konlar va Bozorlardan uyingizgacha
          </p>
        </div>

        <!-- Route Inputs -->
        <div class="space-y-4">
          <div class="relative">
            <div
              class="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            ></div>
            <input
              v-model="inputFrom"
              @keyup.enter="searchAddress('from')"
              type="text"
              placeholder="Qayerdan? (Manzilni yozing va Enter)"
              class="w-full input-premium py-4 pl-12 pr-4 rounded-xl text-white font-medium placeholder-zinc-600"
            />
            <button
              v-if="inputFrom"
              @click="searchAddress('from')"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <i class="bi bi-search"></i>
            </button>
          </div>

          <!-- Decoration line -->
          <div class="h-6 w-0.5 bg-zinc-800 ml-[1.15rem] -my-2"></div>

          <div class="relative">
            <div
              class="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
            ></div>
            <input
              v-model="inputTo"
              @keyup.enter="searchAddress('to')"
              type="text"
              placeholder="Qayerga? (Manzilni yozing va Enter)"
              class="w-full input-premium py-4 pl-12 pr-4 rounded-xl text-white font-medium placeholder-zinc-600"
            />
            <button
              v-if="inputTo"
              @click="searchAddress('to')"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <i class="bi bi-search"></i>
            </button>
          </div>
        </div>

        <!-- Transport Selection -->
        <div>
          <label
            class="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 block"
            >Transport Turi</label
          >
          <div v-if="loadingTypes" class="text-center py-4 text-zinc-500">
            <div
              class="animate-spin inline-block w-4 h-4 border-2 border-zinc-500 border-t-white rounded-full mr-2"
            ></div>
            Yuklanmoqda...
          </div>
          <div v-else class="grid grid-cols-2 gap-3">
            <div
              v-for="type in deliveryTypes"
              :key="type.id"
              :class="[
                'transport-card p-4 rounded-xl bg-zinc-900/50 flex flex-col items-center gap-2',
                { active: selectedTypeId === type.id },
              ]"
              @click="selectTransport(type)"
            >
              <i
                :class="[
                  'bi text-2xl text-zinc-400',
                  getIconForType(type.typeName),
                ]"
              ></i>
              <div class="text-center">
                <div class="text-xs font-bold text-white uppercase">
                  {{ type.typeName.split("(")[0] }}
                </div>
                <div class="text-[10px] text-zinc-500">
                  {{ formatPrice(type.basePrice) }} +
                  {{ formatPrice(type.baseCostPerKm) }}/km
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Courier Selection -->
        <div v-if="availableCouriers.length > 0">
          <label class="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 block">Mavjud Kuryerlar (Hududingizda)</label>
          <div class="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            <div
              v-for="courier in availableCouriers"
              :key="courier.id"
              :class="[
                'p-4 rounded-xl bg-zinc-900/50 border flex items-center justify-between cursor-pointer transition-all',
                selectedCourierId === courier.id ? 'border-green-500 bg-green-500/5' : 'border-zinc-800 hover:border-zinc-700'
              ]"
              @click="selectCourier(courier)"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                  <i class="bi bi-person-fill"></i>
                </div>
                <div>
                  <div class="text-sm font-black uppercase text-white leading-tight">{{ courier.username }}</div>
                  <div class="text-[10px] text-zinc-500 uppercase tracking-tighter">{{ courier.vehicleType || 'Piyoda' }} • {{ courier.workingRegion }}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-xs font-black text-green-500">{{ formatPrice(courier.deliveryPrice) }}</div>
                <div class="text-[8px] text-zinc-600 uppercase">Xizmat haqi</div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="inputTo && !loadingCouriers" class="p-4 bg-zinc-900/30 rounded-xl border border-zinc-800/50 text-center">
          <p class="text-[10px] text-zinc-500 uppercase font-bold italic">Bu hududda hozircha bo'sh kuryerlar yo'q.</p>
        </div>
      </div>

      <!-- Result Panel (Hidden by default) -->
      <div
        v-if="routeResult"
        class="mt-auto p-6 md:p-8 bg-zinc-900 border-t border-zinc-800"
      >
        <div class="flex justify-between items-end mb-4">
          <div>
            <p
              class="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1"
            >
              Masofa
            </p>
            <p class="text-2xl font-mono text-white">
              {{ routeResult.distanceText }}
            </p>
          </div>
          <div class="text-right">
            <p
              class="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1"
            >
              Taxminiy Vaqt (Avto)
            </p>
            <p class="text-2xl font-mono text-white">
              {{ routeResult.durationText }}
            </p>
          </div>
        </div>

        <div
          class="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex justify-between items-center mb-4"
        >
          <span class="text-zinc-400 font-bold">Jami:</span>
          <span class="text-3xl font-black text-green-500">{{
            formatPrice(routeResult.totalPrice)
          }}</span>
        </div>

        <button
          @click="createOrder"
          :disabled="creatingOrder"
          class="w-full py-3 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-colors"
        >
          <span v-if="creatingOrder">Buyurtma berilmoqda...</span>
          <span v-else>Buyurtma Berish</span>
        </button>
      </div>
    </div>

    <!-- Map Container -->
    <div class="w-full md:w-2/3 lg:w-3/4 h-1/2 md:h-full relative bg-zinc-800">
      <div id="map" class="w-full h-full cursor-crosshair z-0"></div>

      <!-- Map Controls / Hints -->
      <div class="absolute top-4 left-4 z-[500] flex flex-col gap-2">
        <div class="glass-panel p-2 rounded-xl flex gap-2">
          <button
            @click="setMode('start')"
            :class="[
              'px-4 py-2 border rounded-lg text-xs font-black uppercase transition-all',
              activeMode === 'start'
                ? 'bg-blue-600/20 text-blue-500 border-blue-500 ring-2 ring-blue-500'
                : 'bg-transparent text-zinc-400 border-zinc-700 hover:text-white',
            ]"
          >
            <i class="bi bi-geo-alt-fill"></i> Qayerdan (A)
          </button>
          <button
            @click="setMode('end')"
            :class="[
              'px-4 py-2 border rounded-lg text-xs font-black uppercase transition-all',
              activeMode === 'end'
                ? 'bg-green-600/20 text-green-500 border-green-500 ring-2 ring-green-500'
                : 'bg-transparent text-zinc-400 border-zinc-700 hover:text-white',
            ]"
          >
            <i class="bi bi-geo-alt-fill"></i> Qayerga (B)
          </button>
        </div>
        <div
          class="glass-panel p-3 rounded-xl text-[10px] text-zinc-400 max-w-[200px]"
        >
          Xaritaga bosing yoki qidiruvdan foydalaning. Markerlarni surib
          lokatsiyani aniqlang.
        </div>
      </div>

      <!-- Loading Overlay -->
      <div
        v-if="loadingMap"
        class="absolute inset-0 z-[1000] bg-zinc-950/80 flex items-center justify-center"
      >
        <div class="text-white font-bold animate-pulse">
          Xarita Yuklanmoqda...
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import toast from "@/services/toast";

export default {
  name: "CreateDelivery",
  data() {
    return {
      map: null,
      startPoint: null, // [lat, lng]
      endPoint: null, // [lat, lng]
      startMarker: null,
      endMarker: null,
      routePolyline: null,

      inputFrom: "",
      inputTo: "",

      activeMode: "start",
      deliveryTypes: [],
      selectedTypeId: null,
      selectedType: null,
      loadingTypes: false,
      loadingMap: true,

      routeResult: null,
      creatingOrder: false,

      availableCouriers: [],
      selectedCourierId: null,
      selectedCourier: null,
      loadingCouriers: false,
    };
  },
  async mounted() {
    await this.fetchDeliveryTypes();
    this.initMap();
  },
  methods: {
    async fetchDeliveryTypes() {
      this.loadingTypes = true;
      try {
        const res = await axios.get(`/api/delivery/types`);
        if (res.data.success) {
          this.deliveryTypes = res.data.data;
          if (this.deliveryTypes.length > 0) {
            this.selectTransport(this.deliveryTypes[0]);
          }
        }
      } catch (e) {
        console.error("Failed to load types", e);
      } finally {
        this.loadingTypes = false;
      }
    },
    selectTransport(type) {
      this.selectedTypeId = type.id;
      this.selectedType = type;
      this.calculateRoute();
    },
    getIconForType(typeName) {
      const name = typeName.toLowerCase();
      if (name.includes("velo") || name.includes("bike")) return "bi-bicycle";
      if (name.includes("car") || name.includes("avto"))
        return "bi-car-front-fill";
      if (name.includes("van") || name.includes("damas")) return "bi-truck";
      if (name.includes("truck") || name.includes("yuk"))
        return "bi-truck-flatbed";
      return "bi-box-seam";
    },
    formatPrice(price) {
      if (!price) return "0 UZS";
      return Math.round(price).toLocaleString() + " UZS";
    },
    initMap() {
      if (!window.L) {
        console.error("Leaflet not loaded");
        return;
      }

      // Default Center (Tashkent)
      this.map = window.L.map("map").setView([41.2995, 69.2401], 12);

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(this.map);

      this.loadingMap = false;

      // Map Click Event
      this.map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        if (this.activeMode === "start") {
          this.setStartPoint([lat, lng]);
        } else {
          this.setEndPoint([lat, lng]);
        }
      });

      // Try Geolocation
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            this.map.setView([latitude, longitude], 14);
            // Optional: set start point immediately?
            // this.setStartPoint([latitude, longitude]);
          },
          (err) => {
            console.log("Geo denied");
          },
        );
      }
    },
    setMode(mode) {
      this.activeMode = mode;
    },
    createIcon(color) {
      if (!window.L) return;
      return window.L.divIcon({
        className: "custom-div-icon",
        html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
    },
    setStartPoint(coords) {
      this.startPoint = coords; // [lat, lng]

      if (this.startMarker) {
        this.startMarker.setLatLng(coords);
      } else {
        this.startMarker = window.L.marker(coords, {
          draggable: true,
          icon: this.createIcon("#3b82f6"), // Blue
        }).addTo(this.map);

        this.startMarker.on("dragend", (e) => {
          const { lat, lng } = e.target.getLatLng();
          this.setStartPoint([lat, lng]);
        });
      }

      // Reverse Geocode
      this.reverseGeocode(coords[0], coords[1], "from");

      // Auto switch mode
      this.setMode("end");
      this.calculateRoute();
    },
    setEndPoint(coords) {
      this.endPoint = coords;

      if (this.endMarker) {
        this.endMarker.setLatLng(coords);
      } else {
        this.endMarker = window.L.marker(coords, {
          draggable: true,
          icon: this.createIcon("#22c55e"), // Green
        }).addTo(this.map);

        this.endMarker.on("dragend", (e) => {
          const { lat, lng } = e.target.getLatLng();
          this.setEndPoint([lat, lng]);
        });
      }

      // Reverse Geocode
      this.reverseGeocode(coords[0], coords[1], "to");

      this.calculateRoute();
      this.searchCouriersInRegion(coords);
    },
    async searchCouriersInRegion(coords) {
      if (!coords) return;
      this.loadingCouriers = true;
      try {
        // Simple region extraction from coords or address
        // For now we'll use a broad search or just fetch all active couriers and filter locally
        // But better is to use the address from reverse geocode
        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords[0]}&lon=${coords[1]}`);
        const address = res.data.address;
        const region = address.city || address.town || address.village || address.suburb || address.county;
        
        if (region) {
          const courierRes = await axios.get(`/api/auth/couriers-by-region/${encodeURIComponent(region)}`);
          if (courierRes.data.success) {
            this.availableCouriers = courierRes.data.data;
          }
        }
      } catch (e) {
        console.error("Courier search failed", e);
      } finally {
        this.loadingCouriers = false;
      }
    },
    selectCourier(courier) {
      this.selectedCourierId = courier.id;
      this.selectedCourier = courier;
      this.calculateRoute();
    },
    async reverseGeocode(lat, lng, target) {
      try {
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        );
        if (res.data && res.data.display_name) {
          if (target === "from") this.inputFrom = res.data.display_name;
          else this.inputTo = res.data.display_name;
        }
      } catch (e) {
        console.error("Reverse geocode failed", e);
      }
    },
    async searchAddress(target) {
      const query = target === "from" ? this.inputFrom : this.inputTo;
      if (!query || query.length < 3) return;

      try {
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        );
        if (res.data && res.data.length > 0) {
          const place = res.data[0];
          const lat = parseFloat(place.lat);
          const lng = parseFloat(place.lon);
          const coords = [lat, lng];

          if (target === "from") {
            this.setStartPoint(coords);
          } else {
            this.setEndPoint(coords);
          }

          this.map.setView(coords, 14);
        } else {
          toast.error("Manzil topilmadi");
        }
      } catch (e) {
        console.error(e);
        toast.error("Qidiruv xatosi");
      }
    },
    calculateRoute() {
      if (!this.startPoint || !this.endPoint || !this.selectedType) return;

      // Remove old polyline
      if (this.routePolyline) {
        this.map.removeLayer(this.routePolyline);
      }

      // Leaflet distanceTo is in meters
      const startLatLng = window.L.latLng(this.startPoint);
      const endLatLng = window.L.latLng(this.endPoint);
      const distMeters = startLatLng.distanceTo(endLatLng);

      const distKm = distMeters / 1000;

      // Draw Polyline (Straight line)
      this.routePolyline = window.L.polyline([this.startPoint, this.endPoint], {
        color: "#22c55e",
        weight: 5,
        opacity: 0.7,
        dashArray: "10, 10",
      }).addTo(this.map);

      this.map.fitBounds(this.routePolyline.getBounds(), { padding: [50, 50] });

      // Price Calc
      let base = this.selectedType.basePrice || 0;
      let rate = this.selectedType.baseCostPerKm || 0;
      
      // If courier is selected, their price overrides or adds to base
      if (this.selectedCourier && this.selectedCourier.deliveryPrice) {
        base = this.selectedCourier.deliveryPrice;
        rate = 0; // Courier price is usually flat for region in this simple model
      }
      
      const totalPrice = base + distKm * rate;

      // Duration Estimate (Roughly 30km/h avg speed inside city)
      const avgSpeedKmH = 30;
      const hours = distKm / avgSpeedKmH;
      const minutes = Math.round(hours * 60);
      let durationText = "";
      if (minutes < 60) durationText = `${minutes} min`;
      else {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        durationText = `${h} soat ${m} min`;
      }

      this.routeResult = {
        distanceText: `${distKm.toFixed(2)} km`,
        durationText: durationText,
        totalPrice: totalPrice,
        distanceKm: distKm,
      };
    },
    async createOrder() {
      if (!this.routeResult || !this.selectedType) return;

      this.creatingOrder = true;
      try {
        const payload = {
          orderItems: [
            {
              product: 9999, // Virtual Delivery Service Product
              quantity: 1,
            },
          ],
          shippingAddress: this.inputTo || "Belgilangan Manzil",
          notes: `From: ${this.inputFrom}, Make: Delivery Service`,
          subtotalPrice: 0,
          deliveryTypeId: this.selectedTypeId,
          preferredCourierId: this.selectedCourierId, // Pass preferred courier if any

          // Destination
          latitude: this.endPoint[0],
          longitude: this.endPoint[1],

          // Origin
          originLat: this.startPoint[0],
          originLng: this.startPoint[1],

          paymentMethod: "Cash",
        };

        const token = localStorage.getItem("userToken");
        if (!token) {
          toast.warning("Iltimos, avval tizimga kiring (Login)");
          this.$router.push("/login");
          return;
        }

        const response = await axios.post(`/api/orders`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success || response.data.id) {
          toast.success("Buyurtma muvaffaqiyatli yaratildi!");
          this.$router.push("/profile");
        }
      } catch (e) {
        console.error(e);
        toast.error(
          "Buyurtma yaratishda xatolik: " +
            (e.response?.data?.message || e.message),
        );
      } finally {
        this.creatingOrder = false;
      }
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700;900&display=swap");

.font-inter {
  font-family: "Inter", sans-serif;
}

/* Map Styling for "Dark Mode" look via CSS filter if tiles are bright */
:deep(.leaflet-tile-pane) {
  filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
}

.glass-panel {
  background: rgba(24, 24, 27, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.input-premium {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid #27272a;
  transition: all 0.3s ease;
}
.input-premium:focus {
  border-color: #22c55e;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
  outline: none;
}

.transport-card {
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}
.transport-card:hover {
  background-color: rgba(30, 41, 59, 0.8);
}
.transport-card.active {
  background: rgba(34, 197, 94, 0.1);
  border-color: #22c55e;
}
</style>
