<template>
  <div style="padding: 16px">
    <h1>搭配推荐</h1>
    <p>从首页选择场景后点击"帮我搭"，推荐结果会在这里展示。</p>
    <router-link to="/">去首页选场景</router-link>

    <div v-if="outfits.length" style="margin-top: 20px">
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
import { useOutfitStore } from '../stores/outfit'
import { storeToRefs } from 'pinia'

const store = useOutfitStore()
const { outfits } = storeToRefs(store)
</script>
