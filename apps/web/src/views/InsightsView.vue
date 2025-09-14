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

        <div class="relative bg-blue-50/50 p-4 rounded-lg min-h-[120px]">
          <Transition name="fade">
            <div
              v-if="summaryApi.loading.value"
              class="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-lg"
            >
              <div class="text-gray-500 animate-pulse">Generating your new summary...</div>
            </div>
          </Transition>

          <div v-if="summaryApi.error.value" class="text-red-600 text-sm flex items-center justify-center h-full">
            Sorry, I couldn't generate a summary right now.
          </div>
          <p v-else-if="summary" class="text-gray-800 leading-relaxed transition-opacity duration-300">
            {{ summary }}
          </p>
          <div v-else class="text-gray-500 flex items-center justify-center h-full">
            Select a period to generate your summary.
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
const summaryApi = useApi(); // Separate instance for the summary card's state
const activeTab = ref<'mine' | 'public'>('mine');
const insightsData = ref<InsightsData | null>(null);

// State for the AI summary feature
const selectedPeriod = ref<SummaryPeriod>('week');
const summary = ref<string>('');
const periods: { label: string; value: SummaryPeriod }[] = [
  { label: 'Last 3 Days', value: '3days' },
  { label: 'Last Week', value: 'week' },
  { label: 'Last 2 Weeks', value: '2weeks' },
  { label: 'Last Month', value: 'month' },
];

// --- Logic ---
const fetchChartData = async () => {
  const endpoint = activeTab.value === 'mine' ? '/insights/mine' : '/insights/public';
  const response = await api.get<InsightsData>(endpoint);
  insightsData.value = response?.success ? response.data : null;
};

const fetchSummary = async () => {
  if (activeTab.value !== 'mine') return;
  const response = await summaryApi.get<SummaryData>(`/insights/mine/summary?period=${selectedPeriod.value}`);
  summary.value = response?.success ? response.data.summary : '';
};

// Watch for changes and fetch data accordingly
watch(activeTab, (newTab) => {
  fetchChartData();
  if (newTab === 'mine') {
    fetchSummary();
  }
}, { immediate: true });

watch(selectedPeriod, fetchSummary);

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
