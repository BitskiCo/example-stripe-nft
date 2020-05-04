require('dotenv').config();
const {
  ProviderManager
} = require('bitski-node');
const HDWalletProvider = require("@truffle/hdwallet-provider");
const mnemonic = process.env['MNEMONIC'];

const id = process.env.BITSKI_APP_WALLET_ID;
const secret = process.env.BITSKI_APP_WALLET_SECRET;

const providerManager = new ProviderManager(id, secret);

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 7545,
      network_id: "*"
    },
    live: {
      network_id: '1',
      provider: () => {
        return providerManager.getProvider('mainnet');
      }
    },
    kovan: {
      network_id: '42',
      provider: () => {
        return providerManager.getProvider('kovan');
      }
    },
    rinkeby: {
      // must be a thunk, otherwise truffle commands may hang in CI
      provider: () =>
        new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/8f17cced7d3449e3a202a462b6547001",
          0, 1, true, "m/44'/1'/0'/0/"
        ),
      network_id: '4',
      skipDryRun: true,
    }
  },
  plugins: [
    'truffle-plugin-verify'
  ],
  api_keys: {
    etherscan: process.env.ETHERSCAN_API_KEY
  }
};