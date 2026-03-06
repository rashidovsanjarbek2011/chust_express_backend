<template>
  <div
    class="owner-dashboard-page pt-20 min-h-screen bg-zinc-950 text-white p-6 md:p-12"
  >
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-16">
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 mb-4"
        >
          <i class="bi bi-person-workspace text-green-500 text-xs"></i>
          <span
            class="text-[10px] font-black uppercase tracking-widest text-green-500"
            >Biznes Boshqaruvi</span
          >
        </div>
        <h1
          class="text-5xl font-black text-white tracking-tighter uppercase mb-2"
        >
          Shop Owner Dashboard
        </h1>
        <p class="text-zinc-500 text-lg">
          Do'koningiz faoliyatini va daromadlaringizni real vaqtda boshqaring.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <router-link
          :to="{ name: 'create' }"
          class="premium-card p-8 group relative overflow-hidden border-blue-500/10"
        >
          <div
            class="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition-all transform group-hover:rotate-12"
          >
            <i class="bi bi-plus-circle text-3xl"></i>
          </div>
          <h2 class="text-2xl font-black mb-2 uppercase tracking-tight">
            Yangi Mahsulot
          </h2>
          <p class="text-zinc-500 text-sm leading-relaxed">
            Do'koningiz uchun yangi mahsulot e'lonini yarating va sotuvni
            boshlang.
          </p>
          <div
            class="absolute -right-2 -bottom-2 opacity-10 group-hover:opacity-20 transition-opacity"
          >
            <i class="bi bi-plus-circle text-8xl"></i>
          </div>
        </router-link>

        <router-link
          to="/seller/sales"
          class="premium-card p-8 group relative overflow-hidden border-green-500/10"
        >
          <div
            class="w-14 h-14 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500 group-hover:text-white transition-all transform group-hover:-rotate-12"
          >
            <i class="bi bi-graph-up-arrow text-3xl"></i>
          </div>
          <h2 class="text-2xl font-black mb-2 uppercase tracking-tight">
            Sotuvlar Paneli
          </h2>
          <p class="text-zinc-500 text-sm leading-relaxed">
            Sotilgan mahsulotlar statistikasi va daromadlarni kuzatib boring.
          </p>
          <div
            class="absolute -right-2 -bottom-2 opacity-10 group-hover:opacity-20 transition-opacity"
          >
            <i class="bi bi-graph-up-arrow text-8xl"></i>
          </div>
        </router-link>

        <div
          class="premium-card p-8 group relative overflow-hidden border-zinc-800 bg-zinc-900/40 cursor-not-allowed opacity-60"
        >
          <div
            class="w-14 h-14 bg-zinc-800 text-zinc-600 rounded-2xl flex items-center justify-center mb-6"
          >
            <i class="bi bi-pie-chart text-3xl"></i>
          </div>
          <h2
            class="text-2xl font-black mb-2 uppercase tracking-tight text-zinc-500"
          >
            Statistika
          </h2>
          <p class="text-zinc-600 text-sm leading-relaxed">
            Kengaytirilgan tahliliy ma'lumotlar va hisobotlar.
            <span class="text-zinc-700">(Tez kunda)</span>
          </p>
          <div class="absolute -right-2 -bottom-2 opacity-5">
            <i class="bi bi-pie-chart text-8xl"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "OwnerDashboard",
};
</script>

<style scoped>
.owner-dashboard-page {
  background: radial-gradient(
    circle at bottom left,
    rgba(34, 197, 94, 0.03),
    transparent 600px
  );
}
</style>
