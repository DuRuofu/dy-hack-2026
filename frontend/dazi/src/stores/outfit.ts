import { defineStore } from 'pinia'
import { ref } from 'vue'
import { recommendOutfit } from '../api'

export const useOutfitStore = defineStore('outfit', () => {
  const outfits = ref<any[]>([])
  const loading = ref(false)

  async function fetchRecommend(scene: string) {
    loading.value = true
    try {
      const { data } = await recommendOutfit(scene)
      outfits.value = data.outfits
    } finally {
      loading.value = false
    }
  }

  return { outfits, loading, fetchRecommend }
})
