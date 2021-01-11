import { calculateTextPadding, drawRect, rectContainsPoint } from './helpers.js';
import loadAssets from './asset-loader.js';
import Menu from './menus/menu.js';

export default class StartMenu {
  constructor(canvas, saves, startGameCallback) {
    this.startButton = {
      x: 100,
      y: 100,
      width: 200,
      height: 50,
    };
    this.levelEditorButton = {
      x: 100,
      y: 200,
      width: 200,
      height: 50,
    };
    this.startGameCallback = startGameCallback;
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d');
    this.saves = saves;
    this.draw();
  }

  setSaves(saves) {
    this.saves = saves;
  }

  draw() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = 'white';
    drawRect(this.startButton, this.context);
    drawRect(this.levelEditorButton, this.context);
    this.context.font = '20px verdana';
    this.context.textBaseline = 'middle';
    this.context.fillStyle = 'black';
    let [leftPad, topPad] = calculateTextPadding(this.startButton, 'Start Game', this.context);
    this.context.fillText('Start Game', this.startButton.x + leftPad, this.startButton.y + topPad);
    [leftPad, topPad] = calculateTextPadding(this.levelEditorButton, 'Level Editor', this.context);
    this.context.fillText('Level Editor', this.levelEditorButton.x + leftPad, this.levelEditorButton.y + topPad);
    if (this.savesMenu) {
      this.savesMenu.draw();
    }
  }

  onClick(event) {
    const point = {
      x: (event.offsetX / this.canvas.clientWidth) * this.canvas.width,
      y: (event.offsetY / this.canvas.clientHeight) * this.canvas.height,
    };
    if (this.savesMenu && rectContainsPoint(this.savesMenu.rect, point)) {
      this.savesMenu.onClick(point);
    } else if (rectContainsPoint(this.startButton, point)) {
      this.openSavesMenu();
    } else if (rectContainsPoint(this.levelEditorButton, point)) {
      const path = window.location.pathname;
      window.open(`${path}level-editor`, '_blank');
    }
  }

  openSavesMenu() {
    const saveList = [];
    if (this.saves) {
      this.saves.forEach((save) => {
        saveList.push({ name: save.name, desc: save.credits });
      });
    }
    saveList.push({ name: 'New Save', desc: '' });
    this.savesMenu = new Menu(this.canvas.width * 0.1, this.canvas.height * 0.1,
      this.canvas.width * 0.8, this.canvas.height * 0.8, this.context);
    let previousSelection;
    this.savesMenu.addScrollList(6, 16, saveList, (name) => {
      this.savesMenu.popComponent();
      if (previousSelection) {
        this.savesMenu.popComponent();
        this.savesMenu.popComponent();
        if (previousSelection !== 'New Save') {
          this.savesMenu.popComponent();
        }
      }
      previousSelection = name;

      const saveData = this.saves.find((save) => save.name === name);
      this.savesMenu.addButton('Start Game', 18, 0, true, false, () => {
        loadAssets((assets) => {
          this.startGameCallback(assets, saveData);
          this.savesMenu = undefined;
        });
      });
      if (name === 'New Save') {
        this.savesMenu.addButton('Import Save', 18, 0, true, false, () => {
          const saveString = prompt('Please enter your save information:');
          if (saveString) {
            const data = JSON.parse(atob(saveString));
            delete data.name;
            loadAssets((assets) => {
              this.startGameCallback(assets, data);
              this.savesMenu = undefined;
            });
          }
        });
      } else {
        this.savesMenu.addButton('Export Save', 18, 0, true, false, () => {
          console.log(btoa(JSON.stringify(saveData)));
        });
        this.savesMenu.addButton('Delete', 18, 0, true, false, () => {
          console.log('delete');
        });
      }
      this.savesMenu.addButton('Cancel', 20, 0, true, true, () => {
        this.savesMenu = undefined;
        this.draw();
      });
      this.draw();
    });
    this.savesMenu.addButton('Cancel', 20, 0, true, true, () => {
      this.savesMenu = undefined;
      this.draw();
    });
    this.draw();
  }
}
