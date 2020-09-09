angular
  .module('mapEditorApp')
  .component('netmapEditor', {
    templateUrl: 'components/netmap-editor/netmap-editor.html',
    controller: function($scope, gridService) {
      $scope.tileTypes = {
        NONE: 'none',
        NODE: 'node',
        CONNECTION_HORIZONTAL: 'connection-horizontal',
        CONNECTION_VERTICAL: 'connection-vertical',
        CONNECTION_TOP_CORNER: 'connection-top-corner',
        CONNECTION_LEFT_CORNER: 'connection-left-corner',
        CONNECTION_RIGHT_CORNER: 'connection-right-corner',
        CONNECTION_BOTTOM_CORNER: 'connection-bottom-corner',
      };
      $scope.modes = {
        ADD: 'add',
        EDIT: 'edit',
        ADDING_CONNECTION: 'adding connection',
        NONE: 'none',
      }
      $scope.ownerList = [
        'Cellular Automata Research',
        'Doctor Donut',
        'Lucky Monkey Media',
        'Parker Ellington Davis Consulting',
        'Pharmhaus',
        'S.M.A.R.T.',
        'Unknown',
        'Warez'
      ]
      const defaultWidth = 10;
      const defaultHeight = 10;
      const maxSize = 99;
      $scope.tiles = gridService.createGrid(defaultWidth, defaultHeight, $scope.tileTypes.NONE);
      gridService.updateTileCoordinates($scope.tiles);
      $scope.resize = () => {
        gridService.resizeGrid($scope.tiles, $scope.resizeParams, maxSize, $scope.tileTypes.NONE);
        $scope.tableMargin = {
          'margin-top': `${ ((((Math.sqrt(2) * $scope.tiles.length) + (Math.sqrt(2) * $scope.tiles[0].length)) / 2) - ($scope.tiles.length)) * 25 }px`,
          'margin-left': `${ ((((Math.sqrt(2) * $scope.tiles.length) + (Math.sqrt(2) * $scope.tiles[0].length)) / 2) - ($scope.tiles[0].length)) * 25 }px`,
        }
      }
      $scope.tableMargin = {
        'margin-top': `${ ((((Math.sqrt(2) * $scope.tiles.length) + (Math.sqrt(2) * $scope.tiles[0].length)) / 2) - ($scope.tiles.length)) * 25 }px`,
        'margin-left': `${ ((((Math.sqrt(2) * $scope.tiles.length) + (Math.sqrt(2) * $scope.tiles[0].length)) / 2) - ($scope.tiles[0].length)) * 25 }px`,
      }
  
      $scope.nodes = [];
      $scope.clickTile = (tile) => {
        if ($scope.mode === $scope.modes.ADDING_CONNECTION) {
          const previousTile = $scope.currentConnection[$scope.currentConnection.length - 1];
          if (tile === previousTile && tile.type !== $scope.tileTypes.NODE) {
            tile.type = $scope.tileTypes.NONE;
            $scope.currentConnection.pop();
          } if ((tile.type === $scope.tileTypes.NONE || tile.type === $scope.tileTypes.NODE) && Math.abs(tile.x - previousTile.x) + Math.abs(tile.y - previousTile.y) === 1) {
              if (tile !== $scope.selectedNode.tile) {
                $scope.currentConnection.push(tile);
                $scope.updateConnectionOrientations($scope.currentConnection);
              if (tile.type === $scope.tileTypes.NODE) {
                $scope.finishCurrentConnection();
              }
            }
          }
        } else {
          if ($scope.selectedTile) {
            $scope.selectedTile.selected = false;
          }
          $scope.selectedTile = tile;
          tile.selected = true;
          if (tile.type === $scope.tileTypes.NODE) {
            $scope.mode = $scope.modes.EDIT;
            $scope.selectedNode = $scope.nodes.find((node) => node.tile === tile);
          } else if (tile.type === $scope.tileTypes.NONE) {
            $scope.mode = $scope.modes.ADD;
            $scope.newNode = {
              tile
            }
          } else {
            $scope.mode = $scope.modes.NONE;
          }
        }
      }
  
      $scope.addNode = () => {
        $scope.newNode.tile.type = $scope.tileTypes.NODE;
        $scope.nodes.push({
          name: $scope.newNode.name,
          owner: $scope.newNode.owner,
          desc: $scope.newNode.desc,
          startsOutOwned: $scope.newNode.startsOutOwned,
          securityLevel: parseInt($scope.newNode.securityLevel, 10),
          battle: $scope.newNode.battle,
          tile: $scope.newNode.tile,
          connections: [],
        });
        const tile = $scope.newNode.tile;
        $scope.newNode = undefined;
        $scope.clickTile(tile);
      }
      $scope.removeNode = () => {
        const tile = $scope.selectedNode.tile;
        tile.type = $scope.tileTypes.NONE;
        const index = $scope.nodes.findIndex((node) => node === $scope.selectedNode);
        $scope.nodes.splice(index, 1);
        $scope.selectedNode = undefined;
        $scope.clickTile(tile);
      }
      $scope.addConnection = () => {
        $scope.mode = $scope.modes.ADDING_CONNECTION;
        $scope.currentConnection = [$scope.selectedNode.tile];
      }
      $scope.cancelConnection = () => {
        $scope.mode = $scope.modes.EDIT;
        $scope.currentConnection.forEach((tile) => {
          if (tile.type !== $scope.tileTypes.NODE) {
            tile.type = $scope.tileTypes.NONE;
          }
        });
        $scope.clickTile($scope.selectedNode.tile);
      }
  
      $scope.mouseEnterTile = (tile) => {
  
      }
  
      $scope.finishCurrentConnection = () => {
        const tile = $scope.currentConnection[0];
        const node1 = $scope.nodes.find((node) => node.tile === tile);
        const node2 = $scope.nodes.find((node) => node.tile === $scope.currentConnection[$scope.currentConnection.length - 1]);
        node1.connections.push({
          destination: node2,
          path: $scope.currentConnection
        });
        node2.connections.push({
          destination: node1,
          path: [...$scope.currentConnection].reverse(),
        });
        $scope.currentConnection = undefined;
        $scope.mode = $scope.modes.EDIT;
        $scope.clickTile(tile);
      }
  
      $scope.updateConnectionOrientations = (connection) => {
        let newTileType;
        if (connection.length > 2) {
          if (connection[connection.length - 3].y > connection[connection.length - 2].y) {
            if (connection[connection.length - 2].x > connection[connection.length - 1].x) {
              connection[connection.length - 2].type = $scope.tileTypes.CONNECTION_LEFT_CORNER;
              newTileType = $scope.tileTypes.CONNECTION_VERTICAL;
            } else if (connection[connection.length - 2].x < connection[connection.length - 1].x) {
              connection[connection.length - 2].type = $scope.tileTypes.CONNECTION_BOTTOM_CORNER;
              newTileType = $scope.tileTypes.CONNECTION_VERTICAL;
            } else {
              newTileType = $scope.tileTypes.CONNECTION_HORIZONTAL;
            }
          } else if (connection[connection.length - 3].y < connection[connection.length - 2].y) {
            if (connection[connection.length - 2].x > connection[connection.length - 1].x) {
              connection[connection.length - 2].type = $scope.tileTypes.CONNECTION_TOP_CORNER;
              newTileType = $scope.tileTypes.CONNECTION_VERTICAL;
            } else if (connection[connection.length - 2].x < connection[connection.length - 1].x) {
              connection[connection.length - 2].type = $scope.tileTypes.CONNECTION_RIGHT_CORNER;
              newTileType = $scope.tileTypes.CONNECTION_VERTICAL;
            } else {
              newTileType = $scope.tileTypes.CONNECTION_HORIZONTAL;
            }
          } else if (connection[connection.length - 3].x > connection[connection.length - 2].x) {
            if (connection[connection.length - 2].y > connection[connection.length - 1].y) {
              connection[connection.length - 2].type = $scope.tileTypes.CONNECTION_RIGHT_CORNER;
              newTileType = $scope.tileTypes.CONNECTION_HORIZONTAL;
            } else if (connection[connection.length - 2].y < connection[connection.length - 1].y) {
              connection[connection.length - 2].type = $scope.tileTypes.CONNECTION_BOTTOM_CORNER;
              newTileType = $scope.tileTypes.CONNECTION_HORIZONTAL;
            } else {
              newTileType = $scope.tileTypes.CONNECTION_VERTICAL;
            }
          } else if (connection[connection.length - 3].x < connection[connection.length - 2].x) {
            if (connection[connection.length - 2].y > connection[connection.length - 1].y) {
              connection[connection.length - 2].type = $scope.tileTypes.CONNECTION_TOP_CORNER;
              newTileType = $scope.tileTypes.CONNECTION_HORIZONTAL;
            } else if (connection[connection.length - 2].y < connection[connection.length - 1].y) {
              connection[connection.length - 2].type = $scope.tileTypes.CONNECTION_LEFT_CORNER;
              newTileType = $scope.tileTypes.CONNECTION_HORIZONTAL;
            } else {
              newTileType = $scope.tileTypes.CONNECTION_VERTICAL;
            }
          }
        } else {
          if (connection[0].y !== connection[1].y) {
            newTileType = $scope.tileTypes.CONNECTION_HORIZONTAL;
          } else {
            newTileType = $scope.tileTypes.CONNECTION_VERTICAL;
          }
        }
  
        if (connection[connection.length - 1].type !== $scope.tileTypes.NODE) {
          connection[connection.length - 1].type = newTileType;
        }
      }
  
      $scope.generateJson = () => {
        const netmap = {};
        
        netmap.size = ($scope.tiles.length + $scope.tiles[0].length) / 2;
        console.log($scope.nodes);
  
        netmap.nodes = [];
        $scope.nodes.forEach((node) => {
          const x = ((node.tile.x - node.tile.y + $scope.tiles.length) - 1) / 2;
          const y = (node.tile.x + node.tile.y) / 2;
          const newNode = {
            name: node.name,
            owner: node.owner,
            desc: node.desc,
            image: `node-${node.owner}`,
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
            console.log(connection.path);
            connection.path.forEach((tile) => {
              const tileX = ((tile.x - tile.y + $scope.tiles.length) - 1) / 2;
              const tileY = (tile.x + tile.y) / 2;
              console.log(`${tileX}, ${tileY}`);
              if (tile.type === $scope.tileTypes.CONNECTION_VERTICAL) {
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
              } else if (tile.type === $scope.tileTypes.CONNECTION_HORIZONTAL) {
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
              } else if (tile.type === $scope.tileTypes.CONNECTION_BOTTOM_CORNER) {
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
              } else if (tile.type === $scope.tileTypes.CONNECTION_TOP_CORNER) {
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
              } else if (tile.type === $scope.tileTypes.CONNECTION_LEFT_CORNER) {
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
              } else if (tile.type === $scope.tileTypes.CONNECTION_RIGHT_CORNER) {
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
              x: (((lastTile.x - lastTile.y + $scope.tiles.length) - 1) / 2) + 0.5,
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
        console.log(JSON.stringify(netmap));
      };
    },
  });
