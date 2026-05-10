import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  root: path.resolve(__dirname),
  plugins: [vue()],
  server: {
    port: 5175,
    proxy: {
      '/api': {
        target: 'http://localhost:3103',
        changeOrigin: true,
      },
    },
  },
})
