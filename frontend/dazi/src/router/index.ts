import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/Home.vue') },
  { path: '/upload', name: 'Upload', component: () => import('../views/Upload.vue') },
  { path: '/wardrobe', name: 'Wardrobe', component: () => import('../views/Wardrobe.vue') },
  { path: '/outfit', name: 'Outfit', component: () => import('../views/Outfit.vue') },
  { path: '/mix-match', name: 'MixMatch', component: () => import('../views/MixMatch.vue') },
  { path: '/video', name: 'Video', component: () => import('../views/Video.vue') },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
