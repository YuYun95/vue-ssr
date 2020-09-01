/**
 * 通用启动入口
 */

import Vue from 'vue'
import App from './App'

// 导出一个工厂函数，用于创建新的应用程序、router、store实例
// 各个用户之间互不影响
export function createApp() {
  const app = new Vue({
    // 根实例简单的渲染应用程序组件
    render: h => h(App)
  })
  return {app}
}
