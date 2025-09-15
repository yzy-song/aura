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
import { Toaster } from 'vue-sonner'
import ReloadPWA from '@/components/ReloadPWA.vue';
</script>
