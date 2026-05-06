<script setup>
import { ref, onMounted, computed } from 'vue'
import { Plus, Trash2, Truck, MapPin, Star, Image, DollarSign, ChevronRight, ChevronLeft, Loader2, X, Settings, Sparkles } from 'lucide-vue-next'
import api from '../services/api'
import PhotoManager from '../components/PhotoManager.vue'

const items = ref([])
const loading = ref(true)
const submitting = ref(false)
const showModal = ref(false)
const showImagesModal = ref(false)
const selectedVehicleImages = ref([])
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
  plateNum: '',
  capacity: 0,
  phone: '',
  description: '',
  district: '',
  photos: [],
  productionYear: new Date().getFullYear(),
  pricingModel: 'Hourly',
  price: 0
}
const form = ref({ ...defaultForm })

const fetchItems = async () => {
  try {
    const { data } = await api.get('extra/delivery-vehicles')
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
    // Explicitly filter form data to only include allowed fields
    const formData = {
      name: form.value.name,
      plateNum: form.value.plateNum,
      capacity: form.value.capacity,
      phone: form.value.phone,
      pricePerKm: form.value.pricePerKm,
      description: form.value.description,
      district: form.value.district,
      photos: form.value.photos,
      productionYear: form.value.productionYear,
      pricingModel: form.value.pricingModel,
      price: form.value.price
    }
    await api.post('extra/delivery-vehicles', formData)
    showModal.value = false
    form.value = { ...defaultForm }
    currentStep.value = 1
    await fetchItems()
  } catch (error) {
    errorMsg.value = error.response?.data?.message || 'Failed to save vehicle'
  } finally {
    submitting.value = false
  }
}

const showVehicleImages = (vehicle) => {
  selectedVehicleImages.value = vehicle.photos || []
  showImagesModal.value = true
}

const deleteItem = async (id) => {
  if (!isSubscriptionActive.value) return
  if (!confirm('Are you sure?')) return
  try {
    await api.delete(`extra/delivery-vehicles/${id}`)
    await fetchItems()
  } catch (error) {
    console.error(error)
  }
}

