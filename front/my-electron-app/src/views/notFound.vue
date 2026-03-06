<template>
  <div
    class="not-found pt-32 min-h-screen bg-zinc-950 flex items-center justify-center p-6"
  >
    <div class="premium-card p-12 md:p-20 text-center max-w-lg">
      <h1 class="text-8xl font-black text-green-500 tracking-tighter mb-4">
        404
      </h1>
      <h2 class="text-2xl font-black uppercase tracking-tight mb-6">
        Sahifa Topilmadi
      </h2>
      <p class="text-zinc-500 mb-10">
        Kechirasiz, siz qidirayotgan sahifa mavjud emas yoki boshqa manzilga
        ko'chirilgan.
      </p>
      <router-link
        to="/"
        class="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg shadow-green-500/20 inline-block"
      >
        Bosh sahifaga qaytish
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: "NotFound",
};
</script>

<style scoped>
.not-found {
  background: radial-gradient(
    circle at center,
    rgba(34, 197, 94, 0.05),
    transparent 800px
  );
}
</style>
