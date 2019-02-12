import Raven from 'raven-js';
import { Index } from './controllers/Index';

if (SENTRY_DSN) {
  Raven.config(SENTRY_DSN).install();
}

const controller = new Index();

// Load webfonts before rendering app
WebFont.load({
  google: {
    families: ['Acme']
  },
  active: () => {
    controller.start();
  }
});
