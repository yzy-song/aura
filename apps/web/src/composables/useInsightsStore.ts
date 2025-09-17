import { ref } from 'vue'

type SummaryPeriod = '3days' | 'week' | '2weeks' | 'month'

const generatedSummaries = ref<Record<SummaryPeriod, string>>({
  '3days': '',
  week: '',
  '2weeks': '',
  month: '',
})

export function useInsightsStore() {
  // 这个函数的作用就是返回对我们共享状态的引用
  return {
    generatedSummaries,
  }
}
