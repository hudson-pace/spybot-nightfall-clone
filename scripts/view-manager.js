import NetMap from './netmap.js';
import DataBattle from './databattle.js';

function updateEventHandlers(currentView) {
  console.log('resetting event handlers');
  $('canvas')
    .off('mousedown')
    .off('mouseup')
    .off('mouseleave')
    .off('mousemove')
    .off('click')
    .off('mousewheel');
  $(document).off('keydown');
  $('canvas')
    .on('mousedown', (event) => {
      if (currentView && currentView.onMouseDown) {
        currentView.onMouseDown(event);
      }
    })
    .on('mouseup', () => {
      if (currentView && currentView.onMouseUp) {
        currentView.onMouseUp();
      }
    })
    .on('mouseleave', () => {
      if (currentView && currentView.onMouseLeave) {
        currentView.onMouseLeave();
      }
    })
    .on('mousemove', (event) => {
      if (currentView && currentView.onMouseMove) {
        currentView.onMouseMove(event);
      }
    })
    .on('click', (event) => {
      if (currentView && currentView.onClick) {
        currentView.onClick(event);
      }
    })
    .on('mousewheel', (event) => {
      if (currentView && currentView.onMouseWheel) {
        currentView.onMouseWheel(event);
      }
    });
  $(document).on('keydown', (event) => {
    if (currentView && currentView.onKeydown) {
      currentView.onKeydown(event);
    }
  });
}

export default function ViewManager(url, images) {
  let currentView;
  function setCurrentView(newView) {
    currentView = newView;
    updateEventHandlers(currentView);
  }

  let netMap;
  function switchToNetMap(wonBattle) {
    setCurrentView(netMap);
    currentView.returnFromBattle(wonBattle);
  }
  function startDataBattle(name) {
    const dataBattle = new DataBattle(name, `${url}/battles.json`, images, () => {
      console.log('Databattle loaded.');
      setCurrentView(dataBattle);
    }, switchToNetMap);
  }
  netMap = new NetMap(`${url}/netmap.json`, images, () => {
    console.log('Netmap loaded.');
    setCurrentView(netMap);
  }, startDataBattle);
}
