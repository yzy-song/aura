<template>
  <div class="max-w-lg mx-auto px-4 py-6 font-sans">
    <header class="text-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Your Journey</h1>
      <p class="text-gray-500 mt-2">Look back at your moments</p>
    </header>

    <div v-if="api.loading.value && !allEntries.length" class="text-center py-10">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-4 text-gray-500">Loading your history...</p>
    </div>
    <div v-if="api.error.value" class="text-center text-red-600 p-4 bg-red-50 border border-red-200 rounded-lg">
      Failed to load history: {{ api.error.value }}
    </div>

    <section v-if="!api.error.value" class="bg-white p-2 sm:p-4 rounded-xl shadow-sm border border-gray-100 mb-8">
      <VCalendar
        v-model="selectedDate"
        :attributes="calendarAttributes"
        borderless
        expanded
        title-position="left"
        class="custom-calendar"
      />
    </section>

    <section v-if="!api.error.value">
      <h2 class="text-xl font-bold text-gray-800 mb-4">
        Entries for <span class="text-blue-600">{{ formattedSelectedDate }}</span>
      </h2>

      <TransitionGroup
        tag="div"
        class="space-y-4"
        enter-from-class="opacity-0 translate-y-5"
        enter-active-class="transition-all duration-500 ease-out"
        leave-to-class="opacity-0 scale-95"
        leave-active-class="transition-all duration-300 ease-in"
      >
        <div v-for="entry in entriesForSelectedDate" :key="entry.id" class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">
              {{ entry.tags[0]?.emoji || '📝' }}
            </div>
            <div class="flex-1">
              <div class="flex flex-wrap gap-2 mb-2">
                <span v-for="tag in entry.tags" :key="tag.id" class="text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                   {{ tag.emoji }} {{ tag.name }}
                </span>
              </div>
              <p v-if="entry.note" class="text-gray-700">{{ entry.note }}</p>
              <p class="text-xs text-gray-400 mt-2">{{ formatTime(entry.createdAt) }}</p>
            </div>
          </div>
        </div>
      </TransitionGroup>

      <div
        v-if="!entriesForSelectedDate.length && !api.loading.value"
        class="text-center py-10 px-4 rounded-lg bg-gray-50 border-2 border-dashed"
      >
        <p class="text-gray-500">No entries recorded on this day.</p>
        <RouterLink to="/" class="mt-4 inline-block px-5 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition">
          Record a new moment
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useApi } from '@/composables/useApi';
// 👇 --- 修正点 3: 导入我们新的、更精确的类型 --- 👇
import type { MoodEntryWithTags, PaginatedMoodEntries } from '@aura/types';
import { Calendar as VCalendar } from 'v-calendar';
import 'v-calendar/style.css';
import { format } from 'date-fns';
import { RouterLink } from 'vue-router';

const api = useApi();
// 👇 --- 修正点 4: 使用更精确的类型 --- 👇
const allEntries = ref<MoodEntryWithTags[]>([]);
const selectedDate = ref(new Date());

onMounted(async () => {
  const response = await api.get<PaginatedMoodEntries>('/mood-entries/mine', { limit: 1000 });
  if (response && response.success) {
    // 👇 --- 修正点 5: 从分页数据中正确地解构出 data 数组 --- 👇
    allEntries.value = response.data.data;
  }
});

// 👇 --- 修正点 6: 为 calendarAttributes 添加明确的类型，以解决 v-calendar 的类型报错 --- 👇
const calendarAttributes = computed(() => [
  {
    key: 'today',
    highlight: {
      color: 'blue',
      fillMode: 'outline' as const,
    },
    dates: [new Date()],
  },
  {
    key: 'entries',
    dot: true,
    dates: allEntries.value.map(entry => new Date(entry.createdAt)),
  }
]);

const entriesForSelectedDate = computed(() => {
  return allEntries.value.filter(entry => {
    const entryDate = new Date(entry.createdAt);
    return entryDate.toDateString() === selectedDate.value.toDateString();
  });
});

const formattedSelectedDate = computed(() => {
  return format(selectedDate.value, 'MMMM d, yyyy');
});

// 👇 --- 修正点 7: 允许 formatTime 接收 Date 或 string 类型 --- 👇
const formatTime = (dateString: string | Date) => {
  return format(new Date(dateString), 'h:mm a');
};
</script>

<style>
/* Custom styles for v-calendar (no changes) */
.custom-calendar.vc-container {
  --vc-font-family: inherit;
  --vc-rounded-full: 0.5rem;
  --vc-accent-600: #2563eb; /* Tailwind blue-600 */
}
</style>
