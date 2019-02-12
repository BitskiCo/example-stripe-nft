import 'phaser';

import CrewScene from '../scenes/CrewScene.js';
import BootScene from '../scenes/BootScene.js';
import UnitScene from '../scenes/UnitScene.js';
import ReceiptScene from '../scenes/ReceiptScene.js';
import TransactionScene from '../scenes/TransactionScene.js';
import AppWalletService from '../services/AppWalletService.js';
import StripeService from '../services/StripeService.js';
import TokenService from '../services/TokenService.js';
import Web3 from 'web3';
import { TransferModal } from '../views/Transfer.js';

export default class Game {

    constructor(parentElement, provider) {
        this.web3 = new Web3(provider);
        this.stripe = new StripeService(STRIPE_API_KEY);
        this.appWallet = new AppWalletService(APP_WALLET_URL || 'http://localhost:4200');

        this.setAccount().then(() => {
            this.tokenService = new TokenService(this.web3, CONTRACT_ADDRESS, this.currentAccount);
            this.loadGame();
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
        this.transferModal = new TransferModal(token, (recipient) => {
            const method = this.tokenService.transfer(token.id, recipient);
            this.gameEngine.scene.stop('unit');
            this.gameEngine.scene.start('transaction', { owner: this, method: method, completion: () => {
                this.gameEngine.scene.stop('transaction');
                this.gameEngine.scene.start('boot');
            }});
            this.transferModal = undefined;
        });
        this.transferModal.show();
    }

    resize() {
        // this.gameEngine.renderer.resize(window.innerHeight, window.innerWidth);
        // this.gameEngine.events.emit('resize');
    }

    loadGame() {

        const bootScene = new BootScene(this);

        const gameConfig = {
            type: Phaser.AUTO,
            scale: {
                parent: 'game',
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: 1200,
                height: 1200
            },
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
    }
}
