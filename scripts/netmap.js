import NetworkNode from './network-node.js';
import { drawRect, calculateTextPadding, rectContainsPoint } from './helpers.js';
import Menu from './menus/menu.js';
import ProgramMenu from './menus/program-menu.js';
import DialogueMenu from './menus/dialogue-menu.js';
import Tutorial from './tutorial.js';
import Inventory from './inventory.js';
import DataBattle from './databattle.js';

function compareArrays(arr1, arr2) {
  return arr1.length === arr2.length && arr1.every((element, index) => element === arr2[index]);
}

export default class NetMap {
  constructor(assets, oldSaveData, saveManager, startMenuCallback) {
    this.assets = assets;
    this.oldSaveData = oldSaveData;
    this.saveManager = saveManager;
    this.startMenuCallback = startMenuCallback;

    this.saveData = {};
    this.showingDebugInfo = false;
    [this.canvas] = document.getElementsByTagName('canvas');
    this.context = this.canvas.getContext('2d');
    this.screenPosition = [0, 0];
    // Gives mouse position as fraction of element width. Used to zoom in on cursor.
    this.relativeMousePosition = [0, 0];
    this.zoomFactor = 1;
    this.menuButton = {
      x: this.canvas.width - 50,
      y: 0,
      width: 50,
      height: 30,
    };

    this.nodes = [];
    this.connections = [];

    const map = assets.netmap;
    this.mapWidth = map.size * 1000;
    this.mapHeight = map.size * 1000;
    this.maxZoom = Math.min(this.mapWidth / 100, this.mapHeight / 500);
    map.nodes.forEach((node) => {
      this.nodes.push(new NetworkNode(node, assets.images[node.image]));
    });

    this.inventory = new Inventory();

    if (oldSaveData) {
      this.loadSave();
    } else {
      this.newSave();
    }

    this.isDragging = false;
  }

  launchDataBattle(battleData) {
    this.dataBattle = new DataBattle(this.canvas, this.context, battleData, this.assets,
      this.inventory, (wonBattle, reward, bonusCredits) => {
        this.returnFromBattle(wonBattle, reward, bonusCredits);
        this.dataBattle = undefined;
        this.draw();
      });
  }

  addConnectionsFromNode(node) {
    node.connections.forEach((connection) => {
      if (!this.connections.find((c) => compareArrays(connection.path, c)
        || compareArrays(connection.path, [...c].reverse()))) {
        this.connections.push(connection.path);
        const destinationNode = this.nodes.find((destNode) => destNode.name === connection.node);
        destinationNode.activate();
      }
    });
  }

  draw() {
    if (this.tutorial) {
      this.tutorial.draw();
    } else if (this.dataBattle) {
      this.dataBattle.draw();
    } else {
      console.log('Redrawing netmap.');
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.scale(this.zoomFactor, this.zoomFactor);
      if (this.showingDebugInfo) {
        this.drawGrid();
      }

      this.context.lineWidth = 2;
      this.context.strokeStyle = '#d8ebff';
      this.connections.forEach((connection) => {
        this.context.beginPath();
        this.context.moveTo((connection[0].x * 100) - this.screenPosition[0],
          (connection[0].y * 100) - this.screenPosition[1]);
        connection.slice(1).forEach((point) => {
          this.context.lineTo((point.x * 100) - this.screenPosition[0],
            (point.y * 100) - this.screenPosition[1]);
        });
        this.context.stroke();
      });
      this.context.lineWidth = 1;
      this.nodes.forEach((node) => {
        if (node.isVisible) {
          node.draw(this.context, this.screenPosition, this.showingDebugInfo);
        }
      });
      this.context.scale(1 / this.zoomFactor, 1 / this.zoomFactor);
      if (this.nodeMenu) {
        this.nodeMenu.draw(this.context);
      }
      if (this.shop) {
        this.shop.draw();
      }
      this.context.font = '16px verdana';
      this.context.textBaseline = 'middle';
      this.context.fillStyle = 'white';
      this.context.fillText(`credits: ${this.inventory.credits}`, 800, 20);
      drawRect(this.menuButton, this.context);
      this.context.fillStyle = 'black';
      const [leftPad, topPad] = calculateTextPadding(this.menuButton, 'Menu', this.context);
      this.context.fillText('Menu', this.menuButton.x + leftPad, this.menuButton.y + topPad);
      this.programMenu.draw();
      if (this.dialogueMenu) {
        this.dialogueMenu.draw();
      }
    }
  }

