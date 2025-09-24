<template>
  <div class="max-w-lg mx-auto px-4 py-6 font-sans">
    <header class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Settings</h1>
      <p class="text-gray-500 mt-2">Manage your account and preferences</p>
    </header>

    <div v-if="profileStore.isAuthenticated && profileStore.profile" class="space-y-6">
      <!-- 头像上传区 -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-4">
        <div class="relative">
          <img
            :src="avatarPreviewUrl || profileStore.profile.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${profileStore.profile.anonymousName}`"
            alt="User Avatar"
            class="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
          />
          <button @click="triggerFileInput" class="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-600 transition">
            <span class="material-symbols-outlined text-base">edit</span>
          </button>
          <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" class="hidden" />
        </div>
        <button v-if="selectedFile" @click="handleAvatarUpload" :disabled="isUploading" class="px-4 py-2 text-sm font-semibold bg-green-500 text-white rounded-full hover:bg-green-600 transition disabled:bg-gray-400">
          {{ isUploading ? 'Uploading...' : 'Save Avatar' }}
        </button>
      </div>

      <!-- 昵称修改区 -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Display Name</h3>
        <div class="flex items-center gap-2">
          <input type="text" v-model="editableName" class="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
          <button @click="handleNameUpdate" :disabled="isUpdatingName" class="px-5 h-10 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition disabled:bg-gray-400">
            {{ isUpdatingName ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>

      <!-- 其它设置区 -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Preferences</h3>
        <p class="text-gray-500">Theme, notifications, etc. (Coming soon)</p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Data</h3>
        <p class="text-gray-500">Export your data. (Coming soon)</p>
      </div>

      <button @click="handleSignOut" class="w-full h-12 px-5 rounded-lg bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-colors">
        Sign Out
      </button>
    </div>

    <div v-else class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 class="text-lg font-semibold text-gray-700 mb-4">Account Sync</h2>
      <p class="text-gray-600 mb-6">
        Sign in to securely back up and sync your data across devices.
      </p>
      <div class="space-y-4">
        <button
          @click="handleSignIn('google')"
          :disabled="isLoading"
          class="w-full h-12 px-5 rounded-lg bg-white border border-gray-300 text-gray-700 font-bold tracking-wide shadow-sm hover:bg-gray-50 transition-all duration-300 disabled:bg-gray-200 flex items-center justify-center gap-3"
        >
          <svg class="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M47.52 24.54C47.52 22.86 47.34 21.24 47.04 19.62H24V28.8H37.44C36.84 31.44 35.28 33.66 33.12 35.1V41.46H41.52C45.42 37.86 47.52 31.86 47.52 24.54Z" fill="#4285F4"></path><path d="M24 48C30.48 48 35.94 45.84 39.84 42.42L32.82 36.9C30.66 38.34 27.66 39.3 24 39.3C17.4 39.3 11.76 34.86 9.84 28.98H1.26V34.5C5.16 42.42 13.92 48 24 48Z" fill="#34A853"></path><path d="M9.84 28.98C9.36 27.54 9.12 26.04 9.12 24.5C9.12 22.96 9.36 21.46 9.84 20.02V14.5H1.26C-0.42 17.82 -1.5 21.54 -1.5 24.5C-1.5 27.46 -0.42 31.18 1.26 34.5L9.84 28.98Z" fill="#FBBC05"></path><path d="M24 9.7C27.3 9.7 30.12 10.86 32.46 13.02L39.96 5.58C35.94 1.98 30.48 0 24 0C13.92 0 5.16 5.58 1.26 13.5L9.84 19.02C11.76 13.14 17.4 9.7 24 9.7Z" fill="#EA4335"></path></svg>
          <span v-if="!isLoading">Sign in with Google</span>
          <span v-else>Connecting...</span>
        </button>

        <button
          @click="handleSignIn('twitter')"
          :disabled="isLoading"
          class="w-full h-12 px-5 rounded-lg bg-black text-white font-bold tracking-wide shadow-lg hover:bg-gray-800 transition-all duration-300 disabled:bg-gray-600 flex items-center justify-center gap-3"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 16 16"><path d="M9.243 6.015L15.358 0H13.91l-5.465 6.84L3.69 0H0l6.383 9.25L0 16h1.52l5.774-7.22L12.31 16H16L9.243 6.015ZM7.42 8.35L6.82 7.5l-5.3-7.5H3.6l4.6 6.55.6.85 5.56 7.95H12.2L7.42 8.35Z"></path></svg>
          <span v-if="!isLoading">Sign in with Twitter</span>
          <span v-else>Connecting...</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { signInWithPopup, GoogleAuthProvider, TwitterAuthProvider, type AuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { useApi } from '@/composables/useApi';
import { useProfileStore } from '@/stores/profile.store';
import { useEventBus } from '@/composables/useEventBus';
import type { AuthResponse, Profile, BackendResponse } from '@aura/types';
import { apiClient } from '@/services/apiClient';

const { post } = useApi();
const profileStore = useProfileStore();
const { emit } = useEventBus();

// --- State for Profile Editing ---
const editableName = ref(profileStore.profile?.anonymousName || '');
const isUpdatingName = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const avatarPreviewUrl = ref<string | null>(null);
const isUploading = ref(false);

// 监视 store 的变化，以确保在 fetchProfile 后能更新本地的 editableName
watch(() => profileStore.profile, (newProfile) => {
  if (newProfile) {
    editableName.value = newProfile.anonymousName;
  }
}, { immediate: true });

// --- Avatar Logic ---
const triggerFileInput = () => fileInput.value?.click();

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
    avatarPreviewUrl.value = URL.createObjectURL(selectedFile.value);
  }
};

const handleAvatarUpload = async () => {
  if (!selectedFile.value) return;
  isUploading.value = true;

  const formData = new FormData();
  formData.append('file', selectedFile.value);

  try {
    const response = await apiClient.patch<BackendResponse<Profile>>('/profiles/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.data && response.data.success) {
      profileStore.setProfile(response.data.data);
      emit('toast:show', { message: 'Avatar updated successfully!', type: 'success' });
      selectedFile.value = null;
      avatarPreviewUrl.value = null;
    } else {
      throw new Error(response.data.message || 'Avatar upload failed.');
    }
  } catch (error: any) {
    emit('toast:show', { message: error.message, type: 'error' });
  } finally {
    isUploading.value = false;
  }
};

// --- Name Update Logic ---
const handleNameUpdate = async () => {
  if (!editableName.value || editableName.value === profileStore.profile?.anonymousName) {
    return;
  }
  isUpdatingName.value = true;
  const response = await apiClient.patch<BackendResponse<Profile>>('/profiles/me', { anonymousName: editableName.value });
  if (response && response.data.success) {
    profileStore.setProfile(response.data.data);
    emit('toast:show', { message: 'Name updated successfully!', type: 'success' });
  }
  isUpdatingName.value = false;
};

// --- Sign In / Sign Out Logic ---
const isLoading = ref(false);
const handleSignIn = async (providerName: 'google' | 'twitter') => {
  isLoading.value = true;
  let provider: AuthProvider;
  if (providerName === 'google') {
    provider = new GoogleAuthProvider();
  } else {
    provider = new TwitterAuthProvider();
  }

  try {
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();

    const response = await post<AuthResponse>('/auth/link-firebase', { idToken });

    if (response && response.success) {
      profileStore.setAuthData({
        newProfile: response.data.profile,
        newAccessToken: response.data.accessToken,
      });
      emit('toast:show', { message: 'Signed in successfully!', type: 'success' });
    } else {
      throw new Error('Failed to link account on our server.');
    }

  } catch (error: any) {
    console.error("Sign-in error:", error);
    emit('toast:show', { message: error.message || `Failed to sign in with ${providerName}.`, type: 'error' });
  } finally {
    isLoading.value = false;
  }
};

const handleSignOut = () => {
  signOut(auth).then(() => {
    profileStore.logout();
    emit('toast:show', { message: 'You have been signed out.', type: 'success' });
  }).catch((error) => {
    emit('toast:show', { message: 'Error signing out.', type: 'error' });
  });
};
</script>
