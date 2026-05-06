<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, Lock, ShieldCheck, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-vue-next'
import api from '../services/api'

const router = useRouter()
const email = ref('')
const password = ref('')
const extraCode = ref('')
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)

const validateForm = () => {
  if (!email.value.trim()) {
    error.value = 'Email address is required'
    return false
  }
  
  if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    error.value = 'Please enter a valid email address'
    return false
  }
  
  if (!password.value) {
    error.value = 'Password is required'
    return false
  }
  
  // Extra code is now optional
  return true
}

const handleLogin = async () => {
  error.value = ''
  
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  
  try {
    const loginData = {
      email: email.value.trim().toLowerCase(),
      password: password.value
    }
    
    // Only include extra code if it's provided
    if (extraCode.value.trim()) {
      loginData.extraCode = extraCode.value.trim()
    }
    
    const { data } = await api.post('auth/login', loginData)
    
    if (data.success) {
      // Allow both extra-user and regular user
      if (data.role !== 'extra-user' && data.role !== 'user') {
        error.value = 'Access denied. This panel is for Extra Service providers.'
        return
      }
      
      // Store authentication data
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.data))
      
      if (rememberMe.value) {
        localStorage.setItem('rememberedEmail', email.value)
      } else {
        localStorage.removeItem('rememberedEmail')
      }
      
      // Redirect to dashboard
      router.push({ name: 'dashboard' })
    } else {
      error.value = data.message || 'Login failed'
    }
  } catch (err) {
    console.error('Login error:', err)
    if (err.response?.data?.message) {
      error.value = err.response.data.message
    } else if (err.response?.status === 401) {
      error.value = 'Incorrect email, password, or security code'
    } else if (err.response?.status === 403) {
      error.value = 'Access denied. Your account may be suspended.'
    } else if (err.response?.status >= 500) {
      error.value = 'Server error. Please try again later.'
    } else {
      error.value = 'Network error. Please check your connection.'
    }
  } finally {
    loading.value = false
  }
}

// Load remembered email on mount
const rememberedEmail = localStorage.getItem('rememberedEmail')
if (rememberedEmail) {
  email.value = rememberedEmail
  rememberMe.value = true
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <!-- Background Effects -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
    </div>

    <div class="w-full max-w-md relative z-10">
      <!-- Logo and Title -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 p-1 mb-6 shadow-2xl">
          <div class="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center">
            <ShieldCheck class="w-10 h-10 text-purple-400" />
          </div>
        </div>
        <h1 class="text-4xl font-bold text-white mb-2">Extra Services</h1>
        <p class="text-gray-400 text-lg">Professional Services Portal</p>
      </div>

      <!-- Login Form -->
      <div class="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Error Message -->
          <div v-if="error" class="flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl">
            <AlertCircle class="w-5 h-5 text-red-400 flex-shrink-0" />
            <span class="text-red-300 text-sm font-medium">{{ error }}</span>
          </div>

          <!-- Email Field -->
          <div class="space-y-2">
            <label for="email" class="block text-sm font-semibold text-gray-300">
              Email Address
            </label>
            <div class="relative">
              <Mail class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                v-model="email"
                type="email"
                required
                placeholder="name@company.com"
                autocomplete="email"
                class="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                :disabled="loading"
              />
            </div>
          </div>

          <!-- Security Code Field -->
          <div class="space-y-2">
            <label for="extraCode" class="block text-sm font-semibold text-gray-300">
              Security Code <span class="text-gray-500 font-normal">(Optional)</span>
            </label>
            <div class="relative">
              <ShieldCheck class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="extraCode"
                v-model="extraCode"
                type="text"
                placeholder="EXTRA-XXXXXX (optional)"
                autocomplete="off"
                class="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 font-mono tracking-wider focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                :disabled="loading"
              />
            </div>
            <p class="text-xs text-gray-500">
              Enter your security code for Extra Services access, or leave empty to activate later
            </p>
          </div>

          <!-- Password Field -->
          <div class="space-y-2">
            <label for="password" class="block text-sm font-semibold text-gray-300">
              Password
            </label>
            <div class="relative">
              <Lock class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="Enter your password"
                autocomplete="current-password"
                class="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                :disabled="loading"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                :disabled="loading"
              >
                <EyeOff v-if="showPassword" class="w-5 h-5" />
                <Eye v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Remember Me -->
          <div class="flex items-center">
            <input
              id="rememberMe"
              v-model="rememberMe"
              type="checkbox"
              class="w-4 h-4 bg-white/5 border-white/20 rounded text-purple-600 focus:ring-purple-500 focus:ring-2"
              :disabled="loading"
            />
            <label for="rememberMe" class="ml-3 text-sm text-gray-300 cursor-pointer">
              Remember my email
            </label>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
            <span>{{ loading ? 'Authenticating...' : 'Sign In' }}</span>
          </button>
        </form>

        <!-- Help Text -->
        <div class="mt-6 pt-6 border-t border-white/10">
          <p class="text-center text-gray-400 text-sm">
            Need access? Contact your administrator for an Extra Service account.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.3;
  }
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

/* Custom checkbox styling */
input[type="checkbox"]:checked {
  background-color: rgb(147 51 234);
  border-color: rgb(147 51 234);
}

input[type="checkbox"]:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.2);
}
</style>
