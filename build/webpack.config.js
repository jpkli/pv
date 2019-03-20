const path = require('path');
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
function resolve (dir) {
    return path.join(__dirname, '..', dir)
}
module.exports = {
    entry: {
        "p5": "./index.js",
        "p5-test": "./test/main.js"
    },
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
          {
            test: /\.js$/,
            loader: 'babel-loader',
            include: [resolve('src'), resolve('test'), resolve('node_modules/webpack-dev-server/client')]
          },
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
    },
    node: {
        setImmediate: false,
        dgram: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty'
    }
};