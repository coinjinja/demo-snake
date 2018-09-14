const config = require('./webpack.config.base')

module.exports = {
  ...config,
  devServer: {
    contentBase: './www',
    host: '0.0.0.0',
    port: 8080,
    disableHostCheck: true,
  },
  watch: true,
  watchOptions: {
    aggregateTimeout: 100,
    poll: 1000,
  },
  devtool: 'inline-source-map ',
};
