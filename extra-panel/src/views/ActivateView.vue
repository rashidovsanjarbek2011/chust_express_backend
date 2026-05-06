<script setup>
import { ref } from 'vue'
import { Key, ShieldCheck, Loader2 } from 'lucide-vue-next'
import api from '../services/api'

const code = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const handleActivate = async () => {
  if (!code.value) return
  
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  
  try {
    const { data } = await api.post('auth/activate-extra', { code: code.value })
    
    if (data.success) {
      successMsg.value = data.message
      code.value = ''
      
      // Update local storage user data to refresh timer
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      user.extraExpiresAt = data.extraExpiresAt
      user.role = data.role
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('token', data.token) // Save new token
      
      // Trigger storage event for SubscriptionTimer component
      window.dispatchEvent(new Event('storage'))
    }
  } catch (error) {
    errorMsg.value = error.response?.data?.message || 'Activation failed. Please check your code.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto py-12">
    <div class="glass-dark p-8 md:p-12 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
      <!-- Decor -->
      <div class="absolute -top-24 -right-24 w-62 h-62 bg-indigo-500/10 blur-[100px] rounded-full"></div>
      <div class="absolute -bottom-24 -left-24 w-62 h-62 bg-cyan-500/10 blur-[100px] rounded-full"></div>

      <div class="relative z-10 text-center">
        <div class="w-20 h-20 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-indigo-500/20 rotate-3">
          <Key :size="40" class="text-white -rotate-3" />
        </div>

        <h2 class="text-4xl font-bold mb-4">Activate Panel</h2>
        <p class="text-neutral-400 mb-12 max-w-md mx-auto">
          Enter your unique Security Code to enable resource management and unlock the full power of the Extra Services Panel.
        </p>

        <form @submit.prevent="handleActivate" class="space-y-6 max-w-sm mx-auto text-left">
          <div v-if="errorMsg" class="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm flex items-center gap-3">
            <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            {{ errorMsg }}
          </div>

          <div v-if="successMsg" class="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm flex items-center gap-3">
            <ShieldCheck :size="18" />
            {{ successMsg }}
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-neutral-400 ml-1">Security Code</label>
            <div class="relative group">
              <input 
                v-model="code"
                type="text" 
                placeholder="EXT-XXXXXX"
                required
                class="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] transition-all font-mono text-center text-xl tracking-widest uppercase"
              />
            </div>
          </div>

          <button 
            type="submit" 
            :disabled="loading || !code"
            class="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 text-white rounded-2xl font-bold shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3"
          >
            <Loader2 v-if="loading" class="animate-spin" />
            {{ loading ? 'Activating...' : 'Activate Now' }}
          </button>
        </form>

        <p class="mt-12 text-sm text-neutral-500">
          Already active? Check your timer in the sidebar. <br/>
          Expired codes cannot be reused.
        </p>
      </div>
    </div>
  </div>
</template>
