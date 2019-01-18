const TEMPLATE = `
<div id="transfer-modal">
    <div>
        <h3>Transfer Token</h3>
        <p>Enter the ethereum address to send this token to:</p>
    </div>
    <div>
        <input type="text" size="44" placeholder="0x" name="recipient" />
    </div>
    <div>
        <button class="btn submit" type="submit">Transfer</button>
        <button class="btn cancel">Cancel</button>
    </div>
</div>
`;

export class TransferModal {

  constructor(token, callback) {
    this.token = token;
    this.callback = callback;
    this.container = document.getElementById('modal-container');
  }

  show() {
    this.container.innerHTML = TEMPLATE;
    this.container.classList.add('visible');
    const recipientField = this.container.querySelector('#transfer-modal input[name=recipient]');
    const submitButton = this.container.querySelector('#transfer-modal button.submit');
    const cancelButton = this.container.querySelector("#transfer-modal button.cancel");

    submitButton.addEventListener('click', () => {
      const recipient = recipientField.value;
      this.callback(recipient);
      this.hide();
    });

    cancelButton.addEventListener('click', () => {
        this.hide();
    });
  }

  hide() {
    this.container.classList.remove('visible');
    this.container.innerHTML = '';
  }
};