  moveScreen(x, y) {
    this.screenPosition[0] += x / this.zoomFactor;
    this.screenPosition[1] += y / this.zoomFactor;
    if (this.screenPosition[0] < 0) {
      this.screenPosition[0] = 0;
    } else if (this.screenPosition[0] + (this.canvas.width / this.zoomFactor) > this.mapWidth) {
      this.screenPosition[0] = this.mapWidth - (this.canvas.width / this.zoomFactor);
    }
    if (this.screenPosition[1] < 0) {
      this.screenPosition[1] = 0;
    } else if (this.screenPosition[1] + (this.canvas.height / this.zoomFactor) > this.mapHeight) {
      this.screenPosition[1] = this.mapHeight - (this.canvas.height / this.zoomFactor);
    }
    this.draw();
  }

  centerScreenOnPoint(x, y) {
    this.screenPosition[0] = x - this.canvas.width / (2 * this.zoomFactor);
    this.screenPosition[1] = y - this.canvas.height / (2 * this.zoomFactor);
    this.draw();
  }

  ownNode(node) {
    node.own();
    this.addConnectionsFromNode(node);
    if (node.event) {
      this.dialogueMenu = new DialogueMenu(this.context, node.event.dialogue, (choiceValue) => {
        switch (node.event.type) {
          default:
            break;
          case 'add program':
            this.inventory.addProgram(node.event.programName);
            this.programMenu.updateProgramList(this.inventory.programs.map((program) => (
              { name: program.name, desc: `x${program.quantity}` })));
            break;
          case 'reveal node': {
            const newNode = this.nodes.find((n) => n.name === node.event.nodeName);
            newNode.reveal();
            this.centerScreenOnPoint(newNode.center.x, newNode.center.y);
            break;
          }
          case 'increase security level':
            this.securityLevel += 1;
            break;
          case 'add credits':
            this.inventory.addCredits(parseInt(node.event.credits, 10));
            break;
          case 'launch tutorial':
            if (choiceValue === 'yes') {
              this.tutorial = new Tutorial(node.battle, this.assets, this.canvas, this.context,
                () => {
                  this.tutorial = undefined;
                  this.draw();
                });
            }
            break;
        }
        this.dialogueMenu = undefined;
        this.draw();
      });
    }
    this.centerScreenOnPoint(node.center.x, node.center.y);
  }

  drawGrid() {
    for (let i = -1 * (this.screenPosition[1] % 100); i < this.mapHeight; i += 100) {
      this.context.beginPath();
      this.context.strokeStyle = 'white';
      this.context.moveTo(0, i);
      this.context.lineTo(this.mapWidth, i);
      this.context.stroke();
    }
    for (let i = -1 * (this.screenPosition[0] % 100); i < this.mapWidth; i += 100) {
      this.context.beginPath();
      this.context.strokeStyle = 'white';
      this.context.moveTo(i, 0);
      this.context.lineTo(i, this.mapHeight);
      this.context.stroke();
    }
  }

  zoomScreen(z) {
    const oldWidth = 1000 / this.zoomFactor;
    const oldHeight = 500 / this.zoomFactor;
    if (z < 0) {
      this.zoomFactor /= 1.1;
    } else if (z > 0) {
      this.zoomFactor *= 1.1;
    }
    if (this.zoomFactor < 0.5) {
      this.zoomFactor = 0.5;
    } else if (this.zoomFactor > this.maxZoom) {
      this.zoomFactor = this.maxZoom;
    }
    // Divide by zoom factor to counteract zoom in the moveScreen function.
    this.moveScreen(
      ((oldWidth - 1000 / this.zoomFactor) * this.relativeMousePosition[0]) * this.zoomFactor,
      ((oldHeight - 500 / this.zoomFactor) * (this.relativeMousePosition[1])) * this.zoomFactor,
    );
  }

  openNodeMenu(node) {
    this.nodeMenu = new Menu(this.canvas.width * 0.7, this.canvas.height * 0.2,
      this.canvas.width * 0.25, 0, this.context);
    this.nodeMenu.addTextBlock(node.name, 20, true);
    this.nodeMenu.addTextBlock(node.owner, 16, true);
    this.nodeMenu.addGap(10);
    this.nodeMenu.addTextBlock(node.desc, 15, false);
    this.nodeMenu.addGap(10);
    if (node.isActive) {
      if (this.securityLevel >= node.securityLevel) {
        this.nodeMenu.addButton('Start', 16, 100, true, true, () => {
          this.nodeMenu = undefined;
          this.startNode();
        });
      } else {
        this.nodeMenu.addTextBlock('[Higher security clearance is needed to access this node.]', 16, false);
      }
    }
    this.nodeMenu.addButton('Close', 16, 100, true, true, () => {
      this.nodeMenu = undefined;
      this.draw();
    });
  }

