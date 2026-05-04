<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Users, Truck, Wrench, Map, ArrowRight, FolderPlus, Key, ShieldAlert, Sparkles, AlertCircle } from 'lucide-vue-next'
import api from '../services/api'

const stats = ref({
  workers: 0,
  vehicles: 0,
  equipment: 0,
  territories: 0,
  rentals: 0
})
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const loading = ref(true)
const router = useRouter()

const isSubscriptionActive = computed(() => {
  if (!user.value.extraExpiresAt) return false
  return new Date() < new Date(user.value.extraExpiresAt)
})

const fetchStats = async () => {
  loading.value = true
  try {
    const { data } = await api.get('extra/stats')
    stats.value = data
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStats()
  window.addEventListener('storage', () => {
    user.value = JSON.parse(localStorage.getItem('user') || '{}')
  })
})

const navigateTo = (name) => {
  router.push({ name })
}
</script>

<template>
  <div class="space-y-10 pb-20">
    <!-- Hero Header -->
    <header class="relative overflow-hidden p-10 md:p-14 rounded-[3rem] bg-neutral-950 border border-white/5 shadow-3xl">
      <!-- Animated Background Blobs -->
      <div class="absolute -top-24 -right-24 w-80 h-80 bg-indigo-600/20 blur-[120px] rounded-full animate-pulse"></div>
      <div class="absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-600/20 blur-[120px] rounded-full animate-pulse" style="animation-delay: 2s"></div>
      
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div class="max-w-2xl">
          <div class="flex items-center gap-2 mb-6">
            <div class="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/50 flex items-center gap-1.5">
              <Sparkles :size="10" />
              Central Operations Hub
            </div>
            <button 
              @click="fetchStats" 
              class="ml-auto p-2 bg-white/5 hover:bg-white/10 rounded-xl text-neutral-500 hover:text-white transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter"
            >
              <Sparkles :size="12" :class="{ 'animate-spin': loading }" />
              Refresh Data
            </button>
          </div>
          <h2 class="text-4xl md:text-5xl font-bold text-white leading-tight">
            Welcome, <span class="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">{{ user?.username || 'Service Partner' }}</span>
          </h2>
          <p class="text-neutral-500 mt-4 text-lg font-medium leading-relaxed">
            Monitor infrastructure, manage personnel, and track your service assets across all regions. 
            {{ isSubscriptionActive ? 'Your command center is fully active.' : 'Activate your panel to start managing resources.' }}
          </p>
        </div>
        
        <!-- Subscription Status CTA -->
        <div v-if="!isSubscriptionActive" class="shrink-0">
          <button 
            @click="navigateTo('activate')"
            class="group relative p-1 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 transition-transform active:scale-95"
          >
            <div class="bg-neutral-950 rounded-[1.4rem] px-8 py-5 flex items-center gap-4 group-hover:bg-transparent transition-colors">
              <Key class="text-white group-hover:scale-110 transition-transform" />
              <div class="text-left">
                <p class="text-white font-bold text-lg leading-none mb-1">Activate Now</p>
                <p class="text-neutral-500 text-xs group-hover:text-white/80">Unlock management tools</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>

    <!-- Subscription Lock Warning -->
    <div v-if="!isSubscriptionActive" class="mx-auto max-w-4xl p-6 glass-dark rounded-3xl border border-amber-500/20 bg-amber-500/5 flex items-center gap-4">
      <div class="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
        <AlertCircle :size="24" />
      </div>
      <div>
        <p class="text-amber-200 font-bold">Limited Access Mode</p>
        <p class="text-amber-500/70 text-sm italic">You can view statistics, but resource creation/editing is disabled. Enter a Security Code in the "Activate Panel" section to restore full functionality.</p>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <!-- Personnel -->
      <div @click="navigateTo('workers')" class="glass-card p-8 flex flex-col gap-8 hover:bg-white/5 transition-all duration-300 cursor-pointer group hover:-translate-y-1 border border-white/5 hover:border-indigo-500/30">
        <div class="flex items-center justify-between">
          <div class="p-4 bg-indigo-500/10 rounded-2xl group-hover:bg-indigo-500/20 transition-colors">
            <Users class="text-indigo-400 w-8 h-8" />
          </div>
          <ArrowRight class="w-5 h-5 text-neutral-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
        </div>
        <div>
          <h3 class="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Personnel</h3>
          <p class="text-4xl font-bold mt-2 text-white">{{ loading ? '...' : stats.workers }}</p>
        </div>
      </div>
      
      <!-- Logistics -->
      <div @click="navigateTo('vehicles')" class="glass-card p-8 flex flex-col gap-8 hover:bg-white/5 transition-all duration-300 cursor-pointer group hover:-translate-y-1 border border-white/5 hover:border-cyan-500/30">
        <div class="flex items-center justify-between">
          <div class="p-4 bg-cyan-500/10 rounded-2xl group-hover:bg-cyan-500/20 transition-colors">
            <Truck class="text-cyan-400 w-8 h-8" />
          </div>
          <ArrowRight class="w-5 h-5 text-neutral-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
        </div>
        <div>
          <h3 class="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Logistics Fleet</h3>
          <p class="text-4xl font-bold mt-2 text-white">{{ loading ? '...' : stats.vehicles }}</p>
        </div>
      </div>

      <!-- Machinery -->
      <div @click="navigateTo('equipments')" class="glass-card p-8 flex flex-col gap-8 hover:bg-white/5 transition-all duration-300 cursor-pointer group hover:-translate-y-1 border border-white/5 hover:border-amber-500/30">
        <div class="flex items-center justify-between">
          <div class="p-4 bg-amber-500/10 rounded-2xl group-hover:bg-amber-500/20 transition-colors">
            <Wrench class="text-amber-400 w-8 h-8" />
          </div>
          <ArrowRight class="w-5 h-5 text-neutral-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
        </div>
        <div>
          <h3 class="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Industrial Gear</h3>
          <p class="text-4xl font-bold mt-2 text-white">{{ loading ? '...' : stats.equipment }}</p>
        </div>
      </div>

      <!-- Rentals -->
      <div @click="navigateTo('rentals')" class="glass-card p-8 flex flex-col gap-8 hover:bg-white/5 transition-all duration-300 cursor-pointer group hover:-translate-y-1 border border-white/5 hover:border-purple-500/30">
        <div class="flex items-center justify-between">
          <div class="p-4 bg-purple-500/10 rounded-2xl group-hover:bg-purple-500/20 transition-colors">
            <FolderPlus class="text-purple-400 w-8 h-8" />
          </div>
          <ArrowRight class="w-5 h-5 text-neutral-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
        </div>
        <div>
          <h3 class="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Rental Assets</h3>
          <p class="text-4xl font-bold mt-2 text-white">{{ loading ? '...' : stats.rentals }}</p>
        </div>
      </div>

      <!-- Mapped Zones -->
      <div @click="navigateTo('territories')" class="glass-card p-8 flex flex-col gap-8 hover:bg-white/5 transition-all duration-300 cursor-pointer group hover:-translate-y-1 border border-white/5 hover:border-emerald-500/30">
        <div class="flex items-center justify-between">
          <div class="p-4 bg-emerald-500/10 rounded-2xl group-hover:bg-emerald-500/20 transition-colors">
            <Map class="text-emerald-400 w-8 h-8" />
          </div>
          <ArrowRight class="w-5 h-5 text-neutral-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
        </div>
        <div>
          <h3 class="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Operating Zones</h3>
          <p class="text-4xl font-bold mt-2 text-white">{{ loading ? '...' : stats.territories }}</p>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="glass-dark rounded-[2.5rem] border border-white/5 p-10">
      <div class="flex items-center justify-between mb-8">
        <h3 class="text-2xl font-bold text-white flex items-center gap-3">
          <Sparkles class="text-indigo-400" />
          Recent Activity Log
        </h3>
        <button v-if="stats.recentItems?.length > 0" class="text-sm font-bold text-indigo-400 hover:text-white transition-colors">See History</button>
      </div>

      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="h-20 bg-white/5 animate-pulse rounded-2xl"></div>
      </div>

      <div v-else-if="!stats.recentItems || stats.recentItems.length === 0" class="py-10 text-center">
        <div class="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-neutral-700">
          <FolderPlus :size="32" />
        </div>
        <p class="text-neutral-500 font-medium">No recent activity found. Start adding resources to see them here.</p>
      </div>

      <div v-else class="space-y-4">
        <div 
          v-for="item in stats.recentItems" 
          :key="item.id + item.type"
          class="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
        >
          <div class="flex items-center gap-5">
            <div class="w-12 h-12 rounded-2xl bg-neutral-900 flex items-center justify-center border border-white/5 group-hover:border-indigo-500/30 transition-colors">
              <component 
                :is="item.icon === 'Users' ? Users : (item.icon === 'Truck' ? Truck : (item.icon === 'Wrench' ? Wrench : FolderPlus))" 
                :size="20" 
                class="text-neutral-400 group-hover:text-white"
              />
            </div>
            <div>
              <p class="text-white font-bold">{{ item.fullName || item.name }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span class="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">{{ item.type }}</span>
                <span class="text-[10px] text-neutral-600 font-medium">{{ new Date(item.createdAt).toLocaleDateString() }}</span>
              </div>
            </div>
          </div>
          <button class="p-2 text-neutral-600 hover:text-indigo-400 transition-colors">
            <ArrowRight :size="18" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
