'use strict'

const glob = require('glob')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const entries = {}
const htmlWebpackPluginArray = []
const cacheGroups = {}

glob.sync('./src/pages/**/app.js').forEach(path => {
    const chunk = path.split('./src/pages/')[1].split('/app.js')[0]
    entries[chunk] = path
    // chunks.push(chunk)
  
    const filename = chunk + '.html'
    const htmlConf = {
      filename: filename,
      template: path.replace(/.js/g, '.html'),
      inject: 'body',
      favicon: './src/commons/assets/img/logo.png',
      // hash: true,
      chunks: ['vendor', 'commons', chunk + '-static', chunk]
    }
    htmlWebpackPluginArray.push(new HtmlWebpackPlugin(htmlConf))

    cacheGroups[chunk.replace('/', '-') + '-static'] = {
        test: new RegExp(('/src/pages/' + chunk + '/static/').replace(/\//g, '[\\\\/]')),
        name: chunk + '-static',
        minSize: 30000,
        minChunks: 1,
        chunks: 'initial',
        priority: -2,
        reuseExistingChunk: true
    }
})

const styleLoaderOptions = {
    loader: 'style-loader',
    options: {
      sourceMap: true
    }
}
const cssOptions = [
    { loader: 'css-loader', options: { sourceMap: true } },
    { loader: 'postcss-loader', options: { sourceMap: true } }
]
const lessOptions = [...cssOptions, {
    loader: 'less-loader',
    options: {
        sourceMap: true
    }
}]

module.exports = {
    entries,
    htmlWebpackPluginArray,
    cacheGroups,
    styleLoaderOptions,
    cssOptions,
    lessOptions
}