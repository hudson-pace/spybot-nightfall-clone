angular
  .module('mapEditorApp')
  .component('databattleEditor', {
    templateUrl: 'components/databattle-editor/databattle-editor.html',
    controller: function DatabattleEditorController($scope, $http, databattleService, netmapService) {
      $scope.tileTypes = databattleService.tileTypes;
  
      $http.get('../assets/agents.json')
        .then((data) => {
          $scope.programList = data.data;
          $scope.programList.sort((a, b) => ((a.name > b.name) ? 1 : -1));
        }, () => {
          console.log('could not load program list.');
        });
      $scope.itemList = [
        'credit',
        'data',
      ];

      $scope.netmapWatcher = netmapService.getNetmapWatcher();

      const databattleWatcher = databattleService.getDatabattleWatcher();
      if (databattleWatcher.databattle) {
        $scope.databattle = databattleWatcher.databattle;
      } else {
        $scope.databattle = databattleService.createNewDatabattle(10, 10, 99);
      }
  

      let currentEnemy;
      let currentEnemyTile;
      
      $scope.clickTile = (event, tile) => {
        if (event.button === 0) {
          if ($scope.selectedType) {
            if ($scope.selectedType === $scope.tileTypes.ENEMY) {
              if ($scope.selectedProgram) {
                currentEnemy = $scope.databattle.startEnemy($scope.selectedProgram, tile);
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
        }
      };
  
      $scope.mouseEnterTile = (event, tile) => {
        if (event.button === 0) {
          if (currentEnemy) {
            if (!currentEnemy.tiles.find((t) => t === tile)) {
              if (currentEnemy.tiles.find((t) => t === currentEnemyTile && (Math.abs(t.x - tile.x) + Math.abs(t.y - tile.y) === 1))) {
                // Only allow adjacent tiles. Also, the user must add the new tile from an existing enemy tile. This ensures a contiguous outline.
                $scope.databattle.addToEnemy(currentEnemy, tile, currentEnemyTile);
                currentEnemyTile = tile;
              }
            } else {
              currentEnemyTile = tile;
            }
          } else {
            $scope.clickTile(tile);
          }
        } else {
          $scope.mouseUp();
        }
      };

      $scope.mouseUp = (event) => {
        if (event) {
          console.log(event);
        }
        if (!event || event.button === 0) {
          if (currentEnemy) {
            $scope.databattle.enemies.push(currentEnemy);
            currentEnemy = undefined;
          }
        }
      }

      $scope.generateJSON = () => {
        console.log(databattleService.getJsonFromDatabattle($scope.databattle));
      }
      $scope.loadDatabattle = (battleJson) => {
        $scope.databattle = databattleService.createDatabattleFromJson(battleJson);
      }

      $scope.returnToNetmap = () => {
        databattleService.closeDatabattle();
      }
    },
  });
