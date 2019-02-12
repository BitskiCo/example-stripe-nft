import Raven from 'raven-js';
import { Index } from './controllers/Index';

if (SENTRY_DSN) {
  Raven.config(SENTRY_DSN).install();
}

const controller = new Index();

var WebFontConfig = {
  //  The Google Fonts we want to load (specify as many as you like in the array)
  google: {
    families: ['Acme']
  }
};

window.addEventListener('load', function() {
  controller.start();
});
