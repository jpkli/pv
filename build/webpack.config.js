const path = require('path');
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: {
    "pv": "./index.js",
    "pv-demo": './demos/demo.js',
    "pv-test": "./test/main.js"
  },
  mode: "development",
  devtool: "source-map",
  cache: false,
  target: 'web',
  resolve: {
    modules: ['../node_modules', path.resolve(__dirname, '../..')],
    alias: {
      p3$: 'p3.js',
      p4$: 'p4.js'
    } 
  },
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "[name].js"
  },
  module: {
    exprContextCritical: false,
    rules: [
      {
      test: /\.css$/,
      use: ['style-loader', 'css-loader',]
      }
    ]
  },
  devServer: {
    compress: true,
    publicPath: '/dist/',
    clientLogLevel: "none",
    historyApiFallback: true,
  }
};