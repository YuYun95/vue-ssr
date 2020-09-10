/**
 * 服务端启动入口
 */

import { createApp } from './app'

// context参数是有server.js中的renderToString方法传递的第一个参数
export default async context => {
  // 因为有可能会是异步路由钩子函数或组件，所以我们将返回一个 Promise，
  // 以便服务器能够等待所有的内容在渲染前，
  // 就已经准备就绪。（如，异步路由）
  const { app, router } = createApp()

  const meta = app.$meta() // 一定要在路由导航之前

  // 设置服务器端 router 的位置
  router.push(context.url) // 拿到客户端请求路径，设置路由

  context.meta = meta // 路由导航之后

  // 等到 router 将可能的异步组件和钩子函数解析完
  // new Promise((resolve, reject) => {
  //   router.onReady(resolve,reject)
  // })
  await new Promise(router.onReady.bind(router)) // onReady内部有this指向的问题

  return app
}
