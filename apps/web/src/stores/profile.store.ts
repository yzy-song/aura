import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useApi } from '@/composables/useApi'
import { logger } from '@/utils/logger'

export const useProfileStore = defineStore('profile', () => {
  const profileId = ref<string | null>(localStorage.getItem('auraProfileId'))
  const { post } = useApi()

  async function initProfile() {
    if (profileId.value) {
      logger.info('Profile ID loaded from localStorage:', profileId.value)
      return
    }

    logger.info('No local Profile ID found, creating a new one...')

    const response = await post<{ id: string }>('/profiles', {
      anonymousName: `Wandering Soul #${Math.floor(Math.random() * 1000)}`,
      avatarId: `avatar-${Math.floor(Math.random() * 10)}`,
    })

    if (response && response.success) {
      const newProfileId = response.data.id
      localStorage.setItem('auraProfileId', newProfileId)
      profileId.value = newProfileId
      logger.info('New Profile created and saved:', newProfileId)
    }
  }

  return { profileId, initProfile }
})
