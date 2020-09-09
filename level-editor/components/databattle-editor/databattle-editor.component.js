angular
  .module('mapEditorApp')
  .component('databattleEditor', {
    templateUrl: 'components/databattle-editor/databattle-editor.html',
    controller: function DatabattleEditorController($scope, $http, gridService) {
      $scope.tileTypes = {
        NONE: 'none',
        BASIC: 'basic',
        UPLOAD: 'upload',
        ENEMY: 'enemy',
        ITEM: 'item',
      };
      const defaultWidth = 10;
      const defaultHeight = 10;
      const maxSize = 99; 
  
      $http.get('../assets/agents.json')
        .then((data) => {
          $scope.programList = data.data;
        }, () => {
          console.log('could not load program list.');
        });
      $scope.itemList = [
        'credit',
        'data',
      ];
  
      $scope.tiles = gridService.createGrid(defaultWidth, defaultHeight, $scope.tileTypes.NONE);
      console.log($scope.tiles);
      gridService.updateTileCoordinates($scope.tiles);
      $scope.resize = () => {
        gridService.resizeGrid($scope.tiles, $scope.resizeParams, maxSize, $scope.tileTypes.NONE);
      }
  
      const enemies = [];
      let currentEnemy;
      let currentEnemyTile;
  
      $scope.updateTile = (tile, newType, newItem, newProgram, newStyle) => {
        const enemyIndex = enemies.findIndex((e) => {
          let containsTile = false;
          e.tiles.forEach((enemyTile) => {
            if (enemyTile === tile) {
              containsTile = true;
            }
          });
          return containsTile;
        });
        if (enemyIndex !== -1) {
          enemies[enemyIndex].tiles.forEach((enemyTile) => {
            enemyTile.type = $scope.tileTypes.NONE;
            enemyTile.item = undefined;
            enemyTile.program = undefined;
            enemyTile.style = undefined;
          });
          enemies.splice(enemyIndex, 1);
        }
        tile.type = newType;
        tile.item = newItem;
        tile.program = newProgram;
        tile.style = newStyle;
      };
  
      $scope.startEnemy = (name, tile) => {
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
        $scope.updateTile(tile, $scope.tileTypes.ENEMY, undefined, name, { ...enemy.style });
        return enemy;
      }
      $scope.addToEnemy = (enemy, tile, previousTile) => {
        $scope.updateTile(tile, $scope.tileTypes.ENEMY, undefined, undefined,
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
      $scope.clickTile = (tile) => {
        if ($scope.selectedType) {
          if ($scope.selectedType === $scope.tileTypes.ENEMY) {
            if ($scope.selectedProgram) {
              currentEnemy = $scope.startEnemy($scope.selectedProgram, tile);
              currentEnemyTile = tile;
            }
          } else if ($scope.selectedType === $scope.tileTypes.ITEM) {
            if ($scope.selectedItem) {
              if ($scope.selectedItem === 'credit') {
                const amount = parseInt($scope.creditAmount, 10);
                if (amount > 0) {
                  const item = {
                    name: $scope.selectedItem,
                    amount,
                  };
                  $scope.updateTile(tile, $scope.selectedType, item);
                }
              } else {
                $scope.updateTile(tile, $scope.selectedType, { name: $scope.selectedItem });
              }
            }
          } else {
            $scope.updateTile(tile, $scope.selectedType);
          }
        }
      };
      $scope.mouseenterTile = (event, tile) => {
        if (event.buttons === 1) {
          if (currentEnemy) {
            if (!currentEnemy.tiles.find((t) => t === tile)) {
              $scope.addToEnemy(currentEnemy, tile, currentEnemyTile);
            }
            currentEnemyTile = tile;
          } else {
            $scope.clickTile(tile);
          }
        } else if (currentEnemy) {
          enemies.push(currentEnemy);
          currentEnemy = undefined;
        }
      };
      $scope.generateJSON = () => {
        const battle = {};
        battle.name = $scope.battleName;
        battle.height = $scope.tiles.length;
        battle.width = $scope.tiles[0].length;
        battle.reward = parseInt($scope.reward, 10);
        battle.field = [];
        battle.enemies = [];
        battle.items = [];
        $scope.tiles.forEach((row, y) => {
          let newRow = '';
          row.forEach((tile, x) => {
            switch (tile.type) {
              default:
                newRow += ' ';
                break;
              case $scope.tileTypes.NONE:
                newRow += ' ';
                break;
              case $scope.tileTypes.BASIC:
              case $scope.tileTypes.ENEMY:
                newRow += '#';
                break;
              case $scope.tileTypes.UPLOAD:
                newRow += '@';
                break;
              case $scope.tileTypes.ITEM:
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
  
        enemies.forEach((enemy) => {
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
        console.log(JSON.stringify(battle));
      };
  
      $scope.openBattleFromJson = () => {
        const battleJson = JSON.parse($scope.inputJson);
        $scope.battleName = battleJson.name;
        $scope.tiles = [];
        $scope.reward = battleJson.reward;
        battleJson.field.forEach((row, y) => {
          let newRow = [];
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
          $scope.tiles.push(newRow);
        });
        battleJson.enemies.forEach((enemy) => {
          let previousTile = $scope.tiles[enemy.coords[0].y][enemy.coords[0].x]
          const newEnemy = $scope.startEnemy(enemy.name, previousTile);
          enemy.coords.splice(1).forEach((c) => {
            const tile = $scope.tiles[c.y][c.x]
            $scope.addToEnemy(newEnemy, tile, previousTile)
            previousTile = tile;
          });
          enemies.push(newEnemy);
        });
        battleJson.items.forEach((item) => {
          const tile = $scope.tiles[item.coords.y][item.coords.x];
          tile.type = $scope.tileTypes.ITEM;
          tile.item = {
            name: item.type,
            amount: item.amount,
          }
        });
      };
    },
  });
