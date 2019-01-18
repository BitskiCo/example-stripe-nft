import Game from './Game.js';
import { Bitski, AuthenticationStatus } from 'bitski';
import Raven from 'raven-js';
import Web3 from 'web3';

if (SENTRY_DSN) {
  Raven.config(SENTRY_DSN).install();
}

let bitski = new Bitski(BITSKI_CLIENT_ID, BITSKI_REDIRECT_URL);

window.addEventListener('load', function() {

  // Setup Metamask Button
  configureMetamaskButton();

  // Setup Bitski
  bitski.getAuthStatus().then((authStatus) => {
    if (authStatus == AuthenticationStatus.Connected) {
      showApp(bitski.getProvider(BITSKI_PROVIDER_ID));
    } else {
      showLoginButton(bitski);
    }
  }).catch(function (error) {
    console.error(error);
    showLoginButton(bitski);
  });
});

function showApp(provider) {
  window.web3 = new Web3(provider);
  web3.eth.net.getId().then(netId => {
    if (netId !== EXPECTED_NETWORK_ID) {
      alert(`Please set your network to ${EXPECTED_NETWORK_NAME}`);
    } else {
      document.getElementById('signed-out').style.display = 'none';
      document.getElementById('signed-in').style.display = 'block';
      window.game = new Game(document.getElementById('game'), provider);

      web3.eth.getAccounts().then((accounts) => {
        if (accounts[0]) {
          document.getElementById('your-address').innerText = accounts[0];
          document.getElementById('copy-address').dataset['clipboardText'] = accounts[0];
        }
      });
    }
  });
}

function showLoginButton(bitski) {
  document.getElementById('signed-out').style.display = 'block';
  document.getElementById('signed-in').style.display = 'none';

  bitski.getConnectButton({ container: document.getElementById('connect-button') }, (error, user) => {
    if (error) {
      document.getElementById('error').innerText = (error && error.message) || error
      console.error(error);
    }

    if (user) {
      showApp(bitski.getProvider(BITSKI_PROVIDER_ID));
    }
  });
}

function configureMetamaskButton() {
  var metamaskButton = document.getElementById('metamask-button');
  if (metamaskButton) {
    metamaskButton.style.fontFamily = '-apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Oxygen, \'Helvetica Neue\', sans-serif';
    metamaskButton.style.fontWeight = 'bold';
    metamaskButton.style.backgroundColor = '#F79220';
    metamaskButton.style.backgroundRepeat = 'no-repeat';
    metamaskButton.style.backgroundPositionY = '50%';
    metamaskButton.style.color = '#fff';
    metamaskButton.style.border = 'none';
    metamaskButton.style.margin = '0';
    metamaskButton.style.padding = '0';
    metamaskButton.style.cursor = 'pointer';
    metamaskButton.style.borderRadius = '6px';
    metamaskButton.style.fontSize = '12px';
    metamaskButton.style.height = '28px';
    metamaskButton.style.lineHeight = '28px';
    metamaskButton.style.paddingLeft = '14px';
    metamaskButton.style.paddingRight = '14px';

    metamaskButton.onclick = function() {
      window.ethereum.enable().then(() => {
        showApp(window.ethereum);
      });
    };

    if (window.ethereum) {
      metamaskButton.style.display = 'block';
    } else {
      metamaskButton.style.display = 'none';
    }
  }
}
