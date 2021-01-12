import DataBattle from './databattle.js';
import Menu from './menus/menu.js';
import Inventory from './inventory.js';

export default class Tutorial {
  constructor(battleData, assets, canvas, context, exitTutorialCallback) {
    const inventory = new Inventory();
    inventory.addProgram('Hack', 1);
    inventory.addProgram('Slingshot', 1);
    this.databattle = new DataBattle(canvas, context, battleData, assets, inventory, () => {
      exitTutorialCallback();
    });
    const { startButton, programMenu, map } = this.databattle.getTutorialInfo();
    this.startButton = startButton;
    this.programMenu = programMenu;
    this.map = map;
    this.canvas = canvas;
    this.context = context;
    this.menu = new Menu(this.canvas.width * 0.7, this.canvas.height * 0.3,
      this.canvas.width * 0.2, 0, this.context);
    this.menu.addTextBlock('', 14, false);
    this.step = 0;
    this.instructions = [
      '',
      "To start, select 'Hack' from the program menu to the left.",
      'Now place it on the bottom-right upload square.',
      "Next, select 'Slingshot' from the program menu.",
      'Place it on the remaining upload square.',
      "Start the battle by clicking the 'start' button in the bottom left.",
      "The game is afoot! Select your 'Hack' program by clicking on it.",
      'By clicking on the highlighted squares, move it two tiles to the right.',
      'By clicking on the highlighted squares, move it two tiles to the right.',
      "The 'Slice' attack has been automatically selected. Attack the enemy by clicking on the highlighted tile.",
      "Your 'Hack' program's turn is now over. 'Slingshot' has been selected automatically. Move it over two spaces.",
      "Your 'Hack' program's turn is now over. 'Slingshot' has been selected automatically. Move it over two spaces.",
      "'Slingshot' is out of moves. Its 'Stone' attack has been automatically selected. Use it to finish off your opponent.",
      '',
    ];

    this.goToNextStep();
  }

  onClick(point, event) {
    switch (this.step) {
      case 1:
        if (this.programMenu.containsPoint(point)) {
          this.databattle.onClick(event);
          if (this.programMenu.selectedProgram === 'Hack') {
            this.goToNextStep();
          }
        }
        break;
      case 2:
        this.clickIfCorrectTile(this.map.tiles, point, event, 3, 4);
        break;
      case 3:
        if (this.programMenu.containsPoint(point)) {
          this.databattle.onClick(event);
          if (this.programMenu.selectedProgram === 'Slingshot') {
            this.goToNextStep();
          }
        }
        break;
      case 4:
        this.clickIfCorrectTile(this.map.tiles, point, event, 2, 2);
        break;
      case 5:
        if (this.startButton.containsPoint(point)) {
          this.databattle.onClick(event);
          this.goToNextStep();
        }
        break;
      case 6:
        this.clickIfCorrectTile(this.map.tiles, point, event, 3, 4);
        break;
      case 7:
        this.clickIfCorrectTile(this.map.tiles, point, event, 4, 4);
        break;
      case 8:
        this.clickIfCorrectTile(this.map.tiles, point, event, 5, 4);
        break;
      case 9:
        this.clickIfCorrectTile(this.map.tiles, point, event, 6, 4);
        break;
      case 10:
        this.clickIfCorrectTile(this.map.tiles, point, event, 3, 2);
        break;
      case 11:
        this.clickIfCorrectTile(this.map.tiles, point, event, 4, 2);
        break;
      case 12:
        this.clickIfCorrectTile(this.map.tiles, point, event, 6, 2);
        break;
      default:
        break;
    }
  }

  goToNextStep() {
    this.step += 1;
    this.changeMenuText(this.instructions[this.step]);
    this.draw();
  }

  clickIfCorrectTile(tiles, point, event, x, y) {
    tiles.forEach((tile) => {
      if (tile.containsPoint(point) && tile.x === x && tile.y === y) {
        this.databattle.onClick(event);
        this.goToNextStep();
      }
    });
  }

  changeMenuText(newText) {
    this.menu.popComponent();
    this.menu.addTextBlock(newText, 14, false);
  }

  onMouseWheel(event) {
    this.databattle.onMouseWheel(event);
  }

  draw() {
    this.databattle.draw();
    this.menu.draw();

    // Draw the menu again after a delay.
    // Some of the databattle operations were drawing over the menu.
    setTimeout(() => {
      this.menu.draw();
    }, 1000);
  }
}
