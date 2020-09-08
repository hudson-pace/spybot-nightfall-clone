function generateTiles(width, height, defaultType) {
  const tiles = [];
  for (let i = 0; i < height; i += 1) {
    const newRow = [];
    for (let j = 0; j < width; j += 1) {
      newRow.push({
        coords: {
          x: j,
          y: i,
        },
        type: defaultType,
      });
    }
    tiles.push(newRow);
  }
  return tiles;
}

function updateTileCoords (tiles) {
  tiles.forEach((row, rowIndex) => {
    row.forEach((tile, colIndex) => {
      tile.x = colIndex;
      tile.y = rowIndex;
    });
  });
};

function resizeTileGrid(tiles, resizeParams, maxSize, defaultType) {
  if (resizeParams) {
    const params = {
      left: parseInt(resizeParams.left, 10),
      right: parseInt(resizeParams.right, 10),
      top: parseInt(resizeParams.top, 10),
      bottom: parseInt(resizeParams.bottom, 10),
    };
    if (params.left && params.left !== 0 && params.left + tiles[0].length > 0
      && params.left + tiles[0].length < maxSize) {
      tiles.forEach((row) => {
        if (params.left > 0) {
          for (let i = 0; i < params.left; i += 1) {
            row.unshift({
              type: defaultType,
            });
          }
        } else {
          row.splice(0, params.left * -1);
        }
      });
    }
    if (params.right && params.right !== 0 && params.right + tiles[0].length > 0
      && params.right + tiles[0].length < maxSize) {
      tiles.forEach((row) => {
        if (params.right > 0) {
          for (let i = 0; i < params.right; i += 1) {
            row.push({
              type: defaultType,
            });
          }
        } else {
          row.splice(row.length - (params.right * -1));
        }
      });
    }
    if (params.top && params.top !== 0 && params.top + tiles.length > 0
      && params.top + tiles.length < maxSize) {
      if (params.top > 0) {
        for (let i = 0; i < params.top; i += 1) {
          const newRow = [];
          for (let j = 0; j < tiles[0].length; j += 1) {
            newRow.push({
              type: defaultType,
            });
          }
          tiles.unshift(newRow);
        }
      } else {
        tiles.splice(0, params.top * -1);
      }
    }
    if (params.bottom && params.bottom !== 0 && params.bottom + tiles.length > 0
      && params.bottom + tiles.length < maxSize) {
      if (params.bottom > 0) {
        for (let i = 0; i < params.bottom; i += 1) {
          const newRow = [];
          for (let j = 0; j < tiles[0].length; j += 1) {
            newRow.push({
              type: defaultType,
            });
          }
          tiles.push(newRow);
        }
      } else {
        tiles.splice(tiles.length - (params.bottom * -1));
      }
    }
  }
  updateTileCoords(tiles);
}

