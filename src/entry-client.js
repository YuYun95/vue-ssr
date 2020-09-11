/**
 * 客户端入口
 */

import { createApp } from './app'

const { app, router, store } = createApp()

if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__) // 替换容器状态(把服务端发送过来的容器状态，同步到客户端容器状态)
}

router.onReady(() => {
  app.$mount('#app')
})

