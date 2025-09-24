import './assets/main.css'
import 'vue-sonner/style.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia' // 导入 createPinia

import App from './App.vue'
import router from './router'
import { useProfileStore } from './stores/profile.store' // 导入我们创建的 store

import VCalendar from 'v-calendar'
const app = createApp(App)

app.use(createPinia()) // 注册 Pinia
app.use(router)

app.use(VCalendar, {})
// 1. 获取 profile store 的实例
const profileStore = useProfileStore()

// 2. 执行初始化操作
Promise.all([profileStore.initAnonymousProfile(), profileStore.fetchProfile()])
  .then(() => {
    app.mount('#app')
  })
  .catch((error) => {
    console.error('Failed to initialize app state:', error)
    app.mount('#app')
  })
