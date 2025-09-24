<template>
  <div class="flex flex-col h-screen bg-gray-50">
    <main class="flex-1 overflow-y-auto pb-16 hide-scrollbar">
      <RouterView />
    </main>
    <BottomNav />
    <Toaster rich-colors position="top-center" />
    <ReloadPWA />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import BottomNav from '@/components/BottomNav.vue'
import { Toaster ,toast} from 'vue-sonner'
import ReloadPWA from '@/components/ReloadPWA.vue';
import { useEventBus } from '@/composables/useEventBus'

// 监听 toast:show 事件
const { on } = useEventBus()
on('toast:show', (payload: { message: string; type?: 'success' | 'error' | 'info' }) => {
  if (payload.type === 'success') {
    toast.success(payload.message)
  } else if (payload.type === 'error') {
    toast.error(payload.message)
  } else {
    toast.info(payload.message)
  }
})
</script>
