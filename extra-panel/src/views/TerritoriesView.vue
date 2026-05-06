<script setup>
import { ref, onMounted, computed } from 'vue'
import { Plus, Trash2, Map, Globe, Loader2, X, MapPin } from 'lucide-vue-next'
import api from '../services/api'

const items = ref([])
const loading = ref(true)
const submitting = ref(false)
const showModal = ref(false)
const errorMsg = ref('')

// Access Control
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const isSubscriptionActive = computed(() => {
  if (!user.value.extraExpiresAt) return false
  return new Date() < new Date(user.value.extraExpiresAt)
})

const form = ref({ name: '', zoneType: '', description: '' })

const fetchItems = async () => {
  try {
    const { data } = await api.get('extra/territories')
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
    await api.post('extra/territories', form.value)
    showModal.value = false
    form.value = { name: '', zoneType: '', description: '' }
    await fetchItems()
  } catch (error) {
    errorMsg.value = error.response?.data?.message || 'Failed to save territory'
  } finally {
    submitting.value = false
  }
}

const deleteItem = async (id) => {
  if (!isSubscriptionActive.value) return
  if (!confirm('Are you sure?')) return
  try {
    await api.delete(`extra/territories/${id}`)
    await fetchItems()
  } catch (error) {
    console.error(error)
  }
}

onMounted(fetchItems)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold bg-gradient-to-r from-white to-neutral-500 bg-clip-text text-transparent">Geographical Coverage</h2>
        <p class="text-neutral-500 text-sm mt-1">Define operating zones for your logicstics and personnel network.</p>
      </div>
      <button 
        @click="showModal = true" 
        :disabled="!isSubscriptionActive"
        class="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:grayscale transition-all rounded-2xl font-bold shadow-xl shadow-emerald-500/20"
      >
        <Plus class="w-5 h-5" />
        Map Territory
      </button>
    </div>

    <div class="glass-card overflow-hidden rounded-[2.5rem]">
      <div v-if="loading" class="p-12 text-center text-neutral-400 animate-pulse flex flex-col items-center gap-4">
        <Loader2 class="w-8 h-8 animate-spin text-emerald-500" />
        Syncing geographical data...
      </div>
      
      <div v-else-if="items.length === 0" class="p-20 text-center">
        <div class="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 text-neutral-600">
          <Globe :size="40" />
        </div>
        <h3 class="text-xl font-bold text-white mb-2">No Zones Mapped</h3>
        <p class="text-neutral-500 max-w-xs mx-auto mb-8">You haven't defined any servicing territories yet.</p>
        <button 
          @click="showModal = true"
          :disabled="!isSubscriptionActive"
          class="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all font-bold border border-white/10"
        >
          Define First Area
        </button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="bg-white/5 border-b border-white/10 text-neutral-400">
            <tr>
              <th class="py-5 px-8 font-bold text-xs uppercase tracking-widest">Region Name</th>
              <th class="py-5 px-8 font-bold text-xs uppercase tracking-widest">Zone Type</th>
              <th class="py-5 px-8 font-bold text-xs uppercase tracking-widest">Coverage Info</th>
              <th class="py-5 px-8 font-bold text-xs uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr v-for="item in items" :key="item.id" class="hover:bg-white/[0.02] transition-colors group">
              <td class="py-6 px-8 font-bold text-white text-lg">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <MapPin :size="20" />
                  </div>
                  {{ item.name }}
                </div>
              </td>
              <td class="py-6 px-8">
                <span class="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/20 uppercase tracking-widest">
                  {{ item.zoneType || 'Standard' }}
                </span>
              </td>
              <td class="py-6 px-8 text-neutral-400 text-sm leading-relaxed max-w-xs truncate">
                {{ item.description || 'No description provided' }}
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

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <div class="glass-dark w-full max-w-lg rounded-[2.5rem] p-10 shadow-3xl border border-white/10 animate-in fade-in zoom-in duration-300">
        <div class="flex items-center justify-between mb-8">
          <h3 class="text-2xl font-bold text-white flex items-center gap-3">
            <Map class="text-emerald-500" />
            Define Territory
          </h3>
          <button @click="showModal = false" class="text-neutral-500 hover:text-white transition-colors">
            <X class="w-6 h-6" />
          </button>
        </div>

        <div v-if="errorMsg" class="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm">
          {{ errorMsg }}
        </div>

        <form @submit.prevent="submit" class="space-y-6">
          <div class="space-y-2">
            <label class="block text-sm font-bold text-neutral-400 ml-1">Region Name</label>
            <input v-model="form.name" required placeholder="e.g. Tashkent City" class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500/50 transition-all font-medium" />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-bold text-neutral-400 ml-1">Zone Type</label>
            <input v-model="form.zoneType" placeholder="Urban, Rural, Industrial..." class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500/50 transition-all font-medium" />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-bold text-neutral-400 ml-1">Operational Description</label>
            <textarea v-model="form.description" class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500/50 transition-all font-medium" rows="3" placeholder="Service limitations, courier access points..."></textarea>
          </div>
          
          <div class="flex justify-end gap-3 mt-10">
            <button type="button" @click="showModal = false" class="px-6 py-4 text-neutral-400 hover:text-white transition-all font-bold">Cancel</button>
            <button 
              type="submit" 
              :disabled="submitting || !isSubscriptionActive" 
              class="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl transition-all font-bold shadow-xl shadow-emerald-500/20 flex items-center gap-2"
            >
              <Loader2 v-if="submitting" class="w-5 h-5 animate-spin" />
              {{ submitting ? 'Mapping...' : 'Confirm Zone' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
