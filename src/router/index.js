import { createRouter, createWebHistory } from '@ionic/vue-router';
import HomePage from '../views/home-page.vue'
import SettingPage from '../views/settings-page.vue';
import CompletePage from '../views/complete-page.vue';
import CheckPage from '../views/check-page.vue';
import InventarPage from '../views/inventar-page.vue';

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
    path:'/tools/check/scanning',
    component: () => import('@/views/qr-scanner-check.vue'),
  },
  {
    path:'/settings',
    component: SettingPage,
  },
  {
    path:'/complet',
    component: CompletePage,
  },
  {
    path:'/check',
    component: CheckPage,
  },
  {
    path:'/inventar',
    component: InventarPage,
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