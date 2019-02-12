import { Scene } from 'phaser';

const labelStyle = {
    fontSize: '64px',
    fontFamily: 'Acme',
    color: '#ffffff',
    align: 'center',
    backgroundColor: '#2DAA58'
};

const labelConfig = {
    x: 600,
    y: 0,
    origin: { x: 0.5, y: 0 },
    padding: 20,
    text: 'Loading....',
    style: labelStyle
};

const whatsHappeningStyle = {
    backgroundColor: '#333333',
    font: '32px Acme',
    fill: 'white',
    wordWrap: { width: 1200 }
}

export default class BootScene extends Scene {
    constructor(owner) {
        super({ key: 'boot', active: true });
        this.owner = owner;
    }

    create(config) {

        this.make.text({
            x: 0,
            y: 1200,
            padding: 20,
            origin: { x: 0, y: 1 },
            text: "Whats Happening?\n\nWe are querying the ethereum network. If this takes a while something might be broken...",
            style: whatsHappeningStyle
        });
        this.make.text(labelConfig);

        this.owner.tokenService.list().then((tokens) => {
            this.scene.start('crew', { owner: this.owner, tokens: tokens});
        }).catch(console.alert);
    }
};
