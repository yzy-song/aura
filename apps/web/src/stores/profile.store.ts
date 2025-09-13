import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/services/apiClient' // 直接导入 api 对象
import { logger } from '@/utils/logger'
import type { BackendResponse, Profile } from '@aura/types' // 导入共享类型

export const useProfileStore = defineStore('profile', () => {
  const profileId = ref<string | null>(localStorage.getItem('auraProfileId'))

  async function initProfile() {
    // 如果本地已有ID，直接使用
    if (profileId.value) {
      logger.info('Profile ID loaded from localStorage:', profileId.value)
      return
    }

    // 如果本地没有ID，调用 API 创建
    try {
      logger.info('No local Profile ID found, creating a new one...')

      // 👇 直接调用 api.post，不再通过 useApi
      const response = await api.post<BackendResponse<Profile>>('/profiles', {
        anonymousName: `Wandering Soul #${Math.floor(Math.random() * 1000)}`,
        avatarId: `avatar-${Math.floor(Math.random() * 10)}`,
      })

      if (response && response.success) {
        const newProfileId = response.data.id
        localStorage.setItem('auraProfileId', newProfileId)
        profileId.value = newProfileId
        logger.info('New Profile created and saved:', newProfileId)
      } else {
        // 处理 API 返回 success: false 的情况
        throw new Error(response?.message || 'Failed to create profile')
      }
    } catch (error) {
      logger.error('Failed to initialize profile:', error)
      // 在这里可以添加一些错误处理逻辑，比如向用户显示一个全局错误提示
    }
  }

  return { profileId, initProfile }
})
