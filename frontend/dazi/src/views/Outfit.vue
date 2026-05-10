<template>
  <div class="min-h-screen bg-cream">
    <div class="bg-charcoal grain relative overflow-hidden">
      <div class="relative z-10 px-6 py-5">
        <p class="text-warm-light text-[10px] tracking-[0.3em] uppercase font-medium mb-1.5">Recommendations</p>
        <h1 class="font-serif text-2xl text-white font-bold">搭配推荐</h1>
        <div class="absolute right-6 top-1/2 -translate-y-1/2">
          <UserAvatar />
        </div>
      </div>
      <div class="absolute -right-8 top-2 w-32 h-32 rounded-full border border-white/5"></div>
      <div class="absolute -right-4 top-8 w-20 h-20 rounded-full border border-white/5"></div>
    </div>

    <div class="px-4 pt-4 pb-6 relative z-10">
      <!-- Empty -->
      <div v-if="!outfits.length" class="flex flex-col items-center justify-center py-20 text-ink-faint">
        <div class="w-16 h-16 rounded-full bg-cream-dark flex items-center justify-center text-3xl mb-4"> </div>
        <p class="font-serif text-lg text-ink-light">还没有推荐方案</p>
        <router-link to="/" class="mt-4 px-6 py-2.5 rounded-full text-xs font-medium text-white bg-charcoal tracking-wider uppercase">
          去选场景
        </router-link>
      </div>

      <!-- Results -->
      <div v-else class="space-y-4">
        <div v-for="(plan, i) in outfits" :key="i"
          class="bg-paper rounded-2xl overflow-hidden border border-cream-dark">
          <div class="relative h-1 bg-cream-dark">
            <div class="absolute left-0 top-0 h-full rounded-r-full transition-all duration-700"
              :class="plan.score >= 80 ? 'bg-sage' : plan.score >= 60 ? 'bg-warm' : 'bg-coral'"
              :style="{ width: plan.score + '%' }"></div>
          </div>
          <div class="p-4">
            <div class="flex items-start justify-between mb-3">
              <span class="text-[10px] text-ink-faint tracking-wider uppercase">Plan {{ ['A','B','C','D','E'][i] }}</span>
              <div class="px-2.5 py-1 rounded-lg text-xs font-bold"
                :class="plan.score >= 80 ? 'bg-sage/10 text-sage' : plan.score >= 60 ? 'bg-warm/10 text-warm' : 'bg-coral/10 text-coral'">
                {{ plan.score }}
              </div>
            </div>
            <p class="text-sm text-ink mb-3 leading-relaxed">{{ plan.reason }}</p>
            <div class="flex gap-2.5 overflow-x-auto scroll-snap-x pb-1">
              <div v-for="item in plan.items" :key="item.clothe_id" class="flex-shrink-0 text-center w-20">
                <div class="w-20 h-20 rounded-xl overflow-hidden bg-cream mb-1.5 ring-1 ring-cream-dark">
                  <img v-if="item.oss_url || item.ossUrl" :src="item.oss_url || item.ossUrl" class="w-full h-full object-cover scale-110" />
                  <div v-else class="w-full h-full flex items-center justify-center text-ink-faint/30 text-2xl"> </div>
                </div>
                <div class="text-[10px] font-medium text-ink truncate">{{ item.name }}</div>
                <div class="text-[9px] text-ink-faint tracking-wider uppercase">{{ item.role }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOutfitStore } from '../stores/outfit'
import { storeToRefs } from 'pinia'
import UserAvatar from '../components/UserAvatar.vue'

const store = useOutfitStore()
const { outfits } = storeToRefs(store)
</script>
