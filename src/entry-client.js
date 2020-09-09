/**
 * 客户端入口
 */

import { createApp } from './app'

// 客户端特定引导逻辑……

const { app, router } = createApp()

router.onReady(() => {
  app.$mount('#app')
})

