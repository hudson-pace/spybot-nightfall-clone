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
};

export function Tile(x, y, size, gap, leftPad, topPad, image) {
  // These are the coordinates where the tile should actually be drawn.
  this.x = x;
  this.y = y;
  this.gap = gap;
  this.size = size;
  const canvasX = leftPad + (x * (size + gap));
  const canvasY = topPad + (y * (size + gap));
  this.overlay = overlayTypes.NONE;
  this.type = tileTypes.NONE;

  this.getCanvasRect = function getCanvasRect() {
    return {
      x: canvasX,
      y: canvasY,
      width: size,
      height: size,
    };
  };

  this.draw = function draw(context) {
    switch (this.type) {
      default:
        context.fillStyle = 'black';
        break;
      case tileTypes.BASIC:
        context.fillStyle = 'gray';
        break;
    }
    context.fillRect(canvasX, canvasY, size, size);
    switch (this.overlay) {
      default:
        break;
      case overlayTypes.VALID_MOVE:
        context.drawImage(image, 1 * size, 1 * size, size, size, canvasX, canvasY, size, size);
        break;
      case overlayTypes.MOVE_LEFT:
        context.drawImage(image, 0 * size, 2 * size, size, size, canvasX, canvasY, size, size);
        break;
      case overlayTypes.MOVE_RIGHT:
        context.drawImage(image, 2 * size, 2 * size, size, size, canvasX, canvasY, size, size);
        break;
      case overlayTypes.MOVE_UP:
        context.drawImage(image, 1 * size, 2 * size, size, size, canvasX, canvasY, size, size);
        break;
      case overlayTypes.MOVE_DOWN:
        context.drawImage(image, 2 * size, 1 * size, size, size, canvasX, canvasY, size, size);
        break;
      case overlayTypes.UPLOAD:
        context.drawImage(image, 0 * size, 1 * size, size, size, canvasX, canvasY, size, size);
        break;
    }
  };
  this.containsPoint = function containsPoint(point) {
    return (point.x > canvasX && point.x < canvasX + size
      && point.y > canvasY && point.y < canvasY + size);
  };
  this.getDrawingCoords = function getDrawingCoords() {
    return { x: canvasX, y: canvasY };
  };
  this.changeType = function changeType(newType) {
    this.type = newType;
  };
  this.changeOverlay = function changeOverlay(newOverlay) {
    this.overlay = newOverlay;
  };
}
