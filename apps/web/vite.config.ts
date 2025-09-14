import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/postcss'
import { VitePWA } from 'vite-plugin-pwa'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      registerType: 'autoUpdate', // Automatically update the app when new content is available
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'], // Cache these file types
      },
      manifest: {
        name: 'Aura - Your Mood Companion',
        short_name: 'Aura',
        description:
          'An anonymous app to record, reflect, and gain insights into your emotional patterns.',
        theme_color: '#ffffff',
        background_color: '#f9fafb', // A light gray background
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
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
