const Web3 = require('web3');
const Bitski = require('bitski-node');
const Contract = require('./contract');
const ExampleAppABI = require('../../build/contracts/ExampleApp');
const TokenABI = require('../../build/contracts/LimitedMintableNonFungibleToken');
const BN = require('bn.js');
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const Transaction = require('./transaction');
const Server = require('./server');
const TokenTypes = new BN(process.env.TOKEN_TYPES || '5', 10);
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);

class App {

  /**
   * Creates a new instance of App
   * @param {string} clientId Your Bitski client id
   * @param {string} network The network name to use (mainnet | kovan | rinkeby)
   * @param {object} credentials Your app wallet credentials
   * @param {string} credentials.id Your credential id
   * @param {string} credentials.secret Your credential secret
   */
  constructor(clientId, network, credentials) {
    const options = {
      credentials: credentials,
      network: network
    };
    // Create instance of BitskiProvider
    this.provider = Bitski.getProvider(clientId, options);

    // Create instance of web3
    this.web3 = new Web3(this.provider);
  }

  /**
   * Starts the app by connecting to Ethereum network and starting the Express server
   * @param {number} port Port to start the server on
   */
  async start(port) {
    console.log('starting app...');
    try {
      // Get accounts
      const accounts = await this.web3.eth.getAccounts();
      // Check to make sure we have an account
      if (accounts.length == 0) {
        throw new Error('No account found');
      }

      // Set current account
      this.currentAccount = accounts[0];

      this.balance = await this.web3.eth.getBalance(this.currentAccount);

      // Set network id
      this.networkId = await this.web3.eth.net.getId();

      // Create instance of contract
      this.contract = await new Contract(this.web3, this.networkId, ExampleAppABI).deployed();
      this.token = await new Contract(this.web3, this.networkId, TokenABI).deployed();

      // Cache token name
      this.name = await this.token.methods.name().call();

      // Create the server
      this.server = new Server(port, this);

      // Refresh balance every 60 seconds
      this.updateBalance();

      // Watch for new events
      this.watchTransferEvents();


    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }

  /**
   * Watches for new Transfer events from this contract and logs them to the console
   */
  watchTransferEvents() {
    this.token.events.Transfer().on('data', (event) => {
      const {
        to,
        from,
        tokenId
      } = event.returnValues;
      console.log(`Token ${tokenId} was transferred from ${from} to ${to}`);
    }).on('error', (error) => {
      console.log('Error subscribing', error);
      const now = new Date();
      console.log(now.toISOString());
    });
  }

  /**
   * We regularly check the balance of our App Wallet to make sure we're still funded.
   */
  updateBalance() {
    setTimeout(() => {
      this.web3.eth.getBalance(this.currentAccount).then(balance => {
        this.balance = balance;
        console.log(`Current balance: ${balance}`);
      }).catch(error => {
        console.log('Error updating balance:');
        console.error(error);
        const now = new Date();
        console.log(now.toISOString());
      });
      this.updateBalance();
    }, 60 * 1000);
  }

  getTotalSupply() {
    return this.token.methods.totalSupply().call();
  }

  getName() {
    return this.token.methods.name().call();
  }

  getSymbol() {
    return this.token.methods.symbol().call();
  }

  getMintLimit() {
    return this.token.methods.mintLimit().call();
  }

  getBalance(owner) {
    return this.token.methods.balanceOf(owner).call();
  }

  getTokens(owner) {
    return this.token.methods.balanceOf(owner).call().then(balance => {
      let promises = [];
      for (var i = 0; i < balance; i++) {
        const promise = this.token.methods.tokenOfOwnerByIndex(owner, i).call();
        promises.push(promise);
      }
      return Promise.all(promises);
    });
  }

  async getInventory() {
    const inventoryPath = process.env.INVENTORY_FILE;

    if (inventoryPath) {
      return readFile(inventoryPath, 'utf-8')
        .then(data => {
          return JSON.parse(data);
        });
    } else {
      return [];
    }
  }

  getTokenURI(tokenId) {
    return this.token.methods.tokenURI(tokenId).call();
  }

  async getTokenMetadata(tokenId) {
    const baseUrl = process.env.WEB_URL || 'https://example-dapp-1.bitski.com';
    const inventory = await this.getInventory();
    const imageIndex = new BN(tokenId).mod(TokenTypes).add(new BN(1));
    const metadata = inventory.find(({id}) => id == imageIndex.toNumber()) || {};

    const imageUrl = metadata.imageUrl;

    //The ERC-721 Metadata standard
    const erc721Details = {
      name: metadata.name,
      description: metadata.description,
      image: imageUrl
    };

    // Additional OpenSea Metadata
    const openSeaExtras = {
      external_url: baseUrl,
      attributes: metadata.traits || [],
    };

    // Additional RareBits Metadata
    const rareBitsExtras = {
      image_url: imageUrl,
      home_url: baseUrl
    };

    return Object.assign({}, erc721Details, openSeaExtras, rareBitsExtras);
  }

  tokenIdFromProductId(productId) {
    const productIdBN = new BN(productId, 10).sub(new BN(1));
    const randomTokenId = new BN(this.web3.utils.randomHex(32), 16);
    const tokenId = randomTokenId.sub(randomTokenId.mod(TokenTypes)).add(productIdBN);
    return tokenId;
  }

  processTransaction(token, recipient, productId) {
    const tokenId = this.tokenIdFromProductId(productId);
    const tokenIdString = tokenId.toString(10);

    // Generate the token URI (points at this app)
    const baseUrl = process.env.API_URL || 'https://example-dapp-1-api.bitski.com';
    const tokenURI = `${baseUrl}/tokens/${tokenIdString}`;


    // Create "transaction" object to manage state of the transaction
    const transaction = new Transaction(this.web3, this.contract.methods.mint);
    transaction.setInputs(recipient, '0x' + tokenId.toJSON(), tokenURI);

    return transaction.validate(this.currentAccount).then(() => {
      console.log("Transaction validated");

      // Create the charge options
      const chargeOptions = {
        source: token.id,
        currency: 'usd',
        description: `NFT Purchase - ${tokenIdString}`,
        amount: 100,
        capture: false
      };

      // Authorize the card without charging (capture: false)
      return stripe.charges.create(chargeOptions).then(charge => {
        console.log("Created initial credit card authorization");

        // If the charge is valid, submit the ethereum transaction
        return transaction.submit(this.currentAccount).then((transactionHash) => {
          console.log(`Ethereum transaction submitted ${transactionHash}`);

          // Update the charge with the transaction hash for accounting later
          stripe.charges.update(charge.id, {
            metadata: {
              transactionHash: transactionHash
            }
          }).then(() => {
            console.log('Charge was updated with metadata');
          }).catch(error => {
            console.log('Error updating charge metadata');
            console.error(error);
          });

          // Add an event listener for the transaction to be confirmed
          transaction.once('confirmed', () => {
            stripe.charges.capture(charge.id).then(capture => {
              console.log('Charge captured');
            }).catch(error => {
              console.log('Error capturing charge');
              console.error(error);
            });
          });
          return {
            transactionHash,
            token: {
              id: tokenIdString,
              imageId: productId
            }
          };
        });
      });
    });
  }

  getConfig() {
    return {
      networkId: this.networkId,
      contractAddress: this.contract.options.address,
      tokenAddress: this.token.options.address,
      address: this.currentAccount,
      balance: this.balance,
      name: this.name
    }
  }
}

module.exports = App;