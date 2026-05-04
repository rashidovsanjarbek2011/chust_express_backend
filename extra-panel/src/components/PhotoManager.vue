<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { Plus, X, Image as ImageIcon, Link as LinkIcon } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const newUrl = ref('')
const error = ref('')

const addPhoto = () => {
  if (!newUrl.value) return
  if (!newUrl.value.startsWith('http')) {
    error.value = 'Please enter a valid URL'
    return
  }
  
  const updated = [...props.modelValue, newUrl.value]
  emit('update:modelValue', updated)
  newUrl.value = ''
  error.value = ''
}

const removePhoto = (index) => {
  const updated = props.modelValue.filter((_, i) => i !== index)
  emit('update:modelValue', updated)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Input Section -->
    <div class="flex flex-col gap-2">
      <label class="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">Add Image URL</label>
      <div class="flex gap-2">
        <div class="relative flex-1 group">
          <LinkIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            v-model="newUrl"
            type="text" 
            placeholder="https://example.com/image.jpg"
            class="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
            @keyup.enter="addPhoto"
          />
        </div>
        <button 
          @click="addPhoto"
          class="px-6 rounded-2xl bg-indigo-500 text-white font-bold hover:bg-indigo-400 transition-all flex items-center gap-2"
        >
          <Plus :size="20" />
          <span>Add</span>
        </button>
      </div>
      <p v-if="error" class="text-rose-400 text-xs mt-1 ml-1">{{ error }}</p>
    </div>

    <!-- Preview Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <div 
        v-for="(url, index) in modelValue" 
        :key="index"
        class="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:border-indigo-500/50 transition-all cursor-move"
      >
        <img 
          :src="url" 
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          @error="(e) => e.target.style.display = 'none'"
        />
        <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button 
            @click="removePhoto(index)"
            class="p-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
          >
            <X :size="18" />
          </button>
        </div>
      </div>

      <!-- Empty State / Placeholder -->
      <div 
        v-if="modelValue.length === 0"
        class="aspect-square rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-neutral-700 p-4 text-center"
      >
        <ImageIcon :size="32" class="mb-2 opacity-20" />
        <p class="text-[10px] uppercase font-bold tracking-tighter opacity-40">No portfolio images yet</p>
      </div>
    </div>
  </div>
</template>
