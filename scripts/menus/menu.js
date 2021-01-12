import { rectContainsPoint } from '../helpers.js';
import { splitTextIntoLines, calculateTextPadding } from './menu-helpers.js';
import Button from './components/button.js';
import ScrollList from './components/scroll-list.js';

export default class Menu {
  constructor(x, y, width, minHeight, context) {
    this.padding = 10;
    this.rect = {
      x,
      y,
      width,
      height: Math.max(minHeight, this.padding * 2),
    };
    this.yOffset = this.padding;
    this.components = [];
    this.baseTextHeight = 20;
    this.context = context;
  }

  draw() {
    this.context.strokeStyle = 'white';
    this.context.lineWidth = 1;
    this.context.fillStyle = '#545454';
    this.context.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
    this.context.strokeRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
    this.components.forEach((component) => {
      component.draw();
    });
  }

  onClick(point) {
    this.components.forEach((component) => {
      if (component.onClick && rectContainsPoint(component.rect, point)) {
        component.onClick(point);
      }
    });
  }

  onScroll(point, amount) {
    this.components.forEach((component) => {
      if (component.onScroll && rectContainsPoint(component.rect, point)) {
        component.onScroll(amount);
      }
    });
  }

  onMouseMove(point) {
    this.components.forEach((component) => {
      if (component.onMouseMove) {
        component.onMouseMove(point);
      }
    });
  }

  containsPoint(point) {
    return rectContainsPoint(this.rect, point);
  }

  addTextBlock(text, textHeight, centerText) {
    this.context.font = `${textHeight}px verdana`;
    const width = this.rect.width - (2 * this.padding);
    const lines = splitTextIntoLines(width, text, this.context);
    const newComponent = {
      rect: {
        x: this.rect.x + this.padding,
        y: this.rect.y + this.yOffset,
        width,
        height: lines.length * textHeight,
      },
      draw: () => {
        this.context.fillStyle = 'white';
        this.context.font = `${textHeight}px verdana`;
        this.context.textBaseline = 'top';
        lines.forEach((line, index) => {
          let { x } = newComponent.rect;
          if (centerText) {
            x += calculateTextPadding(newComponent.rect.width, line, this.context);
          }
          this.context.fillText(line, x, newComponent.rect.y + (index * textHeight));
        });
      },
    };
    this.addComponent(newComponent);
  }

  addGap(gap) {
    this.yOffset += gap;
  }

  addButton(text, textHeight, minWidth, centerText, centered, onButtonPress) {
    this.context.font = `${textHeight}px verdana`;
    const width = Math.max(this.context.measureText(text).width + (this.padding * 2), minWidth);
    const height = textHeight * 2;
    let { x } = this.rect;
    if (centered) {
      x += (this.rect.width - width) / 2;
    } else {
      x += this.padding;
    }
    const newButton = new Button(this.context, x, this.rect.y + this.yOffset, width, height,
      this.padding, text, textHeight, centerText, onButtonPress);
    this.addComponent(newButton);
  }

  addScrollList(slots, textHeight, members, chooseMemberCallback) {
    const width = this.rect.width - (2 * this.padding);
    const newScrollList = new ScrollList(this.context, members, slots, this.rect.x + this.padding,
      this.rect.y + this.yOffset, width, textHeight, chooseMemberCallback);
    this.addComponent(newScrollList);
    return newScrollList;
  }

  addImage(image, sourceRect, centered) {
    let { x } = this.rect;
    if (centered) {
      x += (this.rect.width - (sourceRect.width) * 1.3) / 2;
    } else {
      x += this.padding;
    }
    const newComponent = {
      rect: {
        x,
        y: this.rect.y + this.yOffset,
        width: sourceRect.width * 1.3,
        height: sourceRect.height * 1.3,
      },
      draw: () => {
        this.context.drawImage(image,
          sourceRect.x, sourceRect.y, sourceRect.width, sourceRect.height,
          newComponent.rect.x, newComponent.rect.y,
          sourceRect.width * 1.3, sourceRect.height * 1.3);
      },
    };
    this.addComponent(newComponent);
  }

  addComponent(component) {
    this.components.push(component);
    this.yOffset += component.rect.height + this.padding;
    if (this.yOffset > this.rect.height) {
      this.rect.height = this.yOffset;
    }
  }

  popComponent() {
    const component = this.components.pop();
    this.yOffset -= (component.rect.height + this.padding);
  }
}
