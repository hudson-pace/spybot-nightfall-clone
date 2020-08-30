export const tileTypes = {
  NONE: 'none',
  BASIC: 'basic',
  UPLOAD: 'upload',
};
export function Tile(x, y, size, gap, leftPad, topPad) {
  // These are the coordinates where the tile should actually be drawn.
  this.x = x;
  this.y = y;
  const canvasX = leftPad + (x * (size + gap));
  const canvasY = topPad + (y * (size + gap));

  this.draw = function draw(context) {
    switch (this.type) {
      default:
        context.fillStyle = 'black';
        break;
      case tileTypes.BASIC:
        context.fillStyle = 'gray';
        break;
      case tileTypes.UPLOAD:
        context.fillStyle = 'white';
        break;
    }
    context.fillRect(canvasX, canvasY, size, size);
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
}
