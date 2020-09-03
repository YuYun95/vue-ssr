const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const webpack = require('webpack')

const resolve = file => path.resolve(__dirname, file)

module.exports = (server, callback) => {
  let ready
  const onReady = new Promise(r => ready = r)

  // 监视构建 -> 更新 Renderer
  let template
  let serverBundle
  let clientManifest

  const update = () => {
    if (template && serverBundle && clientManifest) {
      ready()
      callback(serverBundle, template, clientManifest)
    }
  }

  // 监视构建 template -> 调用 update -> 更新 Renderer 渲染器
  const templatePath = path.resolve(__dirname, '../index.template.html')
  template = fs.readFileSync(templatePath, 'utf-8')
  update()
  // 原生监视方法 fs.watch、fs.watchFile
  // 第三方监视库 chokidar

  // 监视模板文件变化，文件发生变化重新读取
  chokidar.watch(templatePath).on('change', () => {
    template = fs.readFileSync(templatePath, 'utf-8')
    update()
  })

  // 监视构建 serverBundle -> 调用 update -> 更新 Renderer 渲染器
  const serverConfig = require('./webpack.server.config')
  const serverCompiler = webpack(serverConfig)
  serverCompiler.watch({}, (err, stats) => {
    if (err) throw err // 错误指webpack本身的错误
    // 自己源代码是否有错
    if (stats.hasErrors()) return

    // 读取最新构建的server-bundle.json文件 更新 创建renderer渲染器
    serverBundle = JSON.parse(fs.readFileSync(resolve('../dist/vue-ssr-server-bundle.json'), 'utf-8')) // 不用require，有缓存
    update()
  })

  // 监视构建 clientManifest -> 调用 update -> 更新 Renderer 渲染器
  return onReady
}
