angular
  .module('mapEditorApp')
  .factory('gridService', function() {
    const grid = {};
    grid.createGrid = (width, height, defaultType) => {
      const tiles = [];
      for (let i = 0; i < height; i += 1) {
        const newRow = [];
        for (let j = 0; j < width; j += 1) {
          newRow.push({
            coords: {
              x: j,
              y: i,
            },
            type: defaultType,
          });
        }
        tiles.push(newRow);
      }
      return tiles;
    };

    grid.updateTileCoordinates = (tiles) => {
      tiles.forEach((row, rowIndex) => {
        row.forEach((tile, colIndex) => {
          tile.x = colIndex;
          tile.y = rowIndex;
        });
      });
    };

    grid.resizeGrid = (tiles, resizeParams, maxSize, defaultType) => {
      newTiles = [];
      tiles.forEach((row) => {
        newTiles.push([...row]);
      });

      if (resizeParams) {
        const params = {
          left: parseInt(resizeParams.left, 10),
          right: parseInt(resizeParams.right, 10),
          top: parseInt(resizeParams.top, 10),
          bottom: parseInt(resizeParams.bottom, 10),
        };
        if (params.left && params.left !== 0 && params.left + newTiles[0].length > 0
          && params.left + newTiles[0].length < maxSize) {
          newTiles.forEach((row) => {
            if (params.left > 0) {
              for (let i = 0; i < params.left; i += 1) {
                row.unshift({
                  type: defaultType,
                });
              }
            } else {
              row.splice(0, params.left * -1);
            }
          });
        }
        if (params.right && params.right !== 0 && params.right + newTiles[0].length > 0
          && params.right + newTiles[0].length < maxSize) {
            newTiles.forEach((row) => {
            if (params.right > 0) {
              for (let i = 0; i < params.right; i += 1) {
                row.push({
                  type: defaultType,
                });
              }
            } else {
              row.splice(row.length - (params.right * -1));
            }
          });
        }
        if (params.top && params.top !== 0 && params.top + newTiles.length > 0
          && params.top + newTiles.length < maxSize) {
          if (params.top > 0) {
            for (let i = 0; i < params.top; i += 1) {
              const newRow = [];
              for (let j = 0; j < newTiles[0].length; j += 1) {
                newRow.push({
                  type: defaultType,
                });
              }
              newTiles.unshift(newRow);
            }
          } else {
            newTiles.splice(0, params.top * -1);
          }
        }
        if (params.bottom && params.bottom !== 0 && params.bottom + newTiles.length > 0
          && params.bottom + newTiles.length < maxSize) {
          if (params.bottom > 0) {
            for (let i = 0; i < params.bottom; i += 1) {
              const newRow = [];
              for (let j = 0; j < newTiles[0].length; j += 1) {
                newRow.push({
                  type: defaultType,
                });
              }
              newTiles.push(newRow);
            }
          } else {
            newTiles.splice(newTiles.length - (params.bottom * -1));
          }
        }
      }
      grid.updateTileCoordinates(newTiles);
      return newTiles;
    };
    return grid;
  });
