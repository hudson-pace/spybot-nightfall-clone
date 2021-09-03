angular
  .module('mapEditorApp')
  .factory('netmapService', ['gridService', 'databattleService', 'eventService',
    function(gridService, databattleService, eventService) {

    service.openDatabattle = (node) => {
      databattleService.setOpenDatabattle(node.battle);
    }
    service.openEvent = (node) => {
      if (node.event) {
        eventService.setOpenEvent(node.event);
      } else {
        const event = eventService.createNewEvent();
        node.event = event;
        eventService.setOpenEvent(node.event);
      }
    }

    service.openShop = (node) => {
      if (!node.shop) {
        node.shop = [];
      }
      netmapWatcher.netmap.openShop = node.shop;
    }
    service.closeShop = () => {
      netmapWatcher.netmap.openShop = undefined;
    }

    
    

    service.getNodeList = () => {
      if (netmapWatcher.netmap) {
        return netmapWatcher.netmap.nodes;
      }
    }

    return service;
  }]);