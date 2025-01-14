import {createElement} from '../utils';
export class AbstractComponent {
  constructor() {
    if (new.target === AbstractComponent) {
      throw new Error(`Can't instantiate AbstractComponent, only concrete one.`);
    }
    this._element = null;
  }

  getElement() {
    if (!this._element) {
      this._element = createElement(this.getTemplate());
    }

    return this._element;
  }

  removeElement() {
    this._element = null;
  }

  getTemplate() {
    throw Error(`Abstract method not implemented`);
  }

  hide() {
    const classes = this.getElement().classList;
    if (!classes.contains(`visually-hidden`)) {
      classes.add(`visually-hidden`);
    }
  }

  show() {
    const classes = this.getElement().classList;
    if (classes.contains(`visually-hidden`)) {
      classes.remove(`visually-hidden`);
    }
  }
}
