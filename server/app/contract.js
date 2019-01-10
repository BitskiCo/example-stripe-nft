// This script bridges a Solidity contract that was compiled with Truffle
// into a Web3 contract we can use in the app. See how it's used in app.js.

class Contract {

  constructor(web3, networkId, artifacts) {
    this.web3 = web3;
    this.networkId = networkId;
    this.artifacts = artifacts;
  }

  /**
   * Use this to create an instance of the contract at the given address.
   * ```
   * const MyContract = Contract(web3, artifacts);
   * const instance = MyContract.at('0x00000…');
   * ```
   * @param {string} address Ethereum address the contract is deployed at
   * @returns {Object} An instance of web3.eth.Contract pointing at the address given.
   */
  at(address) {
    if (this.artifacts && this.artifacts.abi) {
      const abi = this.artifacts.abi;
      return new this.web3.eth.Contract(abi, address);
    } else {
      throw new Error('Contract not compiled or not found');
    }
  }

  /**
   * Get an instance of this contract deployed on the current network.
   * ```
   * const MyContract = Contract(web3, artifacts);
   * MyContract.deployed().then(instance => {
   *  this.contractInstance = instance;
   * });
   * ```
   * @returns {Promise} A Promise containing an instance of the contract.
   */
  deployed() {
    const address = this.getAddress(this.networkId);
    if (address) {
      return Promise.resolve(this.at(address));
    } else {
      const deployedNetworks = Object.keys(this.artifacts.networks);
      return Promise.reject(`Contract not deployed on current network (${this.networkId}). Make sure you ran truffle migrate for the network this environment points to. Currently deployed on: ${deployedNetworks}.`);
    }
  }

  /**
   * Searches the artifacts to get the address at a given network id
   * @param {string} networkID numeric id string of the ethereum network to get the address for. eg "1" for main net.
   */
  getAddress(networkID) {
    if (this.artifacts && this.artifacts.networks && this.artifacts.networks[networkID] && this.artifacts.networks[networkID].address) {
      return this.artifacts.networks[networkID].address;
    }
  }
}

module.exports = Contract;