  returnFromBattle(wonBattle, reward, bonusCredits) {
    if (wonBattle) {
      this.ownNode(this.selectedNode);
      this.inventory.addCredits(reward + bonusCredits);
    }
    this.draw();
    this.updateSaveData();
  }

  startNode() {
    if (this.selectedNode.owner === 'Warez') {
      this.startShop(this.selectedNode);
    } else if (this.selectedNode.owner !== 'S.M.A.R.T.') {
      this.launchDataBattle(this.selectedNode.battle);
    } else {
      this.draw();
    }
  }

  startShop(node) {
    let selectedItem;
    this.shop = new Menu(this.canvas.width * 0.3, this.canvas.height * 0.3, this.canvas.width * 0.4,
      0, this.context);
    this.shop.addTextBlock(node.name, 20, true);
    this.shop.addTextBlock(node.owner, 15, true);
    node.shop.sort((a, b) => ((a.name > b.name) ? 1 : -1));
    this.shop.addScrollList(8, 14,
      node.shop.map((item) => ({ name: item.name, desc: item.price })),
      (itemName) => {
        selectedItem = itemName;
        this.programMenu.showProgramInfoFromName(itemName);
      });
    this.shop.addButton('Buy', 16, 0, true, true, () => {
      const itemInfo = node.shop.find((item) => item.name === selectedItem);
      if (itemInfo && this.inventory.spendCredits(itemInfo.price)) {
        this.inventory.addProgram(itemInfo.name);
        this.programMenu.updateProgramList(this.inventory.programs.map((program) => (
          { name: program.name, desc: `x${program.quantity}` })));
      }
    });
    this.shop.addButton('Close', 16, 0, true, true, () => {
      this.shop = undefined;
      this.updateSaveData();
    });

    this.draw();
  }

  updateSaveData() {
    this.saveData.credits = this.inventory.credits;
    this.saveData.programs = this.inventory.programs;
    this.saveData.securityLevel = this.securityLevel;
    this.saveData.ownedNodes = [];
    this.saveData.visibleNodes = [];
    this.nodes.forEach((node) => {
      if (node.isOwned) {
        this.saveData.ownedNodes.push(node.name);
      } else if (node.isVisible) {
        this.saveData.visibleNodes.push(node.name);
      }
    });

    this.saveManager.updateSave(this.saveData);
  }

  loadSave() {
    this.saveData.name = this.oldSaveData.name;
    this.saveData.credits = this.oldSaveData.credits;
    this.saveData.programs = this.oldSaveData.programs;
    this.saveData.securityLevel = this.oldSaveData.securityLevel;
    this.saveData.ownedNodes = this.oldSaveData.ownedNodes;
    this.saveData.visibleNodes = this.oldSaveData.visibleNodes;

    this.inventory.addCredits(this.saveData.credits);

    this.saveData.programs.forEach((program) => {
      this.inventory.addProgram(program.name, program.quantity);
    });

    this.programMenu = new ProgramMenu(this.assets, this.canvas, this.inventory.programs.map(
      (program) => ({ name: program.name, desc: `x${program.quantity}` }),
    ));

    this.securityLevel = this.saveData.securityLevel;

    this.nodes.forEach((node) => {
      if (this.saveData.ownedNodes.find((ownedNode) => ownedNode === node.name)) {
        node.own();
        this.addConnectionsFromNode(node);
        this.centerScreenOnPoint(node.center.x, node.center.y);
      } else if (this.saveData.visibleNodes.find((visibleNode) => visibleNode.name === node.name)) {
        node.reveal();
      }
    });

    this.updateSaveData();
  }

  newSave() {
    this.inventory.addCredits(10000);

    this.inventory.addProgram('Hack', 2);
    this.inventory.addProgram('Bug', 1);
    this.inventory.addProgram('Slingshot', 1);
    this.inventory.addProgram('Data Doctor', 1);
    this.inventory.addProgram('Hack 2.0', 1);
    this.inventory.addProgram('Mud Golem', 1);
    this.inventory.addProgram('Wolf Spider', 1);
    this.inventory.addProgram('Seeker', 1);
    this.inventory.addProgram('Tower', 1);
    this.inventory.addProgram('Medic', 1);
    this.inventory.addProgram('Turbo', 1);

    this.programMenu = new ProgramMenu(this.assets, this.canvas, this.inventory.programs.map(
      (program) => ({ name: program.name, desc: `x${program.quantity}` }),
    ));

    this.securityLevel = 1;
    this.nodes.forEach((node) => {
      if (node.isOwned) {
        this.ownNode(node);
      }
    });

    this.updateSaveData();
  }

