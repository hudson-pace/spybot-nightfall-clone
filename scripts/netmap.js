import NetworkNode from './network-node.js'

const nodes = [];
const connections = [];

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

export default function NetMap(url, images, mapLoadedCallback) {
  let mapWidth;
  let mapHeight;
  let maxZoom;
  let showingGrid = false;
  const canvas = $('canvas')[0];
  const context = canvas.getContext('2d');
  const screenPosition = [0, 0];
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
    for (let i = -1 * (screenPosition[1] % 100); i < canvas.height; i += 100) {
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
  };

  this.onClick = function onClick(event) {
    const coords = {
      x: ((event.offsetX / canvas.clientWidth) * canvas.width) + screenPosition[0],
      y: ((event.offsetY / canvas.clientHeight) * canvas.height) + screenPosition[1],
    };
    nodes.forEach((node) => {
      if (node.isVisible && node.containsPoint(coords)) {
        if (!node.isOwned) {
          ownNode(node);
          this.draw();
        }
      }
    });
  };

  this.moveScreen = function moveScreen(x, y) {
    screenPosition[0] += x * zoomFactor;
    screenPosition[1] += y * zoomFactor;
    if (screenPosition[0] < 0) {
      screenPosition[0] = 0;
    } else if (screenPosition[0] + canvas.width > mapWidth) {
      screenPosition[0] = mapWidth - canvas.width;
    }
    if (screenPosition[1] < 0) {
      screenPosition[1] = 0;
    } else if (screenPosition[1] + canvas.height > mapHeight) {
      screenPosition[1] = mapHeight - canvas.height;
    }
    this.draw();
  };
  this.zoomScreen = function zoomScreen(z) {
    if (z < 0) {
      zoomFactor *= 1.1;
    } else if (z > 0) {
      zoomFactor /= 1.1;
    }
    if (zoomFactor < 0.5) {
      zoomFactor = 0.5;
    } else if (zoomFactor > maxZoom) {
      zoomFactor = maxZoom;
    }
    const oldWidth = canvas.width;
    const oldHeight = canvas.height;
    canvas.width = 1000 * zoomFactor;
    canvas.height = 500 * zoomFactor;

    // Divide by zoom factor to counteract zoom in the moveScreen function.
    this.moveScreen(((oldWidth - canvas.width) * relativeMousePosition[0]) / zoomFactor,
      ((oldHeight - canvas.height) * (relativeMousePosition[1])) / zoomFactor);
  };
  let mouseIsDown = false;
  let isDragging = false;
  let oldX;
  let oldY;
  $('canvas')
    .mousedown((event) => {
      mouseIsDown = true;
      isDragging = false;
      oldX = event.offsetX;
      oldY = event.offsetY;
    })
    .mouseup(() => {
      mouseIsDown = false;
    })
    .mouseleave(() => {
      mouseIsDown = false;
    })
    .mousemove((event) => {
      relativeMousePosition[0] = event.offsetX / canvas.clientWidth;
      relativeMousePosition[1] = event.offsetY / canvas.clientHeight;
      if (mouseIsDown) {
        isDragging = true;
        this.moveScreen(oldX - event.offsetX, oldY - event.offsetY);
        oldX = event.offsetX;
        oldY = event.offsetY;
      }
    })
    .click((event) => {
      if (!isDragging) {
        this.onClick(event);
      }
    })
    .bind('mousewheel', (event) => {
      this.zoomScreen(event.originalEvent.wheelDelta / 120);
    });
  $(document).keydown((event) => {
    if (event.keyCode === 71) {
      showingGrid = !showingGrid;
      this.draw();
    }
  });
}
