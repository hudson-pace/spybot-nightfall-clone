angular
  .module('mapEditorApp')
  .component('netmapEditor', {
    templateUrl: 'components/netmap-editor/netmap-editor.html',
    controller: function($scope, netmapService) {
      
      const netmapWatcher = netmapService.getNetmapWatcher();
      if (netmapWatcher.netmap) {
        $scope.netmap = netmapWatcher.netmap;
      } else {
        $scope.netmap = netmapService.createNewNetmap(10, 10, 99);
        netmapService.setOpenNetmap($scope.netmap);
      }
      
      

      $scope.editDatabattle = (node) => {
        if ($scope.selectedTile) {
          $scope.selectedTile.selected = false;
        }
        netmapService.openDatabattle(node);
      }
  
      $scope.addNode = (node) => {
        $scope.netmap.addNode(node);
        $scope.newNode = undefined;
        $scope.clickTile(node.tile);
      };
      $scope.removeNode = () => {
        $scope.clearConnections();
        const tile = $scope.selectedNode.tile;
        $scope.netmap.removeNode($scope.selectedNode);
        $scope.clickTile(tile);
      };
      $scope.addConnection = () => {
        $scope.mode = $scope.modes.ADDING_CONNECTION;
        $scope.currentConnection = [$scope.selectedNode.tile];
      };
      $scope.cancelConnection = () => {
        $scope.mode = $scope.modes.EDIT;
        $scope.currentConnection.forEach((tile) => {
          if (tile.type !== $scope.tileTypes.NODE) {
            tile.type = $scope.tileTypes.NONE;
          }
        });
        $scope.currentConnection = undefined;
        $scope.clickTile($scope.selectedNode.tile);
      };
      $scope.clearConnections = () => {
        while ($scope.selectedNode.connections.length > 0) {
          $scope.netmap.removeConnection($scope.selectedNode.connections[0]);
        }
      }
  
      $scope.generateJson = () => {
        console.log(netmapService.generateJson($scope.netmap));
      };

      $scope.loadNetmap = (json) => {
        $scope.netmap = netmapService.createNetmapFromJson(json);
      }

      $scope.editEvent = (node) => {
        netmapService.openEvent(node);
      }
      $scope.editShop = (node) => {
        netmapService.openShop(node);
      }
    },
  });