  onMouseDown(event) {
    if (!this.tutorial) {
      const point = {
        x: this.canvas.width * (event.offsetX / this.canvas.clientWidth),
        y: this.canvas.height * (event.offsetY / this.canvas.clientHeight),
      };
      if (!this.programMenu.containsPoint(point)
        && (!this.nodeMenu || !this.nodeMenu.containsPoint(point))
        && (!this.dialogueMenu || !this.dialogueMenu.containsPoint(point))) {
        this.isDragging = true;
      }
      this.oldX = event.offsetX;
      this.oldY = event.offsetY;
    }
  }

  onMouseUp() {
    if (!this.tutorial) {
      this.isDragging = false;
    }
  }

  onMouseLeave() {
    if (!this.tutorial) {
      this.isDragging = false;
    }
  }

  onMouseMove(event) {
    const point = {
      x: this.canvas.width * (event.offsetX / this.canvas.clientWidth),
      y: this.canvas.height * (event.offsetY / this.canvas.clientHeight),
    };
    if (!this.tutorial) {
      if (this.nodeMenu) {
        this.nodeMenu.onMouseMove(point);
      }
      if (this.dialogueMenu) {
        this.dialogueMenu.onMouseMove(point);
      }
      this.relativeMousePosition[0] = event.offsetX / this.canvas.clientWidth;
      this.relativeMousePosition[1] = event.offsetY / this.canvas.clientHeight;
      if (this.isDragging) {
        this.moveScreen(((this.oldX - event.offsetX) / this.canvas.clientWidth) * this.canvas.width,
          ((this.oldY - event.offsetY) / this.canvas.clientHeight) * this.canvas.height);
        this.oldX = event.offsetX;
        this.oldY = event.offsetY;
      }
    }
  }

  onClick(event) {
    const point = {
      x: this.canvas.width * (event.offsetX / this.canvas.clientWidth),
      y: this.canvas.height * (event.offsetY / this.canvas.clientHeight),
    };
    if (this.tutorial) {
      this.tutorial.onClick(point, event);
    } else if (this.dataBattle) {
      this.dataBattle.onClick(event);
    } else if (this.nodeMenu && this.nodeMenu.containsPoint(point)) {
      this.nodeMenu.onClick(point);
    } else if (this.shop && this.shop.containsPoint(point)) {
      this.shop.onClick(point);
      this.draw();
    } else if (rectContainsPoint(this.menuButton, point)) {
      this.startMenuCallback();
    } else if (this.programMenu.containsPoint(point)) {
      this.programMenu.onClick(point);
      this.draw();
    } else if (this.dialogueMenu && this.dialogueMenu.containsPoint(point)) {
      this.dialogueMenu.onClick(point);
      this.draw();
    } else if (!this.dialogueMenu) {
      const coords = {
        x: (((event.offsetX / this.canvas.clientWidth)
          * this.canvas.width) / this.zoomFactor) + this.screenPosition[0],
        y: (((event.offsetY / this.canvas.clientHeight)
          * this.canvas.height) / this.zoomFactor) + this.screenPosition[1],
      };
      const clickedNode = this.nodes.find((node) => node.containsPoint(coords));
      if (clickedNode && clickedNode.isVisible) {
        this.selectedNode = clickedNode;
        if (this.selectedNode.owner === 'Warez' && !this.selectedNode.isOwned) {
          this.ownNode(this.selectedNode);
        } else {
          this.openNodeMenu(this.selectedNode);
        }
        this.draw();
      }
    }
  }

  onMouseWheel(event) {
    if (this.tutorial) {
      this.tutorial.onMouseWheel(event);
    } else if (this.dataBattle) {
      this.dataBattle.onMouseWheel(event);
    } else {
      const point = {
        x: 1000 * (event.offsetX / this.canvas.clientWidth),
        y: 500 * (event.offsetY / this.canvas.clientHeight),
      };
      if (this.shop && this.shop.containsPoint(point)) {
        this.shop.onScroll(event.wheelDelta / 120);
      } else if (this.programMenu.containsPoint(point)) {
        this.programMenu.onScroll(point, event.wheelDelta / 120);
      } else {
        this.zoomScreen(event.wheelDelta / 120);
      }
    }
  }

  onKeyDown(event) {
    if (!this.tutorial) {
      if (event.keyCode === 71) {
        this.showingDebugInfo = !this.showingDebugInfo;
        this.draw();
      } else if (event.keyCode === 72) {
        this.updateSaveData();
      }
    }
  }
}
