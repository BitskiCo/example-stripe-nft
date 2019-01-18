import Raven from 'raven-js';
import { Index } from './controllers/index';

if (SENTRY_DSN) {
  Raven.config(SENTRY_DSN).install();
}

const controller = new Index();

window.addEventListener('load', function() {
  controller.start();
});
