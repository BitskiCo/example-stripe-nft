import BaseScene from './BaseScene.js';

const labelStyle = {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff',
    align: 'center'
};

const whatsHappeningStyle = {
    backgroundColor: '#333333',
    font: '18px Arial',
    fill: 'white',
    wordWrap: { width: 200 }
}

const labelConfig = {
    x: 300,
    y: 300,
    padding: 10,
    origin: {x: 0.5, y: 0.5 },
    text: 'Waiting for approval...',
    style: labelStyle
};

const buttonStyle = {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff',
    align: 'center',
    backgroundColor: '#2B67AB'
};

let backButtonConfig = {
    x: 0,
    y: 0,
    origin: { x: 0, y: 0 },
    padding: 10,
    text: 'Back',
    style: buttonStyle
};

export default class TransactionScene extends BaseScene {
    constructor() {
        super({ key: 'transaction', active: false });
        this.callback = null;
    }

    back() {
        this.scene.stop('unit');
        this.scene.start('boot');
    }

    create(config) {
        super.create(config);

        this.owner = config.owner;

        this.make.text({
            x: 0,
            y: 0,
            origin: { x: 0, y: 1 },
            padding: 10,
            text: "Whats Happening?\n\nYou've requested a transation on the ethereum network. That transaction needs to be signed by your wallet. Once it is signed it is submitted to the ethereum network where it will either be accepted or rejected.",
            style: whatsHappeningStyle
        });

        let message = this.make.text(labelConfig);

        if (config.method) {
            this.send(config.method, message, config.completion);
        }
    }

    send(method, message, completion) {
        var completionCalled = false;
        method.send({ gas: 700000 })
        .on('transactionHash', function (hash) {
            if (completionCalled) {
                return;
            }
           message.setText('Waiting for confirmation...');
        })
        .on('confirmation', function (confirmationNumber, receipt) {
            if (completionCalled) {
                return;
            }
            if (confirmationNumber >= 1) {
                if (completion) {
                    completion(receipt);
                    completionCalled = true;
                }
            } else {
                message.setText('Waiting for confirmation...');
            }
        })
        .on('error', (error) => {
            if (!completionCalled) {
                message.setText('Error: ' + error.message);
                const back = this.make.text(backButtonConfig);
                back.setInteractive({ useHandCursor: true });
                back.on('pointerup', this.back, this);
            }
        });
    }
}
