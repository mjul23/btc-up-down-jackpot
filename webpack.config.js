const webpack = require('webpack');

module.exports = {
  // ... autres configurations
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser'
    })
  ]
};
