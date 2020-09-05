const defaultWidth = 10;
const defaultHeight = 10;
const maxSize = 99;

const tileTypes = {
  NONE: 'none',
  BASIC: 'basic',
  UPLOAD: 'upload',
  ENEMY: 'enemy',
  ITEM: 'item',
};

const app = angular.module('LevelEditor', []);
app.controller('controller', ($scope, $http) => {
  $scope.tileTypes = tileTypes;

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
  $scope.tiles = [];
  for (let i = 0; i < defaultHeight; i += 1) {
    const newRow = [];
    for (let j = 0; j < defaultWidth; j += 1) {
      newRow.push({
        type: tileTypes.NONE,
      });
    }
    $scope.tiles.push(newRow);
  }

  $scope.updateTileCoords = () => {
    $scope.tiles.forEach((row, rowIndex) => {
      row.forEach((tile, colIndex) => {
        tile.x = colIndex;
        tile.y = rowIndex;
      });
    });
  };

  $scope.updateTileCoords();
  $scope.resize = () => {
    if ($scope.resizeParams) {
      const params = {
        left: parseInt($scope.resizeParams.left, 10),
        right: parseInt($scope.resizeParams.right, 10),
        top: parseInt($scope.resizeParams.top, 10),
        bottom: parseInt($scope.resizeParams.bottom, 10),
      };
      if (params.left && params.left !== 0 && params.left + $scope.tiles[0].length > 0
        && params.left + $scope.tiles[0].length < maxSize) {
        $scope.tiles.forEach((row) => {
          if (params.left > 0) {
            for (let i = 0; i < params.left; i += 1) {
              row.unshift({
                type: tileTypes.NONE,
              });
            }
          } else {
            row.splice(0, params.left * -1);
          }
        });
      }
      if (params.right && params.right !== 0 && params.right + $scope.tiles[0].length > 0
        && params.right + $scope.tiles[0].length < maxSize) {
        $scope.tiles.forEach((row) => {
          if (params.right > 0) {
            for (let i = 0; i < params.right; i += 1) {
              row.push({
                type: tileTypes.NONE,
              });
            }
          } else {
            row.splice(row.length - (params.right * -1));
          }
        });
      }
      if (params.top && params.top !== 0 && params.top + $scope.tiles.length > 0
        && params.top + $scope.tiles.length < maxSize) {
        if (params.top > 0) {
          for (let i = 0; i < params.top; i += 1) {
            const newRow = [];
            for (let j = 0; j < $scope.tiles[0].length; j += 1) {
              newRow.push({
                type: tileTypes.NONE,
              });
            }
            $scope.tiles.unshift(newRow);
          }
        } else {
          $scope.tiles.splice(0, params.top * -1);
        }
      }
      if (params.bottom && params.bottom !== 0 && params.bottom + $scope.tiles.length > 0
        && params.bottom + $scope.tiles.length < maxSize) {
        if (params.bottom > 0) {
          for (let i = 0; i < params.bottom; i += 1) {
            const newRow = [];
            for (let j = 0; j < $scope.tiles[0].length; j += 1) {
              newRow.push({
                type: tileTypes.NONE,
              });
            }
            $scope.tiles.push(newRow);
          }
        } else {
          $scope.tiles.splice($scope.tiles.length - (params.bottom * -1));
        }
      }
    }
    $scope.updateTileCoords();
  };

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
        enemyTile.type = tileTypes.NONE;
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

  $scope.clickTile = (tile) => {
    if ($scope.selectedType) {
      if ($scope.selectedType === tileTypes.ENEMY) {
        if ($scope.selectedProgram) {
          const r = Math.floor(Math.random() * 255);
          const g = Math.floor(Math.random() * 255);
          const b = Math.floor(Math.random() * 255);
          currentEnemy = {
            name: $scope.selectedProgram,
            tiles: [tile],
            style: {
              'border-left': `4px solid rgba(${r}, ${g}, ${b}, 1)`,
              'border-right': `4px solid rgba(${r}, ${g}, ${b}, 1)`,
              'border-top': `4px solid rgba(${r}, ${g}, ${b}, 1)`,
              'border-bottom': `4px solid rgba(${r}, ${g}, ${b}, 1)`,
            },
          };
          currentEnemyTile = tile;
          $scope.updateTile(tile, $scope.selectedType, undefined, $scope.selectedProgram,
            { ...currentEnemy.style });
        }
      } else if ($scope.selectedType === tileTypes.ITEM) {
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
          $scope.updateTile(tile, $scope.selectedType, undefined, undefined,
            { ...currentEnemy.style });
          currentEnemy.tiles.push(tile);
          if (tile.x > currentEnemyTile.x) {
            tile.style['border-left'] = 'none';
            currentEnemyTile.style['border-right'] = 'none';
          } else if (tile.x < currentEnemyTile.x) {
            tile.style['border-right'] = 'none';
            currentEnemyTile.style['border-left'] = 'none';
          } else if (tile.y > currentEnemyTile.y) {
            tile.style['border-top'] = 'none';
            currentEnemyTile.style['border-bottom'] = 'none';
          } else if (tile.y < currentEnemyTile.y) {
            tile.style['border-bottom'] = 'none';
            currentEnemyTile.style['border-top'] = 'none';
          }
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
          case tileTypes.NONE:
            newRow += ' ';
            break;
          case tileTypes.BASIC:
          case tileTypes.ENEMY:
            newRow += '#';
            break;
          case tileTypes.UPLOAD:
            newRow += '@';
            break;
          case tileTypes.ITEM:
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
});
