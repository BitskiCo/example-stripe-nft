const Express = require('express');
const cors = require('cors');
const Web3 = require('web3');
const Bitski = require('bitski-node');
const Contract = require('./contract');
const artifacts = require('../../build/contracts/LimitedMintableNonFungibleToken');
const BN = require('bn.js');
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const bodyParser = require('body-parser');

const GAS_PRICE = '1100000000'; // Ideally this would be dynamically updated based on demand.
const MIN_CONFIRMATIONS = 2; // Minimum # of confirmations required before finalizing charges

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
    this.provider.start();
    // Create instance of web3
    this.web3 = new Web3(this.provider);
    // Create instance of server
    this.app = Express();
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
      this.contract = await new Contract(this.web3, this.networkId, artifacts).at(process.env.CONTRACT_ADDRESS);

      // Cache token name
      this.name = await this.contract.methods.name().call();

      // Create the server
      this.createServer(port);

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
    this.contract.events.Transfer().on('data', (event) => {
      const { to, from, tokenId } = event.returnValues;
      console.log(`Token ${tokenId} was transferred from ${from} to ${to}`);
    }).on('error', (error) => {
      console.log('Error subscribing', error);
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
        console.error(error);
      });
      this.updateBalance();
    }, 60 * 1000);
  }

  validateTransaction(transaction) {
    return transaction.estimateGas().then(estimatedGas => {
      return this.web3.eth.getBalance(this.currentAccount).then(currentBalance => {
        const balance = this.web3.utils.toBN(currentBalance);
        const gasPrice = this.web3.utils.toBN(GAS_PRICE);
        const gas = this.web3.utils.toBN(estimatedGas);
        const maxGas = gas.mul(gasPrice);
        if (balance.lt(maxGas)) {
          throw new Error('Insufficient funds');
        } else {
          return estimatedGas;
        }
      });
    });
  }

  // Submit the transaction. It will be signed automatically by App Wallet
  submitTransaction(transaction, gas, gasPrice) {
    return new Promise((fulfill, reject) => {
      transaction.send({
        from: this.currentAccount,
        gas: gas,
        gasPrice: gasPrice
      }).on('transactionHash', hash => {
        // Return token hash (so that the transaction can be watched), and
        // the generated tokenId (so that the client can instantly update).
        fulfill(hash);
      }).on('error', error => {
        console.log('error sending txn', error);
        reject(error);
      });
    });
  }

  confirmTransaction(transactionHash) {
    return new Promise((fulfill, reject) => {
      let confirmations = 0;
      let subscription = this.web3.eth.subscribe('newBlockHeaders').on('data', (blockHeader) => {
        //New block detected. Check transaction.
        console.log(`Inspecting block ${blockHeader.number}`);

        // Get transaction receipt
        this.web3.eth.getTransactionReceipt(transactionHash).then(txn => {
          if (txn) {
            if (txn.status === false) {
              subscription.unsubscribe();
              reject(new Error('The transaction was reverted'));
            } else {
              // Update confirmations count
              confirmations = blockHeader.number - txn.blockNumber;
              console.log(`${confirmations} confirmations`);
              if (confirmations >= MIN_CONFIRMATIONS) {
                subscription.unsubscribe();
                fulfill();
              }
            }
          } else {
            console.log(`Transaction not yet mined ${transactionHash}`);
          }
        }).catch(error => {
          subscription.unsubscribe();
          reject(error);
        });
      }).on('error', (error) => {
        console.log('error with subscription: '+ error);
      });
    });
  }

  /**
   * Starts the Express server and defines the route
   * @param {number} port The port to start the server on
   */
  createServer(port) {
    // Allow CORS
    this.app.use(cors());

    // Parse JSON requests
    this.app.use(bodyParser.json());

    // Returns some metadata and health information. You could use this to consume the contract
    // address in your web app for example, or use a monitoring service to ensure sufficient balance.
    this.app.get('/', (req, res) => {
      res.send({
        networkId: this.networkId,
        contractAddress: this.contract.options.address,
        address: this.currentAccount,
        balance: this.balance,
        name: this.name
      });
    });

    // Returns the abi of the contract. You could potentially use this to send
    // your contract source to a web client and keep it in sync.
    this.app.get('/abi', (req, res) => {
      res.send(artifacts);
    });

    // Contract State

    // Returns the total supply (total number of tokens)
    this.app.get('/totalSupply', (req, res) => {
      this.contract.methods.totalSupply().call().then(totalSupply => {
        res.send(totalSupply);
      }).catch(error => {
        res.send(error);
      });
    });

    // Returns the name of the contract. Not really that useful :)
    this.app.get('/name', (req, res) => {
      this.contract.methods.name().call().then(name => {
        res.send({ name });
      }).catch(error => {
        res.send(error);
      });
    });

    // Returns the mint limit directly from the contract
    // (the arbitrary maximum number of tokens per address)
    this.app.get('/mintLimit', (req, res) => {
      this.contract.methods.mintLimit().call().then(mintLimit => {
        res.send({ mintLimit });
      }).catch(error => {
        res.send(error);
      });
    });

    // Returns the symbol of the contact (part of the ERC721 standard)
    this.app.get('/symbol', (req, res) => {
      this.contract.methods.symbol().call().then(symbol => {
        res.send({ symbol });
      }).catch(error => {
        res.send(error);
      });
    });

    // Returns all token ids that belong to the provided address.
    // You could use something like this to load data on your client
    // in a more standard JSON format, rather than dealing with web3.
    this.app.get('/:ownerAddress/tokens', (req, res) => {
      const owner = req.params.ownerAddress;
      this.contract.methods.balanceOf(owner).call().then(balance => {
        let promises = [];
        for (var i=0; i < balance; i++) {
          const promise = this.contract.methods.tokenOfOwnerByIndex(owner, i).call();
          promises.push(promise);
        }
        return Promise.all(promises).then(tokens => {
          res.send({ tokens });
        });
      }).catch(error => {
        res.send(error);
      });
    });

    // Returns the token balance of the provided address.
    this.app.get('/:ownerAddress/balance', (req, res) => {
      this.contract.methods.balanceOf(req.params.ownerAddress).call().then(balance => {
        res.send({ balance });
      }).catch(error => {
        res.send(error);
      });
    });

    // Token Metadata

    // An important part of NFTs is showing the characteristics of the token.
    // The ERC-721 spec includes a method for getting a web URI that includes the
    // details of the token in a JSON format. Our backend app can not only host that end-point
    // but load some of the metadata from the contract itself, completing the loop.
    this.app.get('/tokens/:tokenId', (req,res) => {
      if (!req.params.tokenId || !req.params.tokenId.match(/^\d+$/g)) {
        return res.send({ error: { message: 'Invalid token id passed' } });
      }
      // Load character index from the contract (used to determine which image asset to return)
      this.contract.methods.imageId(req.params.tokenId).call().then(imageIndex => {
        const baseUrl = process.env.WEB_URL || 'https://example-dapp-1.bitski.com';
        const description = 'An example of an ERC-721 token';
        const name = this.name; // this is loaded from the contract when we boot
        const imageUrl = `${baseUrl}/assets/character-${imageIndex}.png`;

        //The ERC-721 Metadata standard
        const erc721Details = {
          name: name,
          description: description,
          image: imageUrl
        };

        // Additional OpenSea Metadata
        const openSeaExtras = {
          external_url: baseUrl,
        };

        // Additional RareBits Metadata
        const rareBitsExtras = {
          image_url: imageUrl,
          home_url: baseUrl
        };

        res.send(Object.assign({}, erc721Details, openSeaExtras, rareBitsExtras));
      });
    });

    // Returns the tokenURI for a given token ID from the contract
    this.app.get('/tokenURI/:tokenId', (req, res) => {
      this.contract.methods.tokenURI(req.params.tokenId).call().then(uri => {
        res.send({ tokenURI: uri});
      }).catch(err => {
        res.send({ error: err.toString() });
      });
    });

    // Transactions with App Wallet

    this.app.post('/process-transaction', (req, res) => {
      const token = req.body.token;
      const recipient = req.body.recipient;

      // Ensure payment method token was submitted
      if (!token) {
        res.status(422).json({
          error: {
            message: 'Transaction token not submitted'
          }
        });
        return;
      }

      // Ensure recipient was submitted
      if (!recipient) {
        res.status(422).json({
          error: {
            message: 'Recipient address not provided'
          }
        });
        return;
      }

      // Create the transaction inputs
      const tokenId = this.web3.utils.randomHex(32);
      const tokenIdString = this.web3.utils.hexToNumberString(tokenId);

      // Generate the token URI (points at this app)
      const baseUrl = process.env.API_URL || 'https://example-dapp-1-api.bitski.com';
      const tokenURI = `${baseUrl}/tokens/${tokenIdString}`;
      const transaction = this.contract.methods.mintWithTokenURI(recipient, tokenId, tokenURI);

      // Ensure we can run the transaction first
      this.validateTransaction(transaction).then(estimatedGas => {

        // Create the charge options
        const chargeOptions = {
          source: token.id,
          currency: 'usd',
          description: `NFT Purchase - ${tokenIdString}`,
          amount: 100,
          capture: false
        };

        // Validate payment method by creating initial authorization
        stripe.charges.create(chargeOptions).then(charge => {
          console.log('charged!');

          // submit the ethereum transaction
          this.submitTransaction(transaction, estimatedGas, GAS_PRICE).then(transactionHash => {
            console.log(`Transaction submitted ${transactionHash}`);
            const BN = this.web3.utils.BN;
            const expectedImageId = this.web3.utils.toBN(tokenIdString).mod(new BN(5)).add(new BN(1)).toString();

            // respond with the token, and the transaction hash so the client can monitor it
            res.json({
              transactionHash: transactionHash,
              token: {
                id: tokenIdString,
                imageId: expectedImageId
              }
            });

            // update charge with transaction hash for accounting later
            stripe.charges.update(charge.id, {
              metadata: {
                transactionHash: transactionHash
              }
            }).catch(error => {
              console.log('error updating charge');
              console.error(error);
            });

            // now that it's been submitted, monitor for confirmations
            this.confirmTransaction(transactionHash).then(() => {
              console.log('confirmed transaction');
              // now that the transaction is confirmed, capture the charge, finalizing the payment.
              stripe.charges.capture(charge.id).then(capture => {
                console.log('captured charge!');
              }).catch(error => {
                console.log('error capturing charge');
                console.error(error);
              });
            }).catch(error => {
              // cancel charge?
              console.log('error confirming transaction');
              console.error(error);
            });
          }).catch(error => {
            res.status(500).json({
              error: {
                message: error.toString()
              }
            });
          });

        }).catch(error => {
          console.log('error creating charge');
          console.error(error);
          res.status(500).json({
            error: {
              message: error.toString()
            }
          });
        });

      }).catch(error => {
        console.log('transaction was invalid');
        console.error(error);
        res.status(500).json({
          error: {
            message: error.toString()
          }
        });
      });


    });

    // Start server
    this.app.listen(port, () => console.log(`Listening on port ${port}!`));
  }
}

module.exports = App;
