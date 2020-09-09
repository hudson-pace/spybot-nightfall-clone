angular
  .module('mapEditorApp')
  .component('databattleEditor', {
    templateUrl: 'components/databattle-editor/databattle-editor.html',
    controller: function DatabattleEditorController($scope, $http, gridService, databattleService) {
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

      $scope.databattle = databattleService.createNewDatabattle(10, 10, 99, $scope.tileTypes.NONE);
  

      let currentEnemy;
      let currentEnemyTile;
      
      $scope.resize = () => {
        $scope.databattle.resize($scope.resizeParams);
      }
      
      $scope.clickTile = (tile) => {
        if ($scope.selectedType) {
          if ($scope.selectedType === $scope.tileTypes.ENEMY) {
            if ($scope.selectedProgram) {
              currentEnemy = $scope.databattle.startEnemy($scope.selectedProgram, tile, $scope.tileTypes.ENEMY);
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
                  $scope.databattle.updateTile(tile, $scope.selectedType, item);
                }
              } else {
                $scope.databattle.updateTile(tile, $scope.selectedType, { name: $scope.selectedItem });
              }
            }
          } else {
            $scope.databattle.updateTile(tile, $scope.selectedType);
          }
        }
      };
  
      $scope.mouseenterTile = (event, tile) => {
        if (event.buttons === 1) {
          if (currentEnemy) {
            if (!currentEnemy.tiles.find((t) => t === tile)) {
              $scope.databattle.addToEnemy(currentEnemy, tile, currentEnemyTile, $scope.tileTypes.ENEMY);
            }
            currentEnemyTile = tile;
          } else {
            $scope.clickTile(tile);
          }
        } else if (currentEnemy) {
          $scope.databattle.enemies.push(currentEnemy);
          currentEnemy = undefined;
        }
      };
      
      $scope.generateJSON = () => {
        const battle = {};
        battle.name = $scope.databattle.name;
        battle.height = $scope.databattle.tiles.length;
        battle.width = $scope.databattle.tiles[0].length;
        battle.reward = parseInt($scope.databattle.reward, 10);
        battle.field = [];
        battle.enemies = [];
        battle.items = [];
        $scope.databattle.tiles.forEach((row, y) => {
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
  
        $scope.databattle.enemies.forEach((enemy) => {
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
  
      
    },
  });
