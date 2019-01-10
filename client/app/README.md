# App

## Initialization

### Web3

To initialize web3 we first check if there is already a web3 provider (injected by MetaMask or a web3 compatable browser). If there is no web3 provider we initialise the [Bitski SDK](https://github.com/OutThereLabs/bitski-js-sdk/).

### Loading Contracts

In order to use web3 as our backend we need a way to access our contracts inside our front end. When we built and deployed our contracts Truffle stored the results in the ```build``` directory. We can import those artifacts and parse them using ```web3.eth.Contract``` but to make things easier we have created a wrapper ([TokenService.js](services/TokenService.js)).

### Phaser

Once we have our web3 instance we can initialize our game. [Game.js](Game.js) has a constructor which adds itself as a child to a div that we pass in. It will then load any scene templates we are going to use. From there [BootScene.js](scenes/BootScene.js) will load any tokens via web3 and display them using [CrewScene.js](scenes/CrewScene.js).

## Transactions

We can easily read data from web3 but in order to make any changes to our state we need to create ethereum transactions, send them to the network, and wait for the network to confirm the result. Since this can take some time we have created a scene ([TransactionScene.js](scenes/TransactionScene.js)) to track the progress.