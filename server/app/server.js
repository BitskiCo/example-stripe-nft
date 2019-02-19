const Express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Sentry = require('@sentry/node');

class Server {

  constructor(port, app) {
    this.app = app;
    this.server = Express();
    this.configureMiddleware();
    this.defineRoutes();
    if (process.env.SENTRY_DSN) {
      this.server.use(Sentry.Handlers.errorHandler());
    }
    this.start(port);
  }

  configureMiddleware() {
    if (process.env.SENTRY_DSN) {
      this.server.use(Sentry.Handlers.requestHandler());
    }
    // Allow CORS
    this.server.use(cors());

    // Parse JSON requests
    this.server.use(bodyParser.json());
  }

  defineRoutes() {
    // Returns some metadata and health information. You could use this to consume the contract
    // address in your web app for example, or use a monitoring service to ensure sufficient balance.
    this.server.get('/', (req, res) => {
      const config = this.app.getConfig();
      res.json(config);
    });

    // =====================
    // Contract State
    // =====================

    // Returns the total supply (total number of tokens)
    this.server.get('/totalSupply', (req, res) => {
      this.app.getTotalSupply().then(totalSupply => {
        res.json({ totalSupply });
      }).catch(error => {
        res.status(500).json({ error: error.toString() });
      });
    });

    // Returns the name of the contract. Not really that useful :)
    this.server.get('/name', (req, res) => {
      this.app.getName().then(name => {
        res.json({ name });
      }).catch(error => {
        res.status(500).json({ error: error.toString() });
      });
    });

    // Returns the mint limit directly from the contract
    // (the arbitrary maximum number of tokens per address)
    this.server.get('/mintLimit', (req, res) => {
      this.app.getMintLimit().then(mintLimit => {
        res.json({ mintLimit });
      }).catch(error => {
        res.status(500).json({ error: error.toString() });
      });
    });

    // Returns the symbol of the contact (part of the ERC721 standard)
    this.server.get('/symbol', (req, res) => {
      this.app.getSymbol().then(symbol => {
        res.json({ symbol });
      }).catch(error => {
        res.status(500).json({ error: error.toString() });
      });
    });

    // =====================
    // Enumerating Tokens
    // =====================

    // Returns all token ids that belong to the provided address.
    // You could use something like this to load data on your client
    // in a more standard JSON format, rather than dealing with web3.
    this.server.get('/:ownerAddress/tokens', (req, res) => {
      this.app.getTokens(req.params.ownerAddress).then(tokens => {
        res.json({ tokens });
      }).catch(error => {
        res.status(500).json({ error: error.toString() });
      });
    });

    // Returns the token balance of the provided address.
    this.server.get('/:ownerAddress/balance', (req, res) => {
      this.app.getBalance(req.params.ownerAddress).then(balance => {
        res.json({ balance });
      }).catch(error => {
        res.status(500).json({ error: error.toString() });
      });
    });

    // =====================
    // Token Metadata
    // =====================

    // An important part of NFTs is showing the characteristics of the token.
    // The ERC-721 spec includes a method for getting a web URI that includes the
    // details of the token in a JSON format. Our backend app can not only host that end-point
    // but load some of the metadata from the contract itself, completing the loop.
    this.server.get('/tokens/:tokenId', (req,res) => {
      if (!req.params.tokenId || !req.params.tokenId.match(/^\d+$/g)) {
        return res.send({ error: { message: 'Invalid token id passed' } });
      }
      this.app.getTokenMetadata(req.params.tokenId).then(metadata => {
        res.json(metadata);
      }).catch(error => {
        res.status(500).json({ error: error.toString() });
      });
    });

    // Returns the tokenURI for a given token ID from the contract
    this.server.get('/tokenURI/:tokenId', (req, res) => {
      this.app.getTokenURI(req.params.tokenId).then((uri) => {
        res.json({ tokenURI: uri});
      }).catch(error => {
        res.status(500).json({ error: error.toString() });
      });
    });

    // ================================
    // Transactions with App Wallet
    // ================================

    this.server.post('/process-transaction', (req, res) => {
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

      this.app.processTransaction(token, recipient).then((response) => {
        res.json(response);
      }).catch(error => {
        console.error(error);
        res.status(500).json({
          error: {
            message: error.toString()
          }
        });
      });
    });
  }

  start(port) {
    // Start server
    this.server.listen(port, () => console.log(`Listening on port ${port}!`));
  }

}

module.exports = Server;
