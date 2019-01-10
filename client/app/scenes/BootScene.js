import BaseScene from './BaseScene.js';

const labelStyle = {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff',
    align: 'center',
    backgroundColor: '#2DAA58'
};

const labelConfig = {
    x: 300,
    y: 0,
    origin: { x: 0.5, y: 0 },
    padding: 10,
    text: 'Loading....',
    style: labelStyle
};

const whatsHappeningStyle = {
    backgroundColor: '#333333',
    font: '18px Arial',
    fill: 'white',
    wordWrap: { width: 600 }
}

export default class BootScene extends BaseScene {
    constructor(owner) {
        super({ key: 'boot', active: true });
        this.owner = owner;
    }

    create(config) {
        super.create(config);

        this.make.text({
            x: 0,
            y: 600,
            padding: 10,
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
