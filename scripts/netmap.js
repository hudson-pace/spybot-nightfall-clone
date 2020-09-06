import NetworkNode from './network-node.js';
import { drawRect, calculateTextPadding, rectContainsPoint } from './helpers.js';
import Menu from './menus/menu.js';

const nodes = [];
const connections = [];
let selectedNode;

function compareArrays(arr1, arr2) {
  return arr1.length === arr2.length && arr1.every((element, index) => element === arr2[index]);
}
function addConnectionsFromNode(node) {
  node.connectedNodes.forEach((destinationNodeName) => {
    const newConnection = [node.name, destinationNodeName].sort();
    if (!connections.some((connection) => compareArrays(connection, newConnection))) {
      connections.push(newConnection);
      console.log(`Adding connection: ${newConnection[0]} <---> ${newConnection[1]}`);
      const destinationNode = nodes.find((destNode) => destNode.name === destinationNodeName);
      destinationNode.activate();
    }
  });
}
function createInitialConnections() {
  nodes.forEach((node) => {
    if (node.isOwned) {
      addConnectionsFromNode(node);
    }
  });
}
function ownNode(node) {
  node.own();
  addConnectionsFromNode(node);
}

export default function NetMap(url, assets, inventory, mapLoadedCallback,
  startDataBattleCallback, startMenuCallback) {
  let mapWidth;
  let mapHeight;
  let maxZoom;
  let showingGrid = false;
  const canvas = $('canvas')[0];
  const context = canvas.getContext('2d');
  const screenPosition = [0, 0];
  let nodeMenu;
  // Gives mouse position as fraction of element width. Used to zoom in on cursor.
  const relativeMousePosition = [0, 0];
  let zoomFactor = 1;
  this.menuButton = {
    x: canvas.width - 50,
    y: 0,
    width: 50,
    height: 30,
  };

  let programInfoMenu;
  const programListMenu = new Menu(0, 0, 200, canvas.height * 0.4, context);
  programInfoMenu = new Menu(0, canvas.height * 0.4, 200, canvas.height * 0.6, context);
  programListMenu.addTextBlock('Program List', 18, true);
  const programList = programListMenu.addScrollList(8, 14,
    inventory.programs.map((program) => ({ name: program.name, desc: `x${program.quantity}` })), (programName) => {
      const selectedProgram = assets.agents.find((program) => program.name === programName);
      programInfoMenu = new Menu(0, canvas.height * 0.4, 200, canvas.height * 0.6, context);
      programInfoMenu.addTextBlock('Program Info', 18, true);
      const imgSourceRect = {
        x: (selectedProgram.imgSource % 8) * 27,
        y: Math.floor(selectedProgram.imgSource / 8) * 27,
        width: 27,
        height: 27,
      };
      programInfoMenu.addImage(assets.images.agents, imgSourceRect, true);
      programInfoMenu.addTextBlock(selectedProgram.name, 16, true);
      programInfoMenu.addTextBlock('Commands', 14, false);
      programInfoMenu.addScrollList(3, 14, selectedProgram.commands.map((command) => ({ name: command, desc: '' })),
        (commandName) => {
          programInfoMenu.popComponent();
          const command = assets.commands.find((com) => com.name === commandName);
          let commandInfo = `name: ${command.name}\n`;
          commandInfo += `type: ${command.type}\n`;
          if (commandInfo.stat) {
            commandInfo += `stat: ${command.stat}\n`;
          }
          commandInfo += `range: ${command.range}\n`;
          commandInfo += `damage: ${command.damage}\n`;
          programInfoMenu.addTextBlock(commandInfo, 14, false);
        });
      programInfoMenu.addTextBlock(selectedProgram.desc, 14, false);
    });

  $.getJSON(url, (data) => {
    mapWidth = data.width;
    mapHeight = data.height;
    maxZoom = Math.min(mapWidth / 1000, mapHeight / 500);
    data.nodes.forEach((node) => {
      nodes.push(new NetworkNode(node, assets.images[node.image]));
    });
    createInitialConnections();

    const hqNode = nodes.find((node) => node.name === 'S.M.A.R.T. HQ');
    this.moveScreen(hqNode.center.x - (canvas.width / 2), hqNode.center.y - (canvas.height / 2));

    mapLoadedCallback();

    this.draw();
  });

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

  this.draw = function draw() {
    console.log('Redrawing netmap.');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.scale(zoomFactor, zoomFactor);
    if (showingGrid) {
      this.drawGrid();
    }

    context.lineWidth = 4;
    connections.forEach((connection) => {
      const startNode = nodes.find((node) => node.name === connection[0]);
      const endNode = nodes.find((node) => node.name === connection[1]);
      context.beginPath();
      context.strokeStyle = 'green';
      context.moveTo(startNode.center.x - screenPosition[0],
        startNode.center.y - screenPosition[1]);
      context.lineTo(endNode.center.x - screenPosition[0], endNode.center.y - screenPosition[1]);
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
    context.fillText(`credits: ${inventory.credits}`, 800, 20);
    drawRect(this.menuButton, context);
    context.fillStyle = 'black';
    const [leftPad, topPad] = calculateTextPadding(this.menuButton, 'Menu', context);
    context.fillText('Menu', this.menuButton.x + leftPad, this.menuButton.y + topPad);

    programListMenu.draw();
    if (programInfoMenu) {
      programInfoMenu.draw();
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

  let mouseIsDown = false;
  let isDragging = false;
  let oldX;
  let oldY;
  this.onMouseDown = function onMouseDown(event) {
    mouseIsDown = true;
    isDragging = false;
    oldX = event.offsetX;
    oldY = event.offsetY;
  };
  this.onMouseUp = function onMouseUp() {
    mouseIsDown = false;
  };
  this.onMouseLeave = function onMouseLeave() {
    mouseIsDown = false;
  };
  this.onMouseMove = function onMouseMove(event) {
    relativeMousePosition[0] = event.offsetX / canvas.clientWidth;
    relativeMousePosition[1] = event.offsetY / canvas.clientHeight;
    if (mouseIsDown) {
      isDragging = true;
      this.moveScreen(oldX - event.offsetX, oldY - event.offsetY);
      oldX = event.offsetX;
      oldY = event.offsetY;
    }
  };
  this.onClick = function onClick(event) {
    if (!isDragging) {
      const point = {
        x: 1000 * (event.offsetX / canvas.clientWidth),
        y: 500 * (event.offsetY / canvas.clientHeight),
      };
      if (nodeMenu && nodeMenu.containsPoint(point)) {
        nodeMenu.onClick(point);
      } else if (this.shop && this.shop.containsPoint(point)) {
        this.shop.onClick(point);
        this.draw();
      } else if (rectContainsPoint(this.menuButton, point)) {
        startMenuCallback();
      } else if (programListMenu.containsPoint(point)) {
        programListMenu.onClick(point);
        this.draw();
      } else if (programInfoMenu && programInfoMenu.containsPoint(point)) {
        programInfoMenu.onClick(point);
        this.draw();
      } else {
        const coords = {
          x: (((event.offsetX / canvas.clientWidth)
            * canvas.width) / zoomFactor) + screenPosition[0],
          y: (((event.offsetY / canvas.clientHeight)
            * canvas.height) / zoomFactor) + screenPosition[1],
        };
        const clickedNode = nodes.find((node) => node.containsPoint(coords));
        if (clickedNode && clickedNode.isVisible) {
          selectedNode = clickedNode;
          this.openNodeMenu(selectedNode);
          if (selectedNode.owner === 'Warez') {
            selectedNode.own();
          }
          this.draw();
        }
      }
    }
  };
  this.onMouseWheel = function onMouseWheel(event) {
    const point = {
      x: 1000 * (event.offsetX / canvas.clientWidth),
      y: 500 * (event.offsetY / canvas.clientHeight),
    };
    if (this.shop && this.shop.containsPoint(point)) {
      this.shop.onScroll(event.originalEvent.wheelDelta / 120);
    } else if (programListMenu && programListMenu.containsPoint(point)) {
      programListMenu.onScroll(event.originalEvent.wheelDelta / 120);
    } else if (programInfoMenu && programInfoMenu.containsPoint(point)) {
      programInfoMenu.onScroll(event.originalEvent.wheelDelta / 120);
    } else {
      this.zoomScreen(event.originalEvent.wheelDelta / 120);
    }
  };
  this.onKeydown = function onKeydown(event) {
    if (event.keyCode === 71) {
      showingGrid = !showingGrid;
      this.draw();
    }
  };

  this.openNodeMenu = function startNodeMenu(node) {
    nodeMenu = new Menu(canvas.width * 0.7, canvas.height * 0.2, canvas.width * 0.25, 0, context);
    nodeMenu.addTextBlock(node.name, 20, true);
    nodeMenu.addTextBlock(node.owner, 16, true);
    nodeMenu.addGap(10);
    nodeMenu.addTextBlock(node.desc, 15, false);
    nodeMenu.addGap(10);
    nodeMenu.addButton('Start', 100, true, true, () => {
      nodeMenu = undefined;
      this.startNode();
    });
    nodeMenu.addButton('Close', 100, true, true, () => {
      nodeMenu = undefined;
      this.draw();
    });
  };

  this.returnFromBattle = function returnFromBattle(wonBattle, reward, bonusCredits) {
    if (wonBattle) {
      console.log(`${reward} credits, plus ${bonusCredits} bonus credits`);
      ownNode(selectedNode);
      inventory.addCredits(reward + bonusCredits);
    } else {
      console.log('You lose. In your face. Haha what a loser.');
    }
    setTimeout(() => {
      this.draw();
    }, 500);
  };
  this.startNode = function startNode() {
    if (selectedNode.owner === 'Warez') {
      this.startShop(selectedNode);
    } else if (selectedNode.owner !== 'S.M.A.R.T.') {
      startDataBattleCallback(selectedNode.name);
    } else {
      this.draw();
    }
  };
  this.startShop = function startShop(node) {
    let selectedItem;
    this.shop = new Menu(canvas.width * 0.3, canvas.height * 0.3, canvas.width * 0.4, 0, context);
    this.shop.addTextBlock(node.name, 20, true);
    this.shop.addTextBlock(node.owner, 15, true);
    this.shop.addScrollList(8, 14,
      node.shop.map((item) => ({ name: item.name, desc: item.price })),
      (itemName) => {
        selectedItem = itemName;
      });
    this.shop.addButton('Buy', 0, true, true, () => {
      const itemInfo = node.shop.find((item) => item.name === selectedItem);
      if (itemInfo && inventory.spendCredits(itemInfo.price)) {
        inventory.addProgram(itemInfo.name);
        programList.updateMembers(inventory.programs.map((program) => (
          { name: program.name, desc: `x${program.quantity}` })));
      }
    });
    this.shop.addButton('Close', 0, true, true, () => {
      this.shop = undefined;
    });

    this.draw();
  };
}
