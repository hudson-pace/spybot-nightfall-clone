angular
  .module('mapEditorApp', [])
  .controller('homeController', ['$scope', 'databattleService', 'netmapService', 'eventService',
    function($scope, databattleService, netmapService, eventService) {
    $scope.databattleWatcher = databattleService.getDatabattleWatcher();
    $scope.netmapWatcher = netmapService.getNetmapWatcher();
    $scope.eventWatcher = eventService.getEventWatcher();
    $scope.startDatabattleEditor = () => {
      databattleService.setOpenDatabattle(databattleService.createNewDatabattle(10, 10, 99));
    };
    $scope.startNetmapEditor = () => {
      netmapService.setOpenNetmap(netmapService.createNewNetmap(10, 10, 99));
    };
    $scope.startEventEditor = () => {
      eventService.setOpenEvent(eventService.createNewEvent());
    }
  }]);
  