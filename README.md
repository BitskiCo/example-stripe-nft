# Stripe NFT Demo

An example of how you can use traditional payment processors (Stripe) with App Wallet to enable purchasing of non-fungible tokens (ERC-721).

View the demo: [https://stripe-demo.bitski.com](https://stripe-demo.bitski.com)

## How it Works

1. The user initiates a transaction in the client app
2. The client app displays Stripe's checkout widget, which collects the user's credit card info, and returns a token
3. The client app submits the tokenized credit card info as well as the user's ethereum address to the server to process the transaction
4. The server verifies the payment info, and authorizes the card for $1
5. If the authorization is successful, the server submits a transaction to mint a new token to the receipient (signed by App Wallet)
6. The server receives a transaction hash back, and submits that along with the new token info back to the client to display
7. The server monitors the ethereum transaction to make sure it is successful
8. Once the transaction is confirmed enough times, the server then finalizes the charge with Stripe

### Caveats

- This flow assumes that these NFTs are not inherently very valuable, and that fraud will be low. A more sophisticated contract could be written that allows for the App Wallet to revoke the token in the case of a chargeback.

- The Stripe transaction fee is $0.30, and the Ethereum transaction also costs a small amount of ETH to run. Charging just $1 dollar might not be enough.

- Transaction monitoring can be resource heavy, and should probably be split out into its own app or service for better scalability.

- The ethereum transaction can take a relatively long time to be mined, while the user expects to see something right away. This is a challenge with blockchain in general, but for our purposes, we're assuming the Ethereum transaction will most likely eventually succeed. We do not really handle the case where the transaction fails, but this should be taken into consideration in a production environment. A reasonable option would be to retry the transaction with more gas or a higher gas price. Another good reason to consider splitting transaction monitoring into its own service.

- This would work just as well with any payment provider. You could use In-App Purchase, Braintree, Paypal, etc.

- You may also want to allow purchasing with ETH directly. This could be done by adding a payable function and some additional logic to the ExampleApp contract.

- We do not currently have an automated system for funding your App Wallet when it runs low on funds. You should monitor it regularly to make sure it has enough ETH to execute transactions.

## Project Structure

- client: The client application, which lists tokens, and collects credit card info.
- server: The server application, which processes the payment, and creates tokens.
- contracts: The Solidity smart contracts for the token, and app wallet logic.
- migrations: Code that Truffle uses to deploy our contracts to the blockchain
- test: Tests our Solidity contracts logic
- build: Compiled contracts and metadata

## Running the demo

This demo has three parts to it:

1. Smart contracts
2. Client app
3. Server app

You can find instructions for the client and server apps in their respective folders. Both the client and server app rely on smart contracts, which need to be configured first.

### Install dependencies

First, install Truffle:

```
npm install -g truffle
```

Then, install the other dependencies

```
npm install
```

We use Truffle Framework to build, test, and deploy our smart contracts. Since permissions are managed by the contract, you will need to deploy your own version of the contracts provided.

### Configure Truffle

In order to deploy your contracts, Truffle will need a wallet to submit from. We have a convenient option with App Wallet, which is the same service that powers the server app. To use App Wallet, you just need to create an app on the developer portal ([https://developer.bitski.com](https://developer.bitski.com)), and then create an app wallet and backend credentials for your app.

Create a .env file in the root directory, and fill it out with your credentials:

```
BITSKI_APP_WALLET_ID=YOUR-CREDENTIAL-ID
BITSKI_APP_WALLET_SECRET=YOUR-CREDENTIAL-SECRET
```

Alternatively you can expose these flags as simple environment variables.

### Deploy Contracts

Make sure your account is funded with Rinkeby ETH ([https://faucet.rinkeby.io](https://faucet.rinkeby.io)), and then run the following:

```
truffle migrate --network rinkeby
```

This should deploy your contracts to the Rinkeby test network, and save the resulting metadata to the build folder.

### Configure the Client & Server

At this point, you're ready to start the client and the server apps. Follow the instructions in the READMEs of their respective directories.
