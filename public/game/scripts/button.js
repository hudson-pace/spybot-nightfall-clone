import { calculateTextPadding, rectContainsPoint, rectAsArray } from './helpers.js';

export default class Button {
  constructor(x, y, width, height, text, onClickCallback) {
    this.rect = {
      x,
      y,
      width,
      height,
    };
    this.text = text;
    this.onClickCallback = onClickCallback;
  }

  containsPoint(point) {
    return rectContainsPoint(this.rect, point);
  }

  click() {
    this.onClickCallback();
  }

  draw(context) {
    context.fillStyle = 'grey';
    context.fillRect(...rectAsArray(this.rect));
    context.fillStyle = 'white';
    context.font = '20px verdana';
    context.textBaseline = 'middle';
    const [leftPad, topPad] = calculateTextPadding(this.rect, this.text, context);
    context.fillText(this.text, this.rect.x + leftPad, this.rect.y + topPad);
  }
}
