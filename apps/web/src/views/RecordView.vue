<template>
  <div class="p-4 max-w-lg mx-auto">
    <header class="text-center mb-6 mt-2">
      <h1 class="text-2xl font-bold text-gray-800">How are you feeling now?</h1>
    </header>

    <div v-if="tagsApi.loading.value" class="text-center text-gray-500 py-10">Loading...</div>

    <div v-if="tagsApi.error.value" class="text-center text-red-500 p-4 bg-red-100 rounded-lg">
      Failed to load tags: {{ tagsApi.error.value }}
    </div>

    <form v-if="emotionTags.length" @submit.prevent="handleSubmit">
      <section class="mb-6">
        <h2 class="text-lg font-semibold text-gray-700 mb-3">Emotions</h2>
        <div class="flex flex-wrap gap-3">
          <button
            v-for="tag in emotionTags"
            :key="tag.id"
            type="button"
            @click="toggleSelection(tag, selectedTags)"
            :class="[
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border',
              isSelected(tag)
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100',
            ]"
          >
            {{ tag.name }}
          </button>
        </div>
      </section>

      <section class="mb-6">
        <h2 class="text-lg font-semibold text-gray-700 mb-3">Activities</h2>
        <div class="flex flex-wrap gap-3">
          <button
            v-for="tag in activityTags"
            :key="tag.id"
            type="button"
            @click="toggleSelection(tag, selectedTags)"
            :class="[
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border',
              isSelected(tag)
                ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100',
            ]"
          >
            {{ tag.name }}
          </button>
        </div>
      </section>

      <section class="mb-8">
        <label for="note" class="text-lg font-semibold text-gray-700 mb-3 block">Add a note (optional)</label>
        <textarea
          id="note"
          v-model="note"
          rows="4"
          class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          placeholder="What's on your mind?"
        ></textarea>
      </section>

      <button
        type="submit"
        :disabled="entryApi.loading.value || selectedTags.length === 0"
        class="w-full h-14 px-5 rounded-lg bg-blue-600 text-white text-lg font-bold tracking-wide shadow-lg hover:bg-blue-700 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
      >
        <span v-if="!entryApi.loading.value">Save Entry</span>
        <span v-else>Saving...</span>
      </button>

      <div v-if="entryApi.error.value" class="mt-4 text-center text-red-500">
        {{ entryApi.error.value }}
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useApi } from '@/composables/useApi';
import type { MoodEntry, Tag } from '@aura/types'; // 从我们的共享包导入类型
import { toast } from 'vue-sonner';
// --- API Hooks ---
// 为不同的 API 调用创建独立的 useApi 实例，这样它们的 loading/error 状态不会互相干扰
const tagsApi = useApi();
const entryApi = useApi();

// --- Component State ---
const allTags = ref<Tag[]>([]);
const selectedTags = ref<Tag[]>([]);
const note = ref('');

// --- Computed Properties ---
// 动态计算出情绪和活动标签列表
const emotionTags = computed(() => allTags.value.filter((tag) => tag.type === 'EMOTION'));
const activityTags = computed(() => allTags.value.filter((tag) => tag.type === 'ACTIVITY'));

// --- Logic ---
onMounted(async () => {
  const response = await tagsApi.get<Tag[]>('/tags');
  if (response && response.success) {
    allTags.value = response.data;
  }
});

const toggleSelection = (tag: Tag, selectionArray: Tag[]) => {
  const index = selectionArray.findIndex((t) => t.id === tag.id);
  if (index > -1) {
    selectionArray.splice(index, 1);
  } else {
    selectionArray.push(tag);
  }
};

const isSelected = (tag: Tag) => {
  return selectedTags.value.some((t) => t.id === tag.id);
};

const handleSubmit = async () => {
  // 👇 --- 2. 明确地告诉 promise resolve 的类型 --- 👇
  const promise = (): Promise<MoodEntry> =>
    new Promise(async (resolve, reject) => {
      // 👇 --- 3. 调用 API 时，传入泛型参数 MoodEntry --- 👇
      const response = await entryApi.post<MoodEntry>('/mood-entries', {
        note: note.value,
        tagIds: selectedTags.value.map((t) => t.id),
      });

      if (response && response.success) {
        // 现在 TypeScript 知道 response.data 是 MoodEntry 类型
        resolve(response.data);
      } else {
        reject(entryApi.error.value || 'Failed to save entry.');
      }
    });

  toast.promise(promise(), { // 👈 4. 调用 promise 函数
    loading: 'Saving entry...',
    // 👇 --- 5. 现在 _data 会被正确推断为 MoodEntry 类型 --- 👇
    success: (_data: MoodEntry) => {
      // 提交成功后清空表单
      selectedTags.value = [];
      note.value = '';
      return 'Entry saved successfully!';
    },
    error: (error: unknown) => {
      return String(error);
    },
  });
};
</script>
