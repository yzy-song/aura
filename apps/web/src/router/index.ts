// apps/web/src/router/index.ts

import { createRouter, createWebHistory } from 'vue-router'
import RecordView from '../views/RecordView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'record',
      component: RecordView,
    },
    {
      path: '/history',
      name: 'history',
      // 懒加载：只有当用户访问这个页面时，才会加载对应的代码
      component: () => import('../views/HistoryView.vue'),
    },
    {
      path: '/insights',
      name: 'insights',
      component: () => import('../views/InsightsView.vue'),
    },
    {
      path: '/insights',
      name: 'insights',
      component: () => import('../views/InsightsView.vue'),
    },
  ],
})

export default router
