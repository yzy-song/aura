import axios from 'axios'
import { useProfileStore } from '@/stores/profile.store'
import { logger } from '@/utils/logger'

// 创建 Axios 实例
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3005',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 (为 Aura 项目定制)
apiClient.interceptors.request.use(
  (config) => {
    logger.info('[API Request]', config.method?.toUpperCase(), config.url)

    // 从 Pinia Store 中获取 profileId
    const profileStore = useProfileStore()
    const profileId = profileStore.profileId

    // 如果 profileId 存在，就添加到请求头
    if (profileId) {
      config.headers['X-Profile-Id'] = profileId
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截器 (基本沿用您的代码)
apiClient.interceptors.response.use(
  (response) => {
    // 只返回最核心的 data 部分
    return response.data
  },
  (error) => {
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred.'
    logger.error('API Error:', errorMessage, error.response?.data)
    return Promise.reject(new Error(errorMessage))
  },
)
