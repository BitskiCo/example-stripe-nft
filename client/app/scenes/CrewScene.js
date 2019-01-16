import TokenService from '../services/TokenService.js';
import BaseScene from './BaseScene.js';
import Phaser from 'phaser';

const labelStyle = {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff',
    align: 'center',
    backgroundColor: '#2DAA58'
};

const buttonStyle = {
    fontSize: '32px',
    fontFamily: 'Arial',
    fontWeight: 'bold',
    color: '#ffffff',
    align: 'center',
    backgroundColor: '#2B67AB'
};

const whatsHappeningStyle = {
    backgroundColor: '#333333',
    font: '16px Arial',
    fill: 'white',
    wordWrap: { width: 580 }
}

const characterPositions = [
    [100, 170],
    [260, 150],
    [420, 190],
    [180, 310],
    [340, 310],
];

export default class CrewScene extends BaseScene {
    constructor() {
        super({ key: 'crew', active: false });
        this.tokens = [];
    }

    preload() {
        this.load.image('character-1', 'assets/character-1.png');
        this.load.image('character-2', 'assets/character-2.png');
        this.load.image('character-3', 'assets/character-3.png');
        this.load.image('character-4', 'assets/character-4.png');
        this.load.image('character-5', 'assets/character-5.png');
    }

    buyToken() {
        this.owner.signPersonal();
        // this.owner.purchaseToken().then(response => {
        //     this.showPurchasedToken(response.token, response.transactionHash);
        // }).catch(error => {
        //     console.error(error);
        // });
    }

    showPurchasedToken(token, transactionHash) {
        this.owner.tokenService.unsubscribe();
        this.scene.stop('crew');
        this.scene.start('receipt', { owner: this.owner, token: token, transactionHash: transactionHash });
    }

    showTokenDetails(token) {
        this.owner.tokenService.unsubscribe();
        this.scene.stop('crew');
        this.scene.start('unit', { owner: this.owner, token: token });
    }

    drawToken(token, index) {
        let character = token.imageId;
        let characterPosition = characterPositions[index];
        let characterImage = this.physics.add.image(characterPosition[0], characterPosition[1], `character-${character}`);
        characterImage.setScale(0.7);
        characterImage.setOrigin(0,0);
        let velocityX = Math.random() * (100 - (-100)) + (-100);
        let velocityY = Math.random() * (300 - (-300)) + (-300);
        characterImage.setVelocity(velocityX, velocityY);
        characterImage.setBounce(1, 1);
        characterImage.setGravityY(200);
        characterImage.setCollideWorldBounds(true);

        characterImage.setInteractive({ useHandCursor: true });
        characterImage.on('pointerup', () => {
            this.showTokenDetails(token);
        });
        this.characters.push(characterImage);
    }

    configureTokens() {
        let totalTokens = this.tokens.length;

        this.characters.forEach(image => {
            image.destroy();
        });

        this.characters = [];

        this.tokens.forEach((token, i) => {
            this.drawToken(token, i);
        });

        var title = '...'

        if (totalTokens === 1) {
            title = 'You have 1 guy!';
        } else if (totalTokens < 5) {
            title = 'You have ' + totalTokens + ' guys!';
        } else {
            title = 'You have a complete crew!';
        }

        this.label.text = title;

        if (totalTokens < 5) {
            this.moreButton.setInteractive({ useHandCursor: true });
            this.moreButton.alpha = 1;
        } else {
            this.moreButton.alpha = 0;
            this.moreButton.removeInteractive();
        }
    }

    handleTransfer(event) {
        const { from, to, tokenId } = event.returnValues;
        const address = this.owner.tokenService.defaultAccount;
        if (to == address) {
            const existingToken = this.tokens.find(token => { return token.id == tokenId });
            if (!existingToken) {
                this.owner.tokenService.getImageId(tokenId).then(imageId => {
                    this.tokens.push({ id: tokenId, imageId: imageId });
                    this.configureTokens();
                });
            }
        } else if (from == address) {
            this.tokens = this.tokens.filter(token => { return token.id != tokenId });
            this.configureTokens();
        } else {
            console.error('Received unexpected event', event);
        }
    }

    create(config) {
        super.create(config);
        this.owner = config.owner;
        this.tokenService = config.tokenService;
        this.tokens = config.tokens;
        this.characters = [];

        this.make.text({
            x: 0,
            y: 600,
            origin: { x: 0, y: 1 },
            padding: 10,
            text: "Whats Happening?\n\nWe've queried the ethereum network for any ERC721 tokens that are available from our contract. For each token we calculate an appearance and show that here.\n\nIf you don't have any tokens we let you 'mint' up to five tokens.\n\nIf you do have a token you should see it here. That means our contract worked!",
            style: whatsHappeningStyle
        });

        this.physics.world.setBounds(0, 84, 500, 250);

        let labelConfig = {
            x: 300,
            y: 0,
            origin: { x: 0.5, y: 0 },
            padding: 10,
            style: labelStyle
        };

        this.label = this.sys.make.text(labelConfig);

        let buttonConfig = {
            x: 600,
            y: 0,
            padding: 10,
            origin: { x: 1, y: 0 },
            style: buttonStyle,
            alpha: 0,
            text: 'Buy $1'
        };

        this.moreButton = this.sys.make.text(buttonConfig);
        this.moreButton.on('pointerup', () => {
            this.buyToken();
        });

        this.configureTokens();

        this.owner.tokenService.subscribe((event) => {
            this.handleTransfer(event);
        });
    }
};
