export default class NetworkNode {
  constructor(node, image) {
    this.rect = {
      x: node.coords.x * 100,
      y: node.coords.y * 100,
      width: 100,
      height: 100,
    };
    this.center = {
      x: this.rect.x + (this.rect.width / 2),
      y: this.rect.y + (this.rect.height / 2),
    };
    this.image = image;
    this.name = node.name;
    this.desc = node.desc;
    this.owner = node.owner;
    this.shop = node.shop;
    this.event = node.event;
    this.securityLevel = node.securityLevel;
    this.battle = node.battle;

    this.isVisible = node.ownedByUser;
    this.isActive = node.ownedByUser;
    this.isOwned = node.ownedByUser;
    this.connections = node.connections;
  }

  draw(context, screenPosition) {
    const imageSource = {
      x: 0,
      y: 0,
      width: this.image.width / 2,
      height: this.image.height,
    };
    if (!this.isOwned) {
      imageSource.x = this.image.width / 2;
    }
    const drawX = this.center.x - (imageSource.width / 2 + screenPosition[0]);
    const drawY = this.center.y - (imageSource.height / 2 + screenPosition[1]);
    context.drawImage(this.image,
      imageSource.x, imageSource.y, imageSource.width, imageSource.height,
      drawX, drawY, imageSource.width, imageSource.height);
    context.beginPath();
    context.strokeStyle = 'red';
    context.rect(this.rect.x - screenPosition[0], this.rect.y - screenPosition[1],
      this.rect.width, this.rect.height);
    context.stroke();
  }

  containsPoint(point) {
    return (point.x >= this.rect.x && point.x < this.rect.x + this.rect.width
      && point.y >= this.rect.y && point.y < this.rect.y + this.rect.height);
  }

  reveal() {
    this.isVisible = true;
  }

  activate() {
    this.isVisible = true;
    this.isActive = true;
  }

  own() {
    this.isVisible = true;
    this.isActive = true;
    this.isOwned = true;
  }
}
