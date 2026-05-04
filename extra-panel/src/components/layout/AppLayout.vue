<script setup>
import { RouterView, RouterLink, useRoute, useRouter } from 'vue-router'
import { LayoutDashboard, Users, Truck, Wrench, Map, LogOut, User, FolderPlus, ShieldAlert, Key, HelpCircle } from 'lucide-vue-next'
import { computed, ref, onMounted } from 'vue'
import SubscriptionTimer from '../SubscriptionTimer.vue'

const route = useRoute()
const router = useRouter()
const user = ref(null)

const loadUser = () => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      user.value = JSON.parse(userStr)
    } catch (e) {
      console.error('Failed to parse user from localStorage', e)
    }
  }
}

onMounted(() => {
  loadUser()
  window.addEventListener('storage', loadUser)
  // Also check periodically for changes in the same window (e.g. after profile edit)
  const interval = setInterval(loadUser, 1000)
  return () => {
    window.removeEventListener('storage', loadUser)
    clearInterval(interval)
  }
})

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push({ name: 'login' })
}

const navigation = [
  { name: 'Dashboard', to: { name: 'dashboard' }, icon: LayoutDashboard },
  { name: 'Workers', to: { name: 'workers' }, icon: Users },
  { name: 'Vehicles', to: { name: 'vehicles' }, icon: Truck },
  { name: 'Equipment', to: { name: 'equipments' }, icon: Wrench },
  { name: 'Rentals', to: { name: 'rentals' }, icon: FolderPlus },
  { name: 'Territories', to: { name: 'territories' }, icon: Map },
  { name: 'Activate Panel', to: { name: 'activate' }, icon: Key },
  { name: 'Usage Guide', to: { name: 'guide' }, icon: HelpCircle },
  { name: 'Privacy Policy', to: { name: 'policy' }, icon: ShieldAlert },
]
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-neutral-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
    <!-- Sidebar -->
    <div class="glass-dark w-72 flex-shrink-0 flex flex-col h-full border-r border-white/10 z-10">
      <!-- Sidebar Header -->
      <div class="h-20 flex items-center px-8 border-b border-white/5">
        <h1 class="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Extra Services</h1>
      </div>

      <!-- Timer Section -->
      <div class="p-4">
        <SubscriptionTimer />
      </div>
      
      <!-- Nav Links -->
      <div class="flex-1 overflow-y-auto py-2 px-4 space-y-2">
        <RouterLink
          v-for="item in navigation"
          :key="item.name"
          :to="item.to"
          class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group overflow-hidden"
          :class="route.name === item.to.name ? 'text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'"
        >
          <div v-if="route.name === item.to.name" class="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-cyan-600/20 backdrop-blur-md"></div>
          <div v-if="route.name === item.to.name" class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-cyan-500"></div>
          
          <component :is="item.icon" class="w-5 h-5 relative z-10" :class="route.name === item.to.name ? 'text-indigo-400' : ''" />
          <span class="font-medium relative z-10">{{ item.name }}</span>
        </RouterLink>
      </div>

      <!-- Sidebar Footer -->
      <div v-if="user" class="border-t border-white/5 p-4 bg-black/20">
        <div class="flex items-center gap-3 p-3 rounded-2xl group transition-colors">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center border border-white/10 shrink-0 capitalize text-indigo-400 font-bold">
            {{ user.username?.charAt(0) || 'U' }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-white truncate text-left">{{ user.username }}</p>
            <p class="text-[10px] text-neutral-500 truncate text-left">{{ user.email }}</p>
          </div>
          <button 
            @click="handleLogout" 
            title="Logout"
            class="p-2 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
          >
            <LogOut class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col h-full overflow-hidden relative">
      <!-- Top header -->
      <header class="h-20 lg:flex hidden items-center justify-between px-8 border-b border-white/5 bg-black/20 backdrop-blur-md z-10">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-neutral-500 uppercase tracking-[0.2em]">Partner Dashboard</span>
        </div>
        <div class="flex items-center gap-4">
          <div class="glass flex items-center gap-2 px-4 py-2 rounded-full border border-white/5">
            <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span class="text-sm font-medium text-neutral-300">System Online</span>
          </div>
        </div>
      </header>

      <!-- Scrollable content -->
      <main class="flex-1 overflow-y-auto p-4 md:p-8 z-0">
        <div class="mx-auto max-w-7xl">
          <RouterView v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </RouterView>
        </div>
      </main>
    </div>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
