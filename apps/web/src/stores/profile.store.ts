import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/services/apiClient'
import { logger } from '@/utils/logger'
import type { Profile, BackendResponse } from '@aura/types'

export const useProfileStore = defineStore('profile', () => {
  // --- State ---
  const profile = ref<Profile | null>(null)
  const accessToken = ref<string | null>(localStorage.getItem('auraAccessToken'))

  // --- Getters (计算属性) ---
  const isAuthenticated = computed(() => !!accessToken.value)
  const profileId = computed(() => profile.value?.id || localStorage.getItem('auraProfileId'))
  // --- Actions (操作) ---

  function setProfile(newProfile: Profile) {
    profile.value = newProfile
  }

  // 设置认证信息 (登录成功后调用)
  function setAuthData({
    newProfile,
    newAccessToken,
  }: {
    newProfile: Profile
    newAccessToken: string
  }) {
    profile.value = newProfile
    accessToken.value = newAccessToken
    localStorage.setItem('auraAccessToken', newAccessToken)
    // 登录后，我们就不再需要匿名的 ID 了
    localStorage.removeItem('auraProfileId')
    logger.info('Authentication data set. User is logged in.', newProfile)
  }

  // 登出
  async function logout() {
    profile.value = null
    accessToken.value = null
    localStorage.removeItem('auraAccessToken')
    // 登出后，获取一个新的匿名身份
    await initAnonymousProfile()
  }

  // 初始化匿名 Profile (应用启动时或登出后调用)
  async function initAnonymousProfile() {
    if (isAuthenticated.value) {
      logger.info('User is authenticated, skipping anonymous profile creation.')
      return
    }

    const anonymousId = localStorage.getItem('auraProfileId')
    if (anonymousId) {
      logger.info('Anonymous profile ID loaded from localStorage:', anonymousId)
      // 未来可以考虑根据匿名ID去后端获取profile信息
      return
    }

    try {
      logger.info('No local anonymous ID found, creating a new one...')
      const response = await api.post<BackendResponse<Profile>>('/profiles', {
        anonymousName: `Wandering Soul #${Math.floor(Math.random() * 1000)}`,
        avatarUrl: '/avatars/panda.png',
      })

      if (response && response.success) {
        localStorage.setItem('auraProfileId', response.data.id)
      }
    } catch (error) {
      logger.error('Failed to initialize anonymous profile:', error)
    }
  }

  async function fetchProfile() {
    if (isAuthenticated.value && !profile.value) {
      try {
        const response = await api.get<BackendResponse<Profile>>('/profiles/me')
        if (response && response.success) {
          profile.value = response.data
        } else {
          logout() // Token 可能无效，执行登出
        }
      } catch (error) {
        logger.error('Failed to fetch profile:', error)
        logout()
      }
    }
  }

  return {
    profile,
    accessToken,
    isAuthenticated,
    profileId,
    initAnonymousProfile,
    setAuthData,
    setProfile,
    logout,
    fetchProfile,
  }
})
