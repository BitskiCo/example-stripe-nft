module.exports = {
  app: {
    id: '365c9c6a-5602-4bc6-942c-7084beada709' //change this to your app's client id
  },
  appWallet: {
    client: {
      //if you have an app wallet, add your client id and secret here
      id: 'ad2c4eb9-bc22-4000-b17e-54dd1e568440',
      secret: '56iBfVL]fxB-pRyS}19[er9lBxuD}MvcUV6P0Yl7UE]pNjJR}ntkVkC-Iysg6raDt'
    },
    auth: {
      tokenHost: 'https://account.bitski.com',
      tokenPath: '/oauth2/token'
    }
  },
  environments: {
    development: {
      network: 'development', //ethereum network to use for local dev
      redirectURL: 'http://localhost:3000/callback.html' //url the popup will redirect to when logged in
    },
    production: {
      network: 'kovan', //ethereum network to use for production
      redirectURL: 'https://mydomain.com/callback.html' //url the popup will redirect to when logged in
    }
  },
  networkIds: {
    kovan: 'kovan',
    rinkeby: 'rinkeby',
    live: 'mainnet',
    development: 'http://localhost:9545' //Update this if you use Ganache or another local blockchain
  }
};
