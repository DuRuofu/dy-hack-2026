<template>
  <div style="padding: 16px">
    <h1>自由搭配 + AI 评价</h1>

    <h2>1. 从衣橱选衣物</h2>
    <button @click="loadWardrobe" style="margin-bottom:8px">加载衣橱</button>
    <span v-if="loadingWardrobe"> 加载中...</span>

    <div v-if="wardrobeItems.length" style="margin-top:8px">
      <p>点击选择衣物（可选多件）：</p>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">
        <div v-for="item in wardrobeItems" :key="item.id"
          @click="toggleSelect(item.id)"
          :style="{
            border: selectedIds.includes(item.id) ? '2px solid green' : '1px solid #ddd',
            borderRadius: '6px',
            padding: '6px',
            textAlign: 'center',
            cursor: 'pointer',
            background: selectedIds.includes(item.id) ? '#e8f5e9' : '#fff',
          }"
        >
          <img v-if="item.oss_url || item.ossUrl" :src="item.oss_url || item.ossUrl" style="width:100%;aspect-ratio:1;object-fit:cover;borderRadius:4px" />
          <div v-else style="width:100%;aspect-ratio:1;background:#eee;display:flex;align-items:center;justify-content:center;borderRadius:4px;font-size:11px">无图</div>
          <div style="font-size:11px">{{ item.name }}</div>
        </div>
      </div>
    </div>

    <h2 style="margin-top:16px">2. 已选 ({{ selectedIds.length }} 件)</h2>
    <div v-if="selectedIds.length" style="display:flex;gap:8px;flex-wrap:wrap">
      <div v-for="id in selectedIds" :key="id" style="border:1px solid #aaa;padding:4px 8px;borderRadius:4px;font-size:12px">
        {{ getItemName(id) }}
        <button @click="selectedIds = selectedIds.filter(x => x !== id)" style="margin-left:4px;color:red;border:none;background:none;cursor:pointer">x</button>
      </div>
    </div>

    <button @click="onEvaluate" :disabled="selectedIds.length === 0 || evaluating" style="margin-top:12px;padding:12px 24px;font-size:16px">
      {{ evaluating ? '评价中...' : '让 AI 点评' }}
    </button>

    <div v-if="evaluation" style="margin-top:20px;border:1px solid #ddd;padding:16px;borderRadius:8px">
      <h2>AI 评价结果</h2>
      <h3 style="font-size:24px">{{ evaluation.score }} 分</h3>

      <div v-if="evaluation.pros?.length">
        <strong>优点：</strong>
        <ul><li v-for="p in evaluation.pros">{{ p }}</li></ul>
      </div>
      <div v-if="evaluation.cons?.length">
        <strong>缺点：</strong>
        <ul><li v-for="c in evaluation.cons">{{ c }}</li></ul>
      </div>
      <div v-if="evaluation.suggestion">
        <strong>建议：</strong> {{ evaluation.suggestion }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getWardrobe, evaluateOutfit } from '../api'

const wardrobeItems = ref<any[]>([])
const loadingWardrobe = ref(false)
const selectedIds = ref<number[]>([])
const evaluating = ref(false)
const evaluation = ref<any>(null)

onMounted(() => loadWardrobe())

async function loadWardrobe() {
  loadingWardrobe.value = true
  try {
    const { data } = await getWardrobe()
    wardrobeItems.value = data.items
  } finally {
    loadingWardrobe.value = false
  }
}

function toggleSelect(id: number) {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((x) => x !== id)
  } else {
    selectedIds.value.push(id)
  }
}

function getItemName(id: number) {
  return wardrobeItems.value.find((i) => i.id === id)?.name ?? `#${id}`
}

async function onEvaluate() {
  if (selectedIds.value.length === 0) return
  evaluating.value = true
  evaluation.value = null
  try {
    const { data } = await evaluateOutfit(selectedIds.value)
    evaluation.value = data
  } catch (e: any) {
    alert('评价失败: ' + (e.response?.data?.message || e.message))
  } finally {
    evaluating.value = false
  }
}
</script>
