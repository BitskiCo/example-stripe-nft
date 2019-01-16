import 'phaser';

import CrewScene from './scenes/CrewScene.js';
import BootScene from './scenes/BootScene.js';
import UnitScene from './scenes/UnitScene.js';
import ReceiptScene from './scenes/ReceiptScene.js';
import TransactionScene from './scenes/TransactionScene.js';
import AppWalletService from './services/AppWalletService.js';
import StripeService from './services/StripeService.js';
import TokenService from './services/TokenService.js';
import Web3 from 'web3';
import BN from 'bn.js';

export default class Game {

    constructor(parentElement, provider) {
        this.web3 = new Web3(provider);
        this.stripe = new StripeService(STRIPE_API_KEY);
        this.appWallet = new AppWalletService('http://localhost:4200');

        this.setAccount().then(() => {
            this.tokenService = new TokenService(this.web3, CONTRACT_ADDRESS, this.currentAccount, TOKEN_URI_BASE_URL);
            this.loadGame();

            while (parentElement.firstChild) {
                parentElement.removeChild(parentElement.firstChild);
            }

            parentElement.appendChild(this.gameEngine.canvas);
        });
    }

    setAccount() {
        return this.web3.eth.getAccounts().then(accounts => {
            this.currentAccount = accounts[0];
            return accounts[0];
        }).catch(error => {
            console.error(error);
        });
    }

    getBalance() {
        return this.web3.eth.getBalance(this.currentAccount);
    }

    purchaseToken() {
        return this.stripe.showCheckoutForm('1 x Bitski Guy', 100).then(token => {
            return this.processTransaction(token);
        });
    }

    processTransaction(token) {
        return this.appWallet.processPurchase(token, this.currentAccount);
    }

    showTokenInfo(tokenId) {
        window.open(`https://rinkeby.opensea.io/assets/${this.tokenService.address}/${tokenId}`, '_blank');
    }

    showTransactionInfo(transactionHash) {
        window.open(`https://rinkeby.etherscan.io/tx/${transactionHash}`, '_blank');
    }

    showTransferUI(token) {
        const container = document.getElementById('modal-container');
        container.innerHTML = ```
            <div id="transfer-modal">
                <div>
                    <h3>Transfer Token</h3>
                    <p>Enter the address to send this token to:</p>
                </div>
                <div>
                    <input type="text" size="44" placeholder="0x" name="recipient" />
                </div>
                <div>
                    <button class="cancel">Cancel</button>
                    <button class="submit" type="submit">Transfer</button>
                </div>
            </div>
        ```;
        container.classList.add('visible');
        const recipientField = container.querySelector('#transfer-modal input');
        const submitButton = container.querySelector('#transfer-modal button.submit');
        const cancelButton = container.querySelector("#transfer-modal button.cancel");
    }

    resize() {
        this.gameEngine.renderer.resize(window.innerHeight, window.innerWidth);
        this.gameEngine.events.emit('resize');
    }

    loadGame() {
        const size = Math.min(600, window.innerWidth);

        const bootScene = new BootScene(this);

        const gameConfig = {
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: {
                        y: 200
                    }
                }
            },
            scene: [bootScene, CrewScene, UnitScene, TransactionScene, ReceiptScene],
        };

        const game = new Phaser.Game(gameConfig);
        this.gameEngine = game;

        window.onresize = function() {
            game.renderer.resize(window.innerWidth, window.innerHeight);
            game.events.emit('resize');
        };
    }
}
