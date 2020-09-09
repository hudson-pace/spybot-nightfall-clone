angular
  .module('mapEditorApp', [])
  .controller('homeController', function($scope) {
    $scope.mode = 'start';
    $scope.startDatabattleEditor = () => {
      $scope.mode = 'databattle';
    };
    $scope.startNetmapEditor = () => {
      $scope.mode = 'netmap';
    };
  });
  