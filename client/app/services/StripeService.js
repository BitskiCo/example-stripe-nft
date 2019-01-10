export default class StripeService {

  constructor(apiKey) {
    this.apiKey = apiKey;
    this.storeName = 'Bitski App Wallet Demo';

    this.handler = StripeCheckout.configure({
      key: apiKey,
      image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
      locale: 'auto',
      token: (token) => {
        if (this.tokenHandler) {
          if (token) {
            this.tokenHandler.fulfill(token);
          } else {
            this.tokenHandler.reject(new Error('Transaction was cancelled'));
          }
          this.tokenHandler = undefined;
        }
      }
    });
  }

  showCheckoutForm(itemName, amount) {
    return new Promise((fulfill, reject) => {
      this.tokenHandler = { fulfill, reject };
      this.handler.open({
        name: this.storeName,
        description: itemName,
        amount: amount
      });
    });
  }

}
