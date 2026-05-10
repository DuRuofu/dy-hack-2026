<template>
  <div class="pb-24">
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
  <nav class="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
    <div class="mx-3 mb-2 bg-charcoal/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/30 px-2 py-2.5">
      <div class="flex justify-around items-center">
        <router-link
          v-for="tab in tabs"
          :key="tab.path"
          :to="tab.path"
          class="relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300"
          :class="$route.path === tab.path ? 'text-white' : 'text-white/40 hover:text-white/60'"
        >
          <span v-if="$route.path === tab.path" class="absolute inset-0 bg-white/10 rounded-xl"></span>
          <span class="relative text-xl leading-none">{{ tab.icon }}</span>
          <span class="relative text-[11px] font-medium tracking-wider uppercase">{{ tab.label }}</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const tabs = [
  { path: '/', icon: '◇', label: '发现' },
  { path: '/wardrobe', icon: '□', label: '衣橱' },
  { path: '/upload', icon: '⊕', label: '收录' },
  { path: '/video', icon: '◎', label: '方案' },
  { path: '/mix-match', icon: '✦', label: '搭配' },
]
</script>
