<template>
  <Pie :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale)

defineProps<{
  chartData: {
    labels: string[],
    datasets: import('chart.js').ChartDataset<'pie', number[]>[]
  },
  chartOptions?: import('chart.js').ChartOptions<'pie'>
}>()
</script>
