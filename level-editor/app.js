angular
  .module('mapEditorApp', [])
  .controller('homeController', ['$scope', 'databattleService', 'netmapService', function($scope, databattleService, netmapService) {
    $scope.databattleWatcher = databattleService.getDatabattleWatcher();
    $scope.netmapWatcher = netmapService.getNetmapWatcher();
    $scope.startDatabattleEditor = () => {
      databattleService.setOpenDatabattle(databattleService.createNewDatabattle(10, 10, 99));
    }
    $scope.startNetmapEditor = () => {
      netmapService.setOpenNetmap(netmapService.createNewNetmap(10, 10, 99));
    }
  }]);
  