const Vue = require('vue')
const express = require('express')
const fs = require('fs')

const serverBundle = require('./dist/vue-ssr-server-bundle.json')
const clientManifest = require('./dist/vue-ssr-client-manifest.json')
const { static } = require('express')
const template = fs.readFileSync('./index.template.html', 'utf-8')
const renderer = require('vue-server-renderer').createBundleRenderer(serverBundle, {
  template,
  clientManifest
})

const server = express()

// 请求前缀，使用express中间件的static处理
server.use('/dist', express.static('./dist'))

server.get('/', (req, res) => {

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
})

server.listen(3000, () => {
  console.log('server running at port 3000...')
})
