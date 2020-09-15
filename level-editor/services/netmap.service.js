angular
  .module('mapEditorApp')
  .factory('netmapService', ['gridService', 'databattleService', 'eventService',
    function(gridService, databattleService, eventService) {
    const service = {};
    service.tileTypes = {
      NONE: 'none',
      NODE: 'node',
      CONNECTION_HORIZONTAL: 'connection-horizontal',
      CONNECTION_VERTICAL: 'connection-vertical',
      CONNECTION_TOP_CORNER: 'connection-top-corner',
      CONNECTION_LEFT_CORNER: 'connection-left-corner',
      CONNECTION_RIGHT_CORNER: 'connection-right-corner',
      CONNECTION_BOTTOM_CORNER: 'connection-bottom-corner',
    }

    const netmapWatcher = {};

    service.getNetmapWatcher = () => {
      return netmapWatcher;
    }
    service.setOpenNetmap = (netmap) => {
      netmapWatcher.netmap = netmap;
    };
    service.closeNetmap = () => {
      netmapWatcher.netmap = undefined;
    };

    service.openDatabattle = (node) => {
      databattleService.setOpenDatabattle(node.battle);
    }
    service.openEvent = (node) => {
      if (node.event) {
        eventService.setOpenEvent(node.event);
      } else {
        const event = eventService.createNewEvent();
        node.event = event;
        eventService.setOpenEvent(node.event);
      }
    }

    service.openShop = (node) => {
      if (!node.shop) {
        node.shop = [];
      }
      netmapWatcher.netmap.openShop = node.shop;
    }
    service.closeShop = () => {
      netmapWatcher.netmap.openShop = undefined;
    }

    service.createNewNetmap = (initialWidth, initialHeight, maxSize) => {
      const netmap = {};
      netmap.resize = (resizeParams) => {
        gridService.resizeGrid(netmap.tiles, resizeParams, maxSize, service.tileTypes.NONE);
        netmap.tableMargin = {
          'margin-top': `${ ((((Math.sqrt(2) * netmap.tiles.length) + (Math.sqrt(2) * netmap.tiles[0].length)) / 2) - (netmap.tiles.length)) * 25 }px`,
          'margin-left': `${ ((((Math.sqrt(2) * netmap.tiles.length) + (Math.sqrt(2) * netmap.tiles[0].length)) / 2) - (netmap.tiles[0].length)) * 25 }px`,
        }
      }
      netmap.tiles = gridService.createGrid(initialWidth, initialHeight, service.tileTypes.NONE);
      netmap.resize({});
      netmap.nodes = [];

      netmap.addNode = (node) => {
        const newNode = {
          name: node.name,
          owner: node.owner,
          desc: node.desc,
          ownedByUser: node.ownedByUser,
          securityLevel: parseInt(node.securityLevel, 10),
          imageName: node.imageName,
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
      netmap.removeNode = (node) => {
        const tile = node.tile;
        tile.type = service.tileTypes.NONE;
        const index = netmap.nodes.findIndex((n) => n === node);
        netmap.nodes.splice(index, 1);
        node = undefined;
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
    service.generateJson = (map) => {

      const netmap = {};
      
      netmap.size = (map.tiles.length + map.tiles[0].length) / 2;
      netmap.height = map.tiles.length;
      netmap.width = map.tiles[0].length;
      netmap.nodes = [];
      map.nodes.forEach((node) => {
        const x = ((node.tile.x - node.tile.y + map.tiles.length) - 1) / 2;
        const y = (node.tile.x + node.tile.y) / 2;
        const newNode = {
          name: node.name,
          owner: node.owner,
          desc: node.desc,
          image: node.imageName,
          ownedByUser: node.ownedByUser,
          securityLevel: node.securityLevel,
          coords: {
            x,
            y,
          },
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
        node.connections.forEach((connection) => {
          const segments = [];
          connection.path.forEach((tile) => {
            const tileX = ((tile.x - tile.y + map.tiles.length) - 1) / 2;
            const tileY = (tile.x + tile.y) / 2;
            if (tile.type === service.tileTypes.CONNECTION_VERTICAL) {
              segments.push({
                point1: {
                  x: tileX + 0.25,
                  y: tileY + 0.25,
                },
                point2: {
                  x: tileX + 0.75,
                  y: tileY + 0.75,
                },
              });
            } else if (tile.type === service.tileTypes.CONNECTION_HORIZONTAL) {
              segments.push({
                point1: {
                  x: tileX + 0.25,
                  y: tileY + 0.75,
                },
                point2: {
                  x: tileX + 0.75,
                  y: tileY + 0.25,
                },
              });
            } else if (tile.type === service.tileTypes.CONNECTION_BOTTOM_CORNER) {
              segments.push({
                point1: {
                  x: tileX + 0.25,
                  y: tileY + 0.75,
                },
                point2: {
                  x: tileX + 0.75,
                  y: tileY + 0.75,
                },
              });
            } else if (tile.type === service.tileTypes.CONNECTION_TOP_CORNER) {
              segments.push({
                point1: {
                  x: tileX + 0.25,
                  y: tileY + 0.25,
                },
                point2: {
                  x: tileX + 0.75,
                  y: tileY + 0.25,
                },
              });
            } else if (tile.type === service.tileTypes.CONNECTION_LEFT_CORNER) {
              segments.push({
                point1: {
                  x: tileX + 0.25,
                  y: tileY + 0.25,
                },
                point2: {
                  x: tileX + 0.25,
                  y: tileY + 0.75,
                },
              });
            } else if (tile.type === service.tileTypes.CONNECTION_RIGHT_CORNER) {
              segments.push({
                point1: {
                  x: tileX + 0.75,
                  y: tileY + 0.25,
                },
                point2: {
                  x: tileX + 0.75,
                  y: tileY + 0.75,
                },
              });
            }
          });

          const points = [];
          points.push({
            x: x + 0.5,
            y: y + 0.5,
          });
          segments.forEach((segment, index) => {
            const previousPoint = points[points.length - 1]
            if (Math.abs(segment.point1.x - previousPoint.x) + Math.abs(segment.point1.y - previousPoint.y)
              < Math.abs(segment.point2.x - previousPoint.x) + Math.abs(segment.point2.y - previousPoint.y)) {
              points.push(segment.point1);
              if (index === segments.length - 1) {
                points.push(segment.point2);
              }
            } else {
              points.push(segment.point2);
              if (index === segments.length - 1) {
                points.push(segment.point1);
              }
            }
          });
          const lastTile = connection.path[connection.path.length - 1];
          points.push({
            x: (((lastTile.x - lastTile.y + map.tiles.length) - 1) / 2) + 0.5,
            y: ((lastTile.x + lastTile.y) / 2) + 0.5,
          });

          // The connection lines are purely aesthetic, so the only relevant points are those at which the direction changes.
          const relevantPoints = [points[0]];
          let previousPoint = points[0];
          let previousSlope = (points[0].x - points[1].x) / (points[0].y - points[1].y);
          points.slice(1).forEach((point) => {
            const slope = (previousPoint.x - point.x) / (previousPoint.y - point.y);
            if (slope !== previousSlope) {
              relevantPoints.push(previousPoint);
            }
            previousPoint = point;
            previousSlope = slope;
          });
          relevantPoints.push(points[points.length - 1]);
          newNode.connections.push({ node: connection.node.name, path: relevantPoints });
        });
        netmap.nodes.push(newNode);
      });
      return JSON.stringify(netmap);
    };

    service.createNetmapFromJson = (netmapJson) => {
      json = JSON.parse(netmapJson);
      const netmap = service.createNewNetmap(json.width, json.height, 99);
      netmapWatcher.netmap = netmap;
      json.nodes.forEach((node) => {
        node.tile = netmap.getTileFromCoords(node.coords.x, node.coords.y);
        netmap.addNode(node);
      });
      json.nodes.forEach((node) => {
        node.connections.forEach((connection) => {
          const destNode = netmap.nodes.find((n) => n.name === connection.node);
          if (!destNode.connections.find((con) => con.node.name === node.name)) {
            const newConnection = [node.tile];
            let previousPoint;
            let x = node.tile.x;
            let y = node.tile.y;
            let finished = false;
            connection.path.forEach((point) => {
              
              if (previousPoint) {
                deltaX = point.x - previousPoint.x;
                deltaY = point.y - previousPoint.y;
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
                  const tile = netmap.tiles[y][x];
                  if (!finished) {
                    netmap.addToConnection(newConnection, tile);
                  }
                  if (tile.type === service.tileTypes.NODE) {
                    finished = true;
                  }
                }
              }
              previousPoint = point;
            });
          }
        });
      });
      return netmap;
    }

    service.getNodeList = () => {
      if (netmapWatcher.netmap) {
        return netmapWatcher.netmap.nodes;
      }
    }

    return service;
  }]);