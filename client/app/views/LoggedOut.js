export class LoggedOutView {

  constructor(selector, bitski, callback) {
    this.bitski = bitski;
    this.selector = selector;
    this.loginCallback = callback;
    if (document.readyState === 'complete') {
      this._assignElement();
    } else {
      window.addEventListener('load', this._assignElement.bind(this));
    }
  }

  _assignElement() {
    this.element = document.querySelector(this.selector);
    this.errorMessage = this.element.querySelector('#error');
    this.connectButtonContainer = this.element.querySelector('#connect-button');
    this.metamaskButton = this.element.querySelector('#metamask-button');
    this.configureView();
  }

  configureView() {
    this.createLoginButton();
    this.configureMetamaskButton();
  }

  show() {
    this.element.style.display = 'block';
  }

  hide() {
    this.element.style.display = 'none';
  }

  setError(error) {
    if (error) {
      this.errorMessage.innerText = (error && error.message) || error
      console.error(error);
    } else {
      this.errorMessage.innerText = '';
    }
  }

  createLoginButton() {
    this.bitski.getConnectButton({ container: this.connectButtonContainer }, (error, user) => {
      if (error) {
        this.setError(error);
        return;
      }

      if (user && this.loginCallback) {
        this.loginCallback(this.bitski.getProvider(BITSKI_PROVIDER_ID));
      }
    });
  }

  logInMetaMask() {
    window.ethereum.enable().then(() => {
      if (this.loginCallback) {
        this.loginCallback(window.ethereum);
      }
    }).catch(error => {
      this.setError(error);
    });
  }

  configureMetamaskButton() {
    this.metamaskButton.addEventListener('click', () => {
      this.logInMetaMask();
    });

    if (window.ethereum) {
      this.metamaskButton.style.display = 'block';
    } else {
      this.metamaskButton.style.display = 'none';
    }
  }

}