const nextStep = () => {
  errorMsg.value = ''
  
  if (currentStep.value === 1) {
    if (!form.value.name) return errorMsg.value = 'Vehicle Make & Model is required'
    if (!form.value.plateNum) return errorMsg.value = 'Plate Number is required'
  }
  
  if (currentStep.value === 2) {
    if (!form.value.district) return errorMsg.value = 'Deployment District is required'
  }
  
  if (currentStep.value === 4) {
    // Photo step - no validation required
  }
  
  if (currentStep.value === 5) {
    if (!form.value.description) return errorMsg.value = 'Asset Description is required'
    if (form.value.price <= 0) return errorMsg.value = 'Please set a valid service rate'
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
        <h2 class="text-3xl font-bold bg-gradient-to-r from-white to-neutral-500 bg-clip-text text-transparent">Vehicle Fleet</h2>
        <p class="text-neutral-500 text-sm mt-1">Manage transport assets including delivery trucks and taxi services.</p>
      </div>
      <button 
        @click="showModal = true" 
        :disabled="!isSubscriptionActive"
        class="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:grayscale transition-all rounded-2xl font-bold shadow-xl shadow-indigo-500/20"
      >
        <Plus class="w-5 h-5" />
        Add Vehicle
      </button>
    </div>

    <!-- Stats summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="glass-dark p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-cyan-500/10 blur-3xl rounded-full group-hover:bg-cyan-500/20 transition-colors"></div>
        <p class="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-1">Total Assets</p>
        <p class="text-4xl font-bold text-white">{{ items.length }}</p>
      </div>
    </div>

    <!-- Table -->
    <div class="glass-card overflow-hidden rounded-[2.5rem]">
      <div v-if="loading" class="p-12 text-center text-neutral-400 animate-pulse flex flex-col items-center gap-4">
        <Loader2 class="w-8 h-8 animate-spin text-cyan-500" />
        Updating fleet data...
      </div>
      
      <div v-else-if="items.length === 0" class="p-20 text-center">
        <div class="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 text-neutral-600">
          <Truck :size="40" />
        </div>
        <h3 class="text-xl font-bold text-white mb-2">Fleet is Empty</h3>
        <p class="text-neutral-500 max-w-xs mx-auto mb-8">No delivery or taxi vehicles have been registered yet.</p>
        <button 
          @click="showModal = true"
          :disabled="!isSubscriptionActive"
          class="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all font-bold border border-white/10"
        >
          Add First Vehicle
        </button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="bg-white/5 border-b border-white/10 text-neutral-400">
            <tr>
              <th class="py-5 px-8 font-bold text-xs uppercase tracking-widest">Model & ID</th>
              <th class="py-5 px-8 font-bold text-xs uppercase tracking-widest">Phone</th>
              <th class="py-5 px-8 font-bold text-xs uppercase tracking-widest">Capacity</th>
              <th class="py-5 px-8 font-bold text-xs uppercase tracking-widest">Pricing</th>
              <th class="py-5 px-8 font-bold text-xs uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr v-for="item in items" :key="item.id" class="hover:bg-white/[0.02] transition-colors group">
              <td class="py-6 px-8">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform cursor-pointer" @click="showVehicleImages(item)">
                    <Truck :size="24" />
                  </div>
                  <div>
                    <p class="font-bold text-white text-lg">{{ item.name }}</p>
                    <p class="text-cyan-400 text-xs font-mono font-bold uppercase tracking-widest">{{ item.plateNum }}</p>
                    <p class="text-neutral-500 text-xs mt-1">{{ item.productionYear }} Model</p>
                  </div>
                </div>
              </td>
              <td class="py-6 px-8">
                <p class="text-white font-mono">{{ item.phone || 'Not set' }}</p>
              </td>
              <td class="py-6 px-8">
                <div class="space-y-1">
                  <p class="text-xl font-bold text-white">{{ item.capacity }} <span class="text-xs text-neutral-500 font-normal">T/M³</span></p>
                  <div class="flex items-center gap-2">
                    <span class="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-lg text-xs font-bold border border-cyan-500/20 uppercase tracking-wider">
                      {{ item.pricingModel }}
                    </span>
                    <p class="text-xs text-neutral-400">{{ item.price?.toLocaleString() }} UZS</p>
                  </div>
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
              step <= currentStep ? 'bg-gradient-to-r from-cyan-600 to-blue-600 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : '',
              'flex-1 border-r border-black/20 last:border-0'
            ]"
          ></div>
        </div>

        <div class="p-10">
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-cyan-600/20 rounded-2xl flex items-center justify-center text-cyan-400">
                <span class="font-bold text-xl">{{ currentStep }}</span>
              </div>
              <h3 class="text-2xl font-bold text-white">
                <template v-if="currentStep === 1">Vehicle Basics</template>
                <template v-if="currentStep === 2">Fleet Territory</template>
                <template v-if="currentStep === 3">Vehicle Condition</template>
                <template v-if="currentStep === 4">Visual Portfolio</template>
                <template v-if="currentStep === 5">Revenue Model</template>
                <template v-if="currentStep === 6">Final Review</template>
              </h3>
            </div>
            <button @click="showModal = false" class="text-neutral-500 hover:text-white transition-colors">
              <X class="w-6 h-6" />
            </button>
          </div>

          <div v-if="errorMsg" class="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm">
            {{ errorMsg }}
          </div>

          <!-- Step 1: Basics -->
          <div v-if="currentStep === 1" class="space-y-6">
            <div class="grid grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="block text-sm font-bold text-neutral-400 ml-1">Make & Model</label>
                <input v-model="form.name" placeholder="e.g. Isuzu Forward" class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-cyan-500/50 transition-all font-medium" />
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-bold text-neutral-400 ml-1">Plate Number</label>
                <input v-model="form.plateNum" placeholder="01 A 777 AA" class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-cyan-500/50 transition-all font-mono font-bold" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="block text-sm font-bold text-neutral-400 ml-1">Load Capacity (Tons/M³)</label>
                <input v-model.number="form.capacity" type="number" step="0.1" class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-cyan-500/50 transition-all font-medium" />
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-bold text-neutral-400 ml-1">Production Year</label>
                <input v-model.number="form.productionYear" type="number" class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-cyan-500/50 transition-all font-medium" />
              </div>
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-bold text-neutral-400 ml-1">Contact Phone</label>
              <input v-model="form.phone" placeholder="+998 90 123 45 67" class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-cyan-500/50 transition-all font-medium" />
            </div>
          </div>

          <!-- Step 2: Territory -->
          <div v-if="currentStep === 2" class="space-y-6">
            <div class="space-y-2">
              <label class="block text-sm font-bold text-neutral-400 ml-1">Deployment District / City</label>
              <input v-model="form.district" placeholder="e.g. Tashkent, Sergeli" class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-cyan-500/50 transition-all font-medium" />
            </div>
            <p class="text-xs text-neutral-500 p-4 bg-white/5 rounded-2xl border border-white/5 border-dashed leading-relaxed">
              Define primary operating zone for this vehicle. This helps in dispatching locally relevant orders and tasks.
            </p>
          </div>

          <!-- Step 3: Condition -->
          <div v-if="currentStep === 3" class="text-center py-8">
            <Star :size="64" class="text-cyan-400 opacity-20 mx-auto mb-6" />
            <h4 class="text-lg font-bold text-white mb-2">Technical Status</h4>
            <p class="text-neutral-500 text-sm max-w-xs mx-auto mb-8">All fleet units are listed as "Excellent/New" initially. Market rating will evolve based on driver conduct and vehicle hygiene.</p>
            <div class="flex items-center justify-center gap-2">
              <Star v-for="i in 5" :key="i" :size="24" class="text-neutral-700" />
            </div>
          </div>

          <!-- Step 4: Visuals -->
          <div v-if="currentStep === 4" class="space-y-8 animate-fade-in px-2">
            <div class="text-center mb-10">
              <div class="w-20 h-20 bg-cyan-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-white/5">
                <Image class="text-cyan-400" :size="40" />
              </div>
              <h3 class="text-3xl font-bold text-white mb-2">Fleet Gallery</h3>
              <p class="text-neutral-500 text-sm">Add high-quality photos of your vehicle (Exterior, interior, and license plate).</p>
            </div>
            
            <PhotoManager v-model="form.photos" />
          </div>

          <!-- Step 5: Pricing -->
          <div v-if="currentStep === 5" class="space-y-6">
            <div class="grid grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="block text-sm font-bold text-neutral-400 ml-1">Billing Model</label>
                <select v-model="form.pricingModel" class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none appearance-none focus:border-cyan-500/50 transition-all font-medium">
                  <option>Hourly</option>
                  <option>Daily</option>
                  <option>Per km</option>
                  <option>Per Trip</option>
                  <option>Monthly</option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-bold text-neutral-400 ml-1">Service Rate (UZS)</label>
                <div class="relative">
                  <DollarSign :size="18" class="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input v-model.number="form.price" type="number" class="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 outline-none focus:border-cyan-500/50 transition-all font-bold" />
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-bold text-neutral-400 ml-1">Asset Description</label>
              <textarea v-model="form.description" rows="2" placeholder="Describe vehicle condition, features, or restrictions..." class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-cyan-500/50 transition-all font-medium"></textarea>
            </div>
          </div>

          <!-- Step 6: Final Review -->
          <div v-if="currentStep === 6" class="text-center py-8">
            <div class="w-20 h-20 bg-green-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-white/5">
              <Sparkles class="text-green-400" :size="40" />
            </div>
            <h3 class="text-3xl font-bold text-white mb-2">Ready to Deploy</h3>
            <p class="text-neutral-500 text-sm max-w-xs mx-auto mb-8">Review your vehicle details and click "Register Asset" to add it to your fleet.</p>
            <div class="bg-white/5 rounded-2xl p-6 text-left max-w-md mx-auto">
              <h4 class="font-bold text-white mb-4">Vehicle Summary:</h4>
              <div class="space-y-2 text-sm">
                <p class="text-neutral-400"><span class="text-white">Model:</span> {{ form.name || 'Not specified' }}</p>
                <p class="text-neutral-400"><span class="text-white">Plate:</span> {{ form.plateNum || 'Not specified' }}</p>
                <p class="text-neutral-400"><span class="text-white">Phone:</span> {{ form.phone || 'Not specified' }}</p>
                <p class="text-neutral-400"><span class="text-white">District:</span> {{ form.district || 'Not specified' }}</p>
                <p class="text-neutral-400"><span class="text-white">Pricing:</span> {{ form.pricingModel }} - {{ form.price?.toLocaleString() }} UZS</p>
                <p class="text-neutral-400"><span class="text-white">Photos:</span> {{ form.photos?.length || 0 }} uploaded</p>
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
              {{ currentStep === 1 ? 'Cancel Registration' : 'Previous' }}
            </button>
            <div class="flex items-center gap-3">
              <button 
                v-if="currentStep < 6"
                type="button" 
                @click="nextStep"
                class="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-[1.25rem] transition-all font-bold flex items-center gap-2"
              >
                Validate Stage
                <ChevronRight class="w-5 h-5" />
              </button>
              <button 
                v-else
                @click="submit"
                :disabled="submitting || !isSubscriptionActive"
                class="px-10 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:scale-105 disabled:opacity-50 text-white rounded-[1.25rem] transition-all font-bold shadow-xl shadow-cyan-500/30 flex items-center gap-2"
              >
                <Loader2 v-if="submitting" class="w-5 h-5 animate-spin" />
                {{ submitting ? 'Deploying to Fleet...' : 'Register Asset' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Images Modal -->
    <div v-if="showImagesModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <div class="glass-dark w-full max-w-4xl rounded-[3rem] border border-white/10 shadow-3xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div class="p-8">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-white">Vehicle Images</h3>
            <button @click="showImagesModal = false" class="text-neutral-500 hover:text-white transition-colors">
              <X class="w-6 h-6" />
            </button>
          </div>
          
          <div v-if="selectedVehicleImages.length === 0" class="text-center py-12">
            <Image class="w-16 h-16 text-neutral-500 mx-auto mb-4" />
            <p class="text-neutral-400">No images uploaded for this vehicle</p>
          </div>
          
          <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div v-for="(image, index) in selectedVehicleImages" :key="index" class="relative group">
              <img 
                :src="image" 
                :alt="`Vehicle image ${index + 1}`"
                class="w-full h-48 object-cover rounded-2xl border border-white/10"
              />
              <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                <button 
                  @click="window.open(image, '_blank')"
                  class="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                >
                  <Settings class="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
