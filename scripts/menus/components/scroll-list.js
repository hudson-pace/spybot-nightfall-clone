export default class ScrollList {
  constructor(context, listItems, slotCount, x, y, width, textHeight, chooseItemCallback) {
    this.context = context;
    this.listItems = listItems;
    this.slotCount = slotCount;
    this.textHeight = textHeight;
    this.rect = {
      x,
      y,
      width,
      height: slotCount * textHeight,
    };
    this.scrollAmount = 0;
    this.chooseItemCallback = chooseItemCallback;
  }

  draw() {
    this.context.fillStyle = 'rgba(50, 50, 50, 1)';
    this.context.fillRect(this.rect.x, this.rect.y,
      this.rect.width, this.rect.height);
    this.context.font = `${this.textHeight}px verdana`;
    this.context.textBaseline = 'top';
    for (let i = 0; i < this.slotCount; i += 1) {
      const item = this.listItems[i + this.scrollAmount];
      if (item) {
        if (this.selectedItem && this.selectedItem === item) {
          this.context.fillStyle = 'rgba(70, 70, 70, 1)';
          this.context.fillRect(this.rect.x, this.rect.y + (i * this.textHeight),
            this.rect.width, this.textHeight);
        }
        this.context.fillStyle = 'white';
        this.context.fillText(
          `${item.name} ${item.desc}`,
          this.rect.x,
          this.rect.y + (i * this.textHeight),
        );
      }
    }
  }

  onScroll(amount) {
    this.scrollAmount -= amount;
    if (this.scrollAmount < 0) {
      this.scrollAmount = 0;
    } else if (this.scrollAmount > this.listItems.length - this.slotCount) {
      if (this.listItems.length < this.slotCount) {
        this.scrollAmount = 0;
      } else {
        this.scrollAmount = this.listItems.length - this.slotCount;
      }
    }
    this.draw();
  }

  onClick(point) {
    const slotIndex = Math.floor((point.y - this.rect.y) / this.textHeight);
    const item = this.listItems[slotIndex + this.scrollAmount];
    if (item) {
      if (!this.selectedItem || this.selectedItem !== item) {
        this.selectedItem = item;
        this.chooseItemCallback(this.selectedItem.name);
      }
    }
  }

  updateListItems(newListItems) {
    this.listItems = newListItems;
    if (this.selectedItem) {
      this.selectedItem = this.listItems.find(
        (item) => item.name === this.selectedItem.name,
      );
    }
  }
}
