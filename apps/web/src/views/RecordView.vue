<template>
  <div class="p-4 max-w-lg mx-auto">
    <header class="text-center mb-8 mt-4">
      <h1 class="text-3xl font-bold text-gray-800 tracking-tight">How are you feeling now?</h1>
    </header>

    <div v-if="tagsApi.loading.value" class="space-y-8 animate-pulse">
      <div>
        <div class="h-6 w-1/3 bg-gray-200 rounded mb-4"></div>
        <div class="grid grid-cols-3 gap-3">
          <div v-for="i in 6" :key="i" class="aspect-square bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
       <div>
        <div class="h-6 w-1/3 bg-gray-200 rounded mb-4"></div>
        <div class="grid grid-cols-3 gap-3">
          <div v-for="i in 6" :key="i" class="aspect-square bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    </div>

    <div v-if="tagsApi.error.value && !tagsApi.loading.value" class="text-center text-red-500 p-4 bg-red-100 rounded-lg">
      Failed to load tags: {{ tagsApi.error.value }}
    </div>

    <form v-if="emotionTags.length" @submit.prevent="handleSubmit">
      <section class="mb-8">
        <h2 class="text-xl font-semibold text-gray-700 mb-4">Emotions</h2>
        <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
          <TagCard
            v-for="tag in emotionTags"
            :key="tag.id"
            :tag="tag"
            :is-selected="isSelected(tag)"
            @select="toggleSelection(tag, selectedTags)"
          />
        </div>
      </section>

      <section class="mb-8">
        <h2 class="text-xl font-semibold text-gray-700 mb-4">Activities</h2>
         <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
          <TagCard
            v-for="tag in activityTags"
            :key="tag.id"
            :tag="tag"
            :is-selected="isSelected(tag)"
            @select="toggleSelection(tag, selectedTags)"
          />
        </div>
      </section>

      <section class="mb-8">
        <label for="note" class="text-xl font-semibold text-gray-700 mb-4 block">Add a note (optional)</label>
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
    </form>
  </div>
</template>

<script setup lang="ts">
// Script 部分无需改动，逻辑完全复用！
import { ref, onMounted, computed } from 'vue';
import { useApi } from '@/composables/useApi';
import type { Tag, MoodEntry } from '@aura/types';
import { toast } from 'vue-sonner';
import TagCard from '@/components/TagCard.vue';

const tagsApi = useApi();
const entryApi = useApi();

const allTags = ref<Tag[]>([]);
const selectedTags = ref<Tag[]>([]);
const note = ref('');

const emotionTags = computed(() => allTags.value.filter((tag) => tag.type === 'EMOTION'));
const activityTags = computed(() => allTags.value.filter((tag) => tag.type === 'ACTIVITY'));

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
  const promise = (): Promise<MoodEntry> =>
    new Promise(async (resolve, reject) => {
      const response = await entryApi.post<MoodEntry>('/mood-entries', {
        note: note.value,
        tagIds: selectedTags.value.map((t) => t.id),
      });

      if (response && response.success) {
        resolve(response.data);
      } else {
        reject(entryApi.error.value || 'Failed to save entry.');
      }
    });

  toast.promise(promise(), {
    loading: 'Saving entry...',
    success: (_data: MoodEntry) => {
      selectedTags.value = [];
      note.value = '';
      return 'Entry saved successfully!';
    },
    error: (error: unknown) => String(error),
  });
};
</script>
