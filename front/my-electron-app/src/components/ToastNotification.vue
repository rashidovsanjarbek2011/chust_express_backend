<template>
  <div
    class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none"
  >
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto min-w-[300px] max-w-sm backdrop-blur-xl border p-4 rounded-xl shadow-2xl flex items-start gap-3 transform transition-all duration-300"
        :class="[
          toast.type === 'success'
            ? 'bg-zinc-900/90 border-green-500/50 text-green-500'
            : '',
          toast.type === 'error'
            ? 'bg-zinc-900/90 border-red-500/50 text-red-500'
            : '',
          toast.type === 'warning'
            ? 'bg-zinc-900/90 border-yellow-500/50 text-yellow-500'
            : '',
          toast.type === 'info'
            ? 'bg-zinc-900/90 border-blue-500/50 text-blue-500'
            : '',
        ]"
      >
        <!-- Icon -->
        <i
          class="bi text-xl shrink-0"
          :class="[
            toast.type === 'success' ? 'bi-check-circle-fill' : '',
            toast.type === 'error' ? 'bi-x-circle-fill' : '',
            toast.type === 'warning' ? 'bi-exclamation-triangle-fill' : '',
            toast.type === 'info' ? 'bi-info-circle-fill' : '',
          ]"
        ></i>

        <!-- Content -->
        <div class="flex-grow pt-0.5">
          <h4 class="font-bold text-sm uppercase tracking-wider mb-0.5">
            {{ getTitle(toast.type) }}
          </h4>
          <p class="text-zinc-300 text-xs font-medium leading-relaxed">
            {{ toast.message }}
          </p>
        </div>

        <!-- Close -->
        <button
          @click="remove(toast.id)"
          class="text-zinc-500 hover:text-white transition-colors"
        >
          <i class="bi bi-x text-lg"></i>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script>
import toast from "@/services/toast";

export default {
  name: "ToastNotification",
  computed: {
    toasts() {
      return toast.state.toasts;
    },
  },
  methods: {
    remove(id) {
      toast.remove(id);
    },
    getTitle(type) {
      switch (type) {
        case "success":
          return "Muvaffaqiyatli";
        case "error":
          return "Xatolik";
        case "warning":
          return "Diqqat";
        case "info":
          return "Ma'lumot";
        default:
          return "Bildirishnoma";
      }
    },
  },
};
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}
.toast-move {
  transition: transform 0.4s ease;
}
</style>
