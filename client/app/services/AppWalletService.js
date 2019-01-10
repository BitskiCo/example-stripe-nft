export default class AppWalletService {

  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  processPurchase(token, recipient) {
    return fetch(`${this.baseUrl}/process-transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, recipient })
    }).then(response => {
      return response.json().then(json => {
        if (response.status > 199 && response.status < 300) {
          return json;
        }
        return this.parseError(json);
      });
    });
  }

  parseError(response) {
    if (response.error) {
      const error = response.error;
      if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error(error);
      }
    } else {
      throw new Error('Something went wrong. Unknown error.');
    }
  }

}
