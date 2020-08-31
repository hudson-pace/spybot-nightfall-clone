import { tileTypes } from './tile.js';

export default function Agent(agent, startingTile, image, context) {
  this.head = startingTile;
  this.tail = startingTile;
  this.tiles = [{
    tile: startingTile,
  }];
  this.selected = false;
  this.movesRemaining = agent.moves;
  this.name = agent.name;
  const { maxSize } = agent;
  const imageSource = {
    x: (agent.imgSource % 8) * 27,
    y: Math.floor(agent.imgSource / 8) * 27,
    size: 27,
  };

  let selectedDisplay = true;
  this.draw = function draw() {
    this.tiles.forEach((tile, index) => {
      const coords = tile.tile.getDrawingCoords();
      if (tile.tile === this.head) {
        if (this.selected) {
          context.clearRect(coords.x - 2, coords.y - 2, imageSource.size + 4, imageSource.size + 4);
        }
        context.drawImage(image, imageSource.x, imageSource.y, imageSource.size, imageSource.size,
          coords.x, coords.y, imageSource.size, imageSource.size);
        const pixelData = context.getImageData(coords.x, coords.y, 1, 1).data;
        context.fillStyle = `rgba(${pixelData.join(',')})`;
      } else if (index > 0) {
        const canvasRect = tile.tile.getCanvasRect();
        let connector;
        if (tile.nextTile.x > tile.tile.x) {
          connector = {
            width: tile.tile.gap,
            height: tile.tile.size / 2,
            x: canvasRect.x + canvasRect.width,
            y: canvasRect.y + Math.floor((canvasRect.height - (tile.tile.size / 2)) / 2),
          };
        } else if (tile.nextTile.x < tile.tile.x) {
          connector = {
            width: tile.tile.gap,
            height: tile.tile.size / 2,
            x: canvasRect.x - tile.tile.gap,
            y: canvasRect.y + Math.floor((canvasRect.height - (tile.tile.size / 2)) / 2),
          };
        } else if (tile.nextTile.y > tile.tile.y) {
          connector = {
            width: tile.tile.size / 2,
            height: tile.tile.gap,
            x: canvasRect.x + Math.floor((canvasRect.width - (tile.tile.size / 2)) / 2),
            y: canvasRect.y + canvasRect.width,
          };
        } else if (tile.nextTile.y < tile.tile.y) {
          connector = {
            width: tile.tile.size / 2,
            height: tile.tile.gap,
            x: canvasRect.x + Math.floor((canvasRect.width - (tile.tile.size / 2)) / 2),
            y: canvasRect.y - tile.tile.gap,
          };
        }
        context.fillRect(coords.x, coords.y, imageSource.size, imageSource.size);
        context.fillRect(connector.x, connector.y, connector.width, connector.height);
      }
    });
    if (this.selected) {
      const coords = this.head.getDrawingCoords();
      if (selectedDisplay) {
        context.fillStyle = 'white';
        context.fillRect(coords.x - 2, coords.y - 2,
          imageSource.size + 4, imageSource.size + 4);
      }
      context.drawImage(image, imageSource.x, imageSource.y, imageSource.size, imageSource.size,
        coords.x, coords.y, imageSource.size, imageSource.size);
    }
  };

  function toggleSelectedDisplay() {
    selectedDisplay = !selectedDisplay;
    this.draw();
  }

  let flashSelectedDisplay;
  this.select = function select() {
    this.selected = true;
    selectedDisplay = true;
    flashSelectedDisplay = setInterval(toggleSelectedDisplay.bind(this), 600);
  };
  this.deselect = function deselect() {
    this.selected = false;
    clearInterval(flashSelectedDisplay);
  };
  this.move = function move(newTile) {
    const tileIndex = this.tiles.findIndex((tile) => tile.tile === newTile);
    if (tileIndex === -1) {
      newTile.changeType(tileTypes.OCCUPIED);
      this.tiles[0].nextTile = newTile;
      this.tiles.unshift({
        tile: newTile,
      });
      if (this.tiles.length > maxSize) {
        const oldTile = this.tiles.pop();
        oldTile.tile.changeType(tileTypes.BASIC);
      }
    } else {
      this.tiles[0].nextTile = newTile;
      this.tiles.splice(tileIndex, 1);
      this.tiles.unshift({
        tile: newTile,
      });
    }
    this.movesRemaining -= 1;
    this.head = newTile;
  };
  this.containsTile = function containsTile(tile) {
    return !!this.tiles.find((t) => t.tile === tile);
  };
}
