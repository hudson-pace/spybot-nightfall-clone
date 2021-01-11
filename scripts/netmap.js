import NetworkNode from './network-node.js';
import { drawRect, calculateTextPadding, rectContainsPoint } from './helpers.js';
import Menu from './menus/menu.js';
import ProgramMenu from './menus/program-menu.js';
import DialogueMenu from './menus/dialogue-menu.js';
import Tutorial from './tutorial.js';
import Inventory from './inventory.js';
import DataBattle from './databattle.js';

const nodes = [];
const connections = [];
let selectedNode;

function compareArrays(arr1, arr2) {
  return arr1.length === arr2.length && arr1.every((element, index) => element === arr2[index]);
}
function addConnectionsFromNode(node) {
  node.connections.forEach((connection) => {
    if (!connections.find((c) => compareArrays(connection.path, c)
      || compareArrays(connection.path, [...c].reverse()))) {
      connections.push(connection.path);
      const destinationNode = nodes.find((destNode) => destNode.name === connection.node);
      destinationNode.activate();
    }
  });
}

export default function NetMap(assets, oldSaveData, saveManager, startMenuCallback) {
  const saveData = {};
  let showingGrid = false;
  const canvas = document.getElementsByTagName('canvas')[0];
  const context = canvas.getContext('2d');
  const screenPosition = [0, 0];
  let nodeMenu;
  let tutorial;
  // Gives mouse position as fraction of element width. Used to zoom in on cursor.
  const relativeMousePosition = [0, 0];
  let zoomFactor = 1;
  this.menuButton = {
    x: canvas.width - 50,
    y: 0,
    width: 50,
    height: 30,
  };

  let programMenu;

  const map = assets.netmap;
  const mapWidth = map.size * 1000;
  const mapHeight = map.size * 1000;
  const maxZoom = Math.min(mapWidth / 100, mapHeight / 500);
  map.nodes.forEach((node) => {
    nodes.push(new NetworkNode(node, assets.images[node.image]));
  });

  this.inventory = new Inventory();
  this.saveManager = saveManager;

  this.launchDataBattle = function launchDataBattle(battleData) {
    this.dataBattle = new DataBattle(canvas, context, battleData, assets, this.inventory,
      (wonBattle, reward, bonusCredits) => {
        this.returnFromBattle(wonBattle, reward, bonusCredits);
        this.dataBattle = undefined;
        this.draw();
      });
  };

  this.draw = function draw() {
    if (tutorial) {
      tutorial.draw();
    } else if (this.dataBattle) {
      this.dataBattle.draw();
    } else {
      console.log('Redrawing netmap.');
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.scale(zoomFactor, zoomFactor);
      if (showingGrid) {
        this.drawGrid();
      }

      context.lineWidth = 4;
      context.strokeStyle = 'green';
      connections.forEach((connection) => {
        context.beginPath();
        context.moveTo((connection[0].x * 100) - screenPosition[0],
          (connection[0].y * 100) - screenPosition[1]);
        connection.slice(1).forEach((point) => {
          context.lineTo((point.x * 100) - screenPosition[0], (point.y * 100) - screenPosition[1]);
        });
        context.stroke();
      });
      context.lineWidth = 1;
      nodes.forEach((node) => {
        if (node.isVisible) {
          node.draw(context, screenPosition);
        }
      });
      context.scale(1 / zoomFactor, 1 / zoomFactor);
      if (nodeMenu) {
        nodeMenu.draw(context);
      }
      if (this.shop) {
        this.shop.draw();
      }
      context.font = '16px verdana';
      context.textBaseline = 'middle';
      context.fillStyle = 'white';
      context.fillText(`credits: ${this.inventory.credits}`, 800, 20);
      drawRect(this.menuButton, context);
      context.fillStyle = 'black';
      const [leftPad, topPad] = calculateTextPadding(this.menuButton, 'Menu', context);
      context.fillText('Menu', this.menuButton.x + leftPad, this.menuButton.y + topPad);
      programMenu.draw();
      if (this.dialogueMenu) {
        this.dialogueMenu.draw();
      }
    }
  };

  this.moveScreen = function moveScreen(x, y) {
    screenPosition[0] += x / zoomFactor;
    screenPosition[1] += y / zoomFactor;
    if (screenPosition[0] < 0) {
      screenPosition[0] = 0;
    } else if (screenPosition[0] + (canvas.width / zoomFactor) > mapWidth) {
      screenPosition[0] = mapWidth - (canvas.width / zoomFactor);
    }
    if (screenPosition[1] < 0) {
      screenPosition[1] = 0;
    } else if (screenPosition[1] + (canvas.height / zoomFactor) > mapHeight) {
      screenPosition[1] = mapHeight - (canvas.height / zoomFactor);
    }
    this.draw();
  };

  this.centerScreenOnPoint = function centerScreenOnPoint(x, y) {
    screenPosition[0] = x - canvas.width / (2 * zoomFactor);
    screenPosition[1] = y - canvas.height / (2 * zoomFactor);
    this.draw();
  };

  this.ownNode = function ownNode(node) {
    node.own();
    addConnectionsFromNode(node);
    if (node.event) {
      this.dialogueMenu = new DialogueMenu(context, node.event.dialogue, (choiceValue) => {
        switch (node.event.type) {
          default:
            break;
          case 'add program':
            this.inventory.addProgram(node.event.programName);
            programMenu.updateProgramList(this.inventory.programs.map((program) => (
              { name: program.name, desc: `x${program.quantity}` })));
            break;
          case 'reveal node': {
            const newNode = nodes.find((n) => n.name === node.event.nodeName);
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
              tutorial = new Tutorial(node.battle, assets, canvas, context, () => {
                tutorial = undefined;
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
  };

  this.drawGrid = function drawGrid() {
    for (let i = -1 * (screenPosition[1] % 100); i < mapHeight; i += 100) {
      context.beginPath();
      context.strokeStyle = 'grey';
      context.moveTo(0, i);
      context.lineTo(mapWidth, i);
      context.stroke();
    }
    for (let i = -1 * (screenPosition[0] % 100); i < mapWidth; i += 100) {
      context.beginPath();
      context.strokeStyle = 'grey';
      context.moveTo(i, 0);
      context.lineTo(i, mapHeight);
      context.stroke();
    }
  };

  this.zoomScreen = function zoomScreen(z) {
    const oldWidth = 1000 / zoomFactor;
    const oldHeight = 500 / zoomFactor;
    if (z < 0) {
      zoomFactor /= 1.1;
    } else if (z > 0) {
      zoomFactor *= 1.1;
    }
    if (zoomFactor < 0.5) {
      zoomFactor = 0.5;
    } else if (zoomFactor > maxZoom) {
      zoomFactor = maxZoom;
    }
    // Divide by zoom factor to counteract zoom in the moveScreen function.
    this.moveScreen(((oldWidth - 1000 / zoomFactor) * relativeMousePosition[0]) * zoomFactor,
      ((oldHeight - 500 / zoomFactor) * (relativeMousePosition[1])) * zoomFactor);
  };

  this.openNodeMenu = function startNodeMenu(node) {
    nodeMenu = new Menu(canvas.width * 0.7, canvas.height * 0.2, canvas.width * 0.25, 0, context);
    nodeMenu.addTextBlock(node.name, 20, true);
    nodeMenu.addTextBlock(node.owner, 16, true);
    nodeMenu.addGap(10);
    nodeMenu.addTextBlock(node.desc, 15, false);
    nodeMenu.addGap(10);
    if (node.isActive) {
      if (this.securityLevel >= node.securityLevel) {
        nodeMenu.addButton('Start', 16, 100, true, true, () => {
          nodeMenu = undefined;
          this.startNode();
        });
      } else {
        nodeMenu.addTextBlock('[Higher security clearance is needed to access this node.]', 16, false);
      }
    }
    nodeMenu.addButton('Close', 16, 100, true, true, () => {
      nodeMenu = undefined;
      this.draw();
    });
  };

  this.returnFromBattle = function returnFromBattle(wonBattle, reward, bonusCredits) {
    if (wonBattle) {
      this.ownNode(selectedNode);
      this.inventory.addCredits(reward + bonusCredits);
    }
    this.draw();
    this.updateSaveData();
  };
  this.startNode = function startNode() {
    if (selectedNode.owner === 'Warez') {
      this.startShop(selectedNode);
    } else if (selectedNode.owner !== 'S.M.A.R.T.') {
      this.launchDataBattle(selectedNode.battle);
    } else {
      this.draw();
    }
  };
  this.startShop = function startShop(node) {
    let selectedItem;
    this.shop = new Menu(canvas.width * 0.3, canvas.height * 0.3, canvas.width * 0.4, 0, context);
    this.shop.addTextBlock(node.name, 20, true);
    this.shop.addTextBlock(node.owner, 15, true);
    node.shop.sort((a, b) => ((a.name > b.name) ? 1 : -1));
    this.shop.addScrollList(8, 14,
      node.shop.map((item) => ({ name: item.name, desc: item.price })),
      (itemName) => {
        selectedItem = itemName;
        programMenu.showProgramInfoFromName(itemName);
      });
    this.shop.addButton('Buy', 16, 0, true, true, () => {
      const itemInfo = node.shop.find((item) => item.name === selectedItem);
      if (itemInfo && this.inventory.spendCredits(itemInfo.price)) {
        this.inventory.addProgram(itemInfo.name);
        programMenu.updateProgramList(this.inventory.programs.map((program) => (
          { name: program.name, desc: `x${program.quantity}` })));
      }
    });
    this.shop.addButton('Close', 16, 0, true, true, () => {
      this.shop = undefined;
      this.updateSaveData();
    });

    this.draw();
  };

  this.updateSaveData = function updateSaveData() {
    saveData.credits = this.inventory.credits;
    saveData.programs = this.inventory.programs;
    saveData.securityLevel = this.securityLevel;
    saveData.ownedNodes = [];
    saveData.visibleNodes = [];
    nodes.forEach((node) => {
      if (node.isOwned) {
        saveData.ownedNodes.push(node.name);
      } else if (node.isVisible) {
        saveData.visibleNodes.push(node.name);
      }
    });

    this.saveManager.updateSave(saveData);
  };

  this.loadSave = function loadSave() {
    saveData.name = oldSaveData.name;
    saveData.credits = oldSaveData.credits;
    saveData.programs = oldSaveData.programs;
    saveData.securityLevel = oldSaveData.securityLevel;
    saveData.ownedNodes = oldSaveData.ownedNodes;
    saveData.visibleNodes = oldSaveData.visibleNodes;

    this.inventory.addCredits(saveData.credits);

    saveData.programs.forEach((program) => {
      this.inventory.addProgram(program.name, program.quantity);
    });

    programMenu = new ProgramMenu(assets, canvas, this.inventory.programs.map(
      (program) => ({ name: program.name, desc: `x${program.quantity}` }),
    ));

    this.securityLevel = saveData.securityLevel;

    nodes.forEach((node) => {
      if (saveData.ownedNodes.find((ownedNode) => ownedNode === node.name)) {
        node.own();
        addConnectionsFromNode(node);
        this.centerScreenOnPoint(node.center.x, node.center.y);
      } else if (saveData.visibleNodes.find((visibleNode) => visibleNode.name === node.name)) {
        node.reveal();
      }
    });

    this.updateSaveData();
  };
  this.newSave = function newSave() {
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

    programMenu = new ProgramMenu(assets, canvas, this.inventory.programs.map(
      (program) => ({ name: program.name, desc: `x${program.quantity}` }),
    ));

    this.securityLevel = 1;
    nodes.forEach((node) => {
      if (node.isOwned) {
        this.ownNode(node);
      }
    });

    this.updateSaveData();
  };

  if (oldSaveData) {
    this.loadSave();
  } else {
    this.newSave();
  }

  let isDragging = false;
  let oldX;
  let oldY;
  this.onMouseDown = function onMouseDown(event) {
    if (!tutorial) {
      const point = {
        x: canvas.width * (event.offsetX / canvas.clientWidth),
        y: canvas.height * (event.offsetY / canvas.clientHeight),
      };
      if (!programMenu.containsPoint(point) && (!nodeMenu || !nodeMenu.containsPoint(point))
        && (!this.dialogueMenu || !this.dialogueMenu.containsPoint(point))) {
        isDragging = true;
      }
      oldX = event.offsetX;
      oldY = event.offsetY;
    }
  };
  this.onMouseUp = function onMouseUp() {
    if (!tutorial) {
      isDragging = false;
    }
  };
  this.onMouseLeave = function onMouseLeave() {
    if (!tutorial) {
      isDragging = false;
    }
  };
  this.onMouseMove = function onMouseMove(event) {
    if (!tutorial) {
      relativeMousePosition[0] = event.offsetX / canvas.clientWidth;
      relativeMousePosition[1] = event.offsetY / canvas.clientHeight;
      if (isDragging) {
        this.moveScreen(((oldX - event.offsetX) / canvas.clientWidth) * canvas.width,
          ((oldY - event.offsetY) / canvas.clientHeight) * canvas.height);
        oldX = event.offsetX;
        oldY = event.offsetY;
      }
    }
  };
  this.onClick = function onClick(event) {
    const point = {
      x: canvas.width * (event.offsetX / canvas.clientWidth),
      y: canvas.height * (event.offsetY / canvas.clientHeight),
    };
    if (tutorial) {
      tutorial.onClick(point, event);
    } else if (this.dataBattle) {
      this.dataBattle.onClick(event);
    } else if (nodeMenu && nodeMenu.containsPoint(point)) {
      nodeMenu.onClick(point);
    } else if (this.shop && this.shop.containsPoint(point)) {
      this.shop.onClick(point);
      this.draw();
    } else if (rectContainsPoint(this.menuButton, point)) {
      startMenuCallback();
    } else if (programMenu.containsPoint(point)) {
      programMenu.onClick(point);
      this.draw();
    } else if (this.dialogueMenu && this.dialogueMenu.containsPoint(point)) {
      this.dialogueMenu.onClick(point);
      this.draw();
    } else if (!this.dialogueMenu) {
      const coords = {
        x: (((event.offsetX / canvas.clientWidth)
          * canvas.width) / zoomFactor) + screenPosition[0],
        y: (((event.offsetY / canvas.clientHeight)
          * canvas.height) / zoomFactor) + screenPosition[1],
      };
      const clickedNode = nodes.find((node) => node.containsPoint(coords));
      if (clickedNode && clickedNode.isVisible) {
        selectedNode = clickedNode;
        if (selectedNode.owner === 'Warez' && !selectedNode.isOwned) {
          this.ownNode(selectedNode);
        } else {
          this.openNodeMenu(selectedNode);
        }
        this.draw();
      }
    }
  };
  this.onMouseWheel = function onMouseWheel(event) {
    if (tutorial) {
      tutorial.onMouseWheel(event);
    } else if (this.dataBattle) {
      this.dataBattle.onMouseWheel(event);
    } else {
      const point = {
        x: 1000 * (event.offsetX / canvas.clientWidth),
        y: 500 * (event.offsetY / canvas.clientHeight),
      };
      if (this.shop && this.shop.containsPoint(point)) {
        this.shop.onScroll(event.wheelDelta / 120);
      } else if (programMenu.containsPoint(point)) {
        programMenu.onScroll(point, event.wheelDelta / 120);
      } else {
        this.zoomScreen(event.wheelDelta / 120);
      }
    }
  };
  this.onKeydown = function onKeydown(event) {
    if (!tutorial) {
      if (event.keyCode === 71) {
        showingGrid = !showingGrid;
        this.draw();
      } else if (event.keyCode === 72) {
        this.updateSaveData();
      }
    }
  };
}
