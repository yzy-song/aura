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
    // <-- Return the full BackendResponse
    loading.value = true
    error.value = null
    try {
      // The `api.get`, `api.post` etc. methods already return the BackendResponse object
      const response = await api[method]<BackendResponse<T>>(url, data)
      return response // <-- Return it directly
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
