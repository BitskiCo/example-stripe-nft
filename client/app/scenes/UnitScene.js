import { Scene } from 'phaser';

const buttonStyle = {
    fontSize: '64px',
    fontFamily: 'Arial',
    color: '#ffffff',
    align: 'center',
    backgroundColor: '#2B67AB'
};

const transferStyle = {
    fontSize: '64px',
    fontFamily: 'Arial',
    color: '#ffffff',
    align: 'center',
    backgroundColor: '#2DAA58'
};

const whatsHappeningStyle = {
    backgroundColor: '#333333',
    font: '22px Courier',
    fill: 'white',
    wordWrap: { width: 1200 },
}

export default class UnitScene extends Scene {
    constructor() {
        super({ key: 'unit', active: false });
    }

    preload() {
        this.load.image('character-1', 'assets/character-1.png');
        this.load.image('character-2', 'assets/character-2.png');
        this.load.image('character-3', 'assets/character-3.png');
        this.load.image('character-4', 'assets/character-4.png');
        this.load.image('character-5', 'assets/character-5.png');
    }

    create(config) {
        const token = config.token;

        this.make.text({
            x: 0,
            y: 1200,
            origin: { x: 0, y: 1 },
            padding: 20,
            text: `Token #${config.token.id}`,
            style: whatsHappeningStyle
        });

        this.owner = config.owner;

        const character = token.imageId;
        const characterImageString = `character-${character}`;
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
            style: buttonStyle
        };

        let backButton = this.sys.make.text(backButtonConfig);

        backButton.setInteractive({ useHandCursor: true });
        backButton.on('pointerup', this.back, this);

        let transferButton = this.sys.make.text({
            x: 1200,
            y: 0,
            padding: 20,
            origin: { x: 1, y: 0 },
            text: 'Transfer',
            style: transferStyle
        });

        transferButton.setInteractive({ useHandCursor: true });
        transferButton.on('pointerup', (event) => {
            this.transferToken(token);
        });
    }

    back() {
        this.scene.stop('unit');
        this.scene.start('boot');
    }

    transferToken(token) {
        this.owner.showTransferUI(token);
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
