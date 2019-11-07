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
        modules: ['../node_modules', path.resolve(__dirname, '../..')]
    },
    output: {
        path: path.resolve(__dirname, "../dist"),
        filename: "[name].js"
    },
    module: {
        exprContextCritical: false,
        rules: [
        //   {
        //     test: /\.js$/,
        //     loader: 'babel-loader',
        //     include: [resolve('src'), resolve('test'), resolve('node_modules/webpack-dev-server/client')]
        //   },
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