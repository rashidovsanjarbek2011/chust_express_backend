<template>
  <div class="site text-white bg-zinc-950 min-h-screen">
    <navbar />
    <div class="pt-32 px-4 md:px-0">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
    <ToastNotification />
  </div>
</template>

<script>
import navbar from "./components/navbar.vue";
import ToastNotification from "./components/ToastNotification.vue";

export default {
  components: {
    navbar,
    ToastNotification,
  },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap");

* {
  font-family: "Inter", sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: #09090b;
}

/* Page Transition Styles - Optimized for Performance */
.page-fade-enter-active,
.page-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
  will-change: opacity, transform; /* Hardware acceleration hint */
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Staggered List Animation */
@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  opacity: 0; /* Start hidden */
  animation: slideUpFade 0.5s ease-out forwards;
}

/* --- Micro-Interactions (Global Polish) --- */

/* 1. Button Press Effect (Tactile Feedback) */
button:active {
  transform: scale(0.96);
  transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 2. Input Focus Glow (Visual Feedback) */
input:focus,
textarea:focus,
select:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.5); /* green-500 with opacity */
  border-color: rgba(34, 197, 94, 0.8);
  transition: all 0.2s ease;
}

/* Smooth color transitions for interactive elements */
a,
button,
input {
  transition-property:
    background-color, border-color, color, fill, stroke, opacity, box-shadow,
    transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
</style>
