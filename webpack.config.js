/* jshint node: true */

var path = require('path');
var _ = require('lodash');
var webpack = require('webpack');

var node_modules = path.join(__dirname, "../../../../node_modules");

var SRC_DIR = path.resolve(__dirname, 'src');
var DIST_DIR = path.join(__dirname, 'dist');

var isProd = true;

const config = {
  entry: [
    './src/client'
  ],

  output: {
    path: DIST_DIR,
    filename: 'bundle.js',
    publicPath: 'static/js/dist'
  },

  resolveLoader: { root: node_modules },

  resolve: {
    alias: {
      shared: path.resolve(SRC_DIR, 'shared')
    }
  },

  module: {
    preLoaders: [{
      test: /\.js$/, // include .js files
      include: SRC_DIR, // exclude any and all files in the node_modules folder
      exclude: /vendor\/.*/,
      loader: "jsxhint-loader"
    }],

    loaders: [
      // json
      {
        test: /\.json$/,
        loader: "json-loader",
        include: SRC_DIR
      },

      // transpile JS
      {
        test: /\.jsx?$/,
        loader: 'babel?cacheDirectory',
        include: SRC_DIR
      },

      {
        test: /\.jsx?$/,
        loaders: ['react-hot'],
        include: SRC_DIR
      },

      // sass files
      {
          test: /\.s?css$/,
          loaders: [
            "style",
            "css"
          ]
      },

      // images, fonts
      {
        test: /\.(jpg|ttf|svg|eot|woff|woff2|png)(\?.*)?$/,
        loader: "file-loader"
      }
    ],

    noParse: [
      path.join(__dirname, "libs")
    ]
  },

  node: {
    fs: "empty"
  },

  devtool: isProd ? null : 'cheap-source-map',
  devServer: {
    proxy: {
      '*': 'http://127.0.0.1:' + (process.env.PORT || 3000)
    },
    host: '127.0.0.1'
  },
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true')),
      __PRERELEASE__: JSON.stringify(JSON.parse(process.env.BUILD_PRERELEASE || 'false'))
    })
  ]
};

console.log(config);

module.exports = config;