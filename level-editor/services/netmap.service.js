angular
  .module('mapEditorApp')
  .factory('netmapService', ['gridService', function(gridService) {
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
    let initialized = false;
    const map = {};

    service.hasBeenInitialized = () => {
      return initialized;
    }

    service.createNewNetmap = (initialWidth, initialHeight, maxSize) => {
      map.resize = (resizeParams) => {
        gridService.resizeGrid(map.tiles, resizeParams, maxSize, service.tileTypes.NONE);
        map.tableMargin = {
          'margin-top': `${ ((((Math.sqrt(2) * map.tiles.length) + (Math.sqrt(2) * map.tiles[0].length)) / 2) - (map.tiles.length)) * 25 }px`,
          'margin-left': `${ ((((Math.sqrt(2) * map.tiles.length) + (Math.sqrt(2) * map.tiles[0].length)) / 2) - (map.tiles[0].length)) * 25 }px`,
        }
      }
      map.tiles = gridService.createGrid(initialWidth, initialHeight, service.tileTypes.NONE);
      map.resize({});
      map.nodes = [];

      map.addNode = (node) => {
        map.nodes.push({
          name: node.name,
          owner: node.owner,
          desc: node.desc,
          startsOutOwned: node.startsOutOwned,
          securityLevel: parseInt(node.securityLevel, 10),
          imageName: node.imageName,
          battle: node.battle,
          tile: node.tile,
          connections: [],
        });
        
        const tile = node.tile;
        tile.type = service.tileTypes.NODE;
      }
      map.removeNode = (node) => {
        const tile = node.tile;
        tile.type = service.tileTypes.NONE;
        const index = map.nodes.findIndex((n) => n === node);
        map.nodes.splice(index, 1);
        node = undefined;
      }

      map.addConnection = (connection) => {
        const tile = connection[0];
        const node = map.nodes.find((node) => node.tile === tile);
        node.connections.push(connection);
      }
      map.removeConnection = (connection) => {
        const tiles = [connection[0]];
        if (connection[connection.length - 1].type === service.tileTypes.NODE) {
          tiles.push(connection[connection.length - 1]);
        }
        tiles.forEach((tile) => {
          const node = map.nodes.find((node) => node.tile === tile);

          // Either find the connection, or the connection equal to the reverse of the array.
          const connectionIndex = node.connections.findIndex((c) => {
            if (c === connection) {
              return true;
            }
            c.forEach((tile, index) => {
              if (tile !== connections[connections.length - (1 + index)]) {
                return false;
              }
            });
            return true;
          });
          if (connectionIndex !== -1) {
            node.connections.splice(connectionIndex, 1);
          }
        });
      }
      
      map.addToConnection = (connection, tile) => {
        connection.push(tile);
        if (tile.type === service.tileTypes.NODE) {
          const node = map.nodes.find((n) => n.tile === tile);
          node.connections.push([ ...connection ].reverse());
        }
        map.updateConnectionOrientations(connection);
      }
      map.popFromConnection = (connection) => {
        connection.pop();
      }

      map.updateConnectionOrientations = (connection) => {
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

      

      return map;
    }
    service.generateJson = () => {

      const netmap = {};
      
      netmap.size = (map.tiles.length + map.tiles[0].length) / 2;
      netmap.nodes = [];
      map.nodes.forEach((node) => {
        const x = ((node.tile.x - node.tile.y + map.tiles.length) - 1) / 2;
        const y = (node.tile.x + node.tile.y) / 2;
        const newNode = {
          name: node.name,
          owner: node.owner,
          desc: node.desc,
          image: node.imageName,
          battle: node.battle,
          ownedByUser: node.ownedByUser,
          securityLevel: node.securityLevel,
          coords: {
            x,
            y,
          },
          connections: [],
        };
        node.connections.forEach((connection) => {
          const segments = [];
          connection.forEach((tile) => {
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
          const lastTile = connection[connection.length - 1];
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
          newNode.connections.push(relevantPoints);
        });
        netmap.nodes.push(newNode);
      });
      return JSON.stringify(netmap);
    };

    return service;
  }]);