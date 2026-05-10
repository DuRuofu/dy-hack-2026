<template>
  <div style="padding: 16px">
    <h1>我的衣橱</h1>

    <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
      <button @click="filterCategory = ''" :style="{ fontWeight: filterCategory === '' ? 'bold' : 'normal' }">全部</button>
      <button v-for="c in categories" :key="c.value"
        @click="filterCategory = c.value"
        :style="{ fontWeight: filterCategory === c.value ? 'bold' : 'normal' }"
      >{{ c.label }}</button>
    </div>

    <button @click="loadWardrobe" style="margin-bottom:12px">刷新</button>
    <span v-if="loading"> 加载中...</span>
    <span v-else> 共 {{ items.length }} 件</span>

    <div v-if="items.length" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px">
      <div v-for="item in filtered" :key="item.id"
        style="border:1px solid #ddd;borderRadius:8px;padding:8px;text-align:center"
      >
        <img v-if="item.oss_url || item.ossUrl"
          :src="item.oss_url || item.ossUrl"
          style="width:100%;aspect-ratio:1;object-fit:cover;borderRadius:4px"
        />
        <div v-else style="width:100%;aspect-ratio:1;background:#eee;display:flex;align-items:center;justify-content:center;borderRadius:4px">
          无图
        </div>
        <div style="font-size:13px;margin-top:4px">{{ item.name }}</div>
        <div style="font-size:11px;color:#888">{{ labelMap.category[item.category] || item.category }} · {{ labelMap.color[item.color] || item.color }}</div>
        <button @click="editing = {...item}" style="font-size:11px;margin-top:4px">编辑</button>
      </div>
    </div>
    <div v-else-if="!loading" style="margin-top:20px;color:#888">衣橱为空，去拍照上传或视频解析添加衣物吧</div>

    <!-- 编辑弹窗 -->
    <div v-if="editing" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:100">
      <div style="background:#fff;padding:20px;borderRadius:8px;min-width:280px">
        <h3>编辑衣物</h3>
        <table>
          <tr><td>名称</td><td><input v-model="editing.name" /></td></tr>
          <tr><td>品类</td><td>
            <select v-model="editing.category">
              <option v-for="c in categories" :key="c.value" :value="c.value">{{ c.label }}</option>
            </select>
          </td></tr>
          <tr><td>颜色</td><td>
            <select v-model="editing.color">
              <option v-for="c in colors" :key="c.value" :value="c.value">{{ c.label }}</option>
            </select>
          </td></tr>
          <tr><td>风格</td><td>
            <select v-model="editing.style">
              <option v-for="s in styles" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
          </td></tr>
          <tr><td>季节</td><td>
            <select v-model="editing.season">
              <option v-for="s in seasons" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
          </td></tr>
        </table>
        <div style="margin-top:12px;display:flex;gap:8px">
          <button @click="onSaveEdit" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
          <button @click="editing = null">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWardrobeStore } from '../stores/wardrobe'
import { storeToRefs } from 'pinia'
import { updateClothing } from '../api'

const store = useWardrobeStore()
const { items, loading } = storeToRefs(store)

const filterCategory = ref('')
const editing = ref<any>(null)
const saving = ref(false)

const categories = [
  { value: 'top', label: '上衣' }, { value: 'bottom', label: '下装' },
  { value: 'dress', label: '连衣裙' }, { value: 'shoes', label: '鞋' },
  { value: 'bag', label: '包' }, { value: 'accessory', label: '配饰' },
]
const colors = [
  { value: 'black', label: '黑' }, { value: 'white', label: '白' },
  { value: 'red', label: '红' }, { value: 'blue', label: '蓝' },
  { value: 'green', label: '绿' }, { value: 'yellow', label: '黄' },
  { value: 'pink', label: '粉' }, { value: 'gray', label: '灰' },
  { value: 'brown', label: '棕' }, { value: 'beige', label: '米' },
  { value: 'multi', label: '多色' },
]
const styles = [
  { value: 'casual', label: '休闲' }, { value: 'formal', label: '通勤' },
  { value: 'sport', label: '运动' }, { value: 'sweet', label: '甜美' },
  { value: 'street', label: '街头' }, { value: 'minimal', label: '极简' },
]
const seasons = [
  { value: 'spring', label: '春' }, { value: 'summer', label: '夏' },
  { value: 'autumn', label: '秋' }, { value: 'winter', label: '冬' },
  { value: 'all', label: '四季' },
]
const labelMap: Record<string, Record<string, string>> = {
  category: Object.fromEntries(categories.map(c => [c.value, c.label])),
  color: Object.fromEntries(colors.map(c => [c.value, c.label])),
}

const filtered = computed(() =>
  filterCategory.value
    ? items.value.filter((i) => i.category === filterCategory.value)
    : items.value,
)

onMounted(() => loadWardrobe())

function loadWardrobe() {
  store.fetchWardrobe()
}

async function onSaveEdit() {
  if (!editing.value) return
  saving.value = true
  try {
    await updateClothing(editing.value.id, {
      name: editing.value.name,
      category: editing.value.category,
      color: editing.value.color,
      style: editing.value.style,
      season: editing.value.season,
    })
    editing.value = null
    loadWardrobe()
  } catch (e: any) {
    alert('保存失败: ' + (e.response?.data?.message || e.message))
  } finally {
    saving.value = false
  }
}
</script>