const app = angular.module('MapEditor', ['ngRoute'])
  .controller('MainController', function() {
    
  })
  .controller('DatabattleEditorController', function($scope, $http) {
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

    $scope.tiles = generateTiles(defaultWidth, defaultHeight, $scope.tileTypes.NONE);
    updateTileCoords($scope.tiles);
    $scope.resize = () => {
      resizeTileGrid($scope.tiles, $scope.resizeParams, maxSize, $scope.tileTypes.NONE);
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

    $scope.clickTile = (tile) => {
      if ($scope.selectedType) {
        if ($scope.selectedType === $scope.tileTypes.ENEMY) {
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
  })
  .controller('NetmapEditorController', function($scope) {
    $scope.tileTypes = {
      NONE: 'none',
      NODE: 'node',
      CONNECTION_HORIZONTAL: 'connection-horizontal',
      CONNECTION_VERTICAL: 'connection-vertical',
      CONNECTION_TOP_CORNER: 'connection-top-corner',
      CONNECTION_LEFT_CORNER: 'connection-left-corner',
      CONNECTION_RIGHT_CORNER: 'connection-right-corner',
      CONNECTION_BOTTOM_CORNER: 'connection-bottom-corner',
    };
    $scope.modes = {
      ADD: 'add',
      EDIT: 'edit',
      ADDING_CONNECTION: 'adding connection',
      NONE: 'none',
    }
    $scope.ownerList = [
      'Cellular Automata Research',
      'Doctor Donut',
      'Lucky Monkey Media',
      'Parker Ellington Davis Consulting',
      'Pharmhaus',
      'S.M.A.R.T.',
      'Unknown',
      'Warez'
    ]
    const defaultWidth = 10;
    const defaultHeight = 10;
    const maxSize = 99;
    $scope.tiles = generateTiles(defaultWidth, defaultHeight, $scope.tileTypes.NONE);
    updateTileCoords($scope.tiles)
    $scope.resize = () => {
      resizeTileGrid($scope.tiles, $scope.resizeParams, maxSize, $scope.tileTypes.NONE);
      $scope.tableMargin = {
        'margin-top': `${(Math.max($scope.tiles[0].length, $scope.tiles.length) / 2) * 50}px`,
        'margin-left': `${(Math.max($scope.tiles[0].length, $scope.tiles.length) / 2) * 50}px`,
      }
    }
    $scope.tableMargin = {
      'margin-top': `${(Math.max($scope.tiles[0].length, $scope.tiles.length) / 2) * 50}px`,
      'margin-left': `${(Math.max($scope.tiles[0].length, $scope.tiles.length) / 2) * 50}px`,
    }

    $scope.nodes = [];
    $scope.connections = [];
    $scope.clickTile = (tile) => {
      if ($scope.mode === $scope.modes.ADDING_CONNECTION) {
        const previousTile = $scope.currentConnection[$scope.currentConnection.length - 1];
        if (tile === previousTile && tile.type !== $scope.tileTypes.NODE) {
          tile.type = $scope.tileTypes.NONE;
          $scope.currentConnection.pop();
        } if ((tile.type === $scope.tileTypes.NONE || tile.type === $scope.tileTypes.NODE) && Math.abs(tile.x - previousTile.x) + Math.abs(tile.y - previousTile.y) === 1) {
            if (tile !== $scope.selectedNode.tile) {
              $scope.currentConnection.push(tile);
              $scope.updateConnectionOrientations($scope.currentConnection);
            if (tile.type === $scope.tileTypes.NODE) {
              $scope.finishCurrentConnection();
            }
          }
        }
      } else {
        if ($scope.selectedTile) {
          $scope.selectedTile.selected = false;
        }
        $scope.selectedTile = tile;
        tile.selected = true;
        if (tile.type === $scope.tileTypes.NODE) {
          $scope.mode = $scope.modes.EDIT;
          $scope.selectedNode = $scope.nodes.find((node) => node.tile === tile);
        } else if (tile.type === $scope.tileTypes.NONE) {
          $scope.mode = $scope.modes.ADD;
          $scope.newNode = {
            tile
          }
        } else {
          $scope.mode = $scope.modes.NONE;
        }
      }
    }

    $scope.addNode = () => {
      $scope.newNode.tile.type = $scope.tileTypes.NODE;
      $scope.nodes.push({
        name: $scope.newNode.name,
        owner: $scope.newNode.owner,
        tile: $scope.newNode.tile,
      });
      const tile = $scope.newNode.tile;
      $scope.newNode = undefined;
      $scope.clickTile(tile);
    }
    $scope.removeNode = () => {
      const tile = $scope.selectedNode.tile;
      tile.type = $scope.tileTypes.NONE;
      const index = $scope.nodes.findIndex((node) => node === $scope.selectedNode);
      $scope.nodes.splice(index, 1);
      $scope.selectedNode = undefined;
      $scope.clickTile(tile);
    }
    $scope.addConnection = () => {
      $scope.mode = $scope.modes.ADDING_CONNECTION;
      $scope.currentConnection = [$scope.selectedNode.tile];
    }
    $scope.cancelConnection = () => {
      $scope.mode = $scope.modes.EDIT;
      $scope.currentConnection.forEach((tile) => {
        if (tile.type !== $scope.tileTypes.NODE) {
          tile.type = $scope.tileTypes.NONE;
        }
      });
      $scope.clickTile($scope.selectedNode.tile);
    }

    $scope.mouseEnterTile = (tile) => {

    }

    $scope.finishCurrentConnection = () => {
      const tile = $scope.currentConnection[0];
      $scope.connections.push($scope.currentConnection);
      $scope.currentConnection = undefined;
      $scope.mode = $scope.modes.EDIT;
      $scope.clickTile(tile);
    }

    $scope.updateConnectionOrientations = (connection) => {
      let newTileType;
      if (connection.length > 2) {
        if (connection[connection.length - 3].y > connection[connection.length - 2].y) {
          if (connection[connection.length - 2].x > connection[connection.length - 1].x) {
            connection[connection.length - 2].type = $scope.tileTypes.CONNECTION_LEFT_CORNER;
            newTileType = $scope.tileTypes.CONNECTION_VERTICAL;
          } else if (connection[connection.length - 2].x < connection[connection.length - 1].x) {
            connection[connection.length - 2].type = $scope.tileTypes.CONNECTION_BOTTOM_CORNER;
            newTileType = $scope.tileTypes.CONNECTION_VERTICAL;
          } else {
            newTileType = $scope.tileTypes.CONNECTION_HORIZONTAL;
          }
        } else if (connection[connection.length - 3].y < connection[connection.length - 2].y) {
          if (connection[connection.length - 2].x > connection[connection.length - 1].x) {
            connection[connection.length - 2].type = $scope.tileTypes.CONNECTION_TOP_CORNER;
            newTileType = $scope.tileTypes.CONNECTION_VERTICAL;
          } else if (connection[connection.length - 2].x < connection[connection.length - 1].x) {
            connection[connection.length - 2].type = $scope.tileTypes.CONNECTION_RIGHT_CORNER;
            newTileType = $scope.tileTypes.CONNECTION_VERTICAL;
          } else {
            newTileType = $scope.tileTypes.CONNECTION_HORIZONTAL;
          }
        } else if (connection[connection.length - 3].x > connection[connection.length - 2].x) {
          if (connection[connection.length - 2].y > connection[connection.length - 1].y) {
            connection[connection.length - 2].type = $scope.tileTypes.CONNECTION_RIGHT_CORNER;
            newTileType = $scope.tileTypes.CONNECTION_HORIZONTAL;
          } else if (connection[connection.length - 2].y < connection[connection.length - 1].y) {
            connection[connection.length - 2].type = $scope.tileTypes.CONNECTION_BOTTOM_CORNER;
            newTileType = $scope.tileTypes.CONNECTION_HORIZONTAL;
          } else {
            newTileType = $scope.tileTypes.CONNECTION_VERTICAL;
          }
        } else if (connection[connection.length - 3].x < connection[connection.length - 2].x) {
          if (connection[connection.length - 2].y > connection[connection.length - 1].y) {
            connection[connection.length - 2].type = $scope.tileTypes.CONNECTION_TOP_CORNER;
            newTileType = $scope.tileTypes.CONNECTION_HORIZONTAL;
          } else if (connection[connection.length - 2].y < connection[connection.length - 1].y) {
            connection[connection.length - 2].type = $scope.tileTypes.CONNECTION_LEFT_CORNER;
            newTileType = $scope.tileTypes.CONNECTION_HORIZONTAL;
          } else {
            newTileType = $scope.tileTypes.CONNECTION_VERTICAL;
          }
        }
      } else {
        if (connection[0].y !== connection[1].y) {
          newTileType = $scope.tileTypes.CONNECTION_HORIZONTAL;
        } else {
          newTileType = $scope.tileTypes.CONNECTION_VERTICAL;
        }
      }

      if (connection[connection.length - 1].type !== $scope.tileTypes.NODE) {
        connection[connection.length - 1].type = newTileType;
      }
    }
  })
  .config(function($routeProvider) {
    $routeProvider
      .when('/databattle-editor', {
        templateUrl: 'databattle-editor.html',
        controller: 'DatabattleEditorController',
      })
      .when('/netmap-editor', {
        templateUrl: 'netmap-editor.html',
        controller: 'NetmapEditorController',
      });
  });
