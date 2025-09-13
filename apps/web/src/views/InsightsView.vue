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
interface TagCount {
  name: string;
  count: number;
}
interface TrendData {
  date: string;
  count: number;
}
interface InsightsData {
  emotionCounts: TagCount[];
  activityCounts: TagCount[];
  trend?: TrendData[];
}

// --- Component State & API ---
const api = useApi();
const activeTab = ref<'mine' | 'public'>('mine');
const insightsData = ref<InsightsData | null>(null);

// --- Logic ---
const fetchData = async () => {
  const endpoint = activeTab.value === 'mine' ? '/insights/mine' : '/insights/public';
  const response = await api.get<InsightsData>(endpoint);
  if (response && response.success) {
    insightsData.value = response.data;
  } else {
    insightsData.value = null;
  }
};

// Watch for tab changes and fetch data accordingly
watch(activeTab, fetchData, { immediate: true });

// --- Computed properties to format data for charts ---
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
      label: 'Entries per day',
      backgroundColor: '#22C55E',
      borderColor: '#16A34A',
      data,
      fill: true,
      tension: 0.3,
    }],
  };
});


// --- Helper for styling the active tab ---
const tabClass = (tabName: 'mine' | 'public') => {
  return [
    'px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 focus:outline-none',
    activeTab.value === tabName
      ? 'bg-white text-blue-600 shadow'
      // The following is a Tailwind JIT trick to ensure the class is generated
      // bg-white text-blue-600 shadow text-gray-600
      : 'text-gray-600'
  ];
};
</script>
