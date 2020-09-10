angular
  .module('mapEditorApp')
  .factory('databattleService', ['gridService', function(gridService) {
    const service = {};
    service.tileTypes = {
      NONE: 'none',
      BASIC: 'basic',
      UPLOAD: 'upload',
      ENEMY: 'enemy',
      ITEM: 'item',
    };

    service.createNewDatabattle = (startingWidth, startingHeight, maxSize) => {
      const databattle = {};
      databattle.tiles = gridService.createGrid(startingWidth, startingHeight, service.tileTypes.NONE);
      gridService.updateTileCoordinates(databattle.tiles);
      databattle.enemies = [];

      databattle.resize = (resizeParams) => {
        gridService.resizeGrid(databattle.tiles, resizeParams, maxSize, service.tileTypes.NONE);
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
            enemyTile.type = service.tileTypes.NONE;
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

      databattle.startEnemy = (name, tile) => {
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
        databattle.updateTile(tile, service.tileTypes.ENEMY, undefined, name, { ...enemy.style });
        return enemy;
      }

      databattle.addToEnemy = (enemy, tile, previousTile) => {
        databattle.updateTile(tile, service.tileTypes.ENEMY, undefined, undefined,
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

    service.createDatabattleFromJson = (battleInput) => {
      const battleJson = JSON.parse(battleInput);
      const databattle = service.createNewDatabattle(10, 10, 99);
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
              type: service.tileTypes.UPLOAD,
            });
          } else if (tile === '#') {
            newRow.push({
              x,
              y,
              type: service.tileTypes.BASIC,
            });
          } else {
            newRow.push({
              x,
              y,
              type: service.tileTypes.NONE,
            });
          }
        });
        databattle.tiles.push(newRow);
      });

      databattle.enemies = [];
      battleJson.enemies.forEach((enemy) => {
        let previousTile = databattle.tiles[enemy.coords[0].y][enemy.coords[0].x]
        const newEnemy = databattle.startEnemy(enemy.name, previousTile);
        enemy.coords.splice(1).forEach((c) => {
          const tile = databattle.tiles[c.y][c.x]
          databattle.addToEnemy(newEnemy, tile, previousTile)
          previousTile = tile;
        });
        databattle.enemies.push(newEnemy);
      });

      battleJson.items.forEach((item) => {
        const tile = databattle.tiles[item.coords.y][item.coords.x];
        tile.type = service.tileTypes.ITEM;
        tile.item = {
          name: item.type,
          amount: item.amount,
        }
      });
      return databattle;
    }

    service.getJsonFromDatabattle = (databattle) => {
      const battle = {};
      battle.name = databattle.name;
      battle.height = databattle.tiles.length;
      battle.width = databattle.tiles[0].length;
      battle.reward = parseInt(databattle.reward, 10);
      battle.field = [];
      battle.enemies = [];
      battle.items = [];
      databattle.tiles.forEach((row, y) => {
        let newRow = '';
        row.forEach((tile, x) => {
          switch (tile.type) {
            default:
              newRow += ' ';
              break;
            case service.tileTypes.NONE:
              newRow += ' ';
              break;
            case service.tileTypes.BASIC:
            case service.tileTypes.ENEMY:
              newRow += '#';
              break;
            case service.tileTypes.UPLOAD:
              newRow += '@';
              break;
            case service.tileTypes.ITEM:
              newRow += '#';
              battle.items.push({
                type: tile.item.name,
                amount: tile.item.amount,
                coords: {
                  x,
                  y,
                },
              });
          }
        });
        battle.field.push(newRow);
      });

      databattle.enemies.forEach((enemy) => {
        const enemyTiles = [];
        enemy.tiles.forEach((tile) => {
          enemyTiles.push({
            x: tile.x,
            y: tile.y,
          });
        });
        battle.enemies.push({
          name: enemy.name,
          coords: enemyTiles,
        });
      });
      return JSON.stringify(battle);
    };

    return service;
  }]);