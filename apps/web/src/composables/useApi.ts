import { ref } from 'vue'
import { apiClient } from '@/services/apiClient'
import { logger } from '@/utils/logger'

export interface BackendResponse<T> {
  success: boolean
  data: T
  message: string
  meta?: Record<string, unknown>
}

type RequestData = Record<string, unknown>

export function useApi() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const request = async <T>(
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    url: string,
    data?: RequestData,
  ): Promise<BackendResponse<T> | null> => {
    loading.value = true
    error.value = null

    try {
      // 👇 --- 核心修正：在 await 之后，我们从返回的 AxiosResponse 中解构出 data 属性 --- 👇
      let response: BackendResponse<T>
      switch (method) {
        case 'get':
          response = (await apiClient.get<BackendResponse<T>>(url, { params: data })).data
          break
        case 'delete':
          response = (await apiClient.delete<BackendResponse<T>>(url)).data
          break
        case 'post':
          response = (await apiClient.post<BackendResponse<T>>(url, data)).data
          break
        case 'put':
          response = (await apiClient.put<BackendResponse<T>>(url, data)).data
          break
        case 'patch':
          response = (await apiClient.patch<BackendResponse<T>>(url, data)).data
          break
        default:
          throw new Error(`Unsupported API method: ${method}`)
      }
      return response
    } catch (err: unknown) {
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'An unexpected error occurred'
      }
      logger.error('useApi Error:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    get: <T>(url: string, params?: RequestData) => request<T>('get', url, params),
    post: <T>(url: string, data?: RequestData) => request<T>('post', url, data),
    put: <T>(url: string, data?: RequestData) => request<T>('put', url, data),
    delete: <T>(url: string) => request<T>('delete', url),
    patch: <T>(url: string, data?: RequestData) => request<T>('patch', url, data),
  }
}
