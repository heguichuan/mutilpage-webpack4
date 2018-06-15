'use strict'

const { join, resolve } = require('path')
const webpack = require('webpack')
const glob = require('glob')

const CleanWebpackPlugin = require('clean-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const extractCSS = new ExtractTextPlugin({
  filename: 'assets/css/[name].css',
  allChunks: true
})
const extractLESS = new ExtractTextPlugin({
  filename: 'assets/css/[name].css',
  allChunks: true
})

const entries = {}
const chunks = []
const htmlWebpackPluginArray = []
glob.sync('./src/pages/**/app.js').forEach(path => {
  const chunk = path.split('./src/pages/')[1].split('/app.js')[0]
  entries[chunk] = path
  chunks.push(chunk)

  const filename = chunk + '.html'
  const htmlConf = {
    filename: filename,
    template: path.replace(/.js/g, '.html'),
    inject: 'body',
    favicon: './src/commons/assets/img/logo.png',
    // hash: true,
    chunks: ['commons', chunk]
  }
  htmlWebpackPluginArray.push(new HtmlWebpackPlugin(htmlConf))
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
console.log('entries: ', entries);
const config = {
  entry: entries,
  output: {
    path: resolve(__dirname, '../dist'),
    filename: 'assets/js/[name].[chunkhash].js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.vue'],
    alias: {
      assets: join(__dirname, '../src/assets'),
      components: join(__dirname, '../src/components'),
      src: join(__dirname, '../src')
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            css: ['css-hot-loader'].concat(ExtractTextPlugin.extract({
              use: cssOptions,
              fallback: styleLoaderOptions
            })),
            less: ['css-hot-loader'].concat(ExtractTextPlugin.extract({
              use: lessOptions,
              fallback: styleLoaderOptions
            })),
            postcss: ['css-hot-loader'].concat(ExtractTextPlugin.extract({
              use: cssOptions,
              fallback: styleLoaderOptions
            }))
          }
        }
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['css-hot-loader'].concat(ExtractTextPlugin.extract({
          use: cssOptions,
          fallback: styleLoaderOptions
        }))
      },
      {
        test: /\.less$/,
        use: ['css-hot-loader'].concat(ExtractTextPlugin.extract({
          use: lessOptions,
          fallback: styleLoaderOptions
        }))
      },
      {
        test: /\.html$/,
        use: [{
          loader: 'html-loader',
          options: {
            root: resolve(__dirname, 'src'),
            attrs: ['img:src', 'link:href']
          }
        }]
      },
      {
        test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
        exclude: /favicon\.png$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: 'assets/img/[name].[hash:7].[ext]'
          }
        }]
      }
    ]
  },
  // optimization: {
  //   splitChunks: {
  //     cacheGroups: {
  //       default: {
  //         minChunks: 2,
	// 				priority: -20,
	// 				reuseExistingChunk: true,
	// 			},
	// 			//打包重复出现的代码
	// 			vendor: {
  //         chunks: 'initial',
	// 				minChunks: 2,
	// 				maxInitialRequests: 5, // The default limit is too small to showcase the effect
	// 				minSize: 0, // This is example is too small to create commons chunks
	// 				name: 'vendor'
	// 			},
	// 			//打包第三方类库
	// 			commons: {
  //         name: "commons",
	// 				chunks: "initial",
	// 				minChunks: Infinity
	// 			}
	// 		}
  //   },
  //   runtimeChunk: {
  //     name: 'manifest'
  //   },
  // },
  performance: {
    hints: false
  },
  plugins: [
    new CleanWebpackPlugin(['dist'], {
      root: resolve(__dirname, '../')
    }),
    new webpack.optimize.SplitChunksPlugin({
			cacheGroups: {
				default: {
					minChunks: 2,
					priority: -20,
					reuseExistingChunk: true,
				},
				//打包重复出现的代码
				vendor: {
					chunks: 'initial',
					minChunks: 2,
					maxInitialRequests: 5, // The default limit is too small to showcase the effect
					minSize: 0, // This is example is too small to create commons chunks
					name: 'vendor'
				},
				//打包第三方类库
				commons: {
					name: "commons",
					chunks: "initial",
					minChunks: Infinity
				}
			}
		}),

		new webpack.optimize.RuntimeChunkPlugin({
			name: "manifest"
		}),
    new webpack.HashedModuleIdsPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
    extractLESS,
    extractCSS
  ]
}
config.plugins = [...config.plugins, ...htmlWebpackPluginArray]
module.exports = config
