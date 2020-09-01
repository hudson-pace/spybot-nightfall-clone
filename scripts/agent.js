import { tileTypes, overlayTypes, Tile } from './tile.js';
import BattleMap from './battlemap.js';

export default function Agent(agent, startingTile, image, agentDoneImage,
  context, map, executeCommandCallback) {
  startingTile.changeType(tileTypes.OCCUPIED);
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
  this.turnIsOver = false;
  this.commands = [];

  $.getJSON('../assets/commands.json', (data) => {
    this.commandData = data;
    console.log('commands loaded');
    agent.commands.forEach((command) => {
      this.commands.push(data.find((com) => com.name === command));
      [this.selectedCommand] = this.commands;
    });
  });

  function createConnector(tile1, tile2, coords) {
    const connector = {};
    if (tile1.x !== tile2.x) {
      connector.width = tile1.gap;
      connector.height = Math.floor(tile1.size / 2);
      connector.y = coords.y + Math.floor(connector.height / 2);
      if (tile1.x > tile2.x) {
        connector.x = coords.x - tile1.gap;
      } else {
        connector.x = coords.x + tile1.size;
      }
    } else {
      connector.width = Math.floor(tile1.size / 2);
      connector.height = tile1.gap;
      connector.x = coords.x + Math.floor((connector.width / 2));
      if (tile1.y > tile2.y) {
        connector.y = coords.y - tile1.gap;
      } else {
        connector.y = coords.y + tile1.size;
      }
    }
    return connector;
  }

  let selectedDisplay = true;
  this.draw = function draw() {
    this.tiles.forEach((tile, index) => {
      const coords = tile.tile.getDrawingCoords();
      if (tile.tile === this.head) {
        context.clearRect(coords.x - 2, coords.y - 2, imageSource.size + 4, imageSource.size + 4);
        context.drawImage(image, imageSource.x, imageSource.y, imageSource.size, imageSource.size,
          coords.x, coords.y, imageSource.size, imageSource.size);
        const pixelData = context.getImageData(coords.x, coords.y, 1, 1).data;
        context.fillStyle = `rgba(${pixelData.join(',')})`;
      } else if (index > 0) {
        const connector = createConnector(tile.tile, tile.nextTile, coords);
        context.fillRect(coords.x, coords.y, imageSource.size, imageSource.size);
        context.fillRect(connector.x, connector.y, connector.width, connector.height);
      }

      if (tile.tile.overlay !== overlayTypes.UPLOAD) {
        tile.tile.drawOverlays(context);
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

    if (this.turnIsOver) {
      const coords = this.head.getDrawingCoords();
      context.drawImage(agentDoneImage, 0, 0, imageSource.size, imageSource.size,
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
    this.showMoveOverlays();
  };
  this.deselect = function deselect() {
    this.selected = false;
    clearInterval(flashSelectedDisplay);
    this.draw();
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
    this.showMoveOverlays();
  };

  this.executeCommand = function executeCommand(tile) {
    map.clearTileOverlays();
    executeCommandCallback(tile, this.selectedCommand);
    this.turnIsOver = true;
  };
  this.containsTile = function containsTile(tile) {
    return !!this.tiles.find((t) => t.tile === tile);
  };

  this.showMoveOverlays = function showMoveOverlays() {
    map.clearTileOverlays();
    if (!this.turnIsOver) {
      if (this.movesRemaining > 0) {
        this.highlightValidMoves(this.movesRemaining, 'move');
      } else {
        this.highlightValidMoves(this.selectedCommand.range, 'attack');
      }
    }
  };
  this.highlightValidMoves = function highlightValidMoves(searchRadius, type) {
    const visitedTiles = [];
    const explorationQueue = [];
    explorationQueue.push([this.head, 0]);
    while (explorationQueue.length > 0) {
      const tile = explorationQueue.splice(0, 1)[0];
      if (tile[1] < searchRadius) {
        let nextTile = map.getTileAtGridCoords(tile[0].x - 1, tile[0].y);
        if (nextTile && (nextTile.type === tileTypes.BASIC
          || (nextTile.type === tileTypes.OCCUPIED && this.containsTile(nextTile))
          || type === 'attack')
          && !visitedTiles.find((t) => t === nextTile)) {
          explorationQueue.push([nextTile, tile[1] + 1]);
          visitedTiles.push(nextTile);
        }
        nextTile = map.getTileAtGridCoords(tile[0].x + 1, tile[0].y);
        if (nextTile && (nextTile.type === tileTypes.BASIC
          || (nextTile.type === tileTypes.OCCUPIED && this.containsTile(nextTile))
          || type === 'attack')
        && !visitedTiles.find((t) => t === nextTile)) {
          explorationQueue.push([nextTile, tile[1] + 1]);
          visitedTiles.push(nextTile);
        }
        nextTile = map.getTileAtGridCoords(tile[0].x, tile[0].y - 1);
        if (nextTile && (nextTile.type === tileTypes.BASIC
          || (nextTile.type === tileTypes.OCCUPIED && this.containsTile(nextTile))
          || type === 'attack')
        && !visitedTiles.find((t) => t === nextTile)) {
          explorationQueue.push([nextTile, tile[1] + 1]);
          visitedTiles.push(nextTile);
        }
        nextTile = map.getTileAtGridCoords(tile[0].x, tile[0].y + 1);
        if (nextTile && (nextTile.type === tileTypes.BASIC
          || (nextTile.type === tileTypes.OCCUPIED && this.containsTile(nextTile))
          || type === 'attack')
        && !visitedTiles.find((t) => t === nextTile)) {
          explorationQueue.push([nextTile, tile[1] + 1]);
          visitedTiles.push(nextTile);
        }
      }
    }
    visitedTiles.forEach((t) => {
      if (type === 'move') {
        if (t === map.getTileAtGridCoords(this.head.x - 1, this.head.y)) {
          t.changeOverlay(overlayTypes.MOVE_LEFT);
        } else if (t === map.getTileAtGridCoords(this.head.x + 1, this.head.y)) {
          t.changeOverlay(overlayTypes.MOVE_RIGHT);
        } else if (t === map.getTileAtGridCoords(this.head.x, this.head.y - 1)) {
          t.changeOverlay(overlayTypes.MOVE_UP);
        } else if (t === map.getTileAtGridCoords(this.head.x, this.head.y + 1)) {
          t.changeOverlay(overlayTypes.MOVE_DOWN);
        } else {
          t.changeOverlay(overlayTypes.VALID_MOVE);
        }
      } else if (type === 'attack') {
        t.changeOverlay(overlayTypes.ATTACK);
      }
    });
  };
  this.resetTurn = function resetTurn() {
    this.turnIsOver = false;
    this.movesRemaining = agent.moves;
  };

  this.chooseTile = function chooseTiles(tile) {
    if (this.movesRemaining > 0) {
      if (BattleMap.tilesAreWithinRange(tile, this.head, 1)) {
        if (tile.type === tileTypes.BASIC
          || (tile.type === tileTypes.OCCUPIED && this.containsTile(tile))) {
          this.move(tile);
        }
      }
    } else if (BattleMap.tilesAreWithinRange(tile, this.head, this.selectedCommand.range)) {
      this.executeCommand(tile);
    }
  };

  this.chooseCommand = function chooseCommand(newCommand) {
    const commandIndex = this.commands.findIndex((command) => command.name === newCommand.name);
    if (commandIndex !== -1) {
      this.selectedCommand = this.commands[commandIndex];
      this.movesRemaining = 0;
      this.showMoveOverlays();
    }
  };

  this.hit = function hit() {
    const tile = this.tiles.splice(this.tiles.length - 1, 1);
    tile[0].tile.changeType(tileTypes.BASIC);
  };
}
