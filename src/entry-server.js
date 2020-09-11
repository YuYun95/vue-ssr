/**
 * 服务端启动入口
 */

import { createApp } from './app'

// context参数是有server.js中的renderToString方法传递的第一个参数
export default async context => {
  // 因为有可能会是异步路由钩子函数或组件，所以我们将返回一个 Promise，
  // 以便服务器能够等待所有的内容在渲染前，
  // 就已经准备就绪。（如，异步路由）
  const { app, router, store } = createApp()

  const meta = app.$meta() // 一定要在路由导航之前

  // 设置服务器端 router 的位置
  router.push(context.url) // 拿到客户端请求路径，设置路由

  context.meta = meta // 路由导航之后

  // 等到 router 将可能的异步组件和钩子函数解析完
  // new Promise((resolve, reject) => {
  //   router.onReady(resolve,reject)
  // })
  await new Promise(router.onReady.bind(router)) // onReady内部有this指向的问题

  // 服务端渲染完毕以后调用，也就可以拿到容器状态数据
  context.rendered = () => {
    // Renderer 会把 context.state 数据对象内联到页面模板中
    // 最终发送给客户端的页面中会包含一段脚本：window.__INITIAL_STATE__ = context.state
    // 客户端就要把页面中的 window.INITIAL_STATE__拿出来填充到客户端 store 容器中
    context.state = store.state
  }

  return app
}
