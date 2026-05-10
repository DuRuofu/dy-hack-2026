<template>
  <div class="relative">
    <div class="flex items-center gap-3 cursor-pointer" @click="show = !show">
      <span class="text-white/50 text-base">Hi, Olivia</span>
      <img src="/avatar.jpeg" class="w-14 h-14 rounded-full object-cover ring-1 ring-white/10" />
    </div>

    <!-- Dropdown Card -->
    <Teleport to="body">
      <transition name="profile-fade">
        <div v-if="show" class="fixed inset-0 z-[100]" @click="show = false">
          <div
            class="absolute top-[88px] right-4 w-72 bg-paper rounded-2xl shadow-2xl shadow-black/20 border border-cream-dark overflow-hidden"
            @click.stop
          >
            <!-- Cover -->
            <div class="h-16 bg-gradient-to-r from-coral/20 via-warm/15 to-sage/20"></div>

            <!-- Avatar overlap -->
            <div class="px-5 -mt-8 flex items-end gap-4 mb-4">
              <img src="/avatar.jpeg" class="w-16 h-16 rounded-full object-cover ring-2 ring-paper shadow-md" />
              <div class="pb-1">
                <div class="font-serif text-base font-bold text-ink">Olivia Chen</div>
                <div class="text-[11px] text-ink-faint">Fashion Enthusiast</div>
              </div>
            </div>

            <!-- Stats -->
            <div class="px-5 pb-4">
              <div class="flex gap-1 mb-4">
                <span class="px-2.5 py-1 rounded-full bg-cream text-[10px] text-ink-light">巴黎</span>
                <span class="px-2.5 py-1 rounded-full bg-cream text-[10px] text-ink-light">极简风</span>
                <span class="px-2.5 py-1 rounded-full bg-cream text-[10px] text-ink-light">26岁</span>
              </div>

              <div class="grid grid-cols-3 gap-3 mb-4">
                <div class="text-center">
                  <div class="font-serif text-lg font-bold text-ink">{{ wardrobeCount }}</div>
                  <div class="text-[9px] text-ink-faint tracking-wide uppercase">衣橱</div>
                </div>
                <div class="text-center">
                  <div class="font-serif text-lg font-bold text-ink">{{ outfitCount }}</div>
                  <div class="text-[9px] text-ink-faint tracking-wide uppercase">搭配</div>
                </div>
                <div class="text-center">
                  <div class="font-serif text-lg font-bold text-ink">7</div>
                  <div class="text-[9px] text-ink-faint tracking-wide uppercase">收藏</div>
                </div>
              </div>

              <p class="text-[11px] text-ink-faint leading-relaxed mb-4">
                热爱穿搭，追求用最简单的单品穿出高级感。
              </p>

              <router-link to="/wardrobe"
                class="block w-full text-center py-2.5 rounded-xl bg-charcoal text-white text-xs font-medium tracking-wide"
                @click="show = false">
                查看衣橱
              </router-link>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  wardrobeCount?: number
  outfitCount?: number
}>()

const show = ref(false)
</script>

<style scoped>
.profile-fade-enter-active { transition: opacity 0.15s ease; }
.profile-fade-leave-active { transition: opacity 0.1s ease; }
.profile-fade-enter-from,
.profile-fade-leave-to { opacity: 0; }
</style>
