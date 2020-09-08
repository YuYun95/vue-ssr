const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const webpack = require('webpack')
const devMiddleware = require('webpack-dev-middleware')
const hotMiddleware = require('webpack-hot-middleware')

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

  // 自动的执行打包构建，也是以监视的方式，这样就不用我们watch
  const serverDevMiddleware = devMiddleware(serverCompiler, {
    logLevel: 'silent' // 关闭日志输出，由 FriendlyErrorsWebpackPlugin 处理
  })

  // 每当构建结束触发，'server'是一个自定义标识，可以随便起
  serverCompiler.hooks.done.tap('server', () => {
    // serverDevMiddleware.fileSystem 到devMiddleware内部的操作文件系统的对象
    serverBundle = JSON.parse(serverDevMiddleware.fileSystem.readFileSync(resolve('../dist/vue-ssr-server-bundle.json'), 'utf-8')) // 不用require，有缓存
    update()
  })
  // serverCompiler.watch({}, (err, stats) => {
  //   if (err) throw err // 错误指webpack本身的错误
  //   // 自己源代码是否有错
  //   if (stats.hasErrors()) return
  //
  //   // 读取最新构建的server-bundle.json文件 更新 创建renderer渲染器
  //   serverBundle = JSON.parse(fs.readFileSync(resolve('../dist/vue-ssr-server-bundle.json'), 'utf-8')) // 不用require，有缓存
  //   update()
  // })

  // 监视构建 clientManifest -> 调用 update -> 更新 Renderer 渲染器
  const clientConfig = require('./webpack.client.config')
  clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
  clientConfig.entry.app = [
    'webpack-hot-middleware/client?quiet=true&reload=true', // 和服务端交互处理热更新一个客户端脚本
    clientConfig.entry.app
  ]
  clientConfig.output.filename = '[name].js' // 热更新模式下确保一致的hash
  const clientCompiler = webpack(clientConfig)

  // 自动的执行打包构建，也是以监视的方式，这样就不用我们watch
  const clientDevMiddleware = devMiddleware(clientCompiler, {
    publicPath: clientConfig.output.publicPath,
    logLevel: 'silent' // 关闭日志输出，由 FriendlyErrorsWebpackPlugin 处理
  })

  // 每当构建结束触发，'client'是一个自定义标识，可以随便起
  clientCompiler.hooks.done.tap('client', () => {
    // clientDevMiddleware.fileSystem 到devMiddleware内部的操作文件系统的对象
    clientManifest = JSON.parse(clientDevMiddleware.fileSystem.readFileSync(resolve('../dist/vue-ssr-client-manifest.json'), 'utf-8')) // 不用require，有缓存
    update()
  })

  server.use(hotMiddleware(clientCompiler, {
    log: false // 关闭它本身的日志输出
  }))

  // 重要！！！将clientDevMiddleware挂载到express服务中，提供对其内存中数据的访问
  server.use(clientDevMiddleware)

  return onReady
}
