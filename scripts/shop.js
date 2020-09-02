import { rectContainsPoint, calculateTextPadding } from './helpers.js';

export default class Shop {
  constructor(shopData, canvas, inventory, programMenu, closeShopCallback) {
    this.programs = shopData;
    this.inventory = inventory;
    this.programMenu = programMenu;
    this.rect = {
      x: canvas.width * 0.3,
      y: canvas.height * 0.3,
      width: canvas.width * 0.4,
      height: canvas.height * 0.6,
    };
    this.programSlots = [];
    this.textHeight = 18;
    this.programs.forEach((program, index) => {
      this.programSlots.push({
        x: this.rect.x + 10,
        y: this.rect.y + 10 + (this.textHeight * index),
        width: this.rect.width - 20,
        height: this.textHeight,
        program,
      });
    });
    this.closeShopCallback = closeShopCallback;
    this.closeButton = {
      x: this.rect.x + 50,
      y: this.rect.height + this.rect.y - 50,
      width: 100,
      height: 50,
    };
  }

  draw(context) {
    context.fillStyle = 'rgba(40, 40, 40, 0.95)';
    context.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
    context.font = `${this.textHeight}px verdana`;
    context.textBaseline = 'top';
    context.fillStyle = 'white';
    this.programSlots.forEach((programSlot) => {
      context.fillText(`${programSlot.program.name}: ${programSlot.program.price}`, programSlot.x, programSlot.y);
    });
    context.fillStyle = 'red';
    context.fillRect(this.closeButton.x, this.closeButton.y,
      this.closeButton.width, this.closeButton.height);
    context.fillStyle = 'white';
    const [leftPad, topPad] = calculateTextPadding(this.closeButton, 'Close', context);
    context.textBaseline = 'middle';
    context.fillText('Close', this.closeButton.x + leftPad, this.closeButton.y + topPad);
  }

  onClick(point) {
    this.programSlots.forEach((programSlot) => {
      if (rectContainsPoint(programSlot, point)) {
        if (this.inventory.spendCredits(programSlot.program.price)) {
          this.inventory.addProgram(programSlot.program.name);
          this.programMenu.resetInventoryStock();
        }
      }
    });
    if (rectContainsPoint(this.closeButton, point)) {
      this.closeShopCallback();
    }
  }

  containsPoint(point) {
    return rectContainsPoint(this.rect, point);
  }
}
