<template>
  <button
    type="button"
    @click="$emit('select')"
    :class="[
      'flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 aspect-square',
      isSelected
        ? 'border-primary bg-blue-50 shadow-lg scale-105' // 使用 primary 颜色
        : 'border-transparent bg-white hover:border-blue-300',
    ]"
  >
    <span class="text-4xl">{{ tag.emoji }}</span>
    <span class="text-sm font-semibold text-neutral-700">{{ tag.name }}</span> </button>
</template>

<script setup lang="ts">
import type { Tag } from '@aura/types';

defineProps<{
  tag: Tag;
  isSelected: boolean;
}>();

defineEmits(['select']);
</script>
