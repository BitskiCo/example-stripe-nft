require('dotenv').config();
const BitskiTruffleProvider = require('bitski-truffle-provider');

const appWallet = {
  client: {
    id: process.env.BITSKI_CREDENTIAL_ID,
    secret: process.env.BITSKI_CREDENTIAL_SECRET
  },
  auth: {
    tokenHost: 'https://account.bitski.com',
    tokenPath: '/oauth2/token'
  }
};

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 9545,
      network_id: "*",
    },
    live: {
      network_id: '1',
      provider: () => {
        return BitskiTruffleProvider("mainnet", appWallet)
      }
    },
    kovan: {
      network_id: '42',
      provider: () => {
        return BitskiTruffleProvider("kovan", appWallet)
      }
    },
    rinkeby: {
      network_id: '4',
      provider: () => {
        return BitskiTruffleProvider("rinkeby", appWallet)
      }
    }
  }
};
