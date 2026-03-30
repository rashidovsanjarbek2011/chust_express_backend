<template>
  <div class="extra-panel pt-20 min-h-screen bg-zinc-950 text-white p-6 md:p-12">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-12">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 mb-4">
          <i class="bi bi-sliders text-orange-500 text-xs"></i>
          <span class="text-[10px] font-black uppercase tracking-widest text-orange-500">{{ $t('extra_title') || 'Xizmat Boshqaruvi' }}</span>
        </div>
        <h1 class="text-5xl font-black text-white tracking-tighter uppercase mb-2">
          {{ $t('extra_panel') || 'Ixtisoslashtirilgan Xizmat Paneli' }}
        </h1>
        <p class="text-zinc-500 text-lg">
          {{ $t('extra_subtitle') || 'Qurilish, Logistika va Resurs Boshqaruvini Markazlashtirilgan Tarzda Boshqaring' }}
        </p>
      </div>

      <!-- Tab Navigation -->
      <div class="mb-8 flex flex-wrap gap-2 border-b border-zinc-800 pb-4 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap',
            activeTab === tab.id
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          ]"
        >
          <i :class="`bi ${tab.icon} mr-2`"></i>{{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="space-y-8">
        <!-- TERRITORIES TAB -->
        <div v-if="activeTab === 'territories'" class="space-y-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-3xl font-black text-white">{{ $t('territories') || 'Hududlar' }}</h2>
            <button @click="showTerritoryForm = true" class="btn-primary">
              <i class="bi bi-plus-circle"></i> {{ $t('add_territory') || 'Hudud Qoʻshish' }}
            </button>
          </div>

          <!-- Add Territory Form -->
          <div v-if="showTerritoryForm" class="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 mb-6">
            <h3 class="text-2xl font-bold mb-4">{{ $t('new_territory') || 'Yangi Hudud' }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input v-model="territoryForm.name" type="text" :placeholder="$t('territory_name') || 'Hudud Nomi'" class="input-field">
              <input v-model="territoryForm.zoneType" type="text" :placeholder="$t('zone_type') || 'Zona Turi'" class="input-field">
              <textarea v-model="territoryForm.description" :placeholder="$t('description') || 'Tavsif'" class="input-field md:col-span-2"></textarea>
            </div>
            <div class="flex gap-2 mt-4">
              <button @click="addTerritory" class="btn-primary">{{ $t('save') || 'Saqlash' }}</button>
              <button @click="showTerritoryForm = false" class="btn-secondary">{{ $t('cancel') || 'Bekor Qilish' }}</button>
            </div>
          </div>

          <!-- Territories List -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="territory in territories" :key="territory.id" class="premium-card p-6 border-cyan-500/10">
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <i class="bi bi-map text-cyan-400"></i>
                  </div>
                  <div>
                    <h3 class="font-bold text-white">{{ territory.name }}</h3>
                    <p class="text-xs text-zinc-500">{{ territory.zoneType }}</p>
                  </div>
                </div>
                <button @click="deleteTerritory(territory.id)" class="text-red-400 hover:text-red-300">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
              <p class="text-sm text-zinc-400 mb-4">{{ territory.description }}</p>
              <button @click="selectTerritory(territory)" class="w-full btn-secondary text-sm">
                {{ $t('view_details') || 'Tafsilotlarni Koʻrish' }}
              </button>
            </div>
          </div>
        </div>

        <!-- WORKERS TAB -->
        <div v-if="activeTab === 'workers'" class="space-y-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-3xl font-black text-white">{{ $t('workers') || 'Ishchilar' }}</h2>
            <button @click="showWorkerForm = true" class="btn-primary">
              <i class="bi bi-plus-circle"></i> {{ $t('add_worker') || 'Ishchi Qoʻshish' }}
            </button>
          </div>

          <!-- Add Worker Form -->
          <div v-if="showWorkerForm" class="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 mb-6">
            <h3 class="text-2xl font-bold mb-4">{{ $t('new_worker') || 'Yangi Ishchi' }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input v-model="workerForm.fullName" type="text" :placeholder="$t('full_name') || 'Toʻliq Ismi'" class="input-field">
              <input v-model="workerForm.phone" type="tel" :placeholder="$t('phone') || 'Telefon'" class="input-field">
              <select v-model="workerForm.role" class="input-field">
                <option value="">{{ $t('select_role') || 'Rol Tanlang' }}</option>
                <option value="Quruvchi">{{ $t('builder') || 'Quruvchi' }}</option>
                <option value="Usta">{{ $t('master') || 'Usta' }}</option>
                <option value="Operator">{{ $t('operator') || 'Operator' }}</option>
                <option value="Mexanik">{{ $t('mechanic') || 'Mexanik' }}</option>
              </select>
            </div>
            <div class="flex gap-2 mt-4">
              <button @click="addWorker" class="btn-primary">{{ $t('save') || 'Saqlash' }}</button>
              <button @click="showWorkerForm = false" class="btn-secondary">{{ $t('cancel') || 'Bekor Qilish' }}</button>
            </div>
          </div>

          <!-- Workers Table -->
          <div class="bg-zinc-800/30 border border-zinc-700 rounded-xl overflow-hidden">
            <table class="w-full">
              <thead class="bg-zinc-800/50 border-b border-zinc-700">
                <tr>
                  <th class="px-6 py-4 text-left font-semibold text-zinc-300">{{ $t('name') || 'Ismi' }}</th>
                  <th class="px-6 py-4 text-left font-semibold text-zinc-300">{{ $t('role') || 'Rol' }}</th>
                  <th class="px-6 py-4 text-left font-semibold text-zinc-300">{{ $t('phone') || 'Telefon' }}</th>
                  <th class="px-6 py-4 text-center font-semibold text-zinc-300">{{ $t('actions') || 'Amallar' }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-700">
                <tr v-for="worker in workers" :key="worker.id" class="hover:bg-zinc-800/20 transition">
                  <td class="px-6 py-4 text-white font-semibold">{{ worker.fullName }}</td>
                  <td class="px-6 py-4 text-zinc-400">{{ worker.role }}</td>
                  <td class="px-6 py-4 text-zinc-400">{{ worker.phone }}</td>
                  <td class="px-6 py-4 text-center">
                    <button @click="deleteWorker(worker.id)" class="text-red-400 hover:text-red-300">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- EQUIPMENT TAB -->
        <div v-if="activeTab === 'equipment'" class="space-y-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-3xl font-black text-white">{{ $t('equipment') || 'Qurilish Texnikalari' }}</h2>
            <button @click="showEquipmentForm = true" class="btn-primary">
              <i class="bi bi-plus-circle"></i> {{ $t('add_equipment') || 'Texnika Qoʻshish' }}
            </button>
          </div>

          <!-- Add Equipment Form -->
          <div v-if="showEquipmentForm" class="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 mb-6">
            <h3 class="text-2xl font-bold mb-4">{{ $t('new_equipment') || 'Yangi Texnika' }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input v-model="equipmentForm.name" type="text" :placeholder="$t('equipment_name') || 'Texnika Nomi'" class="input-field">
              <input v-model="equipmentForm.hourlyRate" type="number" :placeholder="$t('hourly_rate') || 'Soatlik Narxi'" class="input-field">
              <select v-model="equipmentForm.status" class="input-field">
                <option value="Available">{{ $t('available') || 'Mavjud' }}</option>
                <option value="Busy">{{ $t('busy') || 'Bandlangan' }}</option>
                <option value="Maintenance">{{ $t('maintenance') || 'Tamirda' }}</option>
              </select>
            </div>
            <div class="flex gap-2 mt-4">
              <button @click="addEquipment" class="btn-primary">{{ $t('save') || 'Saqlash' }}</button>
              <button @click="showEquipmentForm = false" class="btn-secondary">{{ $t('cancel') || 'Bekor Qilish' }}</button>
            </div>
          </div>

          <!-- Equipment Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="item in equipment" :key="item.id" class="premium-card p-6 border-green-500/10">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="font-bold text-white">{{ item.name }}</h3>
                  <p class="text-sm text-zinc-500">{{ item.hourlyRate }} so'm/soat</p>
                </div>
                <span :class="['text-xs px-2 py-1 rounded', item.status === 'Available' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400']">
                  {{ item.status }}
                </span>
              </div>
              <button @click="deleteEquipment(item.id)" class="w-full btn-secondary text-sm">
                {{ $t('delete') || 'Oʻchirish' }}
              </button>
            </div>
          </div>
        </div>

        <!-- VEHICLES TAB -->
        <div v-if="activeTab === 'vehicles'" class="space-y-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-3xl font-black text-white">{{ $t('vehicles') || 'Transportlar' }}</h2>
            <button @click="showVehicleForm = true" class="btn-primary">
              <i class="bi bi-plus-circle"></i> {{ $t('add_vehicle') || 'Transport Qoʻshish' }}
            </button>
          </div>

          <!-- Add Vehicle Form -->
          <div v-if="showVehicleForm" class="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 mb-6">
            <h3 class="text-2xl font-bold mb-4">{{ $t('new_vehicle') || 'Yangi Transport' }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input v-model="vehicleForm.name" type="text" :placeholder="$t('vehicle_name') || 'Transport Nomi'" class="input-field">
              <input v-model="vehicleForm.plateNum" type="text" :placeholder="$t('plate_number') || 'Raqami'" class="input-field">
              <input v-model="vehicleForm.capacity" type="number" :placeholder="$t('capacity') || 'Sigimi (Tonna)'" class="input-field">
              <input v-model="vehicleForm.pricePerKm" type="number" :placeholder="$t('price_per_km') || 'Narxi (som/km)'" class="input-field">
              <select v-model="vehicleForm.vehicleType" class="input-field">
                <option value="delivery">{{ $t('delivery') || 'Yetkazib Berish' }}</option>
                <option value="service">{{ $t('service') || 'Xizmat' }}</option>
              </select>
            </div>
            <div class="flex gap-2 mt-4">
              <button @click="addVehicle" class="btn-primary">{{ $t('save') || 'Saqlash' }}</button>
              <button @click="showVehicleForm = false" class="btn-secondary">{{ $t('cancel') || 'Bekor Qilish' }}</button>
            </div>
          </div>

          <!-- Vehicles Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="vehicle in vehicles" :key="vehicle.id" class="premium-card p-6 border-blue-500/10">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="font-bold text-white">{{ vehicle.name }}</h3>
                  <p class="text-sm text-zinc-500">{{ vehicle.plateNum }}</p>
                </div>
                <button @click="deleteVehicle(vehicle.id)" class="text-red-400">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
              <div class="grid grid-cols-2 gap-2 text-sm mb-4">
                <div>
                  <p class="text-zinc-500">{{ $t('capacity') || 'Sigimi' }}</p>
                  <p class="text-white font-semibold">{{ vehicle.capacity }} T</p>
                </div>
                <div>
                  <p class="text-zinc-500">{{ $t('price_per_km') || 'Narxi' }}</p>
                  <p class="text-white font-semibold">{{ vehicle.pricePerKm }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- REPORTS TAB -->
        <div v-if="activeTab === 'reports'" class="space-y-6">
          <h2 class="text-3xl font-black text-white">{{ $t('reports_analytics') || 'Hisobotlar va Tahlil' }}</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Territory Revenue -->
            <div class="premium-card p-8 border-amber-500/10">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center">
                  <i class="bi bi-pie-chart text-amber-400 text-2xl"></i>
                </div>
                <div>
                  <p class="text-zinc-400 text-sm">{{ $t('territory_revenue') || 'Hududlar Daromadi' }}</p>
                  <h3 class="text-3xl font-black text-white">{{ territories.length }}</h3>
                </div>
              </div>
              <div class="h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div class="h-full bg-amber-500 w-3/4"></div>
              </div>
            </div>

            <!-- Resource Utilization -->
            <div class="premium-card p-8 border-green-500/10">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center">
                  <i class="bi bi-percent text-green-400 text-2xl"></i>
                </div>
                <div>
                  <p class="text-zinc-400 text-sm">{{ $t('active_equipment') || 'Faol Texnikalar' }}</p>
                  <h3 class="text-3xl font-black text-white">{{ equipment.length }}</h3>
                </div>
              </div>
              <div class="h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div class="h-full bg-green-500 w-2/3"></div>
              </div>
            </div>

            <!-- Worker Workload -->
            <div class="premium-card p-8 border-purple-500/10">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                  <i class="bi bi-speedometer2 text-purple-400 text-2xl"></i>
                </div>
                <div>
                  <p class="text-zinc-400 text-sm">{{ $t('total_workers') || 'Jami Ishchilar' }}</p>
                  <h3 class="text-3xl font-black text-white">{{ workers.length }}</h3>
                </div>
              </div>
              <div class="h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div class="h-full bg-purple-500 w-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- DISPATCHER TAB -->
        <div v-if="activeTab === 'dispatcher'" class="space-y-6">
          <h2 class="text-3xl font-black text-white">{{ $t('dispatcher') || 'Dispatcher - Kalendar va Marshrutlar' }}</h2>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Calendar -->
            <div class="bg-zinc-800/30 border border-zinc-700 rounded-xl p-6">
              <h3 class="text-2xl font-bold mb-6 text-white">{{ $t('schedule') || 'Reja' }}</h3>
              <div class="bg-zinc-700/30 rounded-lg p-8 text-center">
                <p class="text-zinc-400 mb-4">{{ $t('coming_soon') || 'Tez kunda' }}</p>
                <i class="bi bi-calendar-event text-5xl text-zinc-600"></i>
              </div>
            </div>

            <!-- Territory Assignments -->
            <div class="bg-zinc-800/30 border border-zinc-700 rounded-xl p-6">
              <h3 class="text-2xl font-bold mb-6 text-white">{{ $t('territory_assignments') || 'Hudud Tayinlanmasi' }}</h3>
              <div class="space-y-3">
                <div v-for="territory in territories" :key="territory.id" class="bg-zinc-700/30 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <p class="text-white font-semibold">{{ territory.name }}</p>
                    <p class="text-sm text-zinc-500">{{ territory.zoneType || 'Zone' }}</p>
                  </div>
                  <select v-model="territory.assignedWorker" class="bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-white text-sm">
                    <option value="">{{ $t('assign_worker') || 'Ishchi Belgilang' }}</option>
                    <option v-for="worker in workers" :key="worker.id" :value="worker.id">{{ worker.fullName }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ExtraPanel",
  data() {
    return {
      activeTab: "territories",
      tabs: [
        { id: "territories", label: "Hududlar", icon: "bi-map" },
        { id: "workers", label: "Ishchilar", icon: "bi-people" },
        { id: "equipment", label: "Texnikalar", icon: "bi-hammer" },
        { id: "vehicles", label: "Transportlar", icon: "bi-truck" },
        { id: "reports", label: "Hisobotlar", icon: "bi-graph-up" },
        { id: "dispatcher", label: "Dispatcher", icon: "bi-calendar-event" },
      ],
      territories: [],
      workers: [],
      equipment: [],
      vehicles: [],

      showTerritoryForm: false,
      showWorkerForm: false,
      showEquipmentForm: false,
      showVehicleForm: false,

      territoryForm: { name: "", zoneType: "", description: "" },
      workerForm: { fullName: "", phone: "", role: "" },
      equipmentForm: { name: "", hourlyRate: "", status: "Available" },
      vehicleForm: { name: "", plateNum: "", capacity: "", pricePerKm: "", vehicleType: "delivery" },

      loading: false,
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const token = localStorage.getItem("userToken") || localStorage.getItem("token");
        if (!token) return;

        // Load local mock data for now (you can connect to real API later)
        this.territories = JSON.parse(localStorage.getItem("extra_territories") || "[]");
        this.workers = JSON.parse(localStorage.getItem("extra_workers") || "[]");
        this.equipment = JSON.parse(localStorage.getItem("extra_equipment") || "[]");
        this.vehicles = JSON.parse(localStorage.getItem("extra_vehicles") || "[]");
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        this.loading = false;
      }
    },

    // Territory Methods
    async addTerritory() {
      if (!this.territoryForm.name) return;
      const territory = { id: Date.now(), ...this.territoryForm, assignedWorker: "" };
      this.territories.push(territory);
      this.saveTerritories();
      this.territoryForm = { name: "", zoneType: "", description: "" };
      this.showTerritoryForm = false;
    },
    deleteTerritory(id) {
      this.territories = this.territories.filter(t => t.id !== id);
      this.saveTerritories();
    },
    saveTerritories() {
      localStorage.setItem("extra_territories", JSON.stringify(this.territories));
    },

    // Worker Methods
    async addWorker() {
      if (!this.workerForm.fullName) return;
      const worker = { id: Date.now(), ...this.workerForm };
      this.workers.push(worker);
      this.saveWorkers();
      this.workerForm = { fullName: "", phone: "", role: "" };
      this.showWorkerForm = false;
    },
    deleteWorker(id) {
      this.workers = this.workers.filter(w => w.id !== id);
      this.saveWorkers();
    },
    saveWorkers() {
      localStorage.setItem("extra_workers", JSON.stringify(this.workers));
    },

    // Equipment Methods
    async addEquipment() {
      if (!this.equipmentForm.name) return;
      const item = { id: Date.now(), ...this.equipmentForm };
      this.equipment.push(item);
      this.saveEquipment();
      this.equipmentForm = { name: "", hourlyRate: "", status: "Available" };
      this.showEquipmentForm = false;
    },
    deleteEquipment(id) {
      this.equipment = this.equipment.filter(e => e.id !== id);
      this.saveEquipment();
    },
    saveEquipment() {
      localStorage.setItem("extra_equipment", JSON.stringify(this.equipment));
    },

    // Vehicle Methods
    async addVehicle() {
      if (!this.vehicleForm.name) return;
      const vehicle = { id: Date.now(), ...this.vehicleForm, status: "Available" };
      this.vehicles.push(vehicle);
      this.saveVehicles();
      this.vehicleForm = { name: "", plateNum: "", capacity: "", pricePerKm: "", vehicleType: "delivery" };
      this.showVehicleForm = false;
    },
    deleteVehicle(id) {
      this.vehicles = this.vehicles.filter(v => v.id !== id);
      this.saveVehicles();
    },
    saveVehicles() {
      localStorage.setItem("extra_vehicles", JSON.stringify(this.vehicles));
    },

    selectTerritory(territory) {
      console.log("Selected territory:", territory);
    },
  },
};
</script>

<style scoped>
.btn-primary {
  padding: 0.5rem 1rem;
  background: linear-gradient(to right, rgb(180, 83, 9), rgb(234, 88, 12));
  color: white;
  font-weight: 600;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
  cursor: pointer;
  border: none;
}
.btn-primary:hover {
  background: linear-gradient(to right, rgb(234, 88, 12), rgb(249, 115, 22));
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background-color: rgb(39, 39, 42);
  border: 1px solid rgb(63, 63, 70);
  color: white;
  font-weight: 600;
  border-radius: 0.5rem;
  transition: all 0.3s;
  cursor: pointer;
}
.btn-secondary:hover {
  background-color: rgb(63, 63, 70);
}

.input-field {
  width: 100%;
  padding: 0.5rem 1rem;
  background-color: rgb(63, 63, 70);
  border: 1px solid rgb(82, 82, 91);
  border-radius: 0.5rem;
  color: white;
  transition: all 0.3s;
}
.input-field::placeholder {
  color: rgb(113, 113, 122);
}
.input-field:focus {
  border-color: rgb(234, 88, 12);
  outline: none;
}

.premium-card {
  background: linear-gradient(to bottom right, rgba(39, 39, 42, 0.5), rgba(24, 24, 27, 0.3));
  border-radius: 1.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(82, 82, 91, 0.5);
  transition: all 0.3s;
}
.premium-card:hover {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.extra-panel {
  background: radial-gradient(
    circle at bottom left,
    rgba(234, 88, 12, 0.03),
    transparent 600px
  );
}
</style>
