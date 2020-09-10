angular
  .module('mapEditorApp')
  .component('netmapEditor', {
    templateUrl: 'components/netmap-editor/netmap-editor.html',
    controller: function($scope, netmapService) {
      $scope.tileTypes = netmapService.tileTypes;
      $scope.modes = {
        ADD_NODE: 'add',
        EDIT: 'edit',
        ADDING_CONNECTION: 'adding connection',
        NONE: 'none',
      };
      $scope.ownerList = [
        'Cellular Automata Research',
        'Doctor Donut',
        'Lucky Monkey Media',
        'Parker Ellington Davis Consulting',
        'Pharmhaus',
        'S.M.A.R.T.',
        'Unknown',
        'Warez'
      ];
      
      const netmapWatcher = netmapService.getNetmapWatcher();
      if (netmapWatcher.netmap) {
        $scope.netmap = netmapWatcher.netmap;
      } else {
        $scope.netmap = netmapService.createNewNetmap(10, 10, 99);
        netmapService.setOpenNetmap($scope.netmap);
      }
      
      $scope.clickTile = (tile) => {
        if ($scope.mode === $scope.modes.ADDING_CONNECTION) {
          const previousTile = $scope.currentConnection[$scope.currentConnection.length - 1];
          if (tile === previousTile && tile.type !== $scope.tileTypes.NODE) {
            tile.type = $scope.tileTypes.NONE;
            $scope.netmap.popFromConnection($scope.currentConnection);
          } if ((tile.type === $scope.tileTypes.NONE || tile.type === $scope.tileTypes.NODE) && Math.abs(tile.x - previousTile.x) + Math.abs(tile.y - previousTile.y) === 1) {
              if (tile !== $scope.selectedNode.tile) {
                $scope.netmap.addToConnection($scope.currentConnection, tile);
              if (tile.type === $scope.tileTypes.NODE) {
                $scope.clickTile($scope.currentConnection[0]);
                $scope.currentConnection = undefined;
                $scope.mode = $scope.tileTypes.EDIT;
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
            $scope.selectedNode = $scope.netmap.nodes.find((node) => node.tile === tile);
          } else if (tile.type === $scope.tileTypes.NONE) {
            $scope.mode = $scope.modes.ADD_NODE;
            $scope.newNode = {
              tile
            }
          } else {
            $scope.mode = $scope.modes.NONE;
          }
        }
      };

      $scope.editDatabattle = (node) => {
        netmapService.openDatabattle(node);
      }
  
      $scope.addNode = (node) => {
        $scope.netmap.addNode(node);
        $scope.newNode = undefined;
        $scope.clickTile(node.tile);
      };
      $scope.removeNode = () => {
        const tile = $scope.selectedNode.tile;
        $scope.netmap.removeNode($scope.selectedNode);
        $scope.clickTile(tile);
      };
      $scope.addConnection = () => {
        $scope.mode = $scope.modes.ADDING_CONNECTION;
        $scope.currentConnection = [$scope.selectedNode.tile];
        $scope.netmap.addConnection($scope.currentConnection);
      };
      $scope.cancelConnection = () => {
        $scope.mode = $scope.modes.EDIT;
        $scope.currentConnection.forEach((tile) => {
          if (tile.type !== $scope.tileTypes.NODE) {
            tile.type = $scope.tileTypes.NONE;
          }
        });
        $scope.netmap.removeConnection($scope.currentConnection);
        $scope.currentConnection = undefined;
        $scope.clickTile($scope.selectedNode.tile);
      };
  
      $scope.generateJson = () => {
        console.log(netmapService.generateJson($scope.netmap));
      };
    },
  });
