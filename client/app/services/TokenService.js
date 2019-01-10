/**
 * This JSON file was created by Truffle and contains the ABI of our contract
 * as well as the address for any networks we have deployed it to.
 */
const lmnftArtifacts = require('../../../build/contracts/LimitedMintableNonFungibleToken.json');

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
                return new TokenService(web3, contractAddress, accounts[0], TOKEN_URI_BASE_URL);
            });
        });
    }

    static loadDeployedAddress(networkID) {
        if (lmnftArtifacts.networks && lmnftArtifacts.networks[networkID] && lmnftArtifacts.networks[networkID].address) {
            return lmnftArtifacts.networks[networkID].address;
        } else {
            throw Error(`Contract not deployed on current network (${networkID}). Run truffle migrate first and try again.`);
        }
    }

    constructor(web3, address, defaultAccount, tokenURIBaseURL) {
        if (!address) {
            throw new Error('Contract address not provided');
        }

        if (!lmnftArtifacts || !lmnftArtifacts.abi) {
            throw new Error('Contract not compiled or not found');
        }

        this.tokenURIBaseURL = tokenURIBaseURL;
        this.web3 = web3;
        this.defaultAccount = defaultAccount;

        const abi = lmnftArtifacts.abi;
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
        return this.balance().then(balance => {
            var promises = [];
            for (var i=0; i < balance; i++) {
                promises.push(this.contract.methods.tokenOfOwnerByIndex(this.contract.defaultAccount, i).call().then(tokenId => {
                    return this.getImageId(tokenId).then(imageId => {
                        return { id: tokenId, imageId: imageId };
                    });
                }));
            }
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
