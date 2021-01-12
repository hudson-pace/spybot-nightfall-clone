import { rectContainsPoint } from '../../helpers.js';
import { calculateTextPadding } from '../menu-helpers.js';

export default class Button {
  constructor(context, x, y, width, height, padding, text, textHeight, textIsCentered,
    onButtonPress) {
    this.rect = {
      x,
      y,
      width,
      height,
    };
    this.context = context;
    this.text = text;
    this.textHeight = textHeight;
    this.textIsCentered = textIsCentered;
    this.onButtonPress = onButtonPress;
    this.mouseIsHovering = false;
    this.padding = padding;
  }

  draw() {
    if (this.mouseIsHovering) {
      this.context.fillStyle = '#606060';
    } else {
      this.context.fillStyle = '#494949';
    }
    this.context.fillRect(this.rect.x, this.rect.y,
      this.rect.width, this.rect.height);
    this.context.fillStyle = 'white';
    this.context.font = `${this.textHeight}px verdana`;
    this.context.textBaseline = 'top';
    let textX = this.rect.x;
    if (this.textIsCentered) {
      textX += calculateTextPadding(this.rect.width, this.text, this.context);
    } else {
      textX += this.padding;
    }

    this.context.fillText(
      this.text,
      textX,
      this.rect.y + this.textHeight / 2,
    );
  }

  onClick() {
    this.onButtonPress();
  }

  onMouseMove(point) {
    if (rectContainsPoint(this.rect, point)) {
      if (!this.mouseIsHovering) {
        this.mouseIsHovering = true;
        this.draw();
      }
    } else if (this.mouseIsHovering) {
      this.mouseIsHovering = false;
      this.draw();
    }
  }
}
