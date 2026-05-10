import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
})

// 场景
export const getScenes = () => api.get('/scenes')

// 衣橱
export const getWardrobe = (params?: { category?: string; style?: string; season?: string }) =>
  api.get('/wardrobe', { params })

export const getClothing = (id: number) => api.get(`/wardrobe/${id}`)

export const addClothing = (data: {
  name: string
  category: string
  color?: string
  style?: string
  season?: string
  oss_url?: string
  source?: string
  taobao_url?: string
}) => api.post('/wardrobe', data)

export const updateClothing = (
  id: number,
  data: { name?: string; category?: string; color?: string; style?: string; season?: string },
) => api.put(`/wardrobe/${id}`, data)

// 图片识别
export const recognizeImage = (file: File) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/recognize', form)
}

// 搭配推荐
export const recommendOutfit = (scene: string) => api.post('/outfit/recommend', { scene })

// AI 评价
export const evaluateOutfit = (items: number[]) => api.post('/outfit/evaluate', { items })

// 视频解析
export const parseVideo = (url: string) => api.post('/video/parse', { url })

export const saveVideoItems = (items: any[]) => api.post('/video/save', { items })
