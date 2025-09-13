<template>
  <div class="flex flex-col h-screen bg-gray-50">
    <main class="flex-1 overflow-y-auto pb-16">
      <RouterView />
    </main>
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import BottomNav from '@/components/BottomNav.vue'
</script>
