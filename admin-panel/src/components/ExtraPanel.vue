<template>
  <div class="min-h-screen bg-zinc-950 p-4 sm:p-6">
    <!-- Header -->
    <div class="max-w-7xl mx-auto mb-8">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl md:text-4xl font-black uppercase tracking-tighter">
          Resource <span class="text-orange-500">Management</span>
        </h1>
        <router-link
          to="/dashboard"
          class="px-6 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg text-sm font-bold transition-all"
        >
          Back to Dashboard
        </router-link>
      </div>
    </div>

    <!-- Tabs -->
    <div class="max-w-7xl mx-auto mb-8">
      <div class="flex gap-2 border-b border-zinc-800 overflow-x-auto pb-2 scrollbar-hide">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-6 py-3 font-bold uppercase text-sm tracking-widest transition-all whitespace-nowrap',
            activeTab === tab.id
              ? 'text-orange-500 border-b-2 border-orange-500'
              : 'text-zinc-500 hover:text-zinc-300',
          ]"
        >
          {{ tab.name }}
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-7xl mx-auto">
      <!-- Territories Tab -->
      <div v-if="activeTab === 'territories'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-black">Territories</h2>
          <button
            @click="showTerritoryForm = true"
            class="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all"
          >
            + Add Territory
          </button>
        </div>

        <!-- Add Territory Form -->
        <div v-if="showTerritoryForm" class="premium-card p-6 space-y-4">
          <h3 class="text-lg font-bold">New Territory</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              v-model="newTerritory.name"
              placeholder="Territory Name"
              class="input-field"
            />
            <input
              v-model="newTerritory.zoneType"
              placeholder="Zone Type"
              class="input-field"
            />
            <input
              v-model="newTerritory.description"
              placeholder="Description"
              class="input-field"
            />
          </div>
          <div class="flex gap-4">
            <button
              @click="addTerritory"
              class="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg"
            >
              Save
            </button>
            <button
              @click="showTerritoryForm = false"
              class="px-6 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- Territories List -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="territory in territories"
            :key="territory.id"
            class="premium-card p-6"
          >
            <h3 class="text-lg font-bold text-orange-500">{{ territory.name }}</h3>
            <p class="text-zinc-500 text-sm mt-2">Type: {{ territory.zoneType }}</p>
            <p class="text-zinc-500 text-sm">{{ territory.description }}</p>
            <button
              @click="deleteTerritory(territory.id)"
              class="mt-4 px-4 py-1 bg-red-500/20 text-red-500 text-xs font-bold rounded hover:bg-red-500/30"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Workers Tab -->
      <div v-if="activeTab === 'workers'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-black">Workers</h2>
          <button
            @click="showWorkerForm = true"
            class="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all"
          >
            + Add Worker
          </button>
        </div>

        <!-- Add Worker Form -->
        <div v-if="showWorkerForm" class="premium-card p-6 space-y-4">
          <h3 class="text-lg font-bold">New Worker</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              v-model="newWorker.fullName"
              placeholder="Full Name"
              class="input-field"
            />
            <select v-model="newWorker.role" class="input-field">
              <option value="">Select Role</option>
              <option value="Quruvchi">Quruvchi</option>
              <option value="Usta">Usta</option>
              <option value="Operator">Operator</option>
              <option value="Mexanik">Mexanik</option>
            </select>
            <input
              v-model="newWorker.phone"
              placeholder="Phone Number"
              class="input-field"
            />
          </div>
          <div class="flex gap-4">
            <button
              @click="addWorker"
              class="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg"
            >
              Save
            </button>
            <button
              @click="showWorkerForm = false"
              class="px-6 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- Workers Table -->
        <div class="premium-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-zinc-900">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Name</th>
                  <th class="px-4 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Role</th>
                  <th class="px-4 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Phone</th>
                  <th class="px-4 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="worker in workers" :key="worker.id" class="border-t border-zinc-800">
                  <td class="px-4 py-3">{{ worker.fullName }}</td>
                  <td class="px-4 py-3"><span class="px-2 py-1 bg-blue-500/20 text-blue-500 text-xs font-bold rounded">{{ worker.role }}</span></td>
                  <td class="px-4 py-3 text-zinc-500">{{ worker.phone }}</td>
                  <td class="px-4 py-3">
                    <button
                      @click="deleteWorker(worker.id)"
                      class="px-3 py-1 bg-red-500/20 text-red-500 text-xs font-bold rounded hover:bg-red-500/30"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Equipment Tab -->
      <div v-if="activeTab === 'equipment'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-black">Equipment</h2>
          <button
            @click="showEquipmentForm = true"
            class="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all"
          >
            + Add Equipment
          </button>
        </div>

        <!-- Add Equipment Form -->
        <div v-if="showEquipmentForm" class="premium-card p-6 space-y-4">
          <h3 class="text-lg font-bold">New Equipment</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              v-model="newEquipment.name"
              placeholder="Equipment Name"
              class="input-field"
            />
            <input
              v-model="newEquipment.equipmentType"
              placeholder="Type (e.g., Excavator, Crane)"
              class="input-field"
            />
            <input
              v-model.number="newEquipment.hourlyRate"
              placeholder="Hourly Rate"
              type="number"
              class="input-field"
            />
            <select v-model="newEquipment.status" class="input-field">
              <option value="available">Available</option>
              <option value="in_use">In Use</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div class="flex gap-4">
            <button
              @click="addEquipment"
              class="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg"
            >
              Save
            </button>
            <button
              @click="showEquipmentForm = false"
              class="px-6 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- Equipment Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="eq in equipment"
            :key="eq.id"
            class="premium-card p-6"
          >
            <h3 class="text-lg font-bold text-orange-500">{{ eq.name }}</h3>
            <p class="text-zinc-500 text-sm mt-2">Type: {{ eq.equipmentType }}</p>
            <p class="text-zinc-500 text-sm">Rate: ${{ eq.hourlyRate }}/hour</p>
            <p class="text-sm mt-2">
              <span :class="[
                'px-2 py-1 text-xs font-bold rounded',
                eq.status === 'available' ? 'bg-green-500/20 text-green-500' :
                eq.status === 'in_use' ? 'bg-blue-500/20 text-blue-500' :
                'bg-yellow-500/20 text-yellow-500'
              ]">
                {{ eq.status }}
              </span>
            </p>
            <button
              @click="deleteEquipment(eq.id)"
              class="mt-4 px-4 py-1 bg-red-500/20 text-red-500 text-xs font-bold rounded hover:bg-red-500/30"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Vehicles Tab -->
      <div v-if="activeTab === 'vehicles'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-black">Vehicles</h2>
          <button
            @click="showVehicleForm = true"
            class="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all"
          >
            + Add Vehicle
          </button>
        </div>

        <!-- Add Vehicle Form -->
        <div v-if="showVehicleForm" class="premium-card p-6 space-y-4">
          <h3 class="text-lg font-bold">New Vehicle</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              v-model="newVehicle.name"
              placeholder="Vehicle Name"
              class="input-field"
            />
            <input
              v-model="newVehicle.plateNum"
              placeholder="Plate Number"
              class="input-field"
            />
            <input
              v-model.number="newVehicle.capacity"
              placeholder="Capacity (kg)"
              type="number"
              class="input-field"
            />
            <input
              v-model.number="newVehicle.hourlyRate"
              placeholder="Hourly Rate"
              type="number"
              class="input-field"
            />
          </div>
          <div class="flex gap-4">
            <button
              @click="addVehicle"
              class="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg"
            >
              Save
            </button>
            <button
              @click="showVehicleForm = false"
              class="px-6 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- Vehicles Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="vehicle in vehicles"
            :key="vehicle.id"
            class="premium-card p-6"
          >
            <h3 class="text-lg font-bold text-orange-500">{{ vehicle.name }}</h3>
            <p class="text-zinc-500 text-sm mt-2">Plate: {{ vehicle.plateNum }}</p>
            <p class="text-zinc-500 text-sm">Capacity: {{ vehicle.capacity }}kg</p>
            <p class="text-zinc-500 text-sm">Rate: ${{ vehicle.hourlyRate }}/hour</p>
            <button
              @click="deleteVehicle(vehicle.id)"
              class="mt-4 px-4 py-1 bg-red-500/20 text-red-500 text-xs font-bold rounded hover:bg-red-500/30"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Reports Tab -->
      <div v-if="activeTab === 'reports'" class="space-y-6">
        <h2 class="text-2xl font-black">Reports & Analytics</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="premium-card p-6">
            <p class="text-zinc-500 text-xs uppercase font-bold">Total Territories</p>
            <p class="text-4xl font-black text-orange-500 mt-2">{{ territories.length }}</p>
          </div>
          <div class="premium-card p-6">
            <p class="text-zinc-500 text-xs uppercase font-bold">Active Workers</p>
            <p class="text-4xl font-black text-blue-500 mt-2">{{ workers.length }}</p>
          </div>
          <div class="premium-card p-6">
            <p class="text-zinc-500 text-xs uppercase font-bold">Equipment Available</p>
            <p class="text-4xl font-black text-green-500 mt-2">
              {{ equipment.filter(e => e.status === 'available').length }}
            </p>
          </div>
          <div class="premium-card p-6">
            <p class="text-zinc-500 text-xs uppercase font-bold">Total Vehicles</p>
            <p class="text-4xl font-black text-purple-500 mt-2">{{ vehicles.length }}</p>
          </div>
        </div>

        <div class="premium-card p-6">
          <h3 class="text-lg font-bold mb-4">Equipment Status Breakdown</h3>
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span>Available</span>
              <span class="text-green-500">{{ equipment.filter(e => e.status === 'available').length }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>In Use</span>
              <span class="text-blue-500">{{ equipment.filter(e => e.status === 'in_use').length }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>Maintenance</span>
              <span class="text-yellow-500">{{ equipment.filter(e => e.status === 'maintenance').length }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Dispatcher Tab -->
      <div v-if="activeTab === 'dispatcher'" class="space-y-6">
        <h2 class="text-2xl font-black">Dispatcher</h2>
        <div class="premium-card p-6 text-center">
          <p class="text-zinc-500">Coming soon - Advanced scheduling and dispatch management</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExtraPanel',
  data() {
    return {
      activeTab: 'territories',
      tabs: [
        { id: 'territories', name: 'Territories' },
        { id: 'workers', name: 'Workers' },
        { id: 'equipment', name: 'Equipment' },
        { id: 'vehicles', name: 'Vehicles' },
        { id: 'reports', name: 'Reports' },
        { id: 'dispatcher', name: 'Dispatcher' },
      ],
      territories: [],
      workers: [],
      equipment: [],
      vehicles: [],
      showTerritoryForm: false,
      showWorkerForm: false,
      showEquipmentForm: false,
      showVehicleForm: false,
      newTerritory: { name: '', zoneType: '', description: '' },
      newWorker: { fullName: '', role: '', phone: '' },
      newEquipment: { name: '', equipmentType: '', hourlyRate: 0, status: 'available' },
      newVehicle: { name: '', plateNum: '', capacity: 0, hourlyRate: 0 },
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      const territories = localStorage.getItem('extra_territories');
      const workers = localStorage.getItem('extra_workers');
      const equipment = localStorage.getItem('extra_equipment');
      const vehicles = localStorage.getItem('extra_vehicles');

      this.territories = territories ? JSON.parse(territories) : [];
      this.workers = workers ? JSON.parse(workers) : [];
      this.equipment = equipment ? JSON.parse(equipment) : [];
      this.vehicles = vehicles ? JSON.parse(vehicles) : [];
    },
    saveData() {
      localStorage.setItem('extra_territories', JSON.stringify(this.territories));
      localStorage.setItem('extra_workers', JSON.stringify(this.workers));
      localStorage.setItem('extra_equipment', JSON.stringify(this.equipment));
      localStorage.setItem('extra_vehicles', JSON.stringify(this.vehicles));
    },
    addTerritory() {
      if (this.newTerritory.name.trim()) {
        this.territories.push({
          id: Date.now(),
          ...this.newTerritory,
        });
        this.saveData();
        this.newTerritory = { name: '', zoneType: '', description: '' };
        this.showTerritoryForm = false;
      }
    },
    deleteTerritory(id) {
      this.territories = this.territories.filter(t => t.id !== id);
      this.saveData();
    },
    addWorker() {
      if (this.newWorker.fullName.trim()) {
        this.workers.push({
          id: Date.now(),
          ...this.newWorker,
        });
        this.saveData();
        this.newWorker = { fullName: '', role: '', phone: '' };
        this.showWorkerForm = false;
      }
    },
    deleteWorker(id) {
      this.workers = this.workers.filter(w => w.id !== id);
      this.saveData();
    },
    addEquipment() {
      if (this.newEquipment.name.trim()) {
        this.equipment.push({
          id: Date.now(),
          ...this.newEquipment,
        });
        this.saveData();
        this.newEquipment = { name: '', equipmentType: '', hourlyRate: 0, status: 'available' };
        this.showEquipmentForm = false;
      }
    },
    deleteEquipment(id) {
      this.equipment = this.equipment.filter(e => e.id !== id);
      this.saveData();
    },
    addVehicle() {
      if (this.newVehicle.name.trim()) {
        this.vehicles.push({
          id: Date.now(),
          ...this.newVehicle,
        });
        this.saveData();
        this.newVehicle = { name: '', plateNum: '', capacity: 0, hourlyRate: 0 };
        this.showVehicleForm = false;
      }
    },
    deleteVehicle(id) {
      this.vehicles = this.vehicles.filter(v => v.id !== id);
      this.saveData();
    },
  },
};
</script>

<style scoped>
.premium-card {
  background: rgba(15, 15, 15, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.input-field {
  width: 100%;
  padding: 10px 12px;
  background: rgba(45, 45, 45, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  transition: all 0.3s;
}

.input-field:focus {
  outline: none;
  border-color: rgba(255, 152, 0, 0.5);
  background: rgba(45, 45, 45, 0.8);
}

.input-field::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
