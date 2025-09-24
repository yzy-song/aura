import axios from 'axios'
import { useProfileStore } from '@/stores/profile.store'
import { logger } from '@/utils/logger'

// 1. 创建底层 Axios 实例
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 2. 配置请求拦截器 (逻辑不变)
apiClient.interceptors.request.use(
  (config) => {
    logger.info('[API Request]', config.method?.toUpperCase(), config.url)

    // 优先使用登录后获取的 accessToken
    const token = localStorage.getItem('auraAccessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      // 如果没有 accessToken (未登录)，则回退到使用匿名的 profileId
      const profileStore = useProfileStore()
      console.log('Using profileId:', profileStore.profileId)
      if (profileStore.profileId) {
        config.headers['X-Profile-Id'] = profileStore.profileId
      }
    }

    return config
  },
  (error) => Promise.reject(error),
)

// 3. 响应拦截器，只处理错误日志，直接返回原始响应
apiClient.interceptors.response.use(
  (response) => response, // 直接返回原始 AxiosResponse
  (error) => {
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred.'
    logger.error('API Error:', errorMessage, error.response?.data)
    return Promise.reject(new Error(errorMessage))
  },
)

// 4. 创建一个高层 API 对象，负责解包 .data
// 这是其他代码（Store 和 Composable）将要使用的对象
export const api = {
  get: <T>(url: string, params?: Record<string, unknown>): Promise<T> =>
    apiClient.get<T>(url, { params }).then((res) => res.data),
  post: <T>(url: string, data?: unknown): Promise<T> =>
    apiClient.post<T>(url, data).then((res) => res.data),
  put: <T>(url: string, data?: unknown): Promise<T> =>
    apiClient.put<T>(url, data).then((res) => res.data),
  delete: <T>(url: string): Promise<T> => apiClient.delete<T>(url).then((res) => res.data),
  patch: <T>(url: string, data?: unknown): Promise<T> =>
    apiClient.patch<T>(url, data).then((res) => res.data),
}
