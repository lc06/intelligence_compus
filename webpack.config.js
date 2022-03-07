const path = require('path');

const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  context: __dirname,
  entry: {
    app: './src/index.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|gif|jpg|jpeg|svg)$/,
        use: ['url-loader']
      },
      {
        test: /\.(xml|kml)$/,
        use: ['xml-loader']
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    }),
    // Copy Cesium Assets, Widgets, and Workers to a static directory
    new CopyWebpackPlugin({
      patterns: [{
          from: 'node_modules/cesium/Build/Cesium/Workers',
          to: 'Workers'
        },
        {
          from: 'node_modules/cesium/Build/Cesium/ThirdParty',
          to: 'ThirdParty'
        },
        {
          from: 'node_modules/cesium/Build/Cesium/Assets',
          to: 'Assets'
        },
        {
          from: 'node_modules/cesium/Build/Cesium/Widgets',
          to: 'Widgets'
        },
        {
          from: 'src/data',
          to: 'data'
        }
      ],
    }),
    new webpack.DefinePlugin({
      // Define relative base path in cesium for loading assets
      CESIUM_BASE_URL: JSON.stringify('')
    })
  ],
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    hot: true,
    port: 4000,
    open: true,
  },
}
