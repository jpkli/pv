const path = require('path');
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
function resolve (dir) {
    return path.join(__dirname, '..', dir)
}
module.exports = {
    entry: {
        "p5-test": "./test/main.js"
    },
    devtool: "source-map",
    target: 'web',
    resolve: {
        modules: [path.resolve(__dirname, '../..'), '../node_modules'],
        alias: {
            'p.3$': 'p3',
            'p.4$': 'p4'
        }
    },
    output: {
        path: path.resolve(__dirname, "../test"),
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
        publicPath: '/test/',
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