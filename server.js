const Vue = require('vue')
const express = require('express')
const fs = require('fs')
const {createBundleRenderer} = require('vue-server-renderer')
const setupDevServer = require('./build/setup-dev-server')

const server = express()

// 请求前缀，使用express中间件的static处理；express.static 处理的是物理磁盘中的资源文件
server.use('/dist', express.static('./dist'))

const isProd = process.env.NODE_ENV === 'production'

let renderer
let onReady
if (isProd) {
  const serverBundle = require('./dist/vue-ssr-server-bundle.json')
  const clientManifest = require('./dist/vue-ssr-client-manifest.json')
  const {static} = require('express')
  const template = fs.readFileSync('./index.template.html', 'utf-8')
  renderer = createBundleRenderer(serverBundle, {
    template,
    clientManifest
  })
} else {
  // 开发模式 -> 监视打包构建 -> 重新生成 Renderer 渲染器
  // 为什么传server？在开发模式给web服务挂载中间件
  // 每当监视构建打包完成后，回调函数会被执行
  onReady = setupDevServer(server, (serverBundle, template, clientManifest) => {
    renderer = createBundleRenderer(serverBundle, {
      template,
      clientManifest
    })
  })
}

const render = async (req, res) => {
  try {
    const html = await renderer.renderToString({
      title: '拉勾教育',
      meta: `
      <meta name="description" content="拉勾教育" >
    `,
      url: req.url
    })
    res.setHeader('Content-Type', 'text/html; charset=utf8') // 设置编码，防止乱码
    res.end(html)
  } catch (err) {
    return res.status(500).end('Internal Server Error.')
  }
}

// 服务端路由设置为 *，意味着所有的路由（服务端本身的路由【express路由】）都会进入这里
server.get('*', isProd ? render : async (req, res) => {
  // 等待有了 Renderer 渲染器以后，调用 render 进行渲染
  await onReady
  render(req, res)
})

server.listen(3000, () => {
  console.log('server running at port 3000...')
})
