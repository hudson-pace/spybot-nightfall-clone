angular
  .module('mapEditorApp')
  .factory('netmapService', ['gridService', 'databattleService', 'eventService',
    function(gridService, databattleService, eventService) {

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
          image: node.image,
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