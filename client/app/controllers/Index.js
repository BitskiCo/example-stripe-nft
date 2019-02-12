import { Bitski, AuthenticationStatus } from 'bitski';
import Web3 from 'web3';
import Game from './Game.js';
import { LoggedInView } from '../views/LoggedIn.js';
import { LoggedOutView } from '../views/LoggedOut.js';

const LOGGED_OUT_SELECTOR = "#signed-out";
const LOGGED_IN_SELECTOR = "#game";

export class Index {

  constructor() {
    this.bitski = new Bitski(BITSKI_CLIENT_ID, BITSKI_REDIRECT_URL);
    this.loggedInView = new LoggedInView(LOGGED_IN_SELECTOR);
    this.loggedOutView = new LoggedOutView(LOGGED_OUT_SELECTOR, this.bitski, (provider) => {
      this.startGame(provider);
    });
  }

  start() {
    this.checkAuthStatus();
  }

  checkAuthStatus() {
    this.bitski.getAuthStatus().then((authStatus) => {
      if (authStatus == AuthenticationStatus.Connected) {
        this.startGame(this.bitski.getProvider(BITSKI_PROVIDER_ID));
      } else {
        this.showLogin();
      }
    }).catch((error) => {
      console.error(error);
      this.showLogin();
    });
  }

  showLogin() {
    this.loggedInView.hide();
    this.loggedOutView.show();
  }

  showApp() {
    this.loggedOutView.hide();
    this.loggedInView.show();
  }

  logOut() {
    this.bitski.signOut().then(() => {
      this.showLogin();
    }).catch((error) => {
      this.showLogin();
      console.error(error);
    });
  }

  verifyNetwork() {
    return this.web3.eth.net.getId().then(netId => {
      if (netId !== EXPECTED_NETWORK_ID) {
        throw new Error(`Please set your network to ${EXPECTED_NETWORK_NAME}`);
      }
      return true;
    });
  }

  startGame(provider) {
    this.web3 = new Web3(provider);
    this.verifyNetwork().then(() => {
      this.showApp();
      this.game = new Game(this, provider);
    }).catch(error => {
      console.error(error);
      alert(error.message);
    });
  }

}
