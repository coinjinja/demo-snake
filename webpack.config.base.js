const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: ['babel-polyfill', './src/game.js'],
  output: {
    path: path.resolve(__dirname, './www'),
    filename: 'game.js',
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
    }),
    new webpack.ProvidePlugin({
      FastClick: 'fastclick',
    }),
  ],
  resolve: {
    alias: {
      // bind version of jquery-ui
      'jquery-ui': 'jquery-ui-dist/jquery-ui.js',
      modules: path.join(__dirname, 'node_modules'),
    },
  },
};

