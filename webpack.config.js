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
    extensions: ['.js', '.jsx'],
    modules: [
      path.resolve('./src'),
      path.resolve('./node_modules')
    ]
  },

  module: {
    rules: [{
      enforce: 'pre',
      test: /\.js$/, // include .js files
      include: SRC_DIR, // exclude any and all files in the node_modules folder
      exclude: /vendor\/.*/,
      loader: "eslint-loader"
    },
      // json
      {
        test: /\.json$/,
        loader: "json-loader",
        include: SRC_DIR
      },

      // transpile JS
      {
        test: /\.jsx?$/,
        loaders: ['babel-loader?cacheDirectory'],
        include: SRC_DIR
      },

      // sass files
      {
        test: /\.css$/,
        loaders: [
          "style-loader",
          "css-loader"
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

  devtool: isProd ? false : 'cheap-source-map',

  plugins: [
    new webpack.EnvironmentPlugin({'NODE_ENV': 'development'}),
    new webpack.ProvidePlugin({
      React: 'react'
    })
  ]
};

module.exports = config;
