<template>
  <div class="max-w-lg mx-auto px-4 py-6 font-sans">
    <header class="text-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Insights</h1>
      <p class="text-gray-500 mt-2">Discover your emotional patterns</p>
    </header>

    <div class="flex justify-center mb-8">
      <div class="relative flex p-1 bg-gray-200 rounded-full">
        <button @click="activeTab = 'mine'" :class="tabClass('mine')">My Insights</button>
        <button @click="activeTab = 'public'" :class="tabClass('public')">Community</button>
      </div>
    </div>

    <div v-if="api.loading.value" class="text-center py-10">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-4 text-gray-500">Analyzing data...</p>
    </div>
    <div v-if="api.error.value" class="text-center text-red-600 p-4 bg-red-50 border border-red-200 rounded-lg">
      Failed to load insights: {{ api.error.value }}
    </div>

    <div v-if="insightsData && !api.loading.value" class="space-y-8">
      <section
        v-if="activeTab === 'mine'"
        class="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
      >
        <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-4">
          <span class="material-symbols-outlined text-yellow-500">auto_awesome</span>
          <span>Your AI-Powered Reflection</span>
        </h2>

        <div class="flex flex-wrap gap-2 mb-4">
          <button
            v-for="p in periods"
            :key="p.value"
            @click="selectedPeriod = p.value"
            :class="[
              'px-3 py-1 text-xs font-semibold rounded-full transition-colors',
              selectedPeriod === p.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            ]"
          >
            {{ p.label }}
          </button>
        </div>

        <div class="relative bg-blue-50/50 p-4 rounded-lg min-h-[120px] overflow-hidden">
          <!-- 有总结时显示总结 -->
          <p v-if="currentSummary" class="text-gray-800 leading-relaxed">
            {{ currentSummary }}
          </p>

          <!-- 无总结时的交互区域 -->
          <div v-else class="absolute inset-0">
            <!-- 默认提示文字（仅在非加载、非错误状态时显示） -->
            <div v-if="!summaryApi.loading.value && !summaryApi.error.value" class="w-full h-full text-gray-500 flex items-center justify-center blur-sm scale-110">
              Keep recording your moments to unlock personalized insights. I'm here to listen whenever you're ready.
            </div>

            <!-- 加载状态 -->
            <div v-if="summaryApi.loading.value" class="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg">
              <div class="text-gray-500 animate-pulse">Generating your new summary...</div>
            </div>

            <!-- 错误状态 -->
            <div v-else-if="summaryApi.error.value" class="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg text-center">
               <p class="text-red-600 text-sm">Sorry, I couldn't generate a summary right now.</p>
            </div>

            <!-- 生成按钮（仅在非加载、非错误状态时显示） -->
            <div v-else-if="!summaryApi.loading.value && !summaryApi.error.value" class="absolute inset-0 flex items-center justify-center">
              <button @click="handleGenerateClick" class="bg-blue-600 text-white font-semibold px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-all">
                ✨ Generate Reflection
              </button>
            </div>
          </div>
        </div>
        </section>

      <section class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-4">
          <span class="material-symbols-outlined text-blue-500">pie_chart</span>
          <span>Emotion Distribution</span>
        </h2>
        <PieChart v-if="emotionChartData.labels.length" :chart-data="emotionChartData" />
        <p v-else class="text-gray-500 text-center py-4">Not enough data to display.</p>
      </section>

      <section class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-4">
          <span class="material-symbols-outlined text-purple-500">pie_chart</span>
          <span>Activity Distribution</span>
        </h2>
        <PieChart v-if="activityChartData.labels.length" :chart-data="activityChartData" />
        <p v-else class="text-gray-500 text-center py-4">Not enough data to display.</p>
      </section>

      <section v-if="activeTab === 'public' && insightsData.trend" class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-4">
          <span class="material-symbols-outlined text-green-500">show_chart</span>
          <span>Community Mood Trend (Last 7 Days)</span>
        </h2>
        <LineChart v-if="trendChartData.labels.length" :chart-data="trendChartData" />
        <p v-else class="text-gray-500 text-center py-4">Not enough data to display.</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useApi } from '@/composables/useApi';
