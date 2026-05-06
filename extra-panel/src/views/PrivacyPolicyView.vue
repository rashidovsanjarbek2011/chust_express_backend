<script setup>
import { ShieldCheck, FileText, Lock, CreditCard, Scale, AlertCircle } from 'lucide-vue-next'

const sections = [
  {
    title: 'Rules of Use (Условия использования)',
    icon: FileText,
    content: 'The "Extra Services Panel" is a legally binding agreement between the service owner and the user. It regulates the terms of work, limitations of liability, and content rights. By using this service, you agree to comply with all safety and operational guidelines.',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10'
  },
  {
    title: 'User Obligations',
    icon: Scale,
    content: 'Users are prohibited from engaging in spam, copyright infringement, or providing false information about services. You must maintain the accuracy of your service listings, pricing, and contact details.',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10'
  },
  {
    title: 'Account Management',
    icon: Lock,
    content: 'Registration is controlled via unique Security Codes. Access is strictly limited by the activation duration (hour, day, month, year). Once the timer expires, resource management features will be disabled until a new code is applied.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-400/10'
  },
  {
    title: 'Payments & Subscriptions',
    icon: CreditCard,
    content: 'Access to the "Working Set" management requires an active subscription. Payments/Codes are non-refundable once activated. The system owner reserves the right to change pricing and subscription terms with prior notice.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10'
  },
  {
    title: 'Limitation of Liability',
    icon: AlertCircle,
    content: 'The platform owner is not responsible for service interruptions, data loss, or disputes between service providers and third parties. Users use the platform at their own risk.',
    color: 'text-rose-400',
    bg: 'bg-rose-400/10'
  },
  {
    title: 'Data Sovereignty & Privacy',
    icon: ShieldCheck,
    content: 'All resource data uploaded to the Extra Services Panel is owned by the registering user. We use encryption to protect your sensitive operational data, and we do not sell your personnel or asset information to third-party marketing firms.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10'
  },
  {
    title: 'Service Termination',
    icon: Lock,
    content: 'The platform reserves the right to suspend or terminate accounts that violate safety protocols or operational standards. Upon termination, user data will be archived for legal compliance for 90 days before permanent deletion.',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10'
  }
]
</script>

<template>
  <div class="max-w-4xl mx-auto py-8">
    <div class="mb-12 text-center">
      <h1 class="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Privacy Policy & Terms</h1>
      <p class="text-neutral-400">Legal guidelines and rules for the Extra Services ecosystem.</p>
    </div>

    <div class="space-y-6">
      <div 
        v-for="section in sections" 
        :key="section.title"
        class="glass-dark p-8 rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-300 group"
      >
        <div class="flex items-start gap-6">
          <div :class="['p-4 rounded-2xl shrink-0 group-hover:scale-110 transition-transform duration-500', section.bg]">
            <component :is="section.icon" :size="28" :class="section.color" />
          </div>
          <div class="space-y-2">
            <h3 class="text-xl font-bold text-white">{{ section.title }}</h3>
            <p class="text-neutral-400 leading-relaxed">{{ section.content }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-12 p-8 glass-dark rounded-3xl border border-indigo-500/20 bg-indigo-500/5 text-center">
      <p class="text-sm text-neutral-400 mb-0">
        By clicking "Register" or "Activate", you automatically accept these terms and conditions. 
        <br/>Last updated: April 17, 2026.
      </p>
    </div>
  </div>
</template>
