import { rectContainsPoint } from "../helpers.js";

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
    this.context.fillStyle = 'rgba(40, 40, 40, 0.95)';
    this.context.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
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

  onScroll(amount) {
    this.components.forEach((component) => {
      if (component.onScroll) {
        component.onScroll(amount);
      }
    });
  }

  containsPoint(point) {
    return rectContainsPoint(this.rect, point);
  }

  addTextBlock(text, textHeight, centerText) {
    this.context.font = `${textHeight}px verdana`;
    const width = this.rect.width - (2 * this.padding);
    const lines = Menu.splitTextIntoLines(width, text, this.context);
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
        let { x } = newComponent.rect;
        lines.forEach((line, index) => {
          if (centerText) {
            x += Menu.calculateTextPadding(newComponent.rect.width, line, this.context);
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

  addButton(text, minWidth, centerText, centered, onButtonPress) {
    const textHeight = this.baseTextHeight * 0.8;
    this.context.font = `${textHeight}px verdana`;
    const width = Math.max(this.context.measureText(text).width + (this.padding * 2), minWidth);
    const height = textHeight * 2;
    let { x } = this.rect;
    if (centered) {
      x += (this.rect.width - width) / 2;
    } else {
      x += this.padding;
    }
    const newComponent = {
      rect: {
        x,
        y: this.rect.y + this.yOffset,
        width,
        height,
      },
      draw: () => {
        this.context.fillStyle = 'rgba(50, 50, 50, 1)';
        this.context.fillRect(newComponent.rect.x, newComponent.rect.y,
          newComponent.rect.width, newComponent.rect.height);
        this.context.fillStyle = 'white';
        this.context.font = `${textHeight}px verdana`;
        this.context.textBaseline = 'top';
        let textX = newComponent.rect.x;
        if (centerText) {
          textX += Menu.calculateTextPadding(width, text, this.context);
        } else {
          textX += this.padding;
        }

        this.context.fillText(
          text,
          textX,
          newComponent.rect.y + textHeight / 2,
        );
      },
      onClick: () => onButtonPress(),
    };
    this.addComponent(newComponent);
  }

  addScrollList(slots, textHeight, members, chooseMemberCallback) {
    this.context.font = `${textHeight}px verdana`;
    const width = this.rect.width - (2 * this.padding);
    let selectedMember;
    const newComponent = {
      rect: {
        x: this.rect.x + this.padding,
        y: this.rect.y + this.yOffset,
        width,
        height: slots * textHeight,
      },
      scrollAmount: 0,
      draw: () => {
        this.context.fillStyle = 'rgba(50, 50, 50, 1)';
        this.context.fillRect(newComponent.rect.x, newComponent.rect.y,
          newComponent.rect.width, newComponent.rect.height);
        this.context.font = `${textHeight}px verdana`;
        this.context.textBaseline = 'top';
        for (let i = 0; i < slots; i += 1) {
          const member = members[i + newComponent.scrollAmount];
          if (member) {
            if (selectedMember && selectedMember === member) {
              this.context.fillStyle = 'rgba(70, 70, 70, 1)';
              this.context.fillRect(newComponent.rect.x, newComponent.rect.y + (i * textHeight),
                newComponent.rect.width, textHeight);
            }
            this.context.fillStyle = 'white';
            this.context.fillText(
              `${member.name}    ${member.desc}`,
              newComponent.rect.x,
              newComponent.rect.y + (i * textHeight),
            );
          }
        }
      },
      onScroll: (amount) => {
        newComponent.scrollAmount -= amount;
        if (newComponent.scrollAmount < 0) {
          newComponent.scrollAmount = 0;
        } else if (newComponent.scrollAmount > members.length - slots) {
          if (members.length < slots) {
            newComponent.scrollAmount = 0;
          } else {
            newComponent.scrollAmount = members.length - slots;
          }
        }
        this.draw();
      },
      onClick: (point) => {
        const slotIndex = Math.floor((point.y - newComponent.rect.y) / textHeight);
        const member = members[slotIndex + newComponent.scrollAmount];
        if (member) {
          if (!selectedMember || selectedMember !== member) {
            selectedMember = member;
            chooseMemberCallback(selectedMember.name);
          }
        }
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

  static calculateTextPadding(width, text, context) {
    return (width - context.measureText(text).width) / 2;
  }

  static splitTextIntoLines(width, text, context) {
    const words = text.split(' ');
    const lines = [];
    while (words.length > 0) {
      let currentLineLength = 0;
      let index = 0;
      while (index < words.length && currentLineLength < width) {
        const line = words.slice(0, index);
        currentLineLength = context.measureText(line.join(' ')).width;
        index += 1;
      }
      let line;
      if (currentLineLength < width) {
        line = words.splice(0, (words.length));
      } else {
        line = words.splice(0, (index - 2));
      }
      lines.push(line.join(' '));
    }
    return lines;
  }
}
