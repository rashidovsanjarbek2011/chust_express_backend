<template>
  <div
    class="profile-page pt-20 min-h-screen bg-zinc-950 text-white p-6 md:p-12"
  >
    <div class="max-w-3xl mx-auto">
      <div class="flex items-center justify-between mb-12">
        <div>
          <h1
            class="text-4xl font-black text-green-500 tracking-tighter uppercase"
          >
            Profil
          </h1>
          <p class="text-zinc-500 text-sm">
            Shaxsiy ma'lumotlaringiz va sozlamalar
          </p>
        </div>
        <button
          @click="handleLogout"
          class="px-6 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all border border-red-500/20"
        >
          Chiqish
        </button>
      </div>

      <!-- Loading and Error -->
      <div v-if="loading" class="flex justify-center py-20">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-2 border-green-500"
        ></div>
      </div>

      <div
        v-if="error"
        class="premium-card p-6 bg-red-500/10 border-red-500/20 text-red-500 mb-8 flex items-center gap-3"
      >
        <i class="bi bi-exclamation-triangle text-xl"></i>
        <p class="font-bold text-sm">{{ error }}</p>
      </div>

      <!-- User Data -->
      <div v-if="user" class="space-y-6">
        <div class="premium-card p-8 group">
          <div class="flex items-center gap-6 mb-8">
            <div
              class="w-20 h-20 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 relative overflow-hidden group-hover:border-green-500/50 transition-colors"
            >
              <i
                class="bi bi-person-circle text-4xl text-zinc-700 group-hover:text-green-500 transition-colors"
              ></i>
            </div>
            <div>
              <h2 class="text-2xl font-black uppercase tracking-tight">
                {{ user.username }}
              </h2>
              <span
                class="px-3 py-1 bg-green-500 text-black font-black uppercase text-[10px] tracking-widest rounded-full"
                >{{ user.role }}</span
              >
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-1">
              <label
                class="text-zinc-500 font-black uppercase text-[10px] tracking-widest"
                >E-pochta</label
              >
              <p
                class="text-white font-bold bg-zinc-900/50 p-4 rounded-xl border border-zinc-800"
              >
                {{ user.email }}
              </p>
            </div>

            <div class="space-y-1">
              <label
                class="text-zinc-500 font-black uppercase text-[10px] tracking-widest"
                >A'zo bo'lgan sana</label
              >
              <p
                class="text-white font-bold bg-zinc-900/50 p-4 rounded-xl border border-zinc-800"
              >
                {{ new Date(user.createdAt).toLocaleDateString() }}
              </p>
            </div>

            <!-- Shop Location (Owner/Worker) -->
            <div
              v-if="['shop_owner', 'shop_worker'].includes(user.role)"
              class="space-y-3 pt-4 border-t border-zinc-800 md:col-span-2"
            >
              <div class="flex justify-between items-center">
                <label
                  class="text-zinc-500 font-black uppercase text-[10px] tracking-widest"
                  >Do'kon Joylashuvi</label
                >
                <div
                  v-if="user.latitude"
                  class="text-green-500 text-[10px] font-bold uppercase flex items-center gap-1"
                >
                  <i class="bi bi-check-circle-fill"></i> O'rnatilgan
                </div>
              </div>

              <div
                class="flex gap-4 items-center bg-zinc-900/50 p-4 rounded-xl border border-zinc-800"
              >
                <div class="flex-grow">
                  <p class="text-xs text-zinc-400 font-mono mb-1">
                    {{
                      user.latitude
                        ? `${user.latitude.toFixed(6)}, ${user.longitude.toFixed(6)}`
                        : "Joylashuv belgilanmagan"
                    }}
                  </p>
                  <p class="text-[10px] text-zinc-600">
                    Buyurtmalar uchun olib ketish manzili sifatida ishlatiladi.
                  </p>
                </div>
                <button
                  @click="updateLocation"
                  :disabled="updatingLocation"
                  class="px-4 py-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
                >
                  <i
                    v-if="updatingLocation"
                    class="bi bi-arrow-repeat animate-spin"
                  ></i>
                  <i v-else class="bi bi-geo-alt-fill"></i>
                  {{ user.latitude ? "Yangilash" : "O'rnatish" }}
                </button>
              </div>
            </div>

            <div
              v-if="
                user.latitude &&
                !['shop_owner', 'shop_worker'].includes(user.role)
              "
              class="space-y-1"
            >
              <label
                class="text-zinc-500 font-black uppercase text-[10px] tracking-widest"
                >Joylashuv (Lat/Lng)</label
              >
              <p
                class="text-white font-mono font-bold bg-zinc-900/50 p-4 rounded-xl border border-zinc-800"
              >
                {{ user.latitude.toFixed(4) }}, {{ user.longitude.toFixed(4) }}
              </p>
            </div>

            <!-- Ish Maydoni (Delivery) - MOVED UP FOR VISIBILITY -->
            <div
              v-if="user.role === 'delivery' || user.isDelivery"
              class="space-y-3 pt-4 border-t border-zinc-800 md:col-span-2"
            >
              <label class="text-zinc-500 font-black uppercase text-[10px] tracking-widest">Ish Maydoni (Xaritalash uchun)</label>
              <div class="flex gap-4 items-center bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                <div class="flex-grow">
                  <input
                    v-model="user.workingRegion"
                    type="text"
                    placeholder="Masalan: Chilonzor, Yunusobod..."
                    class="w-full bg-transparent text-white font-bold outline-none border-none placeholder:text-zinc-700 p-0"
                  />
                </div>
                <button
                  @click="updateWorkingRegion"
                  :disabled="updatingRegion"
                  class="px-4 py-2 bg-green-500 hover:bg-green-600 active:bg-green-700 text-black rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-2"
                >
                  <i v-if="updatingRegion" class="bi bi-arrow-repeat animate-spin"></i>
                  <i v-else class="bi bi-save-fill"></i>
                  Saqlash
                </button>
              </div>
              <p class="text-[9px] text-zinc-600 italic">* Kuryer sifatida manzillarni xaritalash uchun foydalaniladi.</p>
            </div>

            <!-- Vehicle Type Selection -->
            <div
              v-if="user.role === 'delivery' || user.isDelivery"
              class="space-y-3 pt-4 border-t border-zinc-800 md:col-span-2"
            >
              <label
                class="text-zinc-500 font-black uppercase text-[10px] tracking-widest"
                >Transport Turi</label
              >
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  v-for="type in vehicles"
                  :key="type.value"
                  @click="updateVehicle(type.value)"
                  class="p-4 rounded-xl border transition-all flex flex-col items-center gap-2 group"
                  :class="
                    user.vehicleType === type.value
                      ? 'bg-green-500 border-green-500 text-black'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                  "
                >
                  <i
                    :class="[
                      type.icon,
                      user.vehicleType === type.value
                        ? 'text-black'
                        : 'text-zinc-700 group-hover:text-zinc-500',
                    ]"
                    class="text-2xl"
                  ></i>
                  <span
                    class="font-black uppercase text-[10px] tracking-widest"
                    >{{ type.label }}</span
                  >
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Activity Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            class="premium-card p-6 flex flex-col items-center justify-center text-center"
          >
            <span class="text-4xl font-black text-green-500 mb-2">{{
              user.orders?.length || 0
            }}</span>
            <span
              class="text-zinc-500 font-black uppercase text-[10px] tracking-widest"
              >Umumiy buyurtmalar</span
            >
          </div>
          <div
            v-if="user.products"
            class="premium-card p-6 flex flex-col items-center justify-center text-center"
          >
            <span class="text-4xl font-black text-blue-500 mb-2">{{
              user.products.length
            }}</span>
            <span
              class="text-zinc-500 font-black uppercase text-[10px] tracking-widest"
              >Mahsulotlar</span
            >
          </div>
          <div
            v-if="user.deliveries"
            class="premium-card p-6 flex flex-col items-center justify-center text-center"
          >
            <span class="text-4xl font-black text-purple-500 mb-2">{{
              user.deliveries.length
            }}</span>
            <span
              class="text-zinc-500 font-black uppercase text-[10px] tracking-widest"
              >Yetkazmalar</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import toast from "@/services/toast";
