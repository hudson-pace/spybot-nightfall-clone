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

      console.log('done');
    }
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
        'margin-top': `${ ((((Math.sqrt(2) * $scope.tiles.length) + (Math.sqrt(2) * $scope.tiles[0].length)) / 2) - ($scope.tiles.length)) * 25 }px`,
        'margin-left': `${ ((((Math.sqrt(2) * $scope.tiles.length) + (Math.sqrt(2) * $scope.tiles[0].length)) / 2) - ($scope.tiles[0].length)) * 25 }px`,
      }
    }
    $scope.tableMargin = {
      'margin-top': `${ ((((Math.sqrt(2) * $scope.tiles.length) + (Math.sqrt(2) * $scope.tiles[0].length)) / 2) - ($scope.tiles.length)) * 25 }px`,
      'margin-left': `${ ((((Math.sqrt(2) * $scope.tiles.length) + (Math.sqrt(2) * $scope.tiles[0].length)) / 2) - ($scope.tiles[0].length)) * 25 }px`,
    }

    $scope.nodes = [];
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
        desc: $scope.newNode.desc,
        startsOutOwned: $scope.newNode.startsOutOwned,
        securityLevel: parseInt($scope.newNode.securityLevel, 10),
        battle: $scope.newNode.battle,
        tile: $scope.newNode.tile,
        connections: [],
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
      const node1 = $scope.nodes.find((node) => node.tile === tile);
      const node2 = $scope.nodes.find((node) => node.tile === $scope.currentConnection[$scope.currentConnection.length - 1]);
      node1.connections.push({
        destination: node2,
        path: $scope.currentConnection
      });
      node2.connections.push({
        destination: node1,
        path: [...$scope.currentConnection].reverse(),
      });
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

    $scope.generateJson = () => {
      const netmap = {};
      
      netmap.size = ($scope.tiles.length + $scope.tiles[0].length) / 2;
      console.log($scope.nodes);

      netmap.nodes = [];
      $scope.nodes.forEach((node) => {
        const x = ((node.tile.x - node.tile.y + $scope.tiles.length) - 1) / 2;
        const y = (node.tile.x + node.tile.y) / 2;
        const newNode = {
          name: node.name,
          owner: node.owner,
          desc: node.desc,
          image: `node-${node.owner}`,
          ownedByUser: node.ownedByUser,
          securityLevel: node.securityLevel,
          coords: {
            x,
            y,
          },
          connections: [],
        };
        node.connections.forEach((connection) => {
          const segments = [];
          console.log(connection.path);
          connection.path.forEach((tile) => {
            const tileX = ((tile.x - tile.y + $scope.tiles.length) - 1) / 2;
            const tileY = (tile.x + tile.y) / 2;
            console.log(`${tileX}, ${tileY}`);
            if (tile.type === $scope.tileTypes.CONNECTION_VERTICAL) {
              segments.push({
                point1: {
                  x: tileX + 0.25,
                  y: tileY + 0.25,
                },
                point2: {
                  x: tileX + 0.75,
                  y: tileY + 0.75,
                },
              });
            } else if (tile.type === $scope.tileTypes.CONNECTION_HORIZONTAL) {
              segments.push({
                point1: {
                  x: tileX + 0.25,
                  y: tileY + 0.75,
                },
                point2: {
                  x: tileX + 0.75,
                  y: tileY + 0.25,
                },
              });
            } else if (tile.type === $scope.tileTypes.CONNECTION_BOTTOM_CORNER) {
              segments.push({
                point1: {
                  x: tileX + 0.25,
                  y: tileY + 0.75,
                },
                point2: {
                  x: tileX + 0.75,
                  y: tileY + 0.75,
                },
              });
            } else if (tile.type === $scope.tileTypes.CONNECTION_TOP_CORNER) {
              segments.push({
                point1: {
                  x: tileX + 0.25,
                  y: tileY + 0.25,
                },
                point2: {
                  x: tileX + 0.75,
                  y: tileY + 0.25,
                },
              });
            } else if (tile.type === $scope.tileTypes.CONNECTION_LEFT_CORNER) {
              segments.push({
                point1: {
                  x: tileX + 0.25,
                  y: tileY + 0.25,
                },
                point2: {
                  x: tileX + 0.25,
                  y: tileY + 0.75,
                },
              });
            } else if (tile.type === $scope.tileTypes.CONNECTION_RIGHT_CORNER) {
              segments.push({
                point1: {
                  x: tileX + 0.75,
                  y: tileY + 0.25,
                },
                point2: {
                  x: tileX + 0.75,
                  y: tileY + 0.75,
                },
              });
            }
          });

          const points = [];
          points.push({
            x: x + 0.5,
            y: y + 0.5,
          });
          segments.forEach((segment, index) => {
            const previousPoint = points[points.length - 1]
            if (Math.abs(segment.point1.x - previousPoint.x) + Math.abs(segment.point1.y - previousPoint.y)
              < Math.abs(segment.point2.x - previousPoint.x) + Math.abs(segment.point2.y - previousPoint.y)) {
              points.push(segment.point1);
              if (index === segments.length - 1) {
                points.push(segment.point2);
              }
            } else {
              points.push(segment.point2);
              if (index === segments.length - 1) {
                points.push(segment.point1);
              }
            }
          });
          const lastTile = connection.path[connection.path.length - 1];
          points.push({
            x: (((lastTile.x - lastTile.y + $scope.tiles.length) - 1) / 2) + 0.5,
            y: ((lastTile.x + lastTile.y) / 2) + 0.5,
          });

          // The connection lines are purely aesthetic, so the only relevant points are those at which the direction changes.
          const relevantPoints = [points[0]];
          let previousPoint = points[0];
          let previousSlope = (points[0].x - points[1].x) / (points[0].y - points[1].y);
          points.slice(1).forEach((point) => {
            const slope = (previousPoint.x - point.x) / (previousPoint.y - point.y);
            if (slope !== previousSlope) {
              relevantPoints.push(previousPoint);
            }
            previousPoint = point;
            previousSlope = slope;
          });
          relevantPoints.push(points[points.length - 1]);
          newNode.connections.push(relevantPoints);
        });
        netmap.nodes.push(newNode);
      });
      console.log(JSON.stringify(netmap));
    };
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
