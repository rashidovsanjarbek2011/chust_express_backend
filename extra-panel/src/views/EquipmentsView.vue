<script setup>
import { ref, onMounted, computed } from 'vue'
import { Plus, Trash2, Wrench, MapPin, Star, Image, DollarSign, ChevronRight, ChevronLeft, Loader2, X, Hammer, Sparkles } from 'lucide-vue-next'
import api from '../services/api'
import PhotoManager from '../components/PhotoManager.vue'

const items = ref([])
const loading = ref(true)
const submitting = ref(false)
const showModal = ref(false)
const errorMsg = ref('')
const currentStep = ref(1)

// Access Control
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const isSubscriptionActive = computed(() => {
  if (!user.value.extraExpiresAt) return false
  return new Date() < new Date(user.value.extraExpiresAt)
})

const defaultForm = {
  name: '',
  hourlyRate: 0,
  description: '',
  district: '',
  photos: [],
  productionYear: new Date().getFullYear(),
  pricingModel: 'Hourly',
  price: 0,
  status: 'Available'
}
const form = ref({ ...defaultForm })

const fetchItems = async () => {
  try {
    const { data } = await api.get('extra/construction-equipments')
    items.value = data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const submit = async () => {
  if (!isSubscriptionActive.value) return
  
  submitting.value = true
  errorMsg.value = ''
  try {
    await api.post('extra/construction-equipments', form.value)
    showModal.value = false
    form.value = { ...defaultForm }
    currentStep.value = 1
    await fetchItems()
  } catch (error) {
    errorMsg.value = error.response?.data?.message || 'Failed to save equipment'
  } finally {
    submitting.value = false
  }
}

const deleteItem = async (id) => {
  if (!isSubscriptionActive.value) return
  if (!confirm('Are you sure?')) return
  try {
    await api.delete(`extra/construction-equipments/${id}`)
    await fetchItems()
  } catch (error) {
    console.error(error)
  }
}

const nextStep = () => {
  errorMsg.value = ''
  
  if (currentStep.value === 1) {
    if (!form.value.name) return errorMsg.value = 'Equipment Name is required'
  }
  
  if (currentStep.value === 3) {
    if (!form.value.district) return errorMsg.value = 'Operation District is required'
  }
  
  if (currentStep.value === 6) {
    if (form.value.price <= 0) return errorMsg.value = 'Please set a valid rate value'
  }

  if (currentStep.value < 6) currentStep.value++
}

const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--
}

onMounted(fetchItems)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold bg-gradient-to-r from-white to-neutral-500 bg-clip-text text-transparent">Construction & Heavy Machinery</h2>
        <p class="text-neutral-500 text-sm mt-1">Registry of earth-movers, lifting cranes, and heavy industrial gear.</p>
      </div>
      <button 
        @click="showModal = true" 
        :disabled="!isSubscriptionActive"
        class="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:grayscale transition-all rounded-2xl font-bold shadow-xl shadow-indigo-500/20"
      >
        <Plus class="w-5 h-5" />
        Record Unit
      </button>
    </div>

    <!-- Stats summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="glass-dark p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 blur-3xl rounded-full group-hover:bg-amber-500/20 transition-colors"></div>
        <p class="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-1">Active Machinery</p>
        <p class="text-4xl font-bold text-white">{{ items.length }}</p>
      </div>
    </div>

    <!-- Table -->
    <div class="glass-card overflow-hidden rounded-[2.5rem]">
      <div v-if="loading" class="p-12 text-center text-neutral-400 animate-pulse flex flex-col items-center gap-4">
        <Loader2 class="w-8 h-8 animate-spin text-amber-500" />
        Scanning industrial inventory...
      </div>
      
      <div v-else-if="items.length === 0" class="p-20 text-center">
        <div class="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 text-neutral-600">
          <Hammer :size="40" />
        </div>
        <h3 class="text-xl font-bold text-white mb-2">No Heavy Gear Found</h3>
        <p class="text-neutral-500 max-w-xs mx-auto mb-8">No bulldozers, excavators or cranes have been added to the registry.</p>
        <button 
          @click="showModal = true"
          :disabled="!isSubscriptionActive"
          class="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all font-bold border border-white/10"
        >
          Add First Unit
        </button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="bg-white/5 border-b border-white/10 text-neutral-400">
            <tr>
              <th class="py-5 px-8 font-bold text-xs uppercase tracking-widest">Model & Spec</th>
              <th class="py-5 px-8 font-bold text-xs uppercase tracking-widest">Rental Pricing</th>
              <th class="py-5 px-8 font-bold text-xs uppercase tracking-widest">Zone</th>
              <th class="py-5 px-8 font-bold text-xs uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr v-for="item in items" :key="item.id" class="hover:bg-white/[0.02] transition-colors group">
              <td class="py-6 px-8">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                    <Hammer :size="24" />
                  </div>
                  <div>
                    <p class="font-bold text-white text-lg">{{ item.name }}</p>
                    <p class="text-amber-500 text-xs font-bold uppercase tracking-wider">{{ item.status || 'Available' }}</p>
                    <p class="text-neutral-500 text-xs mt-1">{{ item.productionYear }} Industrial Build</p>
                  </div>
                </div>
              </td>
              <td class="py-6 px-8">
                <div class="space-y-1">
                  <p class="text-xl font-bold text-white">{{ item.price?.toLocaleString() }} <span class="text-xs text-neutral-500 font-normal font-mono">UZS</span></p>
                  <p class="text-xs text-neutral-400 uppercase font-bold tracking-tighter">Per {{ item.pricingModel }}</p>
                </div>
              </td>
              <td class="py-6 px-8">
                <div class="flex items-center gap-2 text-neutral-400">
                  <MapPin :size="16" class="text-amber-500" />
                  <span class="text-sm font-medium">{{ item.district || 'Global Coverage' }}</span>
                </div>
              </td>
              <td class="py-6 px-8 text-right">
                <button @click="deleteItem(item.id)" class="p-3 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all">
                  <Trash2 class="w-5 h-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Multi-Step Registration Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <div class="glass-dark w-full max-w-2xl rounded-[3rem] border border-white/10 shadow-3xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <!-- Progress Bar -->
        <div class="h-1.5 w-full bg-white/5 flex">
          <div 
            v-for="step in 6" 
            :key="step"
            class="h-full transition-all duration-500 ease-out"
            :class="[
              step <= currentStep ? 'bg-gradient-to-r from-amber-600 to-orange-600 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : '',
              'flex-1 border-r border-black/20 last:border-0'
            ]"
          ></div>
        </div>

        <div class="p-10">
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-amber-600/20 rounded-2xl flex items-center justify-center text-amber-500">
                <span class="font-bold text-xl">{{ currentStep }}</span>
              </div>
              <h3 class="text-2xl font-bold text-white">
                <template v-if="currentStep === 1">Machine Specs</template>
                <template v-if="currentStep === 2">Category</template>
                <template v-if="currentStep === 3">Coverage Area</template>
                <template v-if="currentStep === 4">Technical Audit</template>
                <template v-if="currentStep === 5">Unit Visuals</template>
                <template v-if="currentStep === 6">Pricing Setup</template>
              </h3>
            </div>
            <button @click="showModal = false" class="text-neutral-500 hover:text-white transition-colors">
              <X class="w-6 h-6" />
            </button>
          </div>

          <div v-if="errorMsg" class="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm">
            {{ errorMsg }}
          </div>

          <!-- Step 1: Specs -->
          <div v-if="currentStep === 1" class="space-y-6">
            <div class="grid grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="block text-sm font-bold text-neutral-400 ml-1">Equipment Name</label>
                <input v-model="form.name" placeholder="e.g. Caterpillar 320" class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-amber-500/50 transition-all font-medium" />
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-bold text-neutral-400 ml-1">Production Year</label>
                <input v-model.number="form.productionYear" type="number" class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-amber-500/50 transition-all font-medium" />
              </div>
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-bold text-neutral-400 ml-1">Technical Description</label>
              <textarea v-model="form.description" rows="3" placeholder="Condition, engine capacity, attachments included..." class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-amber-500/50 transition-all font-medium"></textarea>
            </div>
          </div>

          <!-- Step 2: Category -->
          <div v-if="currentStep === 2" class="space-y-4">
            <label class="block text-sm font-bold text-neutral-400 ml-1 mb-4">Select Machinery Type</label>
            <div class="grid grid-cols-3 gap-3">
              <button 
                v-for="cat in ['Excavator', 'Crane', 'Dump Truck', 'Bulldozer', 'Concrete Mixer', 'Loader', 'Tractor', 'Evacuator', 'Generator']" 
                :key="cat"
                @click="form.name = cat + ' (Generic)'"
                class="px-4 py-3 bg-white/5 text-neutral-400 border border-white/10 hover:border-white/30 rounded-xl transition-all text-sm font-bold"
              >
                {{ cat }}
              </button>
            </div>
          </div>

          <!-- Step 3: Territory -->
          <div v-if="currentStep === 3" class="space-y-6">
            <div class="space-y-2">
              <label class="block text-sm font-bold text-neutral-400 ml-1">Primary Job Site District</label>
              <input v-model="form.district" placeholder="e.g. Navoi Industrial Zone" class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-amber-500/50 transition-all font-medium" />
            </div>
            <p class="text-xs text-neutral-500 p-6 bg-white/5 rounded-[2rem] border border-white/5 border-dashed leading-relaxed">
              Define the geographical boundary for this equipment. Heavy machinery transport costs are often calculated based on distance from this base point.
            </p>
          </div>

          <!-- Step 4: Level/Rating -->
          <div v-if="currentStep === 4" class="text-center py-8">
            <Star :size="64" class="text-amber-500 opacity-20 mx-auto mb-6" />
            <h4 class="text-lg font-bold text-white mb-2">Service Standards</h4>
            <p class="text-neutral-500 text-sm max-w-xs mx-auto">This unit will be listed with an "A-Class" technical rating initially. Real rating will be updated upon physical inspection.</p>
          </div>

          <!-- Step 5: Visuals -->
          <div v-if="currentStep === 5" class="space-y-8 animate-fade-in px-2">
            <div class="text-center mb-10">
              <div class="w-20 h-20 bg-amber-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-white/5">
                <Hammer class="text-amber-400" :size="40" />
              </div>
              <h3 class="text-3xl font-bold text-white mb-2">Technical Documentation</h3>
              <p class="text-neutral-500 text-sm">Upload several photos of the machinery unit from different angles for better visibility.</p>
            </div>
            
            <PhotoManager v-model="form.photos" />
          </div>

          <!-- Step 6: Pricing -->
          <div v-if="currentStep === 6" class="space-y-6">
            <div class="grid grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="block text-sm font-bold text-neutral-400 ml-1">Billing Period</label>
                <select v-model="form.pricingModel" class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none appearance-none focus:border-amber-500/50 transition-all font-medium">
                  <option>Hourly</option>
                  <option>Daily</option>
                  <option>Shift (8h)</option>
                  <option>Monthly</option>
                  <option>Contractual</option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-bold text-neutral-400 ml-1">Base Price (UZS)</label>
                <div class="relative">
                  <DollarSign :size="18" class="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input v-model.number="form.price" type="number" class="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 outline-none focus:border-amber-500/50 transition-all font-bold" />
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-between gap-4 mt-12 bg-white/5 -mx-10 -mb-10 p-6 border-t border-white/10 backdrop-blur-md">
            <button 
              type="button" 
              @click="currentStep === 1 ? showModal = false : prevStep()" 
              class="px-8 py-3 text-neutral-400 hover:text-white transition-all font-bold flex items-center gap-2"
            >
              <ChevronLeft v-if="currentStep > 1" class="w-5 h-5" />
              {{ currentStep === 1 ? 'Discard' : 'Backstage' }}
            </button>
            <div class="flex items-center gap-3">
              <button 
                v-if="currentStep < 6"
                type="button" 
                @click="nextStep"
                class="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-[1.25rem] transition-all font-bold flex items-center gap-2"
              >
                Next Specification
                <ChevronRight class="w-5 h-5" />
              </button>
              <button 
                v-else
                @click="submit"
                :disabled="submitting || !isSubscriptionActive"
                class="px-10 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:scale-105 disabled:opacity-50 text-white rounded-[1.25rem] transition-all font-bold shadow-xl shadow-amber-500/30 flex items-center gap-2"
              >
                <Loader2 v-if="submitting" class="w-5 h-5 animate-spin" />
                {{ submitting ? 'Archiving Specs...' : 'Commit Machinery' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
