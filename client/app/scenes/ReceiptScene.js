import { Scene } from 'phaser';
import styles from '../utils/styles';

export default class ReceiptScene extends Scene {
    constructor() {
        super({ key: 'receipt', active: false });
    }

    preload() {
        this.load.image('tokenAsset-$1', 'assets/tokenAsset-$1.png');
        this.load.image('tokenAsset-$1', 'assets/tokenAsset-$1.png');
        this.load.image('tokenAsset-$1', 'assets/tokenAsset-$1.png');
        this.load.image('tokenAsset-$1', 'assets/tokenAsset-$1.png');
        this.load.image('tokenAsset-$1', 'assets/tokenAsset-$1.png');
    }

    create(config) {

        const token = config.token;

        this.make.text({
            x: 0,
            y: 1200,
            origin: { x: 0, y: 1 },
            padding: 20,
            text: `Token #${token.id}`,
            style: styles.monospaceLabel
        });

        this.make.text({
          x: 0,
          y: 1100,
          origin: { x: 0, y: 1 },
          padding: 20,
          text: `Transaction ${config.transactionHash}`,
          style: styles.explanation
      });

        this.owner = config.owner;

        const character = token.imageId;
        const characterImageString = `tokenAsset-${character}`;
        const characterImage = this.sys.add.image(600, 600, characterImageString);
        characterImage.setScale(1.5);

        characterImage.setInteractive({ useHandCursor: true });

        characterImage.on('pointerup', () => {
            this.owner.showTokenInfo(token.id);
        });

        let backButtonConfig = {
            x: 0,
            y: 0,
            origin: { x: 0, y: 0 },
            padding: 20,
            text: 'Back',
            style: styles.primaryButton
        };

        let backButton = this.sys.make.text(backButtonConfig);

        backButton.setInteractive({ useHandCursor: true });
        backButton.on('pointerup', this.back, this);

        const viewTransactionButton = this.sys.make.text({
          x: 1200,
          y: 0,
          origin: { x: 1, y: 0 },
          padding: 20,
          text: 'View Txn',
          style: styles.primaryButton
        });

        viewTransactionButton.setInteractive({ useHandCursor: true });
        viewTransactionButton.on('pointerup', () => {
            this.owner.showTransactionInfo(config.transactionHash);
        });

        this.statusLabel = this.make.text({
          x: 0,
          y: 1000,
          origin: { x: 0, y: 1 },
          padding: 20,
          text: 'Status: Unknown',
          style: styles.label
        });

        this.owner.tokenService.watchTransaction(config.transactionHash, (error, receipt) => {
          this.transactionUpdated(error, receipt);
        });
    }

    transactionUpdated(error, receipt) {
      if (error) {
        this.statusLabel.text = 'Status: Error!';
        console.error(error);
      } else {
        if (!receipt) {
            this.statusLabel.text = 'Status: Submitted';
        } else if (receipt.status === true) {
            this.statusLabel.text = `Status: Confirmed (${receipt.confirmations + 1})`
        } else {
            this.statusLabel.text = 'Status: Failed';
        }
      }
    }

    back() {
        this.owner.tokenService.stopWatchingTransaction();
        this.scene.stop('receipt');
        this.scene.start('boot');
    }

    deleteToken(token) {
        this.scene.start('transaction', {
            owner: this.owner,
            method: this.owner.tokenService.delete(token.id),
            completion: () => {
                this.owner.tokenService.list().then((tokens) => {
                    this.scene.stop('transaction');
                    this.scene.start('crew', { tokens: tokens, owner: this.owner });
                });
            }
        });
    }
};
