import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/pages/Home'

Vue.use(VueRouter)

export const createRouter = () => {
  const router = new VueRouter({
    mode: 'history', // 同构不能使用hash，history兼容前后端
    routes: [
      {
        path: '/',
        name: 'home',
        component: Home
      },
      {
        path: '/about',
        name: 'about',
        component: () => import('@/pages/About')
      },
      {
        path: '*',
        name: 'error404',
        component: () => import('@/pages/404')
      }
    ]
  })
  return router
}
