<template>
  <div style="padding: 16px">
    <h1>抖音视频解析</h1>

    <div>
      <input v-model="videoUrl" placeholder="粘贴抖音视频链接" style="width:100%;padding:8px;font-size:14px" />
      <button @click="onParse" :disabled="!videoUrl || parsing" style="margin-top:8px;padding:10px 20px">
        {{ parsing ? '解析中（可能需要30秒+）...' : '解析视频' }}
      </button>
    </div>

    <div v-if="parsedItems.length" style="margin-top:20px">
      <h2>识别出的单品 ({{ parsedItems.length }} 件)</h2>
      <p>勾选要保存到衣橱的单品：</p>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
        <div v-for="(item, i) in parsedItems" :key="i"
          @click="toggleCheck(i)"
          :style="{
            border: checked[i] ? '2px solid green' : '1px solid #ddd',
            borderRadius: '8px',
            padding: '8px',
            textAlign: 'center',
            cursor: 'pointer',
            background: checked[i] ? '#e8f5e9' : '#fff',
          }"
        >
          <img v-if="item.image_base64" :src="'data:image/jpeg;base64,' + item.image_base64" style="width:100%;aspect-ratio:1;object-fit:cover;borderRadius:4px" />
          <div style="font-size:12px;margin-top:4px">{{ item.category }} · {{ item.color }}</div>
          <div style="font-size:11px;color:#888">{{ item.style }} · {{ item.season }}</div>
        </div>
      </div>

      <button @click="onSave" :disabled="saving || checkedCount === 0" style="margin-top:12px;padding:10px 20px">
        {{ saving ? '保存中...' : `保存选中的 ${checkedCount} 件到衣橱` }}
      </button>
      <span v-if="savedCount" style="color:green;margin-left:12px">已保存 {{ savedCount }} 件!</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { parseVideo, saveVideoItems } from '../api'

const videoUrl = ref('')
const parsing = ref(false)
const parsedItems = ref<any[]>([])
const checked = ref<boolean[]>([])
const saving = ref(false)
const savedCount = ref(0)

const checkedCount = computed(() => checked.value.filter(Boolean).length)

function toggleCheck(i: number) {
  checked.value[i] = !checked.value[i]
}

async function onParse() {
  if (!videoUrl.value) return
  parsing.value = true
  parsedItems.value = []
  savedCount.value = 0
  try {
    const { data } = await parseVideo(videoUrl.value)
    parsedItems.value = data.items ?? []
    checked.value = parsedItems.value.map(() => true)
  } catch (e: any) {
    alert('解析失败: ' + (e.response?.data?.message || e.message))
  } finally {
    parsing.value = false
  }
}

async function onSave() {
  const itemsToSave = parsedItems.value
    .filter((_, i) => checked.value[i])
    .map((item) => ({
      image_base64: item.image_base64,
      category: item.category,
      color: item.color,
      style: item.style,
      season: item.season,
      name: `${item.color || ''}${item.category || '衣物'}`,
    }))

  if (itemsToSave.length === 0) return
  saving.value = true
  try {
    const { data } = await saveVideoItems(itemsToSave)
    savedCount.value = data.ids?.length ?? 0
  } catch (e: any) {
    alert('保存失败: ' + (e.response?.data?.message || e.message))
  } finally {
    saving.value = false
  }
}
</script>
