import { tileTypes, overlayTypes, Tile } from './tile.js';
import BattleMap from './battlemap.js';

export default function Agent(agent, coordList, assets, context, map) {
  const startingTile = map.getTileAtGridCoords(coordList[0].x, coordList[0].y);
  startingTile.changeType(tileTypes.OCCUPIED);
  this.head = startingTile;
  this.tiles = [{
    tile: startingTile,
  }];

  this.selected = false;
  this.speed = agent.speed;
  this.movesRemaining = agent.speed;
  this.maxSize = agent.maxSize;
  this.name = agent.name;
  this.desc = agent.desc;
  this.imgSource = agent.imgSource;
  const imageSource = {
    x: (agent.imgSource % 8) * 27,
    y: Math.floor(agent.imgSource / 8) * 27,
    size: 27,
  };
  this.turnIsOver = false;
  this.commands = [];
  agent.commands.forEach((command) => {
    this.commands.push(assets.commands.find((com) => com.name === command));
    [this.selectedCommand] = this.commands;
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
        context.drawImage(assets.images.agents, imageSource.x, imageSource.y, imageSource.size,
          imageSource.size, coords.x, coords.y, imageSource.size, imageSource.size);
        const pixelData = context.getImageData(coords.x, coords.y, 1, 1).data;
        context.fillStyle = `rgba(${pixelData.join(',')})`;
      } else if (index > 0) {
        const connector = createConnector(tile.tile, tile.nextTile, coords);
        context.fillRect(coords.x, coords.y, imageSource.size, imageSource.size);
        context.fillRect(connector.x, connector.y, connector.width, connector.height);
      }

      if (tile.tile.overlay !== overlayTypes.UPLOAD) {
        tile.tile.drawOverlay(context);
      }
    });
    if (this.selected) {
      const coords = this.head.getDrawingCoords();
      if (selectedDisplay) {
        context.fillStyle = 'white';
        context.fillRect(coords.x - 2, coords.y - 2,
          imageSource.size + 4, imageSource.size + 4);
      }
      context.drawImage(assets.images.agents, imageSource.x, imageSource.y, imageSource.size,
        imageSource.size, coords.x, coords.y, imageSource.size, imageSource.size);
    }

    if (this.turnIsOver) {
      const coords = this.head.getDrawingCoords();
      context.drawImage(assets.images.agentDone, 0, 0, imageSource.size, imageSource.size,
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
    flashSelectedDisplay = setInterval(toggleSelectedDisplay.bind(this), 700);
    this.showMoveOverlays();
  };
  this.deselect = function deselect() {
    this.selected = false;
    clearInterval(flashSelectedDisplay);
    map.clearTileOverlays();
    this.draw();
  };
  this.move = function move(newTile) {
    if (this.movesRemaining > 0 && BattleMap.tilesAreWithinRange(newTile, this.head, 1)
      && this.isTileValid(newTile, 'move', [])) {
      const tileIndex = this.tiles.findIndex((tile) => tile.tile === newTile);
      if (tileIndex === -1) {
        newTile.changeType(tileTypes.OCCUPIED);
        this.tiles[0].nextTile = newTile;
        this.tiles.unshift({
          tile: newTile,
        });
        if (this.tiles.length > this.maxSize) {
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
    }
  };

  this.executeCommand = function executeCommand() {
    map.clearTileOverlays();
    this.turnIsOver = true;
  };
  this.containsTile = function containsTile(tile) {
    return !!this.tiles.find((t) => t.tile === tile);
  };

  this.showMoveOverlays = function showMoveOverlays() {
    map.clearTileOverlays();
    if (!this.turnIsOver) {
      if (this.movesRemaining > 0) {
        this.highlightTiles(this.getValidMoves(this.movesRemaining, 'move'), 'move');
      } else {
        this.highlightTiles(
          this.getValidMoves(this.selectedCommand.range, this.selectedCommand.type),
          this.selectedCommand.type,
        );
      }
    }
  };
  this.showAttack = function showAttack(targetTile) {
    map.clearTileOverlays();
    this.highlightTiles([targetTile], this.selectedCommand.type);
  };
  this.isTileValid = function isTileValid(tile, type, visitedTiles) {
    return tile && (tile.type === tileTypes.BASIC || type !== 'move'
      || (tile.type === tileTypes.OCCUPIED && this.containsTile(tile)))
      && !visitedTiles.find((t) => t === tile);
  };
  this.getValidAdjacentTiles = function getValidAdjacentTiles(tile, type, visitedTiles) {
    const validAdjacentTiles = [];
    let nextTile = map.getTileAtGridCoords(tile.x - 1, tile.y);
    if (this.isTileValid(nextTile, type, visitedTiles)) {
      validAdjacentTiles.push(nextTile);
    }
    nextTile = map.getTileAtGridCoords(tile.x + 1, tile.y);
    if (this.isTileValid(nextTile, type, visitedTiles)) {
      validAdjacentTiles.push(nextTile);
    }
    nextTile = map.getTileAtGridCoords(tile.x, tile.y - 1);
    if (this.isTileValid(nextTile, type, visitedTiles)) {
      validAdjacentTiles.push(nextTile);
    }
    nextTile = map.getTileAtGridCoords(tile.x, tile.y + 1);
    if (this.isTileValid(nextTile, type, visitedTiles)) {
      validAdjacentTiles.push(nextTile);
    }
    return validAdjacentTiles;
  };

  this.addToTail = function addToTail(tile) {
    // If tile is specified, add it to the tail. Otherwise, add a random tile to the tail.
    if (this.tiles.length < this.maxSize) {
      console.log('valid');
      for (let i = this.tiles.length - 1; i >= 0; i -= 1) {
        const emptyAdjacentTiles = this.getValidAdjacentTiles(this.tiles[i].tile, 'move', [])
          .filter((t) => t.type !== tileTypes.OCCUPIED);
        console.log('adding tile');
        if (emptyAdjacentTiles.find((t) => t === tile)) {
          tile.changeType(tileTypes.OCCUPIED);
          this.tiles.push({
            tile,
            nextTile: this.tiles[i].tile,
          });
        } else if (!tile && emptyAdjacentTiles.length > 0) {
          const randomTile = emptyAdjacentTiles[
            Math.floor(Math.random() * emptyAdjacentTiles.length)
          ];
          randomTile.changeType(tileTypes.OCCUPIED);
          this.tiles.push({
            tile: randomTile,
            nextTile: this.tiles[i].tile,
          });
          break;
        }
      }
    }
  };
  coordList.slice(1).forEach((coord) => {
    const tile = map.getTileAtGridCoords(coord.x, coord.y);
    this.addToTail(tile);
  });

  this.getValidMoves = function getValidMoves(searchRadius, type) {
    const visitedTiles = [this.head];
    const explorationQueue = [[this.head, 0]];
    while (explorationQueue.length > 0) {
      const tile = explorationQueue.splice(0, 1)[0];
      if (tile[1] < searchRadius) {
        this.getValidAdjacentTiles(tile[0], type, visitedTiles).forEach((nextTile) => {
          explorationQueue.push([nextTile, tile[1] + 1]);
          visitedTiles.push(nextTile);
        });
      }
    }
    return visitedTiles;
  };
  this.getShortestPath = function getShortestPath(tile1, tile2, landOnTile) {
    // If landOnTile is true, find a path from tile1 to tile2. Otherwise, find a path
    // to a tile which is adjacent to tile2.
    const visitedTiles = [tile1];
    const explorationQueue = [[tile1]];
    while (explorationQueue.length > 0) {
      const path = explorationQueue.splice(0, 1)[0];
      if ((!landOnTile && BattleMap.tilesAreWithinRange(path[0], tile2, 1))
        || (landOnTile && path[0] === tile2)) {
        return path;
      }
      let found = false;
      this.getValidAdjacentTiles(path[path.length - 1], 'move', visitedTiles).forEach((nextTile) => {
        if ((!landOnTile && BattleMap.tilesAreWithinRange(nextTile, tile2, 1))
          || (landOnTile && nextTile === tile2)) {
          found = true;
        }
        explorationQueue.push([...path, nextTile]);
        visitedTiles.push(nextTile);
      });
      if (found) {
        const shortestPath = explorationQueue.find((p) => {
          if (!landOnTile && BattleMap.tilesAreWithinRange(p[p.length - 1], tile2, 1)) {
            return true;
          } if (landOnTile && p[p.length - 1] === tile2) {
            return true;
          }
          return false;
        });
        shortestPath.splice(0, 1);
        return shortestPath;
      }
    }
    return undefined;
  };
  this.highlightTiles = function highlightTiles(tiles, type) {
    tiles.forEach((t) => {
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
      } else if (type === 'boost') {
        t.changeOverlay(overlayTypes.BOOST);
      } else if (type === 'terrain') {
        if (this.selectedCommand.damage < 0) {
          t.changeOverlay(overlayTypes.TERRAIN_ADD);
        } else {
          t.changeOverlay(overlayTypes.TERRAIN_REMOVE);
        }
      }
    });
  };

  this.resetTurn = function resetTurn() {
    this.turnIsOver = false;
    this.movesRemaining = this.speed;
  };

  this.chooseCommand = function chooseCommand(newCommandName) {
    if (this.selected) {
      const commandIndex = this.commands.findIndex((command) => command.name === newCommandName);
      if (commandIndex !== -1) {
        this.selectedCommand = this.commands[commandIndex];
        this.movesRemaining = 0;
        this.showMoveOverlays();
      }
    }
  };

  this.hit = function hit() {
    const tile = this.tiles.splice(this.tiles.length - 1, 1);
    tile[0].tile.changeType(tileTypes.BASIC);
  };

  this.boostStat = function boostStat(stat, amount) {
    switch (stat) {
      default:
        break;
      case 'speed':
        this.speed += amount;
        if (this.movesRemaining === this.speed - amount) {
          this.movesRemaining = this.speed;
        }
        break;
      case 'maxSize':
        this.maxSize += amount;
        break;
    }
  };

  this.expandTileRadius = function expandTileRadius(tileList, expansionRadius) {
    const expandedTileList = [...tileList];
    tileList.forEach((tile) => {
      for (let i = -1 * expansionRadius; i <= expansionRadius; i += 1) {
        for (let j = -1 * expansionRadius; j <= expansionRadius; j += 1) {
          if (Math.abs(i) + Math.abs(j) <= expansionRadius) {
            const nextTile = map.getTileAtGridCoords(tile.x + i, tile.y + j);
            if (nextTile
              && !expandedTileList.find((t) => t.x === nextTile.x && t.y === nextTile.y)) {
              expandedTileList.push(nextTile);
            }
          }
        }
      }
    });
    return expandedTileList;
  };

  this.calculateTurn = function calculateTurn(enemyAgents) {
    const possibleMoves = this.getValidMoves(this.movesRemaining, 'move');
    const possibleTilesToAttack = this.expandTileRadius(possibleMoves, this.selectedCommand.range);
    const enemyTilesWithinRange = possibleTilesToAttack.filter((tile) => {
      let occupiedByEnemy = false;
      if (tile.type === tileTypes.OCCUPIED) {
        enemyAgents.forEach((enemy) => {
          if (enemy.containsTile(tile)) {
            occupiedByEnemy = true;
          }
        });
      }
      return occupiedByEnemy;
    });

    // Find all enemies which could be attacked this turn.
    const possibleTargets = [];
    enemyAgents.forEach((enemy) => {
      let withinRange = false;
      enemyTilesWithinRange.forEach((enemyTile) => {
        if (enemy.containsTile(enemyTile)) {
          withinRange = true;
        }
      });
      if (withinRange) {
        possibleTargets.push(enemy);
      }
    });

    let path;
    let targetTile;
    if (possibleTargets.length > 0) {
    // First try all enemies who can be defeated this turn.
      let targets = possibleTargets.filter((enemy) => enemy.tiles.length
        <= this.selectedCommand.damage);
      if (targets.length === 0) {
        // Then try the shortest enemies within range.
        let shortestLength = Infinity;
        possibleTargets.forEach((enemy) => {
          if (enemy.tiles.length < shortestLength) {
            shortestLength = enemy.tiles.length;
          }
        });
        targets = possibleTargets.filter((enemy) => enemy.tiles.length === shortestLength);
      }
      const target = targets[Math.floor(targets.length * Math.random())];
      // Find shortest path to enemy.
      target.tiles.forEach((tile) => {
        const newPath = this.getShortestPath(this.head, tile.tile);
        if (!path || (newPath && newPath.length < path.length)) {
          path = newPath;
          targetTile = tile.tile;
        }
      });
    } else {
      // Then move towards the nearest enemy (by path length).
      enemyAgents.forEach((enemy) => {
        enemy.tiles.forEach((tile) => {
          const newPath = this.getShortestPath(this.head, tile.tile);
          if (!path || (newPath && newPath.length < path.length)) {
            path = newPath;
            targetTile = tile.tile;
          }
        });
      });
    }

    if (!path) {
      // If all else fails, move towards the reachable tile nearest
      // the nearest enemy (by manhattan distance)
      let nearestEnemyTile;
      let shortestDistance = Infinity;
      enemyAgents.forEach((enemy) => {
        enemy.tiles.forEach((tile) => {
          const distance = BattleMap.manhattanDistance(tile.tile, this.head);
          if (!nearestEnemyTile || distance < shortestDistance) {
            shortestDistance = distance;
            nearestEnemyTile = tile.tile;
          }
        });
      });
      let bestReachableTile;
      shortestDistance = Infinity;
      possibleMoves.forEach((tile) => {
        const distance = BattleMap.manhattanDistance(tile, nearestEnemyTile);
        if (!bestReachableTile || distance < shortestDistance) {
          shortestDistance = distance;
          bestReachableTile = tile;
        }
      });
      path = this.getShortestPath(this.head, bestReachableTile, true);
      targetTile = undefined;
    }

    if (path && path.length > this.movesRemaining) {
      // If target is out of range, just get as close as possible.
      if (path.length > this.movesRemaining + this.selectedCommand.range - 1) {
        targetTile = undefined; // path[this.movesRemaining + this.selectedCommand.range - 1];
      }
      path = path.slice(0, this.movesRemaining);
    }
    console.log(targetTile);
    return {
      moves: path,
      targetTile,
    };
  };
}
