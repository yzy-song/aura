<template>
  <button
    type="button"
    @click="$emit('select')"
    :class="[
      'flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 aspect-square',
      isSelected
        ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
        : 'border-transparent bg-white hover:border-blue-300',
    ]"
  >
    <span class="text-4xl">{{ tag.emoji }}</span>
    <span class="text-sm font-semibold text-gray-700">{{ tag.name }}</span>
  </button>
</template>

<script setup lang="ts">
import type { Tag } from '@aura/types';

defineProps<{
  tag: Tag;
  isSelected: boolean;
}>();

defineEmits(['select']);
</script>
