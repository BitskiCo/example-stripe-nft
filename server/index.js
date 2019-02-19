require('dotenv').config();
const Sentry = require('@sentry/node');
const App = require('./app/app');

if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN });
}

const credentials = {
  id: process.env.BITSKI_APP_WALLET_ID,
  secret: process.env.BITSKI_APP_WALLET_SECRET
};

const app = new App(credentials.id, 'rinkeby', credentials);
app.start(process.env.PORT || 4200);
