# Stripe Demo - Client App

The client app is responsible for providing the user interface, as well as collecting payment information and submitting that information to the server for processing. Your tokens are loaded directly from the token contract on the blockchain.

## Create your credentials

You'll need an app id to actually run this demo. Visit https://developer.bitski.com/ and click "Create App". You can enter anything for the name and leave the url blank for now.

Once your app is created, view your app details, then go to the OAuth settings, and under Redirect Urls, add the following:

http://localhost:3000/callback.html

You'll also need a Stripe API Key. You can get one by signing up for a Stripe account at https://stripe.com, and then navigating to Developers > API Keys.

Finally, make sure you've already deployed your contracts by following the README in the root directory.

## Configure the app

Create a `.env` file in this directory (client), then fill in the following:

- BITSKI_CLIENT_ID: Your Bitski app id
- STRIPE_API_KEY: Your Stripe API Key (the public key)
- CONTRACT_ADDRESS: The address your token contract is deployed at (LimitedMintableNonFungibleToken)
- NETWORK_NAME: The network to use (rinkeby | mainnet | kovan)
- BITSKI_REDIRECT_URL: The URL to your callback.html file (/public/callback.html)

It should look something like this:

```
BITSKI_CLIENT_ID=YOUR-ID
BITSKI_REDIRECT_URL=http://localhost:3000/public/callback.html
NETWORK_NAME=rinkeby
STRIPE_API_KEY=YOUR-KEY
CONTRACT_ADDRESS=YOUR-ADDRESS
```

You can also pass these in as regular environment variables at build time if you would prefer.

## Running Locally

Now you should be ready to run the demo app locally. First, install the dependencies.

```bash
npm install
```

Next, run the dev server:

```bash
npm run dev
```

Then browse to [http://localhost:3000](http://localhost:3000) to interact with the app. As you make changes, the page will automatically be reloaded.

## Building for production

To run in production mode, first build the app:

```
npm run build
```

Then, you can start the web server

```
npm start
```

## Game

The front-end of our app is a game using the Phaser framework. The code is located in [app](app/) and the assets are located in ```assets```.
