require('dotenv').config();
const webpack = require('webpack');
const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const networkIds = {
  mainnet: 1,
  rinkeby: 4,
  kovan: 42,
};

module.exports = env => {
  // Configuration options
  const environment = process.env.NODE_ENV || 'development';
  const networkName = process.env.NETWORK_NAME || 'rinkeby';
  const networkId = networkIds[networkName];
  const bitskiClientId = process.env.BITSKI_CLIENT_ID || false;
  const bitskiRedirectURL = process.env.BITSKI_REDIRECT_URL || 'http://localhost:3000/public/callback.html';
  const contractAddress = process.env.CONTRACT_ADDRESS || false;
  const sentryDSN = environment == 'production' && process.env.SENTRY_DSN || false;
  const devtool = environment == 'development' ? 'source-map' : false;

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
        'BITSKI_PROVIDER_ID': JSON.stringify(networkName),
        'EXPECTED_NETWORK_NAME': JSON.stringify(networkName),
        'EXPECTED_NETWORK_ID': JSON.stringify(networkId),
        'BITSKI_CLIENT_ID': JSON.stringify(bitskiClientId),
        'BITSKI_REDIRECT_URL': JSON.stringify(bitskiRedirectURL),
        'CONTRACT_ADDRESS': JSON.stringify(contractAddress),
        'SENTRY_DSN': JSON.stringify(sentryDSN),
        'STRIPE_API_KEY': JSON.stringify(process.env.STRIPE_API_KEY || false),
        'APP_WALLET_URL': JSON.stringify(process.env.APP_WALLET_URL || false),
      })
    ]
  }
};
