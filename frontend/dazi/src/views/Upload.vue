<template>
  <div style="padding: 16px">
    <h1>拍照上传识别</h1>

    <input type="file" accept="image/*" capture="environment" @change="onFileChange" />
    <div v-if="previewUrl" style="margin-top:12px">
      <img :src="previewUrl" style="max-width:200px;max-height:200px;borderRadius:8px" />
    </div>

    <button
      @click="onRecognize"
      :disabled="!file || recognizing"
      style="margin-top:12px;padding:10px 20px"
    >
      {{ recognizing ? '识别中...' : 'AI 识别' }}
    </button>

    <div v-if="result" style="margin-top:20px;border:1px solid #ddd;padding:16px;borderRadius:8px">
      <h2>识别结果</h2>
      <table>
        <tr><td>名称</td><td><input v-model="result.name" /></td></tr>
        <tr><td>品类</td><td>
          <select v-model="result.category">
            <option v-for="c in categories" :key="c.value" :value="c.value">{{ c.label }}</option>
          </select>
        </td></tr>
        <tr><td>颜色</td><td>
          <select v-model="result.color">
            <option v-for="c in colors" :key="c.value" :value="c.value">{{ c.label }}</option>
          </select>
        </td></tr>
        <tr><td>风格</td><td>
          <select v-model="result.style">
            <option v-for="s in styles" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
        </td></tr>
        <tr><td>季节</td><td>
          <select v-model="result.season">
            <option v-for="s in seasons" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
        </td></tr>
      </table>

      <button @click="onSave" :disabled="saving" style="margin-top:12px;padding:10px 20px">
        {{ saving ? '保存中...' : '加入衣橱' }}
      </button>
      <span v-if="saved" style="color:green;margin-left:12px">已保存!</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { recognizeImage, addClothing } from '../api'

const file = ref<File | null>(null)
const previewUrl = ref('')
const recognizing = ref(false)
const saving = ref(false)
const saved = ref(false)
const result = ref<any>(null)

const categories = [
  { value: 'top', label: '上衣' },
  { value: 'bottom', label: '下装' },
  { value: 'dress', label: '连衣裙' },
  { value: 'shoes', label: '鞋' },
  { value: 'bag', label: '包' },
  { value: 'accessory', label: '配饰' },
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

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) {
    file.value = input.files[0]
    previewUrl.value = URL.createObjectURL(input.files[0])
    result.value = null
    saved.value = false
  }
}

async function onRecognize() {
  if (!file.value) return
  recognizing.value = true
  saved.value = false
  try {
    const { data } = await recognizeImage(file.value)
    result.value = {
      name: data.name ?? '',
      category: data.category ?? 'top',
      color: data.color ?? '',
      style: data.style ?? '',
      season: data.season ?? '',
      oss_url: data.oss_url ?? '',
    }
  } catch (e: any) {
    alert('识别失败: ' + (e.response?.data?.message || e.message))
  } finally {
    recognizing.value = false
  }
}

async function onSave() {
  if (!result.value) return
  saving.value = true
  try {
    await addClothing({
      name: result.value.name || '未命名衣物',
      category: result.value.category,
      color: result.value.color,
      style: result.value.style,
      season: result.value.season,
      oss_url: result.value.oss_url,
      source: 'upload',
    })
    saved.value = true
  } catch (e: any) {
    alert('保存失败: ' + (e.response?.data?.message || e.message))
  } finally {
    saving.value = false
  }
}
</script>
