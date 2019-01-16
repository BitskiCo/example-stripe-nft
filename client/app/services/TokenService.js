/**
 * This JSON file was created by Truffle and contains the ABI of our contract
 * as well as the address for any networks we have deployed it to.
 */
const Token = require('../../../build/contracts/LimitedMintableNonFungibleToken.json');

export default class TokenService {
    /**
     * Since our contract will have different addresses depending on which network
     * it is deployed on we need to load the network ID before we can initialize the
     * contract. This will happen async.
     */
    static currentNetwork(web3) {
        return web3.eth.net.getId().then(function(networkID){
            return web3.eth.getAccounts().then(function(accounts){
                const contractAddress = TokenService.loadDeployedAddress(networkID);
                return new TokenService(web3, contractAddress, accounts[0]);
            });
        });
    }

    static loadDeployedAddress(networkID) {
        if (Token.networks && Token.networks[networkID] && Token.networks[networkID].address) {
            return Token.networks[networkID].address;
        } else {
            throw Error(`Contract not deployed on current network (${networkID}). Run truffle migrate first and try again.`);
        }
    }

    constructor(web3, address, defaultAccount) {
        if (!address) {
            throw new Error('Contract address not provided');
        }

        if (!Token || !Token.abi) {
            throw new Error('Contract not compiled or not found');
        }

        this.web3 = web3;
        this.defaultAccount = defaultAccount;

        const abi = Token.abi;
        this.address = address;
        this.contract = new web3.eth.Contract(abi, address);
        this.contract.setProvider(this.web3.currentProvider);

        if (this.defaultAccount) {
            this.contract.defaultAccount = this.defaultAccount;
            this.contract.options.from = this.defaultAccount;
        }
    }

    /**
     * Deletes a token by transfering it to the contract address.
     *
     * @param {string} token the ID of the token we want to delete.
     */
    delete(token) {
        return this.contract.methods.burn(token);
    }

    transfer(token, recipient) {
        return this.contract.methods.transferFrom(this.defaultAccount, recipient, token);
    }

    /**
     * Gets a list of all tokens owned by us.
     */
    list() {
        return this.contract.methods.getOwnerTokens(this.defaultAccount).call().then(tokenIds => {
            const promises = tokenIds.map(tokenId => {
                return this.getImageId(tokenId).then(imageId => {
                    return { id: tokenId, imageId: imageId };
                });
            });
            return Promise.all(promises);
        });
    }

    getImageId(tokenId) {
        return this.contract.methods.imageId(tokenId).call();
    }

    watchTransaction(hash, callback) {
        this.transactionSubscription = this.web3.eth.subscribe('newBlockHeaders').on('data', (block) => {
            const blockNumber = block.number;
            this.web3.eth.getTransactionReceipt(hash).then(receipt => {
                if (receipt) {
                    receipt.confirmations = blockNumber - receipt.blockNumber;
                }
                callback(undefined, receipt);
            }, error => callback(error));
        });
    }

    stopWatchingTransaction() {
        this.transactionSubscription.unsubscribe();
    }

    /**
     * Gets a count of our tokens.
     */
    balance() {
        return this.contract.methods.balanceOf(this.contract.defaultAccount).call();
    }

    subscribe(callback) {
        this.subscription = this.contract.events.Transfer().on('data', (event) => {
            console.log(event);
            if (event.returnValues.to == this.defaultAccount || event.returnValues.from == this.defaultAccount) {
                callback(event);
            }
        });
    }

    unsubscribe() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
