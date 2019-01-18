# Stripe Demo - Backend App

The server component of this demo is responsible for processing payments, creating tokens on behalf of users, and serving metadata for the token contract. We've written this demo in Node.js, and it uses a lightweight Express server to serve API requests. It uses Web3.js with Bitski's Node SDK to connect to the Ethereum network, and a Bitski App Wallet to submit transactions.

A live version of this code is running at [https://stripe-demo-api.bitski.com](https://stripe-demo-api.bitski.com).

## Requirements

- NPM
- Node
- A Bitski app ([https://developer.bitski.com](https://developer.bitski.com))
- A Stripe account ([https://dashboard.stripe.com])

## Running the demo

First, make sure you've followed the steps to compile and migrate the contracts at the root of this repo.

### Install Dependencies

```
npm install
```

### Runtime Environment Variables

To properly configure the server, create a .env file in the server directory, and define the following environment variables (see [dotenv](https://github.com/motdotla/dotenv) for more info):

- STRIPE_SECRET: Your Stripe secret key (Available under Developers > API Keys in the Stripe Dashboard)
- BITSKI_APP_WALLET_ID: Your Bitski App Credential ID (Available under Backend Credentials on developer.bitski.com)
- BITSKI_APP_WALLET_SECRET: Your Bitski App Credential ID (Available under Backend Credentials on developer.bitski.com)
- WEB_URL: The URL for the client application - used for token metadata and image assets
- API_URL: The URL for the server application - used for the token URI
- PORT: Optionally specify what port to deploy the server on

Alternatively, you can export these environment variables in the command line.

### Start the server

```
npm start
```
