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
  };

  $scope.clickTile = (tile) => {
    if ($scope.selectedType) {
      if ($scope.selectedType === tileTypes.ENEMY) {
        if ($scope.selectedProgram) {
          tile.type = $scope.selectedType;
          tile.program = $scope.selectedProgram;
        }
      } else if ($scope.selectedType === tileTypes.ITEM) {
        if ($scope.selectedItem) {
          if ($scope.selectedItem === 'credit') {
            const amount = parseInt($scope.creditAmount, 10);
            if (amount > 0) {
              tile.type = $scope.selectedType;
              tile.item = {
                name: $scope.selectedItem,
                amount,
              };
            }
          } else {
            tile.type = $scope.selectedType;
            tile.item = {
              name: $scope.selectedItem,
            };
          }
        }
      } else {
        tile.type = $scope.selectedType;
      }
    }
  };
  $scope.mouseenterTile = (event, tile) => {
    if (event.buttons === 1) {
      $scope.clickTile(tile);
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
            newRow += '#';
            break;
          case tileTypes.UPLOAD:
            newRow += '@';
            break;
          case tileTypes.ENEMY:
            newRow += '#';
            battle.enemies.push({
              name: tile.program,
              coords: {
                x,
                y,
              },
            });
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

    console.log(JSON.stringify(battle));
  };
});
