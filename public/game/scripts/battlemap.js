import { Tile, tileTypes, overlayTypes } from './tile.js';

export default class BattleMap {
  constructor(battle, canvas, images) {
    this.width = battle.width;
    this.height = battle.height;
    this.tiles = [];
    const leftPad = (canvas.width - (30 * this.width)) / 2;
    const topPad = (canvas.height - (30 * this.height)) / 2;
    battle.field.forEach((row, rowIndex) => {
      row.split('').forEach((square, colIndex) => {
        const tile = new Tile(colIndex, rowIndex, 27, 3, leftPad, topPad, images.tileOverlays);
        switch (square) {
          default:
            tile.changeType(tileTypes.NONE);
            break;
          case '#':
            tile.changeType(tileTypes.BASIC);
            break;
          case '@':
            tile.changeType(tileTypes.BASIC);
            tile.changeOverlay(overlayTypes.UPLOAD);
            break;
        }
        this.tiles.push(tile);
      });
    });
  }

  draw(context) {
    this.tiles.forEach((tile) => {
      tile.draw(context);
    });
  }

  drawOverlays(context) {
    this.tiles.forEach((tile) => {
      tile.drawOverlay(context);
    });
  }

  clearTileOverlays() {
    this.tiles.forEach((tile) => {
      tile.changeOverlay(overlayTypes.NONE);
    });
  }

  getTileAtPoint(point) {
    return this.tiles.find((tile) => tile.containsPoint(point));
  }

  getTileAtGridCoords(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return undefined;
    }
    return this.tiles[(y * this.width) + x];
  }

  static tilesAreWithinRange(tile1, tile2, range) {
    const distance = BattleMap.manhattanDistance(tile1, tile2);
    return distance > 0 && distance <= range;
  }

  static manhattanDistance(tile1, tile2) {
    return Math.abs(tile1.x - tile2.x) + Math.abs(tile1.y - tile2.y);
  }
}
