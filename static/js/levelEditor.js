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
      'Warez'
    ];

    this.addNodeOptions = document.querySelector('#add-node-options');
    this.addNodeOptions.addEventListener('submit', (e) => {
      e.preventDefault();
      new FormData(this.addNodeOptions);
    });
    this.addNodeOptions.addEventListener('formdata', (e) => {
      const data = this.getObjectFromFormData(e.formData);
      this.addNode(data, this.selectedTile);
    });

    this.editNodeOptions = document.querySelector('#edit-node-options');
    this.editNodeOptions.addEventListener('change', (e) => {
      new FormData(this.editNodeOptions);
    });
    this.editNodeOptions.addEventListener('formdata', (e) => {
      const data = this.getObjectFromFormData(e.formData);
    });



    this.connectionOptions = document.querySelector('#connection-options');
  
    this.nodes = [];
    this.switchMode(this.modes.NONE);
    this.table = document.querySelector('#netmap');
    this.grid = this.createGrid(10, 10, this.tileTypes.NONE);
    this.calculateTableMargin();

    this.addResizerListeners();
    this.loadOwnerLists();
  }

  getObjectFromFormData (formData) {
    const obj = {};
    formData.forEach((val, key) => {
      obj[key] = val;
    })
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
        
        break;
      case this.modes.ADDING_CONNECTION:
        this.connectionOptions.classList.remove('hidden');
        break;
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

  clickTile (tile) {
    if (this.mode === this.modes.ADDING_CONNECTION) {
      /*
      const previousTile = $scope.currentConnection[$scope.currentConnection.length - 1];
      if (tile === previousTile && tile.type !== $scope.tileTypes.NODE) {
        tile.type = $scope.tileTypes.NONE;
        $scope.netmap.popFromConnection($scope.currentConnection);
      } if ((tile.type === $scope.tileTypes.NONE || tile.type === $scope.tileTypes.NODE) && Math.abs(tile.x - previousTile.x) + Math.abs(tile.y - previousTile.y) === 1) {
          if (tile !== $scope.selectedNode.tile) {
            $scope.netmap.addToConnection($scope.currentConnection, tile);
          if (tile.type === $scope.tileTypes.NODE) {
            $scope.clickTile($scope.currentConnection[0]);
            $scope.currentConnection = undefined;
            $scope.mode = $scope.tileTypes.EDIT;
          }
        }
      }
      */
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
    const { name, owner, description, startsOwned, securityLevel } = nodeData;
    const node = { ...nodeData, tile };
    this.nodes.push(node);
    this.setTileType(tile, this.tileTypes.NODE);
  }

  removeNode (node) {
    this.setTileType(tile, this.tileTypes.NONE);
    const index = this.nodes.findIndex((n) => n === node);
    this.nodes.splice(index, 1);
  }

  setTileType (tile, newType) {
    tile.element.classList.remove(tile.type);
    tile.element.classList.add(newType);
    tile.type = newType;
  }

}
/*
  netmap.nodes = [];

  netmap.addNode = (node) => {
    const newNode = {
      name: node.name,
      owner: node.owner,
      desc: node.desc,
      ownedByUser: node.ownedByUser,
      securityLevel: parseInt(node.securityLevel, 10),
      image: node.image,
      tile: node.tile,
      connections: [],
    };
    if (!node.battle) {
      newNode.battle = databattleService.createNewDatabattle(10, 10, 99);
    } else {
      newNode.battle = databattleService.createDatabattleFromJson(JSON.stringify(node.battle));
    }

    if (node.event) {
      newNode.event = eventService.createEventFromJson(JSON.stringify(node.event));
    }

    if (node.shop) {
      newNode.shop = node.shop;
    }
    
    netmap.nodes.push(newNode);
    
    const tile = node.tile;
    tile.type = service.tileTypes.NODE;
  }


  netmap.removeConnection = (connection) => {
    const tiles = [connection.path[0], connection.path[connection.path.length - 1]];
    
    tiles.forEach((tile) => {
      const node = netmap.nodes.find((node) => node.tile === tile);

      // Either find the connection, or the connection equal to the reverse of the array.
      const connectionIndex = node.connections.findIndex((c) => {
        if (c === connection) {
          return true;
        }
        let isReversedPath = true;
        c.path.forEach((tile, index) => {
          if (tile !== connection.path[connection.path.length - (1 + index)]) {
            isReversedPath = false;
          }
        });
        return isReversedPath;
      });
      if (connectionIndex !== -1) {
        connection.path.forEach((tile) => {
          if (tile.type !== service.tileTypes.NODE) {
            tile.type = service.tileTypes.NONE;
          }
        });
        node.connections.splice(connectionIndex, 1);
      }
    });
  }
  
  netmap.addToConnection = (connection, tile) => {
    connection.push(tile);
    if (tile.type === service.tileTypes.NODE) {
      const startNode = netmap.nodes.find((node) => node.tile === connection[0]);
      const endNode = netmap.nodes.find((node) => node.tile === tile);
      startNode.connections.push({ node: endNode, path: connection });
      endNode.connections.push({ node: startNode, path: [ ...connection ].reverse() });
    }
    netmap.updateConnectionOrientations(connection);
  }
  netmap.popFromConnection = (connection) => {
    connection.pop();
  }

  netmap.updateConnectionOrientations = (connection) => {
    let newTileType;
    if (connection.length > 2) {
      if (connection[connection.length - 3].y > connection[connection.length - 2].y) {
        if (connection[connection.length - 2].x > connection[connection.length - 1].x) {
          connection[connection.length - 2].type = service.tileTypes.CONNECTION_LEFT_CORNER;
          newTileType = service.tileTypes.CONNECTION_VERTICAL;
        } else if (connection[connection.length - 2].x < connection[connection.length - 1].x) {
          connection[connection.length - 2].type = service.tileTypes.CONNECTION_BOTTOM_CORNER;
          newTileType = service.tileTypes.CONNECTION_VERTICAL;
        } else {
          newTileType = service.tileTypes.CONNECTION_HORIZONTAL;
        }
      } else if (connection[connection.length - 3].y < connection[connection.length - 2].y) {
        if (connection[connection.length - 2].x > connection[connection.length - 1].x) {
          connection[connection.length - 2].type = service.tileTypes.CONNECTION_TOP_CORNER;
          newTileType = service.tileTypes.CONNECTION_VERTICAL;
        } else if (connection[connection.length - 2].x < connection[connection.length - 1].x) {
          connection[connection.length - 2].type = service.tileTypes.CONNECTION_RIGHT_CORNER;
          newTileType = service.tileTypes.CONNECTION_VERTICAL;
        } else {
          newTileType = service.tileTypes.CONNECTION_HORIZONTAL;
        }
      } else if (connection[connection.length - 3].x > connection[connection.length - 2].x) {
        if (connection[connection.length - 2].y > connection[connection.length - 1].y) {
          connection[connection.length - 2].type = service.tileTypes.CONNECTION_RIGHT_CORNER;
          newTileType = service.tileTypes.CONNECTION_HORIZONTAL;
        } else if (connection[connection.length - 2].y < connection[connection.length - 1].y) {
          connection[connection.length - 2].type = service.tileTypes.CONNECTION_BOTTOM_CORNER;
          newTileType = service.tileTypes.CONNECTION_HORIZONTAL;
        } else {
          newTileType = service.tileTypes.CONNECTION_VERTICAL;
        }
      } else if (connection[connection.length - 3].x < connection[connection.length - 2].x) {
        if (connection[connection.length - 2].y > connection[connection.length - 1].y) {
          connection[connection.length - 2].type = service.tileTypes.CONNECTION_TOP_CORNER;
          newTileType = service.tileTypes.CONNECTION_HORIZONTAL;
        } else if (connection[connection.length - 2].y < connection[connection.length - 1].y) {
          connection[connection.length - 2].type = service.tileTypes.CONNECTION_LEFT_CORNER;
          newTileType = service.tileTypes.CONNECTION_HORIZONTAL;
        } else {
          newTileType = service.tileTypes.CONNECTION_VERTICAL;
        }
      }
    } else {
      if (connection[0].y !== connection[1].y) {
        newTileType = service.tileTypes.CONNECTION_HORIZONTAL;
      } else {
        newTileType = service.tileTypes.CONNECTION_VERTICAL;
      }
    }

    if (connection[connection.length - 1].type !== service.tileTypes.NODE) {
      connection[connection.length - 1].type = newTileType;
    }
  }

  netmap.getTileFromCoords = (x, y) => {
    let gridY = (y - x) + ((json.height - 1) / 2);
    let gridX = x + y + ((1 - json.height) / 2);
    return netmap.tiles[gridY][gridX];
  }

  return netmap;
}
*/