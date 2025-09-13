import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia' // 导入 createPinia

import App from './App.vue'
import router from './router'
import { useProfileStore } from './stores/profile.store' // 导入我们创建的 store

const app = createApp(App)

app.use(createPinia()) // 注册 Pinia
app.use(router)

// 1. 获取 profile store 的实例
const profileStore = useProfileStore()

// 2. 执行初始化操作
profileStore.initProfile().then(() => {
  // 3. 确保在获取到 profileId 之后再挂载应用
  app.mount('#app')
})
