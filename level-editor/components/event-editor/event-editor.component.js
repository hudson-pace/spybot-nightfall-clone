angular
  .module('mapEditorApp')
  .component('eventEditor', {
    templateUrl: 'components/event-editor/event-editor.html',
    controller: function($scope, $http, eventService, netmapService) {
      $scope.event = eventService.getEventWatcher().event;
      $scope.netmapWatcher = netmapService.getNetmapWatcher();
      $scope.eventTypes = eventService.eventTypes;
      $http.get('../assets/agents.json')
        .then((data) => {
          $scope.programList = data.data;
        }, () => {
          console.log('could not load program list.');
        });
      $scope.nodeList = netmapService.getNodeList();

      $scope.returnToNetmap = () => {
        eventService.closeEvent();
      }
      $scope.addLineOfDialogue = () => {
        let number = 0;
        if ($scope.event.dialogue.length > 0) {
          number = $scope.event.dialogue[$scope.event.dialogue.length - 1].number + 1;
        }
        $scope.event.dialogue.push({
          number,
          responses: [],
        })
      }
      $scope.addResponse = (line) => {
        line.responses.push({});
      }
    },
  });
