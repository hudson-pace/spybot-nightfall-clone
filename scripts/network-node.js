export default function NetworkNode(node, image) {
  this.rect = {
    x: node.coords.x,
    y: node.coords.y,
    width: image.width / 2,
    height: image.height,
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

  this.isVisible = node.ownedByUser;
  this.isActive = node.ownedByUser;
  this.isOwned = node.ownedByUser;
  this.connectedNodes = node.connectedNodes;

  this.draw = function draw(context, screenPosition) {
    const imageSource = {
      x: 0,
      y: 0,
      width: this.rect.width,
      height: this.rect.height,
    };
    if (!this.isOwned) {
      imageSource.x = this.image.width / 2;
    }
    context.drawImage(this.image,
      imageSource.x, imageSource.y, imageSource.width, imageSource.height,
      this.rect.x - screenPosition[0], this.rect.y - screenPosition[1],
      this.rect.width, this.rect.height);
    context.beginPath();
    context.strokeStyle = 'red';
    context.rect(this.rect.x - screenPosition[0], this.rect.y - screenPosition[1],
      this.rect.width, this.rect.height);
    context.stroke();
  };
  this.containsPoint = function containsPoint(point) {
    return (point.x >= this.rect.x && point.x < this.rect.x + this.rect.width
      && point.y >= this.rect.y && point.y < this.rect.y + this.rect.height);
  };
  this.reveal = function reveal() {
    this.isVisible = true;
  };
  this.activate = function activate() {
    this.isVisible = true;
    this.isActive = true;
  };
  this.own = function own() {
    this.isVisible = true;
    this.isActive = true;
    this.isOwned = true;
  };
}
