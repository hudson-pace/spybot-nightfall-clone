export default class {

  constructor () {
    this.modes = {
      ADD_NODE: 'add',
      EDIT: 'edit',
      ADDING_CONNECTION: 'adding connection',
      NONE: 'none',
    };
    this.tileTypes = {
      NONE: 'none',
      NODE: 'node',
      CONNECTION_HORIZONTAL: 'connection-horizontal',
      CONNECTION_VERTICAL: 'connection-vertical',
      CONNECTION_TOP_CORNER: 'connection-top-corner',
      CONNECTION_LEFT_CORNER: 'connection-left-corner',
      CONNECTION_RIGHT_CORNER: 'connection-right-corner',
      CONNECTION_BOTTOM_CORNER: 'connection-bottom-corner',
    };
    this.ownerList = [
      'Cellular Automata Research',
      'Doctor Donut',
      'Lucky Monkey Media',
      'Parker Ellington Davis Consulting',
      'Pharmhaus',
      'S.M.A.R.T.',
      'Unknown',
      'Warez',
    ];

    this.addNodeOptions = document.querySelector('#add-node-options');

    this.addNodeButton = document.querySelector('#add-node-button');
    this.addNodeButton.addEventListener('click', () => {
      const data = this.getObjectFromFormData(new FormData(this.addNodeOptions));
      this.addNode(data, this.selectedTile);
    });

    this.editNodeOptions = document.querySelector('#edit-node-options');
    this.editNodeOptions.addEventListener('change', () => {
      const data = this.getObjectFromFormData(new FormData(this.editNodeOptions));
      this.updateNode(data, this.selectedNode);
    });

    this.addConnectionButton = document.querySelector('#add-connection-button');
    this.addConnectionButton.addEventListener('click', () => {
      this.addConnection();
    })

    this.clearConnectionsButton = document.querySelector('#clear-connections-button');
    this.clearConnectionsButton.addEventListener('click', () => {
      this.clearConnections(this.selectedTile);
    })

    this.removeNodeButton = document.querySelector('#remove-node-button');
    this.removeNodeButton.addEventListener('click', () => {
      this.removeNode(this.selectedNode);
    });

    this.cancelConnectionButton = document.querySelector('#cancel-connection-button');
    this.cancelConnectionButton.addEventListener('click', () => {
      this.cancelConnection();
    });

    this.connectionOptions = document.querySelector('#connection-options');

    this.generateJsonButton = document.querySelector('#generate-json-button');
    this.generateJsonButton.addEventListener('click', () => {
      console.log(this.generateJson());
    })
    this.jsonInput = document.querySelector('#json-input');
    this.loadFromJsonButton = document.querySelector('#load-from-json-button');
    this.loadFromJsonButton.addEventListener('click', () => {
      this.createNetmapFromJson(this.jsonInput.value);
      this.jsonInput.value='';
    })
  
    this.table = document.querySelector('#netmap');
    this.addResizerListeners();
    this.loadOwnerLists();

    this.initNetmap(10, 10);
  }

  initNetmap (width, height) {
    this.table.innerHTML = '';
    this.selectedTile = undefined;
    this.selectedNode = undefined;
    this.nodes = [];
    this.connections = [];
    this.switchMode(this.modes.NONE);
    this.grid = this.createGrid(width, height);
    this.updateTileCoords();
    this.calculateTableMargin();

    this.setTileType(this.grid[5][4], 'test-class-one');
  }

  getObjectFromFormData (formData) {
    const obj = {};
    formData.forEach((val, key) => {
      obj[key] = val;
    })

    // An unchecked checkbox doesn't return any value. This makes sure it's interpreted as a boolean.
    obj.startsOwned = !!obj.startsOwned;
    return obj;
  }
  
  loadOwnerLists () {
    const options = [];
    this.ownerList.forEach((owner) => {
      const option = document.createElement('option');
      option.innerHTML = owner;
      options.push(option);
    })
    const selects = document.querySelectorAll('select[name="owner"]');
    selects.forEach((select) => {
      options.forEach((option) => {
        select.appendChild(option.cloneNode(true));
      })
    })
  }
  switchMode (newMode) {
    this.mode = newMode;
    this.addNodeOptions.classList.add('hidden');
    this.editNodeOptions.classList.add('hidden');
    this.connectionOptions.classList.add('hidden');
    switch (newMode) {
      case this.modes.ADD_NODE:
        this.addNodeOptions.classList.remove('hidden');
        this.addNodeOptions.reset();
        break;
      case this.modes.EDIT:
        this.editNodeOptions.classList.remove('hidden');
        this.fillFormFromData(this.editNodeOptions, this.selectedNode);
        break;
      case this.modes.ADDING_CONNECTION:
        this.connectionOptions.classList.remove('hidden');
        break;
    }
  }

  fillFormFromData (form, data) {
    for (const [key, value] of Object.entries(data)) {
      const input = form.querySelector(`*[name=${key}]`);
      if (input) {
        switch (input.type) {
          case 'checkbox':
            input.checked = !!value;
            break;
          default:
            input.value = value;
            break;
        }
      }
    }
  }

  createTile () {
    const innerDiv = document.createElement('div');
    const td = document.createElement('td');
    td.classList.add(this.tileTypes.NONE);
    td.classList.add('tile');
    td.appendChild(innerDiv);
    const tile = {
      type: this.tileTypes.NONE,
      element: td
    }
    td.addEventListener('mousedown', () => {
      this.clickTile(tile);
    });
    return tile;
  }


  createGrid (width, height) {
    const tiles = [];
    for (let i = 0; i < height; i += 1) {
      const row = this.createTableRow(width);
      this.table.appendChild(row.element);
      tiles.push(row.tiles);
    }
    return tiles;
  };

  createTableRow (width) {
    const row = [];
    const tr = document.createElement('tr');
    for (let i = 0; i < width; i++) {
      const tile = this.createTile();
      tr.appendChild(tile.element);
      row.push(tile);
    }
    return {
      tiles: row,
      element: tr
    }
  }

  updateTileCoords () {
    for (let i = 0; i < this.grid.length; i++) {
      for (let j = 0; j < this.grid[i].length; j++) {
        this.grid[i][j].x = j;
        this.grid[i][j].y = i;
      }
    }
  }

  getTileFromCoords (x, y, height) {
    console.log(`${x}, ${y} :)`)
    const gridY = (y - x) + ((height - 1) / 2);
    const gridX = x + y + ((1 - height) / 2);
    return this.grid[gridY][gridX];
  }

  clickTile (tile) {
    if (this.mode === this.modes.ADDING_CONNECTION) {
      const previousTile = this.currentConnection[this.currentConnection.length - 1];

      if (tile === previousTile && tile.type !== this.tileTypes.NODE) {
        this.popFromConnection(this.currentConnection);
      } else if (tile.type === this.tileTypes.NONE || tile.type === this.tileTypes.NODE) {
        if (Math.abs(tile.x - previousTile.x) + Math.abs(tile.y - previousTile.y) === 1
          && (tile !== this.currentConnection[0] || previousTile !== this.currentConnection[1])) {
          this.addToConnection(this.currentConnection, tile);
        }
      }
    } else {
      if (tile !== this.selectedTile) {
        this.selectTile(tile);
        if (tile.type === this.tileTypes.NODE) {
          this.switchMode(this.modes.EDIT);
        } else if (tile.type === this.tileTypes.NONE) {
          this.switchMode(this.modes.ADD_NODE);
        } else {
          this.switchMode(this.modes.NONE);
        }
      }
    }
  }

  selectTile (tile) {
    if (this.selectedTile) {
      this.selectedTile.element.classList.remove('selected');
    }
    this.selectedTile = tile;
    if (tile) {
      tile.element.classList.add('selected');
    }
    this.selectedNode = this.getNodeFromTile(tile);
  }

  getNodeFromTile (tile) {
    return this.nodes.find((node) => node.tile === tile);
  }

  resizeGrid ([top, right, bottom, left]) {
    const currentHeight = this.grid.length;
    const currentWidth = this.grid[0].length;

    if (top > 0) {
      const newRow = this.createTableRow(currentWidth);
      this.table.insertBefore(newRow.element, this.table.firstChild);
      this.grid.unshift(newRow.tiles);
    }
    if (bottom > 0) {
      const newRow = this.createTableRow(currentWidth);
      this.table.appendChild(newRow.element);
      this.grid.push(newRow.tiles);
    }

    this.calculateTableMargin();
    this.updateTileCoords();
  }

  addResizerListeners () {
    document.querySelector('#resize-top-plus').addEventListener('click', () => {
      this.resizeGrid([1, 0, 0, 0]);
    });
    document.querySelector('#resize-top-minus').addEventListener('click', () => {
      this.resizeGrid([-1, 0, 0, 0])
    });
    document.querySelector('#resize-bottom-plus').addEventListener('click', () => {
      this.resizeGrid([0, 0, 1, 0])
    });
    document.querySelector('#resize-bottom-minus').addEventListener('click', () => {
      this.resizeGrid([0, 0, -1, 0])
    });
    document.querySelector('#resize-left-plus').addEventListener('click', () => {
      this.resizeGrid([0, 0, 0, 1])
    });
    document.querySelector('#resize-left-minus').addEventListener('click', () => {
      this.resizeGrid([0, 0, 0, -1])
    });
    document.querySelector('#resize-right-plus').addEventListener('click', () => {
      this.resizeGrid([0, 1, 0, 0])
    });
    document.querySelector('#resize-right-minus').addEventListener('click', () => {
      this.resizeGrid([0, -1, 0, 0])
    });
  }

  calculateTableMargin () {
    const tableWrapper = document.querySelector('#netmap-table-wrapper');
    const height = this.grid.length;
    const width = this.grid[0].length;
    tableWrapper.style.marginTop = `${ ((Math.sqrt(2) * .5 * (height + width)) - height) * 25 }px`;
    tableWrapper.style.marginLeft = `${ ((Math.sqrt(2) * .5 * (height + width + 2)) - width) * 25 }px`;
  }

  addNode (nodeData, tile) {
    console.log(tile);
    const { name, owner, description, startsOwned, securityLevel } = nodeData;
    const node = {
      ...nodeData,
      tile,
      // battle: nodeData.battle ? createDatabattleFromJson(JSON.stringify(node.battle)) : createNewDatabattle(10, 10, 99),
      // event: nodeData.event ? createEventFromJson(JSON.stringify(node.event)) : undefined,
      // shop: nodeData.shop ? nodeData.shop : undefined
    };

    this.nodes.push(node);
    this.setTileType(tile, this.tileTypes.NODE);
    if (this.selectedTile === tile) {
      this.selectedNode = node;
      this.switchMode(this.modes.EDIT);
    }
  }

  updateNode (newNodeData, node) {
    Object.assign(node, newNodeData);
  }

  removeNode (node) {
    this.clearConnections(node.tile);
    this.setTileType(node.tile, this.tileTypes.NONE);
    const index = this.nodes.findIndex((n) => n === node);
    this.nodes.splice(index, 1);

    if (this.selectedNode) {
      this.selectedNode = undefined;
      this.switchMode(this.modes.ADD_NODE);
    }
  }

  setTileType (tile, newType) {
    tile.element.classList.remove(tile.type);
    tile.element.classList.add(newType);
    tile.type = newType;
  }

  addToConnection (connection, tile) {
    connection.push(tile);
    if (tile.type === this.tileTypes.NODE) {
      this.connections.push(connection);
      this.currentConnection = undefined;
      if (this.selectedNode) {
        this.switchMode(this.modes.EDIT);
      } else {
        this.switchMode(this.modes.NONE);
      }
    }
    this.updateConnectionOrientations(connection);
  }

  popFromConnection (connection) {
    this.setTileType(connection[connection.length - 1], this.tileTypes.NONE);
    connection.pop();
    this.updateConnectionOrientations(connection);
  }

  addConnection () {
    this.switchMode(this.modes.ADDING_CONNECTION);
    this.currentConnection = [this.selectedTile];
  }


  updateConnectionOrientations (connection) {
    /*
    let newTileType;
    if (connection.length > 2) {
      if (connection[connection.length - 3].y > connection[connection.length - 2].y) {
        if (connection[connection.length - 2].x > connection[connection.length - 1].x) {
          this.setTileType(connection[connection.length - 2], this.tileTypes.CONNECTION_LEFT_CORNER);
          newTileType = this.tileTypes.CONNECTION_VERTICAL;
        } else if (connection[connection.length - 2].x < connection[connection.length - 1].x) {
          this.setTileType(connection[connection.length - 2], this.tileTypes.CONNECTION_BOTTOM_CORNER);
          newTileType = this.tileTypes.CONNECTION_VERTICAL;
        } else {
          newTileType = this.tileTypes.CONNECTION_HORIZONTAL;
        }
      } else if (connection[connection.length - 3].y < connection[connection.length - 2].y) {
        if (connection[connection.length - 2].x > connection[connection.length - 1].x) {
          this.setTileType(connection[connection.length - 2], this.tileTypes.CONNECTION_TOP_CORNER);
          newTileType = this.tileTypes.CONNECTION_VERTICAL;
        } else if (connection[connection.length - 2].x < connection[connection.length - 1].x) {
          this.setTileType(connection[connection.length - 2], this.tileTypes.CONNECTION_RIGHT_CORNER);
          newTileType = this.tileTypes.CONNECTION_VERTICAL;
        } else {
          newTileType = this.tileTypes.CONNECTION_HORIZONTAL;
        }
      } else if (connection[connection.length - 3].x > connection[connection.length - 2].x) {
        if (connection[connection.length - 2].y > connection[connection.length - 1].y) {
          this.setTileType(connection[connection.length - 2], this.tileTypes.CONNECTION_RIGHT_CORNER);
          newTileType = this.tileTypes.CONNECTION_HORIZONTAL;
        } else if (connection[connection.length - 2].y < connection[connection.length - 1].y) {
          this.setTileType(connection[connection.length - 2], this.tileTypes.CONNECTION_BOTTOM_CORNER);
          newTileType = this.tileTypes.CONNECTION_HORIZONTAL;
        } else {
          newTileType = this.tileTypes.CONNECTION_VERTICAL;
        }
      } else if (connection[connection.length - 3].x < connection[connection.length - 2].x) {
        if (connection[connection.length - 2].y > connection[connection.length - 1].y) {
          this.setTileType(connection[connection.length - 2], this.tileTypes.CONNECTION_TOP_CORNER);
          newTileType = this.tileTypes.CONNECTION_HORIZONTAL;
        } else if (connection[connection.length - 2].y < connection[connection.length - 1].y) {
          this.setTileType(connection[connection.length - 2], this.tileTypes.CONNECTION_LEFT_CORNER);
          newTileType = this.tileTypes.CONNECTION_HORIZONTAL;
        } else {
          newTileType = this.tileTypes.CONNECTION_VERTICAL;
        }
      }
    } else {
      if (connection[0].y !== connection[1].y) {
        newTileType = this.tileTypes.CONNECTION_HORIZONTAL;
      } else {
        newTileType = this.tileTypes.CONNECTION_VERTICAL;
      }
    }

    if (connection[connection.length - 1].type !== this.tileTypes.NODE) {
      this.setTileType(connection[connection.length - 1], newTileType);
    }
    */
  }

  clearConnections (tile) {
    for (let i = this.connections.length - 1; i >= 0; i--) {
      if (this.connections[i].includes(tile)) {
        this.connections[i].forEach((t) => {
          if (t.type !== this.tileTypes.NODE) {
            this.setTileType(t, this.tileTypes.NONE);
          }
        });
        this.connections.splice(i, 1);
      }
    }
  }

  cancelConnection () {
    this.switchMode(this.modes.EDIT);
    this.currentConnection.forEach((tile) => {
      if (tile.type !== this.tileTypes.NODE) {
        this.setTileType(tile, this.tileTypes.NONE);
      }
    });
    this.currentConnection = undefined;
  }


  generateJson () {
    // netmap.nodes = [];
    /*
    this.nodes.forEach((node) => {
      const x = ((node.tile.x - node.tile.y + netmap.height) - 1) / 2;
      const y = (node.tile.x + node.tile.y) / 2;
      const newNode = {
        ...node,
        connections: [],
      };
      if (node.battle) {
        newNode.battle = JSON.parse(databattleService.getJsonFromDatabattle(node.battle));
      }
      if (node.event) {
        newNode.event = JSON.parse(eventService.getJsonFromEvent(node.event));
      }
      if (node.shop) {
        newNode.shop = JSON.parse(angular.toJson(node.shop));
      }
    });
    */


    const netmap = {
      height: this.grid.length,
      width: this.grid[0].length,

    }
    return JSON.stringify({
      height: this.grid.length,
      width: this.grid[0].length,
      nodes: this.nodes,
      connections: this.connections
    });
  }
  
  createNetmapFromJson (netmapJson) {
    const json = JSON.parse(netmapJson);
    this.initNetmap(json.width, json.height);
    json.nodes.forEach((node) => {
      const tile = this.getTileFromCoords(node.coords.x, node.coords.y, json.height);
      this.addNode(node, tile);
    });
    json.nodes.forEach((node) => {
      node.connections.forEach((connection) => {
        const endTile = connection.path[connection.path.length - 1];
        const { x, y } = this.getTileFromCoords(endTile.x, endTile.y, json.height);
        console.log(`${x}, ${y}`);
        console.log(this.nodes);
        const destNode = this.nodes.find((n) => n.tile.x === x && n.tile.y === y);
        if (!destNode.connections.find((con) => con.node.tile.x === node.tile.x && con.node.tile.y === node.tile.y)) {
          const newConnection = [node.tile];
          let previousPoint;
          let x = node.tile.x;
          let y = node.tile.y;
          let finished = false;
          connection.path.forEach((point) => {
            
            if (previousPoint) {
              let deltaX = point.x - previousPoint.x;
              let deltaY = point.y - previousPoint.y;
              if (Math.abs(deltaX) !== 0.25 && Math.abs(deltaY) !== 0.25) {
                if (deltaX === deltaY) {
                  if (deltaX < 0) {
                    deltaX = -0.5;
                    deltaY = -0.5;
                  } else {
                    deltaX = 0.5;
                    deltaY = 0.5;
                  }
                } else if (deltaX === deltaY * -1) {
                  if (deltaX < 0) {
                    deltaX = -0.5;
                    deltaY = 0.5; 
                  } else {
                    deltaX = 0.5;
                    deltaY = -0.5;
                  }
                } else if (deltaY === 0) {
                  if (deltaX < 0) {
                    deltaX = -0.5;
                  } else if (deltaX > 0) {
                    deltaX = 0.5;
                  }
                } else if (deltaX === 0) {
                  if (deltaY < 0) {
                    deltaY = -0.5;
                  } else if (deltaY > 0) {
                    deltaY = 0.5;
                  }
                }
              }

              let iterations;
              if (deltaX === 0) {
                iterations = (point.y - previousPoint.y) / deltaY;
              } else if (deltaY === 0) {
                iterations = (point.x - previousPoint.x) / deltaX;
              } else {
                iterations = Math.max((point.x - previousPoint.x) / deltaX, (point.y - previousPoint.y) / deltaY);
              }
              let index = 0;
              while (index < iterations) {
                index += 1;
                if (deltaX === deltaY) {
                  if (deltaX < 0) {
                    x -= 1;
                  } else if (deltaX > 0) {
                    x += 1;
                  }
                } else if (deltaX === deltaY * -1) {
                  if (deltaX < 0) {
                    y += 1;
                  } else if (deltaX > 0) {
                    y -= 1;
                  }
                } else if (deltaX === 0) {
                  if (deltaY < 0) {
                    if (newConnection.length > 1 && newConnection[newConnection.length - 2].x === newConnection[newConnection.length - 1].x) {
                      x -= 1;
                    } else {
                      y -= 1;
                    }
                  } else {
                    if (newConnection.length > 1 && newConnection[newConnection.length - 2].x === newConnection[newConnection.length - 1].x) {
                      x += 1;
                    } else {
                      y += 1;
                    }
                  }
                } else if (deltaY === 0) {
                  if (deltaX < 0) {
                    if (newConnection.length > 1 && newConnection[newConnection.length - 2].y === newConnection[newConnection.length - 1].y) {
                      y += 1;
                    } else {
                      x -= 1;
                    }
                  } else {
                    if (newConnection.length > 1 && newConnection[newConnection.length - 2].y === newConnection[newConnection.length - 1].y) {
                      y -= 1;
                    } else {
                      x += 1;
                    }
                  }
                }
                const tile = this.grid[y][x];
                if (!finished) {
                  this.addToConnection(newConnection, tile);
                }
                if (tile.type === this.tileTypes.NODE) {
                  finished = true;
                }
              }
            }
            previousPoint = point;
          });
        }
      });
    });
  }

}