import { getToken, logout } from "../utils/auth";
import { useRouter } from "vue-router";

export default {
  name: "Profile",
  data() {
    return {
      user: null,
      loading: false,
      error: null,
      updatingLocation: false,
      updatingRegion: false,
      vehicles: [
        { label: "Piyoda", value: "ON_FOOT", icon: "bi bi-person-walking" },
        { label: "Avtomobil", value: "CAR", icon: "bi bi-car-front" },
        { label: "Yuk mashinasi", value: "TRUCK", icon: "bi bi-truck" },
      ],
    };
  },
  setup() {
    const router = useRouter();
    return { router };
  },
  methods: {
    async updateLocation() {
      if (!("geolocation" in navigator)) {
        toast.warning("Geolakatsiya brauzeringizda qo'llab-quvvatlanmaydi.");
        return;
      }

      this.updatingLocation = true;
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const token = getToken();
            const { latitude, longitude } = position.coords;

            await axios.put(
              `/api/auth/profile`,
              { latitude, longitude },
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );

            // Update local user data
            this.user.latitude = latitude;
            this.user.longitude = longitude;
            toast.success("Joylashuv muvaffaqiyatli yangilandi!");
          } catch (err) {
            console.error(err);
            toast.error("Joylashuvni saqlashda xatolik yuz berdi.");
          } finally {
            this.updatingLocation = false;
          }
        },
        (error) => {
          console.error(error);
          toast.error("Joylashuvni aniqlashda xatolik: " + error.message);
          this.updatingLocation = false;
        },
        { enableHighAccuracy: true },
      );
    },
    async updateVehicle(vehicleType) {
      try {
        const token = getToken();
        await axios.put(
          `/api/auth/delivery/vehicle`,
          { vehicleType },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        this.user.vehicleType = vehicleType;
        toast.success("Transport turi muvaffaqiyatli saqlandi!");
      } catch (err) {
        toast.error("Xatolik yuz berdi.");
      }
    },
    async updateWorkingRegion() {
      if (!this.user.workingRegion || !this.user.workingRegion.trim()) {
        toast.warning("Iltimos, ish maydonini kiriting.");
        return;
      }

      this.updatingRegion = true;
      try {
        const token = getToken();
        await axios.put(
          `/api/auth/profile`,
          { workingRegion: this.user.workingRegion },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        toast.success("Ish maydoni muvaffaqiyatli yangilandi!");
      } catch (err) {
        console.error(err);
        toast.error("Ish maydonini saqlashda xatolik yuz berdi.");
      } finally {
        this.updatingRegion = false;
      }
    },
    async fetchProfile() {
      this.loading = true;
      this.error = null;

      try {
        const token = getToken();
        if (!token) {
          this.$router.push({ name: "login" });
          return;
        }

        const res = await axios.get(`/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.user = res.data.data;
      } catch (err) {
        this.error =
          err.response?.data?.message || "Profilni olishda xatolik yuz berdi.";
        if (err.response?.status === 401) {
          logout();
          this.router.push({ name: "login" });
        }
      } finally {
        this.loading = false;
      }
    },
    handleLogout() {
      logout();
      this.router.push({ name: "login" });
    },
  },
  mounted() {
    this.fetchProfile();
  },
};
</script>

<style scoped>
.profile-page {
  background: radial-gradient(
    circle at top left,
    rgba(34, 197, 94, 0.05),
    transparent 600px
  );
}
</style>
