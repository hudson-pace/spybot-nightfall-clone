export default class {
  constructor (container, map) {
    this.container = container;
    this.mapData = map;

    this.modes = {
      ADD_NODE: 'add',
      EDIT: 'edit',
      ADDING_CONNECTION: 'adding connection',
      NONE: 'none',
    };
  
    if (!this.ownerList) {
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
    }

    this.tileTypes = {
      NONE: 'none',
      NODE: 'node',
      CONNECTION: 'connection'
    }
  
    this.connectionTypes = {
      N_S: 'n-s-connector',
      S_N: 's-n-connector',
      NE_SW: 'ne-sw-connector',
      SW_NE: 'sw-ne-connector',
      NW_SE: 'nw-se-connector',
      SE_NW: 'se-nw-connector',
      E_W: 'e-w-connector',
      W_E: 'w-e-connector',
      NONE: '',
    };

    this.addNodeOptions = this.container.querySelector('#add-node-options');

    this.addNodeButton = this.container.querySelector('#add-node-button');
    this.addNodeButton.addEventListener('click', () => {
      const data = this.getObjectFromFormData(new FormData(this.addNodeOptions));
      this.addNode(data, this.selectedTile);
    });

    this.editNodeOptions = this.container.querySelector('#edit-node-options');
    this.editNodeOptions.addEventListener('change', () => {
      const data = this.getObjectFromFormData(new FormData(this.editNodeOptions));
      this.updateNode(data, this.selectedNode);
    });

    this.addConnectionButton = this.container.querySelector('#add-connection-button');
    this.addConnectionButton.addEventListener('click', () => {
      this.addConnection();
    })

    this.clearConnectionsButton = this.container.querySelector('#clear-connections-button');
    this.clearConnectionsButton.addEventListener('click', () => {
      this.clearConnections(this.selectedTile);
    })

    this.removeNodeButton = this.container.querySelector('#remove-node-button');
    this.removeNodeButton.addEventListener('click', () => {
      this.removeNode(this.selectedNode);
    });

    this.cancelConnectionButton = this.container.querySelector('#cancel-connection-button');
    this.cancelConnectionButton.addEventListener('click', () => {
      this.cancelConnection();
    });

    this.connectionOptions = this.container.querySelector('#connection-options');

    this.generateJsonButton = this.container.querySelector('#generate-json-button');
    this.generateJsonButton.addEventListener('click', () => {
      console.log(this.generateJson());
    })
    this.jsonInput = this.container.querySelector('#json-input');
    this.loadFromJsonButton = this.container.querySelector('#load-from-json-button');
    this.loadFromJsonButton.addEventListener('click', () => {
      this.createNetmapFromJson(this.jsonInput.value);
      this.jsonInput.value='';
    })
  
    this.table = this.container.querySelector('#netmap');
    this.addResizerListeners();
    this.loadOwnerLists();

    this.generateNodesFromMapData();

    
    this.selectedTile = undefined;
    this.selectedNode = undefined;
  }

  initMapData () {
    if (!this.mapData.nodes) {
      this.mapData.nodes = [];
    }
    if (!this.mapData.connections) {
      this.mapData.connections = [];
    }
    if (!this.mapData.height) {
      this.mapData.height = 10;
    }
    if (!this.mapData.width) {
      this.mapData.width = 10;
    }
  }

  generateNodesFromMapData () {
    this.initMapData();
    this.table.innerHTML = '';
    
    this.grid = this.createGrid(this.mapData.width, this.mapData.height);
    this.mapData.height = this.grid.length;
    this.mapData.width = this.grid[0].length;
    this.updateTileCoords();
    this.mapData.nodes.forEach((node) => {
      node.tile = this.getTileFromCoords(node.tile.x, node.tile.y);
      this.addNode(node, node.tile, false);
    });
    this.mapData.connections.forEach((connection) => {
      for (let i = 0; i < connection.length; i++) {
        connection[i] = this.getTileFromCoords(connection[i].x, connection[i].y);
      }
      this.addConnection(connection)
    });

    this.switchMode(this.modes.NONE);
    this.calculateTableMargin();
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
    const selects = this.container.querySelectorAll('select[name="owner"]');
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
    const tileDiv = document.createElement('div');
    const connectorDiv = document.createElement('div');
    const td = document.createElement('td');
    tileDiv.classList.add(this.tileTypes.NONE);
    tileDiv.classList.add('tile');
    td.appendChild(tileDiv);
    td.appendChild(connectorDiv);
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

  replaceGridData (grid, gridData) {
    
  }

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

  getTileFromCoords (x, y) {
    return this.grid[y][x];
  }

  clickTile (tile) {
    if (this.mode === this.modes.ADDING_CONNECTION) {
      const previousTile = this.currentConnection[this.currentConnection.length - 1];

      if (tile === previousTile && tile.type === this.tileTypes.CONNECTION) {
        this.popFromConnection(this.currentConnection);
      } else if (tile.type === this.tileTypes.NONE || tile.type === this.tileTypes.NODE) {
        const deltaX = Math.abs(tile.x - previousTile.x);
        const deltaY = Math.abs(tile.y - previousTile.y);
        if (deltaX < 2 && deltaY < 2 && tile !== this.currentConnection[0]) {
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
      this.selectedTile.element.firstChild.classList.remove('selected');
    }
    this.selectedTile = tile;
    if (tile) {
      tile.element.firstChild.classList.add('selected');
    }
    this.selectedNode = this.getNodeFromTile(tile);
  }

  getNodeFromTile (tile) {
    return this.mapData.nodes.find((node) => node.tile === tile);
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
    this.mapData.height = this.grid.length;
    this.mapData.width = this.grid[0].length;
  }

  addResizerListeners () {
    this.container.querySelector('#resize-top-plus').addEventListener('click', () => {
      this.resizeGrid([1, 0, 0, 0]);
    });
    this.container.querySelector('#resize-top-minus').addEventListener('click', () => {
      this.resizeGrid([-1, 0, 0, 0])
    });
    this.container.querySelector('#resize-bottom-plus').addEventListener('click', () => {
      this.resizeGrid([0, 0, 1, 0])
    });
    this.container.querySelector('#resize-bottom-minus').addEventListener('click', () => {
      this.resizeGrid([0, 0, -1, 0])
    });
    this.container.querySelector('#resize-left-plus').addEventListener('click', () => {
      this.resizeGrid([0, 0, 0, 1])
    });
    this.container.querySelector('#resize-left-minus').addEventListener('click', () => {
      this.resizeGrid([0, 0, 0, -1])
    });
    this.container.querySelector('#resize-right-plus').addEventListener('click', () => {
      this.resizeGrid([0, 1, 0, 0])
    });
    this.container.querySelector('#resize-right-minus').addEventListener('click', () => {
      this.resizeGrid([0, -1, 0, 0])
    });
  }

  calculateTableMargin () {
    const tableWrapper = this.container.querySelector('#netmap-table-wrapper');
    const height = this.grid.length;
    const width = this.grid[0].length;
    tableWrapper.style.marginTop = `${ ((Math.sqrt(2) * .5 * (height + width)) - height) * 25 }px`;
    tableWrapper.style.marginLeft = `${ ((Math.sqrt(2) * .5 * (height + width + 2)) - width) * 25 }px`;
  }

  addNode (nodeData, tile, addToList=true) {
    const { name, owner, description, startsOwned, securityLevel } = nodeData;
    const node = {
      ...nodeData,
      tile,
      // battle: nodeData.battle ? createDatabattleFromJson(JSON.stringify(node.battle)) : createNewDatabattle(10, 10, 99),
      // event: nodeData.event ? createEventFromJson(JSON.stringify(node.event)) : undefined,
      // shop: nodeData.shop ? nodeData.shop : undefined
    };

    if (addToList) {
      this.mapData.nodes.push(node);
    }
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
    const index = this.mapData.nodes.findIndex((n) => n === node);
    this.mapData.nodes.splice(index, 1);

    if (this.selectedNode) {
      this.selectedNode = undefined;
      this.switchMode(this.modes.ADD_NODE);
    }
  }

  setTileType (tile, newType) {
    tile.element.firstChild.classList.remove(tile.type);
    tile.element.firstChild.classList.add(newType);
    tile.type = newType;
  }

  setConnectionType (tile, newType) {
    tile.element.children[1].className = newType;
  }

  addToConnection (connection, tile) {
    connection.push(tile);
    if (tile.type === this.tileTypes.NODE) {
      this.mapData.connections.push(connection);
      this.currentConnection = undefined;
      if (this.selectedNode) {
        this.switchMode(this.modes.EDIT);
      } else {
        this.switchMode(this.modes.NONE);
      }
    } else {
      this.setTileType(tile, this.tileTypes.CONNECTION);
    }
    this.updateConnectionOrientations(connection);
  }

  popFromConnection (connection) {
    this.setTileType(connection[connection.length - 1], this.tileTypes.NONE);
    this.setConnectionType(connection[connection.length - 1], this.connectionTypes.NONE);
    connection.pop();
    this.updateConnectionOrientations(connection);
  }

  addConnection (connection) {
    // Can add an entire connection immediately. If none is specified, switches page to connection mode.
    if (connection) {
      connection.forEach((tile) => {
        if (tile.type !== this.tileTypes.NODE) {
          this.setTileType(tile, this.tileTypes.CONNECTION);
        }
      });
      this.mapData.connections.push(connection);
      this.updateConnectionOrientations(connection, true);
    } else {
      this.switchMode(this.modes.ADDING_CONNECTION);
      this.currentConnection = [this.selectedTile];
    }
  }


  updateConnectionOrientations (connection, entirePath = false) {
    if (connection.length === 0) {
      return;
    }
    if (connection.length === 1) {
      this.setConnectionType(connection[connection.length - 1], this.connectionTypes.NONE);
    }

    let i = entirePath ? 2 : connection.length;
    
    for (i; i <= connection.length; i++) {
      const curr = connection[i - 1];
      const prev = connection[i - 2];
      const deltaX = curr.x - prev.x;
      const deltaY = curr.y - prev.y;
      if (deltaX === -1) {
        if (deltaY === -1) {
          this.setConnectionType(prev, this.connectionTypes.S_N);
        } else if (deltaY === 0) {
          this.setConnectionType(prev, this.connectionTypes.SE_NW);
        } else if (deltaY === 1) {
          this.setConnectionType(prev, this.connectionTypes.E_W);
        }
      } else if (deltaX === 0) {
        if (deltaY === -1) {
          this.setConnectionType(prev, this.connectionTypes.SW_NE);
        } else if (deltaY === 1) {
          this.setConnectionType(prev, this.connectionTypes.NE_SW);
        }
      } else if (deltaX === 1) {
        if (deltaY === -1) {
          this.setConnectionType(prev, this.connectionTypes.W_E);
        } else if (deltaY === 0) {
          this.setConnectionType(prev, this.connectionTypes.NW_SE);
        } else if (deltaY === 1) {
          this.setConnectionType(prev, this.connectionTypes.N_S);
        }
      }
    }
  }

  clearConnections (tile) {
    for (let i = this.mapData.connections.length - 1; i >= 0; i--) {
      if (this.mapData.connections[i].includes(tile)) {
        this.mapData.connections[i].forEach((t) => {
          if (t.type !== this.tileTypes.NODE) {
            this.setTileType(t, this.tileTypes.NONE);
            this.setConnectionType(t, this.connectionTypes.NONE);
          }
        });
        this.mapData.connections.splice(i, 1);
      }
    }
  }

  cancelConnection () {
    this.switchMode(this.modes.EDIT);
    this.currentConnection.forEach((tile) => {
      if (tile.type !== this.tileTypes.NODE) {
        this.setTileType(tile, this.tileTypes.NONE);
        this.setConnectionType(tile, this.connectionTypes.NONE);
      }
    });
    this.currentConnection = undefined;
  }


  generateJson () {
    // netmap.nodes = [];
    /*
    this.map.nodes.forEach((node) => {
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

    return JSON.stringify({
      height: this.mapData.height,
      width: this.mapData.length,
      nodes: this.mapData.nodes.map((node) => ({
        owner: node.owner,
        name: node.name,
        description: node.description,
        securityLevel: node.securityLevel,
        startsOwned: node.startsOwned,
        x: node.tile.x,
        y: node.tile.y
      })),
      connections: this.mapData.connections.map((connection) => connection.map((tile) => ({
        x: tile.x,
        y: tile.y
      }))),
    });
  }
  
  createNetmapFromJson (inputJson) {
    Object.assign(this.mapData, JSON.parse(inputJson));
    this.generateNodesFromMapData();
  }
}
