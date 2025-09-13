import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/postcss'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  css: {
    postcss: {
      plugins: [tailwindcss],
    },
  },
  server: {
    host: '0.0.0.0', // 允许所有网络接口访问
    port: 5173, // 指定端口号（可选）
    strictPort: true, // 如果端口被占用则报错
    open: false, // 不自动打开浏览器
    preTransformRequests: true,
    // 仅开发环境用代理
    proxy: {
      '/api': {
        target: 'http://localhost:3005', // 开发环境后端地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // **【新增】** 图片上传目录的代理
      '/uploads': {
        target: 'http://localhost:3005', // 同样指向后端服务
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
