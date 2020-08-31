import { tileTypes } from './tile.js';

export default function Agent(agent, startingTile, image, context) {
  this.head = startingTile;
  this.tail = startingTile;
  this.tiles = [startingTile];
  this.selected = false;
  this.movesRemaining = agent.moves;
  const { maxSize } = agent;
  const imageSource = {
    x: (agent.imgSource % 8) * 27,
    y: Math.floor(agent.imgSource / 8) * 27,
    size: 27,
  };

  let selectedDisplay = true;
  this.draw = function draw() {
    this.tiles.forEach((tile) => {
      const coords = tile.getDrawingCoords();
      if (tile === this.head) {
        if (this.selected) {
          context.clearRect(coords.x - 1, coords.y - 1, imageSource.size + 2, imageSource.size + 2);
          if (selectedDisplay) {
            context.fillStyle = 'white';
            context.fillRect(coords.x - 1, coords.y - 1,
              imageSource.size + 2, imageSource.size + 2);
          }
        }
        context.drawImage(image, imageSource.x, imageSource.y, imageSource.size, imageSource.size,
          coords.x, coords.y, imageSource.size, imageSource.size);
      } else {
        context.drawImage(image, imageSource.x, imageSource.y, 1, 1,
          coords.x, coords.y, imageSource.size, imageSource.size);
      }
    });
  };

  function toggleSelectedDisplay() {
    selectedDisplay = !selectedDisplay;
    this.draw();
  }

  let flashSelectedDisplay;
  this.select = function select() {
    console.log('selected');
    this.selected = true;
    selectedDisplay = true;
    flashSelectedDisplay = setInterval(toggleSelectedDisplay.bind(this), 600);
  };
  this.deselect = function deselect() {
    this.selected = false;
    clearInterval(flashSelectedDisplay);
  };
  this.move = function move(newTile) {
    newTile.changeType(tileTypes.OCCUPIED);
    this.head = newTile;
    this.tiles.unshift(newTile);
    if (this.tiles.length > maxSize) {
      const oldTile = this.tiles.pop();
      oldTile.changeType(tileTypes.BASIC);
    }
    this.movesRemaining -= 1;
  };
}
