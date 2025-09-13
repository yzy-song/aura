<template>
  <Line :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale)

defineProps<{
  chartData: {
    labels: string[],
    datasets: import('chart.js').ChartDataset<'line'>[]
  },
  chartOptions?: import('chart.js').ChartOptions<'line'>
}>()
</script>
