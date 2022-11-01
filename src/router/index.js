import { createRouter, createWebHistory } from '@ionic/vue-router';
import HomePage from '../views/home-page.vue'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    component: HomePage,
  },
  {
    path:'/tools/scanning',
    component: () => import('@/views/qr-scanner.vue'),
  }
    // children: [
    //   {
    //     path: '',
    //     redirect: '/tabs/tab1'
    //   },
    //   {
    //     path: 'tab1',
    //     component: () => import('@/views/Tab1Page.vue')
    //   },
    //   {
    //     path: 'tab2',
    //     component: () => import('@/views/Tab2Page.vue')
    //   },
    //   {
    //     path: 'tab3',
    //     component: () => import('@/views/Tab3Page.vue')
    //   }
    // ]
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
