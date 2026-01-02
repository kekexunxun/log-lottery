import ConfigLayout from '@/layout/ConfigLayout.vue'
import Home from '@/views/home/index.vue'
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  { path: '/', component: Home, meta: { hidden: true } },
  {
    path: '/config',
    component: ConfigLayout,
    children: [
      {
        path: 'person/all',
        component: () => import('@/views/config/person/all.vue'),
        meta: { title: '人员管理' }
      },
      {
        path: 'person/already',
        component: () => import('@/views/config/person/already.vue'),
        meta: { title: '中奖人员列表' }
      },
      {
        path: 'prize',
        component: () => import('@/views/config/prize/config.vue'),
        meta: { title: '奖品管理' }
      },
      {
        path: 'global/image',
        component: () => import('@/views/config/global/image.vue'),
        meta: { title: '图片管理' }
      },
      {
        path: 'global/display',
        component: () => import('@/views/config/global/display.vue'),
        meta: { title: '界面配置' }
      }
    ],
    meta: { title: '配置管理' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
