<template>
  <footer class="sticky bottom-0 bg-white/80 backdrop-blur-sm border-t border-gray-200">
    <nav class="flex justify-around py-2">
      <RouterLink to="/" v-slot="{ isActive }">
        <div
          class="flex flex-col items-center justify-center gap-1 w-1/3 transition-colors"
          :class="isActive ? 'text-blue-600' : 'text-gray-500'"
        >
          <span
            class="material-symbols-outlined"
            :style="{ fontVariationSettings: isActive ? `'FILL' 1` : `'FILL' 0` }"
          >
            edit_note
          </span>
          <span class="text-xs font-medium">Record</span>
        </div>
      </RouterLink>

      <RouterLink to="/history" v-slot="{ isActive }">
        <div
          class="flex flex-col items-center justify-center gap-1 w-1/3 transition-colors"
          :class="isActive ? 'text-blue-600' : 'text-gray-500'"
        >
          <span
            class="material-symbols-outlined"
            :style="{ fontVariationSettings: isActive ? `'FILL' 1` : `'FILL' 0` }"
          >
            calendar_month
          </span>
          <span class="text-xs font-medium">History</span>
        </div>
      </RouterLink>

      <RouterLink to="/insights" v-slot="{ isActive }">
        <div
          class="flex flex-col items-center justify-center gap-1 w-1/3 transition-colors"
          :class="isActive ? 'text-blue-600' : 'text-gray-500'"
        >
          <span
            class="material-symbols-outlined"
            :style="{ fontVariationSettings: isActive ? `'FILL' 1` : `'FILL' 0` }"
          >
            insights
          </span>
          <span class="text-xs font-medium">Insights</span>
        </div>
      </RouterLink>
    </nav>
  </footer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<style scoped>
/* We still keep some basic, non-Tailwind styles here if needed */
.material-symbols-outlined {
  transition: font-variation-settings 0.3s;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
