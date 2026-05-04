<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Clock } from 'lucide-vue-next'

const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const timeLeft = ref('')
const isExpired = ref(false)
let timer = null

const calculateTime = () => {
  if (!user.value.extraExpiresAt) {
    timeLeft.value = 'Inactive'
    isExpired.value = true
    return
  }

  const expiry = new Date(user.value.extraExpiresAt).getTime()
  const now = new Date().getTime()
  const diff = expiry - now

  if (diff <= 0) {
    timeLeft.value = 'Expired'
    isExpired.value = true
    return
  }

  isExpired.value = false
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  if (days > 0) {
    timeLeft.value = `${days}d ${hours}h`
  } else {
    timeLeft.value = `${hours}h ${minutes}m ${seconds}s`
  }
}

onMounted(() => {
  calculateTime()
  timer = setInterval(calculateTime, 1000)
  
  // Watch for local storage changes (if user activates from another tab/view)
  window.addEventListener('storage', () => {
    user.value = JSON.parse(localStorage.getItem('user') || '{}')
  })
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="mt-4 px-4">
    <div :class="[
      'p-4 rounded-2xl border backdrop-blur-md transition-all duration-300',
      isExpired 
        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
    ]">
      <div class="flex items-center gap-3 mb-2">
        <Clock :size="18" :class="isExpired ? 'text-rose-400' : 'text-emerald-400 animate-pulse'" />
        <span class="text-xs font-semibold uppercase tracking-wider opacity-80">Access Timer</span>
      </div>
      <div class="text-xl font-bold font-mono tracking-tight tabular-nums">
        {{ timeLeft }}
      </div>
      <p v-if="isExpired" class="text-[10px] mt-1 opacity-60">Activate code to manage resources</p>
      <p v-else class="text-[10px] mt-1 opacity-60">Managed services fully active</p>
    </div>
  </div>
</template>
