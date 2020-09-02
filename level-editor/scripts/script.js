const defaultWidth = 10;
const defaultHeight = 10;
const maxSize = 99;

const app = angular.module('LevelEditor', []);
app.controller('controller', ($scope) => {
  $scope.tiles = [];
  for (let i = 0; i < defaultHeight; i += 1) {
    const newRow = [];
    for (let j = 0; j < defaultWidth; j += 1) {
      newRow.push({});
    }
    $scope.tiles.push(newRow);
  }
  $scope.resize = () => {
    if ($scope.resizeParams) {
      const params = {
        left: parseInt($scope.resizeParams.left, 10),
        right: parseInt($scope.resizeParams.right, 10),
        top: parseInt($scope.resizeParams.top, 10),
        bottom: parseInt($scope.resizeParams.bottom, 10),
      };
      if (params.left && params.left !== 0 && params.left + $scope.tiles[0].length > 0
        && params.left + $scope.tiles[0].length < maxSize) {
        $scope.tiles.forEach((row) => {
          if (params.left > 0) {
            for (let i = 0; i < params.left; i += 1) {
              row.unshift({});
            }
          } else {
            row.splice(0, params.left * -1);
          }
        });
      }
      if (params.right && params.right !== 0 && params.right + $scope.tiles[0].length > 0
        && params.right + $scope.tiles[0].length < maxSize) {
        $scope.tiles.forEach((row) => {
          if (params.right > 0) {
            for (let i = 0; i < params.right; i += 1) {
              row.push({});
            }
          } else {
            row.splice(row.length - (params.right * -1));
          }
        });
      }
      if (params.top && params.top !== 0 && params.top + $scope.tiles.length > 0
        && params.top + $scope.tiles.length < maxSize) {
        if (params.top > 0) {
          for (let i = 0; i < params.top; i += 1) {
            const newRow = [];
            for (let j = 0; j < $scope.tiles[0].length; j += 1) {
              newRow.push({});
            }
            $scope.tiles.unshift(newRow);
          }
        } else {
          $scope.tiles.splice(0, params.top * -1);
        }
      }
      if (params.bottom && params.bottom !== 0 && params.bottom + $scope.tiles.length > 0
        && params.bottom + $scope.tiles.length < maxSize) {
        if (params.bottom > 0) {
          for (let i = 0; i < params.bottom; i += 1) {
            const newRow = [];
            for (let j = 0; j < $scope.tiles[0].length; j += 1) {
              newRow.push({});
            }
            $scope.tiles.push(newRow);
          }
        } else {
          $scope.tiles.splice($scope.tiles.length - (params.bottom * -1));
        }
      }
    }
  };
});