import { useInsightsStore } from '@/composables/useInsightsStore';

import PieChart from '@/components/PieChart.vue';
import LineChart from '@/components/LineChart.vue';
import { format } from 'date-fns';

// --- Types ---
type SummaryPeriod = '3days' | 'week' | '2weeks' | 'month';
interface TagCount { name: string; count: number; }
interface TrendData { date: string; count: number; }
interface InsightsData {
  emotionCounts: TagCount[];
  activityCounts: TagCount[];
  trend?: TrendData[];
}
interface SummaryData {
  summary: string;
}

// --- Component State & API ---
const api = useApi();
const summaryApi = useApi();
const activeTab = ref<'mine' | 'public'>('mine');
const insightsData = ref<InsightsData | null>(null);

// State for the AI summary feature
const selectedPeriod = ref<SummaryPeriod>('week');
// --- MODIFICATION: Store generated summaries in a Record (Object) ---
const { generatedSummaries } = useInsightsStore();


const periods: { label: string; value: SummaryPeriod }[] = [
  { label: 'Last 3 Days', value: '3days' },
  { label: 'Last Week', value: 'week' },
  { label: 'Last 2 Weeks', value: '2weeks' },
  { label: 'Last Month', value: 'month' },
];

// --- Computed property to get the current summary ---
const currentSummary = computed(() => generatedSummaries.value[selectedPeriod.value]);

// --- Logic ---
const fetchChartData = async () => {
  const endpoint = activeTab.value === 'mine' ? '/insights/mine' : '/insights/public';
  const response = await api.get<InsightsData>(endpoint);
  insightsData.value = response?.success ? response.data : null;
};

const fetchSummary = async () => {
  if (activeTab.value !== 'mine') return;

  // Don't fetch if it's already loading
  if (summaryApi.loading.value) return;

  const response = await summaryApi.get<SummaryData>(`/insights/mine/summary?period=${selectedPeriod.value}`);

  // --- MODIFICATION: Store the result in our new state object ---
  if (response?.success) {
    generatedSummaries.value[selectedPeriod.value] = response.data.summary;
  }
};

// --- New function to handle the button click ---
const handleGenerateClick = () => {
  fetchSummary();
};

// Watch for changes and fetch data accordingly
watch(activeTab, () => {
  fetchChartData();
  // Clear summary when switching tabs
  generatedSummaries.value = {
    '3days': '',
    week: '',
    '2weeks': '',
    month: '',
  };
}, { immediate: true });

// Clear summary when mood data changes (allow regeneration)
watch(insightsData, () => {
  generatedSummaries.value = {
    '3days': '',
    week: '',
    '2weeks': '',
    month: '',
  };
}, { deep: true });

// --- MODIFICATION: Remove the watcher that automatically fetches the summary ---
// watch(selectedPeriod, fetchSummary); // <-- REMOVED

// --- Computed properties for charts (no changes) ---
const emotionChartData = computed(() => {
  const labels = insightsData.value?.emotionCounts.map(item => item.name) || [];
  const data = insightsData.value?.emotionCounts.map(item => item.count) || [];
  return {
    labels,
    datasets: [{
      backgroundColor: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'],
      data,
    }],
  };
});

const activityChartData = computed(() => {
  const labels = insightsData.value?.activityCounts.map(item => item.name) || [];
  const data = insightsData.value?.activityCounts.map(item => item.count) || [];
  return {
    labels,
    datasets: [{
      backgroundColor: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE'],
      data,
    }],
  };
});

const trendChartData = computed(() => {
  const trend = insightsData.value?.trend || [];
  const labels = trend.map(item => format(new Date(item.date), 'MMM d'));
  const data = trend.map(item => item.count);
  return {
    labels,
    datasets: [{
      label: 'Moments per day',
      backgroundColor: '#22C55E20',
      borderColor: '#16A34A',
      data,
      fill: true,
      tension: 0.3,
    }],
  };
});

const tabClass = (tabName: 'mine' | 'public') => {
  return [
    'px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 focus:outline-none',
    activeTab.value === tabName ? 'bg-white text-blue-600 shadow' : 'text-gray-600'
  ];
};
</script>
