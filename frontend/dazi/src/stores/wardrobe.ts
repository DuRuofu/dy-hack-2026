import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getWardrobe } from '../api'

export const useWardrobeStore = defineStore('wardrobe', () => {
  const items = ref<any[]>([])
  const loading = ref(false)

  async function fetchWardrobe(params?: { category?: string; style?: string; season?: string }) {
    loading.value = true
    try {
      const { data } = await getWardrobe(params)
      items.value = data.items
    } finally {
      loading.value = false
    }
  }

  return { items, loading, fetchWardrobe }
})
