<template>
  <div class="p-4 max-w-lg mx-auto">
    <header class="text-center mb-8 mt-4">
      <h1 class="text-3xl font-bold text-gray-800 tracking-tight">How are you feeling now?</h1>
    </header>

    <div v-if="tagsApi.loading.value" class="space-y-8 animate-pulse">
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
          <button
            type="button"
            @click="openCreateTagModal('EMOTION')"
            class="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors duration-200 aspect-square"
          >
            <span class="material-symbols-outlined text-4xl">add</span>
            <span class="text-sm font-semibold">Custom</span>
          </button>
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
          <button
            type="button"
            @click="openCreateTagModal('ACTIVITY')"
            class="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors duration-200 aspect-square"
          >
            <span class="material-symbols-outlined text-4xl">add</span>
            <span class="text-sm font-semibold">Custom</span>
          </button>
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

  <Transition name="modal-fade">
    <div v-if="isCreateTagModalOpen" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <h3 class="text-xl font-bold text-gray-800">Create a custom tag</h3>

        <div>
          <label for="new-tag-name" class="block text-sm font-medium text-gray-600 mb-1">Tag Name</label>
          <input
            type="text"
            id="new-tag-name"
            v-model="newTagName"
            placeholder="e.g., Meditating"
            class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-600 mb-2">Choose an Emoji</label>
          <div class="max-h-32 overflow-y-auto bg-gray-50 p-2 rounded-lg grid grid-cols-7 gap-2">
            <button
              v-for="emoji in emojiList"
              :key="emoji"
              @click="newTagEmoji = emoji"
              :class="[
                'p-1 text-2xl rounded-md transition-all duration-150',
                newTagEmoji === emoji ? 'bg-blue-200 ring-2 ring-blue-500' : 'hover:bg-gray-200'
              ]"
            >
              {{ emoji }}
            </button>
          </div>
        </div>

        <div class="flex gap-4 justify-end pt-2">
          <button @click="isCreateTagModalOpen = false" class="px-4 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200">
            Cancel
          </button>
          <button
            @click="handleCreateCustomTag"
            :disabled="tagCreationApi.loading.value || !newTagName.trim()"
            class="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {{ tagCreationApi.loading.value ? 'Creating...' : 'Create' }}
          </button>
        </div>
        <p v-if="tagCreationApi.error.value" class="text-sm text-red-500 text-right">{{ tagCreationApi.error.value }}</p>
      </div>
    </div>
  </Transition>
</template>

<style>
/* ... tag-list transition styles (不变) ... */

/* 👇 添加模态框的过渡动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useApi } from '@/composables/useApi';
import type { Tag, TagType,MoodEntry  } from '@aura/types';
import { toast } from 'vue-sonner';
import TagCard from '@/components/TagCard.vue';

// 👇 --- 1. 定义我们精选的 Emoji 列表 --- 👇
const emojiList = [
  '😀', '😂', '😍', '🤔', '😢', '😠', '🤯', '😴', '🥳', '😎', '🙏', '💪',
  '🧘', '🏃', '🎉', '✈️', '💼', '📚', '💻', '🍔', '🍕', '☕️', '❤️', '💔',
  '☀️', '🌙', '⭐️', '🔥', '💧', '🌱', '💡', '💰', '🎵', '🎨', '🎮', '🏆'
];

// --- API Hooks ---
const tagsApi = useApi();
const entryApi = useApi();
const tagCreationApi = useApi(); // 为创建标签创建一个独立的 API 实例

// --- Component State ---
const allTags = ref<Tag[]>([]);
const selectedTags = ref<Tag[]>([]);
const note = ref('');

// --- Modal State ---
const isCreateTagModalOpen = ref(false);
const newTagName = ref('');
const newTagType = ref<TagType>('ACTIVITY');
const newTagEmoji = ref('💡'); // 👇 2. 新增状态，并给一个默认值

// --- Computed Properties ---
const emotionTags = computed(() => allTags.value.filter((tag) => tag.type === 'EMOTION'));
const activityTags = computed(() => allTags.value.filter((tag) => tag.type === 'ACTIVITY'));

// --- Logic ---
onMounted(async () => {
  const response = await tagsApi.get<Tag[]>('/tags');
  if (response && response.success) {
    allTags.value = response.data;
  }
});

const openCreateTagModal = (type: TagType) => {
  newTagType.value = type;
  newTagName.value = '';
  newTagEmoji.value = type === 'EMOTION' ? '😀' : '💡'; // 根据类型给一个更合适的默认 Emoji
  tagCreationApi.error.value = null;
  isCreateTagModalOpen.value = true;
};

const handleCreateCustomTag = async () => {
  if (!newTagName.value.trim()) return;

  // 👇 --- 3. 在 API 调用中加入 emoji 字段 --- 👇
  const response = await tagCreationApi.post<Tag>('/tags', {
    name: newTagName.value,
    type: newTagType.value,
    emoji: newTagEmoji.value,
  });

  if (response && response.success) {
    const newTag = response.data;
    // 1. 将新标签添加到总列表中
    allTags.value.push(newTag);
    // 2. 自动选中这个新标签
    toggleSelection(newTag, selectedTags.value);
    // 3. 关闭模态框
    isCreateTagModalOpen.value = false;
    toast.success(`Tag "${newTag.name}" created!`);
  }
  // 错误信息会由 tagCreationApi.error 自动捕获并显示
};

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
  // ... (这个函数保持不变)
};
</script>
