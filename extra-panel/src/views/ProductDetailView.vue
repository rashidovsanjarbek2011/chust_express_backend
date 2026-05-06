<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Package, DollarSign, Box, MapPin, User, Calendar, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-vue-next'
import api from '../services/api'

const router = useRouter()
const route = useRoute()
const product = ref(null)
const loading = ref(true)
const error = ref('')

const productId = computed(() => route.params.id)

const fetchProduct = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const { data } = await api.get(`products/${productId.value}`)
    if (data.success) {
      product.value = data.data
    } else {
      error.value = data.message || 'Failed to load product details'
    }
  } catch (err) {
    console.error('Error fetching product:', err)
    if (err.response?.status === 404) {
      error.value = 'Product not found'
    } else if (err.response?.status >= 500) {
      error.value = 'Server error. Please try again later.'
    } else {
      error.value = 'Failed to load product details'
    }
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.go(-1)
}

const formatPrice = (price, currency = 'UZS') => {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatWeight = (weight, unit) => {
  if (!weight) return 'N/A'
  return `${weight} ${unit || 'kg'}`
}

onMounted(() => {
  if (productId.value) {
    fetchProduct()
  } else {
    error.value = 'Invalid product ID'
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen">
    <!-- Header -->
    <div class="glass-dark border-b border-white/5">
      <div class="max-w-7xl mx-auto px-6 py-6">
        <div class="flex items-center gap-4">
          <button 
            @click="goBack"
            class="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-neutral-400 hover:text-white transition-all flex items-center gap-2"
          >
            <ArrowLeft :size="20" />
            <span class="font-medium">Back</span>
          </button>
          <div class="h-8 w-px bg-white/10"></div>
          <h1 class="text-2xl font-bold text-white flex items-center gap-3">
            <Package class="text-indigo-400" />
            Product Details
          </h1>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-6 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="flex items-center gap-3 text-neutral-400">
          <Loader2 class="animate-spin" :size="24" />
          <span class="font-medium">Loading product details...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex items-center justify-center py-20">
        <div class="text-center max-w-md">
          <div class="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle class="text-red-400" :size="32" />
          </div>
          <h3 class="text-xl font-bold text-white mb-2">Error</h3>
          <p class="text-neutral-400 mb-6">{{ error }}</p>
          <button 
            @click="fetchProduct"
            class="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-2xl transition-all"
          >
            Try Again
          </button>
        </div>
      </div>

      <!-- Product Details -->
      <div v-else-if="product" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Product Images -->
          <div class="glass-dark rounded-3xl p-8 border border-white/5">
            <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <ImageIcon class="text-indigo-400" />
              Product Images
            </h2>
            <div v-if="product.images && product.images.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                v-for="(image, index) in product.images" 
                :key="index"
                class="aspect-square rounded-2xl overflow-hidden bg-neutral-900"
              >
                <img 
                  :src="image" 
                  :alt="`${product.name} - Image ${index + 1}`"
                  class="w-full h-full object-cover"
                  @error="e => { e.target.style.display = 'none'; }"
                />
              </div>
            </div>
            <div v-else class="aspect-video rounded-2xl bg-neutral-900 flex items-center justify-center">
              <div class="text-center">
                <ImageIcon class="text-neutral-600 mx-auto mb-2" :size="48" />
                <p class="text-neutral-500">No images available</p>
              </div>
            </div>
          </div>

          <!-- Product Information -->
          <div class="glass-dark rounded-3xl p-8 border border-white/5">
            <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Package class="text-indigo-400" />
              Product Information
            </h2>
            <div class="space-y-6">
              <div>
                <h3 class="text-3xl font-bold text-white mb-2">{{ product.name }}</h3>
                <p class="text-neutral-400 leading-relaxed">{{ product.description || 'No description available' }}</p>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-4">
                  <div class="flex items-center gap-3">
                    <DollarSign class="text-green-400" :size="20" />
                    <div>
                      <p class="text-sm text-neutral-500">Price</p>
                      <p class="text-xl font-bold text-white">{{ formatPrice(product.price, product.currency) }}</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-3">
                    <Box class="text-blue-400" :size="20" />
                    <div>
                      <p class="text-sm text-neutral-500">Stock</p>
                      <p class="text-xl font-bold text-white">{{ product.stock || 0 }} units</p>
                    </div>
                  </div>
                </div>
                
                <div class="space-y-4">
                  <div class="flex items-center gap-3">
                    <Package class="text-purple-400" :size="20" />
                    <div>
                      <p class="text-sm text-neutral-500">Weight</p>
                      <p class="text-xl font-bold text-white">{{ formatWeight(product.weight, product.unit) }}</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-3">
                    <div class="w-5 h-5 rounded-full" :class="product.isActive ? 'bg-green-500' : 'bg-red-500'"></div>
                    <div>
                      <p class="text-sm text-neutral-500">Status</p>
                      <p class="text-xl font-bold text-white">{{ product.isActive ? 'Active' : 'Inactive' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-8">
          <!-- Owner Information -->
          <div class="glass-dark rounded-3xl p-8 border border-white/5">
            <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <User class="text-indigo-400" />
              Seller Information
            </h2>
            <div v-if="product.owner" class="space-y-4">
              <div>
                <p class="text-sm text-neutral-500">Seller Name</p>
                <p class="text-lg font-bold text-white">{{ product.owner.username }}</p>
              </div>
              <div>
                <p class="text-sm text-neutral-500">Email</p>
                <p class="text-lg font-bold text-white">{{ product.owner.email }}</p>
              </div>
              <div v-if="product.owner.address">
                <p class="text-sm text-neutral-500">Address</p>
                <p class="text-lg font-bold text-white">{{ product.owner.address }}</p>
              </div>
            </div>
            <div v-else class="text-center py-4">
              <p class="text-neutral-500">Seller information not available</p>
            </div>
          </div>

          <!-- Location Information -->
          <div v-if="product.shopAddress" class="glass-dark rounded-3xl p-8 border border-white/5">
            <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <MapPin class="text-indigo-400" />
              Shop Location
            </h2>
            <p class="text-white font-medium">{{ product.shopAddress }}</p>
          </div>

          <!-- Additional Information -->
          <div class="glass-dark rounded-3xl p-8 border border-white/5">
            <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Calendar class="text-indigo-400" />
              Additional Details
            </h2>
            <div class="space-y-4">
              <div>
                <p class="text-sm text-neutral-500">Category</p>
                <p class="text-lg font-bold text-white">{{ product.category || 'Uncategorized' }}</p>
              </div>
              <div>
                <p class="text-sm text-neutral-500">Listed on</p>
                <p class="text-lg font-bold text-white">{{ formatDate(product.createdAt) }}</p>
              </div>
              <div v-if="product.deliveryPrice">
                <p class="text-sm text-neutral-500">Delivery Price</p>
                <p class="text-lg font-bold text-white">{{ formatPrice(product.deliveryPrice, product.currency) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
