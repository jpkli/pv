const path = require('path');
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const nodeExternals = require('webpack-node-externals')
const NodemonPlugin = require( 'nodemon-webpack-plugin' )

function resolve (dir) {
    return path.join(__dirname, '..', dir)
}
module.exports = [
    {
        entry: {
            server: './src/server.js',
        },
        mode: "development",
        devtool: "source-map",
        cache: false,
        target: 'node',
        resolve: {
            modules: ['../node_modules', path.resolve(__dirname, '../..')],
            alias: {
                p3$: 'p3.js',
                p4$: 'p4.js'
            } 
        },
        output: {
            path: path.resolve(__dirname, "../dist"),
            publicPath: '/',
            filename: "[name].js"
        },
        node: {
            // Need this when working with express, otherwise the build fails
            __dirname: false,   // if you don't put this is, __dirname
            __filename: false,  // and __filename return blank or /
        },
        externals: [nodeExternals()],
        module: {
            exprContextCritical: false,
            rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                include: [resolve('src')]
            }
            ]
        },
        // devServer: {
        //     compress: true,
        //     publicPath: '/dist/',
        //     clientLogLevel: "none",
        //     historyApiFallback: true,
        // },
        node: {
            setImmediate: false,
            dgram: 'empty',
            fs: 'empty',
            net: 'empty',
            tls: 'empty',
            child_process: 'empty'
        },
        plugins: [
            new NodemonPlugin()
        ],
    },
    {
        entry: {
            "pv": "./index.js",
            "pv-test": "./test/main.js",
            "pv-demo": './demos/demo.js',
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
    }
];