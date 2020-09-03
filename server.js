const Vue = require('vue')
const express = require('express')
const fs = require('fs')

const server = express()

// 请求前缀，使用express中间件的static处理
server.use('/dist', express.static('./dist'))

const isProd = process.env.NODE_ENV === 'production'

let renderer
if (isProd) {
  const serverBundle = require('./dist/vue-ssr-server-bundle.json')
  const clientManifest = require('./dist/vue-ssr-client-manifest.json')
  const { static } = require('express')
  const template = fs.readFileSync('./index.template.html', 'utf-8')
  renderer = require('vue-server-renderer').createBundleRenderer(serverBundle, {
    template,
    clientManifest
  })
} else {
  // 开发模式 -> 监视打包构建 -> 重新生成 Renderer 渲染器
  // 为什么传server？在开发模式给web服务挂载中间件
  // 每当监视构建打包完成后，回调函数会被执行
  setupDevServer(server, () => {})
}

const render = (req, res) => {
  renderer.renderToString({
    title: '拉勾教育',
    meta: `
      <meta name="description" content="拉勾教育" >
    `
  }, (err, html) => {
    if (err) {
      return res.status(500).end('Internal Server Error.')
    }
    res.setHeader('Content-Type', 'text/html; charset=utf8') // 设置编码，防止乱码
    res.end(html)
  })
}

server.get('/', isProd ? renderer : (req, res) => {
  // TODO: 等待有了 Renderer 渲染器以后，调用 render 进行渲染
  render()
})

server.listen(3000, () => {
  console.log('server running at port 3000...')
})
