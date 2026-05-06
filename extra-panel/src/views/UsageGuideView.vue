<script setup>
import { 
  BookOpen, 
  CheckCircle2, 
  ShieldCheck, 
  LayoutDashboard, 
  MousePointer2, 
  Key,
  ArrowRight,
  Sparkles
} from 'lucide-vue-next'

const steps = [
  {
    id: 1,
    title: 'Dashboard Overview',
    icon: LayoutDashboard,
    description: 'When you first log in, verify your system status. If the "Access Timer" shows "Inactive", you will be in Read-Only mode.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-400/10'
  },
  {
    id: 2,
    title: 'Activation',
    icon: Key,
    description: 'Register a unique Security Code in the "Activate Panel" section. This unlocks management tools for a specific duration (1 month, 1 year, etc.).',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10'
  },
  {
    id: 3,
    title: 'Resource Registration',
    icon: Sparkles,
    description: 'Navigate to Personnel, Fleet, or Machinery. Use the 6-stage professional registration flow to accurately list your assets.',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10'
  },
  {
    id: 4,
    title: 'Territory Mapping',
    icon: CheckCircle2,
    description: 'Ensure your workers and vehicles are assigned to active Territories to make them visible and hireable for orders.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10'
  }
]

const faqs = [
  {
    q: 'Why can\'t I add new workers?',
    a: 'Check your Access Timer on the sidebar. If it is expired, you must activate a new Security Code to re-enable creation/editing.'
  },
  {
    q: 'Can other users see my assets?',
    a: 'No. The Extra Panel uses strict Resource Ownership. You only see and manage the items you have personally registered.'
  },
  {
    q: 'How do I update pricing?',
    a: 'Go to the specific resource list, click Edit, and navigate to Stage 6 (Pricing) to modify rates and models.'
  }
]
</script>

<template>
  <div class="max-w-6xl mx-auto py-10 px-4">
    <!-- Header -->
    <div class="text-center mb-16">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
        <BookOpen :size="14" />
        Education Hub
      </div>
      <h1 class="text-5xl font-bold text-white mb-6">Usage Guide & <span class="text-indigo-400">Tutorials</span></h1>
      <p class="text-neutral-500 text-xl max-w-2xl mx-auto">Master the Extra Services ecosystem with our step-by-step guidance.</p>
    </div>

    <!-- Step Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
      <div 
        v-for="step in steps" 
        :key="step.id"
        class="glass-dark p-8 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all duration-500 group relative overflow-hidden"
      >
        <div class="absolute top-0 right-0 p-6 text-6xl font-black text-white/5 group-hover:text-white/10 transition-colors">
          0{{ step.id }}
        </div>
        
        <div class="flex items-start gap-6 relative z-10">
          <div :class="['p-4 rounded-2xl shrink-0 group-hover:scale-110 transition-transform duration-500', step.bg]">
            <component :is="step.icon" :size="32" :class="step.color" />
          </div>
          <div class="space-y-3">
            <h3 class="text-2xl font-bold text-white">{{ step.title }}</h3>
            <p class="text-neutral-500 leading-relaxed">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- FAQ Section -->
    <div class="glass-dark rounded-[3rem] p-10 md:p-16 border border-white/5 relative overflow-hidden">
      <div class="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full"></div>
      
      <h2 class="text-3xl font-bold text-white mb-10 flex items-center gap-3">
        <MousePointer2 class="text-indigo-400" />
        Frequently Asked Questions
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div v-for="faq in faqs" :key="faq.q" class="space-y-4">
          <h4 class="text-xl font-bold text-indigo-400 flex items-start gap-2">
            <span class="opacity-50">Q:</span> {{ faq.q }}
          </h4>
          <p class="text-neutral-400 leading-relaxed pl-7">
            {{ faq.a }}
          </p>
        </div>
      </div>
    </div>

    <!-- Navigation CTA -->
    <div class="mt-20 flex flex-col md:flex-row items-center justify-between gap-8 p-10 glass-dark rounded-[2.5rem] border border-white/5 bg-gradient-to-r from-indigo-500/5 to-transparent">
      <div class="flex items-center gap-6">
        <div class="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <ShieldCheck class="text-white" :size="32" />
        </div>
        <div>
          <h3 class="text-2xl font-bold text-white">Ready to start?</h3>
          <p class="text-neutral-500">Your resources are waiting to be registered.</p>
        </div>
      </div>
      <RouterLink 
        to="/dashboard"
        class="px-10 py-5 bg-white text-black font-black rounded-2xl hover:bg-indigo-400 hover:text-white transition-all flex items-center gap-2 group"
      >
        Go to Dashboard
        <ArrowRight class="group-hover:translate-x-1 transition-transform" />
      </RouterLink>
    </div>
  </div>
</template>
