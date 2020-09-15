angular
  .module('mapEditorApp')
  .component('shopEditor', {
    templateUrl: 'components/shop-editor/shop-editor.html',
    controller: function($scope, $http, netmapService) {
      $scope.shop = netmapService.getNetmapWatcher().netmap.openShop;
      $http.get('../assets/agents.json')
        .then((data) => {
          $scope.programList = data.data;
        }, () => {
          console.log('could not load program list.');
        });

      $scope.returnToNetmap = () => {
        netmapService.closeShop();
      }
      $scope.addItem = (newItem) => {
        if (!$scope.shop.find((i) => i.name === newItem.name)) {
          $scope.shop.push({
            name: newItem.name,
            price: parseInt(newItem.price, 10),
          });
        }
      }
      $scope.removeItem = (item) => {
        const index = $scope.shop.findIndex((i) => i === item);
        $scope.shop.splice(index, 1);
      }
    },
  });
