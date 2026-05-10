<template>
  <div style="padding: 16px">
    <h1>搭子 - AI 穿搭助手</h1>

    <h2>选择场景</h2>
    <div v-if="loadingScenes">加载中...</div>
    <div v-else style="display:flex;flex-wrap:wrap;gap:8px">
      <button
        v-for="s in scenes"
        :key="s.id"
        @click="selectedScene = s.name"
        :style="{
          padding: '12px 20px',
          border: selectedScene === s.name ? '2px solid #333' : '1px solid #ccc',
          borderRadius: '8px',
          background: selectedScene === s.name ? '#f0f0f0' : '#fff',
          cursor: 'pointer',
        }"
      >
        {{ s.icon }} {{ s.name }}
      </button>
    </div>

    <div v-if="selectedScene" style="margin-top: 16px">
      <button @click="onRecommend" :disabled="recommending" style="padding:12px 24px;font-size:16px">
        {{ recommending ? '搭配中...' : '帮我搭' }}
      </button>
    </div>

    <div v-if="outfits.length" style="margin-top: 24px">
      <h2>搭配推荐 ({{ selectedScene }})</h2>
      <div v-for="(plan, i) in outfits" :key="i" style="border:1px solid #ddd;padding:16px;margin-bottom:12px;borderRadius:8px">
        <h3>方案 {{ i + 1 }} — {{ plan.score }}分</h3>
        <p>{{ plan.reason }}</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <div v-for="item in plan.items" :key="item.clothe_id" style="text-align:center">
            <img v-if="item.oss_url || item.ossUrl" :src="item.oss_url || item.ossUrl" style="width:80px;height:80px;object-fit:cover;borderRadius:4px" />
            <div v-else style="width:80px;height:80px;background:#eee;display:flex;align-items:center;justify-content:center">无图</div>
            <div style="font-size:12px">{{ item.name }}</div>
            <div style="font-size:11px;color:#888">{{ item.role }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getScenes } from '../api'
import { useOutfitStore } from '../stores/outfit'
import { storeToRefs } from 'pinia'

const scenes = ref<any[]>([])
const loadingScenes = ref(true)
const selectedScene = ref('')
const recommending = ref(false)

const outfitStore = useOutfitStore()
const { outfits } = storeToRefs(outfitStore)

onMounted(async () => {
  try {
    const { data } = await getScenes()
    scenes.value = data.scenes
  } finally {
    loadingScenes.value = false
  }
})

async function onRecommend() {
  recommending.value = true
  try {
    await outfitStore.fetchRecommend(selectedScene.value)
  } finally {
    recommending.value = false
  }
}
</script>
