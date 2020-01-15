/* eslint-disable @typescript-eslint/no-var-requires */
const baseConfig = require('./webpack.config');

module.exports = {
  ...baseConfig,
  watch: true,
  devtool: 'inline-source-map',
};