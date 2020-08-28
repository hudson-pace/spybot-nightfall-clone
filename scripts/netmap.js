import NetworkNode from './network-node.js'

export default function NetMap(url, images, mapLoadedCallback) {
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
        console.log(newConnection);
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

  $.getJSON(url, (data) => {
    data.nodes.forEach((node) => {
      nodes.push(new NetworkNode(node, images[node.image]));
    });
    createInitialConnections();

    mapLoadedCallback();
  });

  this.draw = function draw(context) {
    connections.forEach((connection) => {
      const startNode = nodes.find((node) => node.name === connection[0]);
      const endNode = nodes.find((node) => node.name === connection[1]);
      context.beginPath();
      context.strokeStyle = 'green';
      context.moveTo(startNode.center.x, startNode.center.y);
      context.lineTo(endNode.center.x, endNode.center.y);
      context.stroke();
    });
    nodes.forEach((node) => {
      if (node.isVisible) {
        node.draw(context);
      }
    });
  };

  this.onClick = function onClick(event) {
    const canvas = $('canvas')[0];
    const coords = {
      x: (event.offsetX / canvas.clientWidth) * canvas.width,
      y: (event.offsetY / canvas.clientHeight) * canvas.height,
    };
    nodes.forEach((node) => {
      if (node.isVisible && node.containsPoint(coords)) {
        console.log('hit');
        if (!node.isOwned) {
          ownNode(node);
        }
      }
    });
  };
}
