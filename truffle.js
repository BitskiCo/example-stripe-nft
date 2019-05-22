require('dotenv').config();
const { ProviderManager } = require('bitski-node');

const id = process.env.BITSKI_APP_WALLET_ID;
const secret = process.env.BITSKI_APP_WALLET_SECRET;

const providerManager = new ProviderManager(id, secret);

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 9545,
      network_id: "*",
      gas: 6700000
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
      network_id: '4',
      provider: () => {
        return providerManager.getProvider('rinkeby');
      },
      gas: 4000000
    }
  }
};
