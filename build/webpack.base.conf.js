'use strict'

const { join, resolve} = require('path')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const ExtractTextWebapckPlugin = require('extract-text-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin')
const UglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin")

const {entries, htmlWebpackPluginArray, cacheGroups, styleLoaderOptions, cssOptions, lessOptions} = require('./utils')

let config = {
    entry: entries,
    output: {
        path: resolve(__dirname, '../dist'),
        filename: 'assets/js/[name].[chunkhash:8].js',
        publicPath: '/'
    },
    resolve: {
        extensions: ['.js', '.vue'],
        alias: {
          assets: join(__dirname, '../src/commons/assets'),
          components: join(__dirname, '../src/commons/components'),
          src: join(__dirname, '../src')
        }
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                // options: {
                //     loaders: {
                //         css: [
                //             MiniCssExtractPlugin.loader,
                //             "css-loader",
                //             'postcss-loader'
                //         ],
                //         less: [
                //             MiniCssExtractPlugin.loader,
                //             'css-loader',
                //             'postcss-loader',
                //             'less-loader',
                //         ],
                //         postcss: [
                //             MiniCssExtractPlugin.loader,
                //             "css-loader",
                //             'postcss-loader'
                //         ]
                //     }
                // }
            },
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    'postcss-loader'
                ]
            },
            {
              test: /\.less$/,
              use: [
                MiniCssExtractPlugin.loader,
                'css-loader',
                'postcss-loader',
                'less-loader',
              ]
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
    optimization: {
        runtimeChunk: 'single',
        minimizer: [
            new UglifyjsWebpackPlugin({
                exclude: /\.min\.js$/,
                cache: true,
                parallel: true,
                sourceMap: false,
                extractComments: false,
                uglifyOptions: {
                  compress: {
                    unused: true,
                    warnings: false,
                    drop_debugger: true
                  },
                  output: {
                    comments: false
                  }
                }
            }),
            // new OptimizeCssAssetsPlugin({
            //     assetNameRegExp: /\.css$/g,
            //     cssProcessorOptions: {
            //       safe: true,
            //       autoprefixer: { disable: true },
            //       mergeLonghand: false,
            //       discardComments: {
            //         removeAll: true
            //       }
            //     },
            //     canPrint: true
            // })
        ],
        splitChunks: {
            // cacheGroups: {
            //     default: {
            //         minChunks: 2,
			// 		priority: -20,
			// 		reuseExistingChunk: true,
			// 	},
			// 	//打包重复出现的代码
			// 	vendor: {
            //         chunks: 'initial',
			// 		minChunks: 2,
			// 		maxInitialRequests: 5, // The default limit is too small to showcase the effect
			// 		minSize: 0, // This is example is too small to create commons chunks
			// 		name: 'vendor'
			// 	},
			// 	//打包第三方类库
			// 	commons: {
            //         name: "commons",
			// 		chunks: "initial",
			// 		minChunks: Infinity
			// 	}
            // }
            maxInitialRequests: 4,
            cacheGroups: Object.assign({
                vendor: {
                  test: /[\\/]node_modules[\\/]/,
                  name: 'vendor',
                  minSize: 30000,
                  minChunks: 1,
                  chunks: 'initial',
                  priority: 1
                },
                commons: {
                  test: /[\\/]src[\\/]commons[\\/]/,
                  name: 'commons',
                  minSize: 30000,
                  minChunks: 3,
                  chunks: 'initial',
                  priority: -1,
                  reuseExistingChunk: true
                },
                styles: {
                    name: 'styles',
                    test: /\.css$/,
                    chunks: 'all',
                    enforce: true
                }
              }, cacheGroups)
        }
    },
    plugins: [
        new CleanWebpackPlugin(['dist'], {
            root: resolve(__dirname, '../')
        }),
        new webpack.DefinePlugin({
            'process.env': {
              NODE_ENV: JSON.stringify(process.env.NODE_ENV === 'development' ? 'development' : 'production')
            }
        }),
        new VueLoaderPlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.HashedModuleIdsPlugin(),
        new MiniCssExtractPlugin({
            filename: 'assets/css/[name].[contenthash:8].css',
            chunkFilename: 'assets/css/[name].[contenthash:8].css'
        }),
        // new BundleAnalyzerPlugin(),
        ...htmlWebpackPluginArray,
        new InlineManifestWebpackPlugin(),
    ]
}

module.exports = config