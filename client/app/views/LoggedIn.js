export class LoggedInView {

  constructor(selector) {
    this.selector = selector;
    if (document.readyState === 'complete') {
      this._assignElement();
    } else {
      window.addEventListener('load', this._assignElement.bind(this));
    }
  }

  _assignElement() {
    this.element = document.querySelector(this.selector);
    this.gameContainer = this.element.querySelector('#game');
  }

  show() {
    this.element.style.display = 'block';
  }

  hide() {
    this.element.style.display = 'none';
  }

}
