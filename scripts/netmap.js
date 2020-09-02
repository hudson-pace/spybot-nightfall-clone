import NetworkNode from './network-node.js';
import NodeMenu from './node-menu.js';
import Inventory from './inventory.js';
import Shop from './shop.js';

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

export default function NetMap(url, images, inventory, programMenu, mapLoadedCallback,
  startDataBattleCallback) {
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

  $.getJSON(url, (data) => {
    mapWidth = data.width;
    mapHeight = data.height;
    maxZoom = Math.min(mapWidth / 1000, mapHeight / 500);
    data.nodes.forEach((node) => {
      nodes.push(new NetworkNode(node, images[node.image]));
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
      this.shop.draw(context);
    }
    programMenu.draw(context);
    context.font = '16px verdana';
    context.textBaseline = 'middle';
    context.fillStyle = 'white';
    context.fillText(`credits: ${inventory.credits}`, 800, 20);
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
      } else if (programMenu.containsPoint(point)) {
        programMenu.onClick(point);
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
          nodeMenu = new NodeMenu(selectedNode, canvas, this.startNode.bind(this), () => {
            nodeMenu = undefined;
            this.draw();
          });
          if (selectedNode.owner === 'Warez') {
            selectedNode.own();
          }
          this.draw();
        }
      }
    }
  };
  this.onMouseWheel = function onMouseWheel(event) {
    this.zoomScreen(event.originalEvent.wheelDelta / 120);
  };
  this.onKeydown = function onKeydown(event) {
    if (event.keyCode === 71) {
      showingGrid = !showingGrid;
      this.draw();
    }
  };
  this.returnFromBattle = function returnFromBattle(wonBattle, reward) {
    if (wonBattle) {
      ownNode(selectedNode);
      inventory.addCredits(reward);
    } else {
      console.log('You lose. In your face. Haha what a loser.');
    }
    setTimeout(() => {
      this.draw();
    }, 500);
  };
  this.startNode = function startNode() {
    if (selectedNode.owner === 'Warez') {
      this.startShop(selectedNode.shop);
    } else if (selectedNode.owner !== 'S.M.A.R.T.') {
      startDataBattleCallback(selectedNode.name);
    }
  };
  this.startShop = function startShop(shopData) {
    this.shop = new Shop(shopData, canvas, inventory, programMenu, () => {
      this.shop = undefined;
    });
    this.draw();
  };
}
