/**
 * 通用启动入口
 */

import Vue from 'vue'
import App from './App.vue'
import {createRouter} from './router/index'

// 导出一个工厂函数，用于创建新的，否则每个用户访问相同的路由
// 应用程序、router 和 store 实例
export function createApp() {
  const router = createRouter()
  const app = new Vue({
    router, // 把路由挂载到 vue 根实例中
    // 根实例简单的渲染应用程序组件。
    render: h => h(App)
  })
  return {app, router}
}
