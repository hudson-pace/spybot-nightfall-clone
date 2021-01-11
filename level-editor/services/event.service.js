angular
  .module('mapEditorApp')
  .factory('eventService', [function() {
    const service = {};
    service.eventTypes = {
      NONE: 'none',
      INCREASE_SECURITY_LEVEL: 'increase security level',
      ADD_PROGRAM: 'add program',
      REVEAL_NODE: 'reveal node',
      ADD_CREDITS: 'add credits',
      TUTORIAL: 'launch tutorial',
    };
    const eventWatcher = {};

    service.getEventWatcher = () => {
      return eventWatcher;
    }
    service.setOpenEvent = (event) => {
      eventWatcher.event = event;
    };
    service.closeEvent = () => {
      eventWatcher.event = undefined;
    };
    service.createNewEvent = () => {
      const event = {
        dialogue: [],
        type: service.eventTypes.NONE,
      }
      return event;
    }

    service.getJsonFromEvent = (event) => {
      return angular.toJson(event);
    }

    service.createEventFromJson = (json) => {
      return JSON.parse(json);
    }

    return service;
  }]);
