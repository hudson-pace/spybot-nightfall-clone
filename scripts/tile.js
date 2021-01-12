export const tileTypes = {
  NONE: 'none',
  BASIC: 'basic',
  UPLOAD: 'upload',
  OCCUPIED: 'occupied',
};
export const overlayTypes = {
  NONE: 'none',
  VALID_MOVE: 'valid move',
  MOVE_LEFT: 'move left',
  MOVE_RIGHT: 'move right',
  MOVE_UP: 'move up',
  MOVE_DOWN: 'move down',
  UPLOAD: 'upload',
  ATTACK: 'attack',
  BOOST: 'boost',
  TERRAIN_ADD: 'terrainAdd',
  TERRAIN_REMOVE: 'terrainRemove',
};

export class Tile {
  constructor(x, y, size, gap, leftPad, topPad, image) {
    this.x = x;
    this.y = y;
    this.gap = gap;
    this.size = size;
    this.image = image;
    // These are the coordinates where the tile should actually be drawn.
    this.canvasX = leftPad + (x * (size + gap));
    this.canvasY = topPad + (y * (size + gap));
    this.overlay = overlayTypes.NONE;
    this.type = tileTypes.NONE;
  }

  getCanvasRect() {
    return {
      x: this.canvasX,
      y: this.canvasY,
      width: this.size,
      height: this.size,
    };
  }

  drawOverlay(context) {
    switch (this.overlay) {
      default:
        break;
      case overlayTypes.VALID_MOVE:
        context.drawImage(this.image, 1 * this.size, 1 * this.size, this.size, this.size,
          this.canvasX, this.canvasY, this.size, this.size);
        break;
      case overlayTypes.MOVE_LEFT:
        context.drawImage(this.image, 0, 2 * this.size, this.size, this.size, this.canvasX,
          this.canvasY, this.size, this.size);
        break;
      case overlayTypes.MOVE_RIGHT:
        context.drawImage(this.image, 2 * this.size, 2 * this.size, this.size, this.size,
          this.canvasX, this.canvasY, this.size, this.size);
        break;
      case overlayTypes.MOVE_UP:
        context.drawImage(this.image, 1 * this.size, 2 * this.size, this.size, this.size,
          this.canvasX, this.canvasY, this.size, this.size);
        break;
      case overlayTypes.MOVE_DOWN:
        context.drawImage(this.image, 2 * this.size, 1 * this.size, this.size, this.size,
          this.canvasX, this.canvasY, this.size, this.size);
        break;
      case overlayTypes.UPLOAD:
        context.drawImage(this.image, 0 * this.size, 1 * this.size, this.size, this.size,
          this.canvasX, this.canvasY, this.size, this.size);
        break;
      case overlayTypes.TERRAIN_REMOVE:
      case overlayTypes.ATTACK:
        context.drawImage(this.image, 1 * this.size, 0, this.size, this.size, this.canvasX,
          this.canvasY, this.size, this.size);
        break;
      case overlayTypes.BOOST:
        context.drawImage(this.image, 2 * this.size, 0, this.size, this.size, this.canvasX,
          this.canvasY, this.size, this.size);
        break;
      case overlayTypes.TERRAIN_ADD:
        context.drawImage(this.image, 0, 0, this.size, this.size, this.canvasX, this.canvasY,
          this.size, this.size);
        break;
    }
  }

  draw(context) {
    switch (this.type) {
      default:
        context.fillStyle = 'black';
        break;
      case tileTypes.BASIC:
        context.fillStyle = 'gray';
        break;
    }
    context.fillRect(this.canvasX, this.canvasY, this.size, this.size);
  }

  containsPoint(point) {
    return (point.x > this.canvasX && point.x < this.canvasX + this.size
      && point.y > this.canvasY && point.y < this.canvasY + this.size);
  }

  getDrawingCoords() {
    return { x: this.canvasX, y: this.canvasY };
  }

  changeType(newType) {
    this.type = newType;
  }

  changeOverlay(newOverlay) {
    this.overlay = newOverlay;
  }
}
