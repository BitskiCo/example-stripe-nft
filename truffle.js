require('dotenv').config();
const Bitski = require('bitski-node');

const appWallet = {
  client: {
    id: process.env.BITSKI_APP_WALLET_ID,
    secret: process.env.BITSKI_APP_WALLET_SECRET
  },
  auth: {
    tokenHost: 'https://account.bitski.com',
    tokenPath: '/oauth2/token'
  }
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
        console.log("mainnet provider");
        const provider = Bitski.getProvider(process.env.BITSKI_APP_WALLET_ID, { credentials: appWallet.client });
        provider._ready.go();
        return provider;
      }
    },
    kovan: {
      network_id: '42',
      provider: () => {
        console.log("Kovan provider");
        const provider = Bitski.getProvider(process.env.BITSKI_APP_WALLET_ID, { network: 'kovan', credentials: appWallet.client });
        provider._ready.go();
        return provider;
      }
    },
    rinkeby: {
      network_id: '4',
      provider: () => {
        if (providers.get("rinkeby")) {
          return providers.get("rinkeby");
        }
        console.log('config provider');
        const provider = Bitski.getProvider(process.env.BITSKI_APP_WALLET_ID, { network: 'rinkeby', credentials: appWallet.client });
        providers.set("rinkeby", provider);
        return provider;
      },
      gas: 4000000
    }
  }
};
