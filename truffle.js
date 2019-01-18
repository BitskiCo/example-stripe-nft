require('dotenv').config();
const Bitski = require('bitski-node');

const credentials = {
  id: process.env.BITSKI_APP_WALLET_ID,
  secret: process.env.BITSKI_APP_WALLET_SECRET
};

let providers = new Map();

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
        if (providers.get("mainnet")) {
          return providers.get("mainnet");
        }
        const provider = Bitski.getProvider(process.env.BITSKI_APP_WALLET_ID, { credentials: credentials });
        providers.set("mainnet", provider);
        return provider;
      }
    },
    kovan: {
      network_id: '42',
      provider: () => {
        if (providers.get("kovan")) {
          return providers.get("kovan");
        }
        const provider = Bitski.getProvider(process.env.BITSKI_APP_WALLET_ID, { network: 'kovan', credentials: credentials });
        providers.set("kovan", provider);
        return provider;
      }
    },
    rinkeby: {
      network_id: '4',
      provider: () => {
        if (providers.get("rinkeby")) {
          return providers.get("rinkeby");
        }
        const provider = Bitski.getProvider(process.env.BITSKI_APP_WALLET_ID, { network: 'rinkeby', credentials: credentials });
        providers.set("rinkeby", provider);
        return provider;
      },
      gas: 4000000
    }
  }
};
