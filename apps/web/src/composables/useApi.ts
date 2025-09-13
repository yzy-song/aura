import { ref } from 'vue'
import { api } from '@/services/apiClient'
import { logger } from '@/utils/logger'
import type { BackendResponse } from '@aura/types'

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
      // api.get 等方法已经返回了解包后的 BackendResponse<T>
      let response: BackendResponse<T>
      switch (method) {
        case 'get':
          response = await api.get<BackendResponse<T>>(url, { params: data })
          break
        case 'post':
          response = await api.post<BackendResponse<T>>(url, data)
          break
        case 'put':
          response = await api.put<BackendResponse<T>>(url, data)
          break
        case 'delete':
          response = await api.delete<BackendResponse<T>>(url)
          break
        case 'patch':
          response = await api.patch<BackendResponse<T>>(url, data)
          break
        default:
          throw new Error(`Unsupported method: ${method}`)
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
