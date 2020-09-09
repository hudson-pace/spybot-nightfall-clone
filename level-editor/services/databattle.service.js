angular
  .module('mapEditorApp')
  .factory('databattleService', ['gridService', function(gridService) {
    const service = {};
    service.createNewDatabattle = (startingWidth, startingHeight, maxSize, initialTileType) => {
      const databattle = {};
      databattle.tiles = gridService.createGrid(startingWidth, startingHeight, initialTileType);
      gridService.updateTileCoordinates(databattle.tiles);
      databattle.enemies = [];

      databattle.resize = (resizeParams) => {
        gridService.resizeGrid(databattle.tiles, resizeParams, maxSize, initialTileType);
      }
      
      databattle.updateTile = (tile, newType, newItem, newProgram, newStyle) => {
        const enemyIndex = databattle.enemies.findIndex((e) => {
          let found = false;
          e.tiles.forEach((enemyTile) => {
            if (enemyTile === tile) {
              found = true;
            }
          });
          return found;
        });
        if (enemyIndex !== -1) {
          databattle.enemies[enemyIndex].tiles.forEach((enemyTile) => {
            enemyTile.type = initialTileType;
            enemyTile.item = undefined;
            enemyTile.program = undefined;
            enemyTile.style = undefined;
          });
          databattle.enemies.splice(enemyIndex, 1);
        }
        tile.type = newType;
        tile.item = newItem;
        tile.program = newProgram;
        tile.style = newStyle;
      };

      databattle.startEnemy = (name, tile, enemyTileType) => {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        const enemy = {
          name,
          tiles: [tile],
          style: {
            'border-left': `4px solid rgba(${r}, ${g}, ${b}, 1)`,
            'border-right': `4px solid rgba(${r}, ${g}, ${b}, 1)`,
            'border-top': `4px solid rgba(${r}, ${g}, ${b}, 1)`,
            'border-bottom': `4px solid rgba(${r}, ${g}, ${b}, 1)`,
          }
        }
        databattle.updateTile(tile, enemyTileType, undefined, name, { ...enemy.style });
        return enemy;
      }

      databattle.addToEnemy = (enemy, tile, previousTile, enemyTileType) => {
        databattle.updateTile(tile, enemyTileType, undefined, undefined,
          { ...enemy.style });
        enemy.tiles.push(tile);
        if (tile.x > previousTile.x) {
          tile.style['border-left'] = 'none';
          previousTile.style['border-right'] = 'none';
        } else if (tile.x < previousTile.x) {
          tile.style['border-right'] = 'none';
          previousTile.style['border-left'] = 'none';
        } else if (tile.y > previousTile.y) {
          tile.style['border-top'] = 'none';
          previousTile.style['border-bottom'] = 'none';
        } else if (tile.y < previousTile.y) {
          tile.style['border-bottom'] = 'none';
          previousTile.style['border-top'] = 'none';
        }
      }
      return databattle;
    }

    service.createDatabattleFromJson = (battleJson) => {
      const databattle = service.createNewDatabattle();
      databattle.name = battleJson.name;
      databattle.tiles = [];
      databattle.reward = battleJson.reward;

      battleJson.field.forEach((row, y) => {
        const newRow = [];
        row.split('').forEach((tile, x) => {
          if (tile === '@') {
            newRow.push({
              x,
              y,
              type: $scope.tileTypes.UPLOAD,
            });
          } else if (tile === '#') {
            newRow.push({
              x,
              y,
              type: $scope.tileTypes.BASIC,
            });
          } else {
            newRow.push({
              x,
              y,
              type: $scope.tileTypes.NONE,
            });
          }
        });
        databattle.tiles.push(newRow);
      });

      battleJson.enemies.forEach((enemy) => {
        let previousTile = databattle.tiles[enemy.coords[0].y][enemy.coords[0].x]
        const newEnemy = databattle.startEnemy(enemy.name, previousTile);
        enemy.coords.splice(1).forEach((c) => {
          const tile = databattle.tiles[c.y][c.x]
          databattle.addToEnemy(newEnemy, tile, previousTile)
          previousTile = tile;
        });
        enemies.push(newEnemy);
      });

      battleJson.items.forEach((item) => {
        const tile = databattle.tiles[item.coords.y][item.coords.x];
        tile.type = databattle.tileTypes.ITEM;
        tile.item = {
          name: item.type,
          amount: item.amount,
        }
      });
    }

    return service;
  }]);