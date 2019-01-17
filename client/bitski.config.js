module.exports = {
  environments: {
    development: {
      network: 'rinkeby', //ethereum network to use for local dev
      redirectURL: 'http://localhost:3000/public/callback.html', //url the popup will redirect to when logged in
      netId: 4
    },
    production: {
      network: 'rinkeby', //ethereum network to use for production
      redirectURL: 'https://stripe-demo.bitski.com/public/callback.html', //url the popup will redirect to when logged in
      netId: 4
    }
  },
  networkIds: {
    kovan: 'kovan',
    rinkeby: 'rinkeby',
    live: 'mainnet',
    development: 'http://localhost:9545' //Update this if you use Ganache or another local blockchain
  }
};
