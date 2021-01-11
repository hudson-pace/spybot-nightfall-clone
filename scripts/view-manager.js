import NetMap from './netmap.js';
import DataBattle from './databattle.js';
import Inventory from './inventory.js';
import StartMenu from './start-menu.js';

export default function ViewManager(saves, canvas) {
  let inventory = new Inventory();
  let assets;
  let currentView;
  function setCurrentView(newView) {
    currentView = newView;
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

  canvas.addEventListener('mousedown', (event) => {
    if (currentView && currentView.onMouseDown) {
      currentView.onMouseDown(event);
    }
  });
  canvas.addEventListener('mouseup', (event) => {
    if (currentView && currentView.onMouseUp) {
      currentView.onMouseUp(event);
    }
  });
  canvas.addEventListener('mouseleave', (event) => {
    if (currentView && currentView.onMouseLeave) {
      currentView.onMouseLeave(event);
    }
  });
  canvas.addEventListener('mousemove', (event) => {
    if (currentView && currentView.onMouseMove) {
      currentView.onMouseMove(event);
    }
  });
  canvas.addEventListener('click', (event) => {
    if (currentView && currentView.onClick) {
      currentView.onClick(event);
    }
  });
  canvas.addEventListener('mousewheel', (event) => {
    if (currentView && currentView.onMouseWheel) {
      currentView.onMouseWheel(event);
    }
  });
  document.addEventListener('keydown', (event) => {
    if (currentView && currentView.onKeyDown) {
      currentView.onKeyDown(event);
    }
  });
}
