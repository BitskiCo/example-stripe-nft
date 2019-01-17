require('dotenv').config();
const webpack = require('webpack');
const path = require('path');
const BitskiConfig = require('./bitski.config.js');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = env => {
  // Configuration options
  const environment = process.env.NODE_ENV || 'development';
  const currentNetwork = BitskiConfig.environments[environment].network;
  const currentNetId = BitskiConfig.environments[environment].netId;
  const bitskiClientId = process.env.BITSKI_CLIENT_ID;
  const bitskiNetworkId = BitskiConfig.networkIds[currentNetwork];
  const bitskiRedirectURL = BitskiConfig.environments[environment].redirectURL;
  const contractAddress = process.env.CONTRACT_ADDRESS || false;
  const sentryDSN = environment == 'production' && process.env.SENTRY_DSN || false;
  const devtool = environment == 'development' ? 'source-map' : false;

  const tokenURIBaseURL = 'https://example-dapp-1-api.bitski.com/tokens/'; //Change this to your backend. Token id will be appended.

  return {
    devtool: devtool,
    entry: './app/index.js',

    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist')
    },
    module: {
      rules: [{
          test: [/\.vert$/, /\.frag$/],
          use: 'raw-loader'
        }, {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',

          options: {
            presets: ['env']
          }
        }
      ]
    },

    plugins: [
      new HTMLWebpackPlugin({
        title: 'Example Dapp',
        template: './app/index.html',
        hash: true
      }),
      new CopyWebpackPlugin([
        {
          from: 'assets',
          to: 'assets'
        }, {
        from: 'public',
          to: 'public'
        }
      ]),
      new webpack.DefinePlugin({
        'CANVAS_RENDERER': JSON.stringify(true),
        'WEBGL_RENDERER': JSON.stringify(true),
        'BITSKI_PROVIDER_ID': JSON.stringify(bitskiNetworkId),
        'EXPECTED_NETWORK_NAME': JSON.stringify(bitskiNetworkId),
        'EXPECTED_NETWORK_ID': JSON.stringify(currentNetId),
        'BITSKI_CLIENT_ID': JSON.stringify(bitskiClientId),
        'BITSKI_REDIRECT_URL': JSON.stringify(bitskiRedirectURL),
        'TOKEN_URI_BASE_URL': JSON.stringify(tokenURIBaseURL),
        'CONTRACT_ADDRESS': JSON.stringify(contractAddress),
        'SENTRY_DSN': JSON.stringify(sentryDSN),
        'STRIPE_API_KEY': JSON.stringify(process.env.STRIPE_API_KEY || false),
        'APP_WALLET_URL': JSON.stringify(process.env.APP_WALLET_URL || false),
      })
    ]
  }
};
