import NetMap from './netmap.js';
import DataBattle from './databattle.js';
import Inventory from './inventory.js';
import ProgramMenu from './program-menu.js';
import StartMenu from './start-menu.js';

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
  const canvas = $('canvas')[0];
  const inventory = new Inventory();
  const programMenu = new ProgramMenu(canvas, inventory, images.agents);
  let currentView;
  function setCurrentView(newView) {
    currentView = newView;
    updateEventHandlers(currentView);
  }

  let netMap;
  function switchToNetMap(wonBattle, reward, bonusCredits) {
    programMenu.resetInventoryStock();
    setCurrentView(netMap);
    currentView.returnFromBattle(wonBattle, reward, bonusCredits);
  }
  function startDataBattle(name) {
    const dataBattle = new DataBattle(name, `${url}/battles.json`, images, programMenu, () => {
      console.log('Databattle loaded.');
      setCurrentView(dataBattle);
    }, switchToNetMap);
  }

  const startMenu = new StartMenu(canvas, () => {
    if (!netMap) {
      netMap = new NetMap(`${url}/netmap.json`, images, inventory, programMenu, () => {
        console.log('Netmap loaded.');
        setCurrentView(netMap);
      }, startDataBattle, () => {
        setCurrentView(startMenu);
        startMenu.draw();
      });
    } else {
      setCurrentView(netMap);
      netMap.draw();
    }
  });
  setCurrentView(startMenu);
}
