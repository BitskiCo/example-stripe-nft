module.exports = {
  app: {
    id: '9c5726ca-8fd7-45c2-9290-a47439e5f87c' //change this to your app's client id
  },
  appWallet: {
    client: {
      //if you have an app wallet, add your client id and secret here
      id: '602ee7a2-e323-4001-94e6-858cf98d591c',
      secret: '1152AK9MzGmvNTmafL4WksJS1-0AHrrq6BzwbM6swoIb8w10QP6GoJw5wCViAwJgYt'
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
      network: 'rinkeby', //ethereum network to use for production
      redirectURL: 'https://stripe-wine-demo.bitski.com/callback.html' //url the popup will redirect to when logged in
    }
  },
  networkIds: {
    kovan: 'kovan',
    rinkeby: 'rinkeby',
    live: 'mainnet',
    development: 'http://localhost:9545' //Update this if you use Ganache or another local blockchain
  }
};
