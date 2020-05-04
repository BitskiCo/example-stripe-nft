const EventEmitter = require("events");

const MIN_CONFIRMATIONS = 2;

class Transaction extends EventEmitter {

  constructor(web3, method) {
    super();
    this.web3 = web3;
    this.method = method;
  }

  get isConfirmed() {
    return this._isConfirmed;
  }

  set isConfirmed(value) {
    if (this._isConfirmed !== value) {
      this._isConfirmed = value;
      if (value === true) {
        this.submittedTransaction.removeAllListeners();
        this.emit('confirmed');
      }
    }
  }

  get error() {
    return this._error;
  }

  set error(value) {
    this._error = value;
    if (value) {
      this.emit('error', value);
    }
  }

  get receipt() {
    return this._receipt;
  }

  set receipt(value) {
    this._receipt = value;
  }

  setInputs() {
    this.inputs = [...arguments];
    this.transaction = this.method(...arguments);
  }

  validate(from) {
    console.log('Validating transaction', this.inputs);
    return this.transaction.estimateGas({ from: from }).then(estimatedGas => {
      this.gas = estimatedGas;
      return this.web3.eth.getGasPrice().then(estimatedGasPrice => {
        this.gasPrice = estimatedGasPrice;
        return this.web3.eth.getBalance(from).then(currentBalance => {
          const balance = this.web3.utils.toBN(currentBalance);
          const gasPrice = this.web3.utils.toBN(estimatedGasPrice);
          const gas = this.web3.utils.toBN(estimatedGas);
          const maxGas = gas.mul(gasPrice);
          if (balance.lt(maxGas)) {
            throw new Error('Insufficient funds. Add more ETH to your wallet and try again.');
          } else {
            return true;
          }
        });
      });
    });
  }

  submit(from) {
    if (!this.gas || !this.gasPrice) {
      return Promise.reject(new Error('Transaction not yet validated. Please call validate() and try again'));
    }
    return new Promise((fulfill, reject) => {
      const transactionObject = { from: from, gas: this.gas, gasPrice: this.gasPrice, data: this.transaction.encodeABI() };
      console.log('Submitting transaction', transactionObject);
      this.submittedTransaction = this.transaction.send({ from: from, gas: this.gas, gasPrice: this.gasPrice }, (error, transactionHash) => {
        if (error) {
          reject(error);
          return;
        } else {
          fulfill(transactionHash);
        }
      });
      this.submittedTransaction.on('transactionHash', (hash) => {
        this.processTransactionHash(hash);
      });
      this.submittedTransaction.on('error', (error) => {
        this.processTransactionError(error);
      });
      this.submittedTransaction.on('confirmation', (confirmationCount, receipt) => {
        this.processConfirmation(confirmationCount, receipt);
      });
    });
  }

  processTransactionHash(hash) {
    this.transactionHash = hash;
  }

  processTransactionError(error) {
    this.error = error;
  }

  processConfirmation(confirmationCount, receipt) {
    this.receipt = receipt;
    if (confirmationCount >= MIN_CONFIRMATIONS) {
      this.isConfirmed = true;
    }
  }

  confirm() {
    if (this.isConfirmed) {
      return Promise.resolve();
    }
    return new Promise((fulfill, reject) => {
      this.once('confirmed', () => {
        fulfill();
      });
    });
  }

}

module.exports = Transaction;
