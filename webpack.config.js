/* eslint node: true */

const path = require('path');
const _ = require('lodash');
const webpack = require('webpack');

const SRC_DIR = path.resolve(__dirname, 'src');
const DIST_DIR = path.join(__dirname, 'dist');

const isProd = process.env.NODE_ENV == 'production';

const config = {
  entry: [
    './src/client'
  ],

  output: {
    path: DIST_DIR,
    filename: isProd ? 'bundle.[hash].js' : 'bundle.js',
    publicPath: 'static/js/dist'
  },

  resolve: {
    root: [
      path.resolve('./src'),
      path.resolve('./node_modules')
    ]
  },

  module: {
    preLoaders: [{
      test: /\.js$/, // include .js files
      include: SRC_DIR, // exclude any and all files in the node_modules folder
      exclude: /vendor\/.*/,
      loader: "eslint-loader"
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
        loaders: ['babel?cacheDirectory', 'react-hot'],
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

  plugins: [
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true')),
      __PRERELEASE__: JSON.stringify(JSON.parse(process.env.BUILD_PRERELEASE || 'false')),
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      }
    }),

    new webpack.ProvidePlugin({
      React: 'react'
    })
  ].concat(isProd ? [
    new webpack.optimize.UglifyJsPlugin({ minimize: true, sourceMap: false }) 
  ] : [])
};

module.exports = config;
