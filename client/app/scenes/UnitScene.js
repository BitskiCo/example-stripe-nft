import BaseScene from './BaseScene.js';

const buttonStyle = {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff',
    align: 'center',
    backgroundColor: '#2B67AB'
};

const deleteStyle = {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff',
    align: 'center',
    backgroundColor: '#E95C3B'
};

const whatsHappeningStyle = {
    backgroundColor: '#333333',
    font: '11px Courier',
    fill: 'white',
    wordWrap: { width: 600 },
}

export default class UnitScene extends BaseScene {
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
        super.create(config);
        const token = config.token;

        this.make.text({
            x: 0,
            y: 600,
            origin: { x: 0, y: 1 },
            padding: 10,
            text: `Token #${config.token.id}`,
            style: whatsHappeningStyle
        });
        console.log(config.token.id);

        this.owner = config.owner;

        const character = token.imageId;
        const characterImageString = `character-${character}`;
        const characterImage = this.sys.add.image(300, 300, characterImageString);

        characterImage.setInteractive({ useHandCursor: true });
        characterImage.on('pointerdown', () => {
            this.input.addUpCallback(() => {
                this.owner.showTokenInfo(token.id);
            }, true);
        });

        let backButtonConfig = {
            x: 0,
            y: 0,
            origin: { x: 0, y: 0 },
            padding: 10,
            text: 'Back',
            style: buttonStyle
        };

        let backButton = this.sys.make.text(backButtonConfig);

        backButton.setInteractive({ useHandCursor: true });
        backButton.on('pointerup', this.back, this);

        let deleteButtonConfig = {
            x: 600,
            y: 0,
            padding: 10,
            origin: { x: 1, y: 0 },
            text: 'Transfer',
            style: deleteStyle
        };

        let deleteButton = this.sys.make.text(deleteButtonConfig);

        deleteButton.setInteractive({ useHandCursor: true });
        deleteButton.on('pointerup', (event) => {
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
