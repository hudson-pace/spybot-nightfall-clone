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
