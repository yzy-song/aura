<template>
  <div
    v-if="needRefresh"
    class="fixed right-4 bottom-20 z-50 p-4 rounded-lg shadow-lg bg-white border border-gray-200 flex items-center gap-4"
  >
    <span class="text-gray-700">A new version is available!</span>
    <button
      @click="updateServiceWorker()"
      class="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
    >
      Reload
    </button>
  </div>
</template>

<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue';

const { needRefresh, updateServiceWorker } = useRegisterSW();
</script>
