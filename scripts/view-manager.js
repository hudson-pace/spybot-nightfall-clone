import NetMap from './netmap.js';
import DataBattle from './databattle.js';
import Inventory from './inventory.js';
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

export default function ViewManager(saves) {
  const canvas = $('canvas')[0];
  let inventory = new Inventory();
  let assets;
  let currentView;
  function setCurrentView(newView) {
    currentView = newView;
    updateEventHandlers(currentView);
  }

  let netMap;
  function switchToNetMap(wonBattle, reward, bonusCredits) {
    setCurrentView(netMap);
    currentView.returnFromBattle(wonBattle, reward, bonusCredits);
  }
  function startDataBattle(battleData) {
    const dataBattle = new DataBattle(battleData, assets, inventory, switchToNetMap);
    setCurrentView(dataBattle);
  }

  const startMenu = new StartMenu(canvas, saves, (newAssets, saveData) => {
    assets = newAssets;
    inventory = new Inventory();
    netMap = new NetMap(assets, inventory, startDataBattle, () => {
      setCurrentView(startMenu);
      startMenu.draw();
    }, (data) => {
      const newSaveData = data;
      const newSaves = saves;
      if (!newSaveData.name) {
        let highest = 0;
        saves.forEach((save) => {
          const saveNum = parseInt(save.name.slice(5), 10);
          if (saveNum > highest) {
            highest = saveNum;
          }
        });
        newSaveData.name = `save_${highest + 1}`;
        newSaves.push(newSaveData);
      } else {
        const index = saves.findIndex((save) => save.name === newSaveData.name);
        newSaves[index] = newSaveData;
      }
      localStorage.setItem('saves', JSON.stringify(newSaves));
      startMenu.setSaves(newSaves);
    }, saveData);
    setCurrentView(netMap);
    netMap.draw();
  });
  setCurrentView(startMenu);
}
