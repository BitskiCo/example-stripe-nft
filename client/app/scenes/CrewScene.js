import { Scene } from 'phaser';
import styles from '../utils/styles';

const characterPositions = [
    [200, 340],
    [520, 300],
    [840, 380],
    [360, 620],
    [680, 620],
];

export default class CrewScene extends Scene {
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
        this.owner.purchaseToken().then(response => {
            this.showPurchasedToken(response.token, response.transactionHash);
        }).catch(error => {
            console.error(error);
        });
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
        characterImage.setScale(1.2);
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
            title = 'You have a full crew!';
        }

        this.title.text = title;

        if (totalTokens < 5) {
            this.moreButton.setInteractive({ useHandCursor: true });
            this.moreButton.alpha = 1;
        } else {
            this.moreButton.alpha = 0.3;
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
        this.owner = config.owner;
        this.tokenService = config.tokenService;
        this.tokens = config.tokens;
        this.characters = [];

        this.make.text({
            x: 0,
            y: 1200,
            origin: { x: 0, y: 1 },
            padding: 20,
            text: "These are the crypto characters you own from our smart contract. Each character is represented by a unique token which determines its appearance.\n\nYou can buy up to five characters using a credit card. To purchase, use this test number: 4242 4242 4242 4242. Use any expiration date and cvv.",
            style: styles.explanation
        });

        this.physics.world.setBounds(0, 168, 1100, 500);

        this.title = this.sys.make.text({
            x: 600,
            y: 0,
            origin: { x: 0.5, y: 0 },
            padding: 20,
            style: styles.title
        });

        this.moreButton = this.sys.make.text({
            x: 600,
            y: 950,
            padding: 20,
            origin: { x: 0.5, y: 1 },
            style: styles.primaryButton,
            alpha: 0,
            text: 'Buy Character: $1.00'
        });

        this.moreButton.on('pointerup', () => {
            this.buyToken();
        });

        this.logOutButton = this.sys.make.text({
            x: 1180,
            y: 20,
            padding: 20,
            origin: { x: 1, y: 0 },
            style: styles.secondaryButton,
            text: 'Sign Out'
        });
        this.logOutButton.setInteractive({ useHandCursor: true });
        this.logOutButton.on('pointerup', () => {
           this.owner.logOut();
        });

        this.configureTokens();

        this.owner.tokenService.subscribe((event) => {
            this.handleTransfer(event);
        });
    }
};
