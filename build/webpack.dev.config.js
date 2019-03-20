const path = require('path');
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const nodeExternals = require('webpack-node-externals')
const NodemonPlugin = require( 'nodemon-webpack-plugin' )

function resolve (dir) {
    return path.join(__dirname, '..', dir)
}

const P5Config = require('./webpack.config')
const ServerConfig = require('./webpack.node.config')

module.exports = [ServerConfig, P5Config];