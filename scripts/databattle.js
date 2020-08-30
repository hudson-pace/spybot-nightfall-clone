const tileTypes = {
  NONE: 'none',
  DEFAULT: 'default',
  UPLOAD: 'upload',
};

export default function DataBattle(name, url, battleLoadedCallback, exitBattleCallback) {
  const canvas = $('canvas')[0];
  const context = canvas.getContext('2d');
  const map = [];
  let width;
  let height;

  function initializeMap(battle) {
    width = battle.width;
    height = battle.height;
    battle.field.forEach((row, rowIndex) => {
      const mapRow = row.split('').map((square, colIndex) => {
        const tile = {
          x: colIndex,
          y: rowIndex,
        };
        switch (square) {
          default:
            tile.type = tileTypes.NONE;
            break;
          case '#':
            tile.type = tileTypes.DEFAULT;
            break;
          case '@':
            tile.type = tileTypes.UPLOAD;
            break;
        }
        return tile;
      });
      map.push(mapRow);
    });
  }

  $.getJSON(url, (data) => {
    const battle = data.battles.find((b) => b.name === name);
    initializeMap(battle);

    battleLoadedCallback();

    this.draw();
  });

  this.draw = function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    const leftPad = (canvas.width - (30 * width)) / 2;
    const topPad = (canvas.height - (30 * height)) / 2;
    map.forEach((row, rowIndex) => {
      row.forEach((tile, colIndex) => {
        switch (tile.type) {
          default:
            context.fillStyle = 'black';
            break;
          case tileTypes.DEFAULT:
            context.fillStyle = 'gray';
            break;
          case tileTypes.UPLOAD:
            context.fillStyle = 'white';
            break;
          case tileTypes.NONE:
            context.fillStyle = 'black';
            break;
        }
        context.fillRect(leftPad + (colIndex * 30), topPad + (rowIndex * 30), 27, 27);
      });
    });
  };

  this.onClick = function onClick(event) {
    exitBattleCallback();
  };
}
