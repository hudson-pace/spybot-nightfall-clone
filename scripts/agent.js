export default function Agent(agent, tile, image, context) {
  this.tile = tile;
  this.selected = false;
  const imageSource = {
    x: (agent.imgSource % 8) * 27,
    y: Math.floor(agent.imgSource / 8) * 27,
    size: 27,
  };

  let selectedDisplay = true;
  this.draw = function draw() {
    console.log('Redrawing databattle.');
    const coords = this.tile.getDrawingCoords();
    if (this.selected) {
      context.clearRect(coords.x - 1, coords.y - 1, imageSource.size + 2, imageSource.size + 2);
      if (selectedDisplay) {
        context.fillStyle = 'white';
        context.fillRect(coords.x - 1, coords.y - 1, imageSource.size + 2, imageSource.size + 2);
      }
    }
    context.drawImage(image, imageSource.x, imageSource.y, imageSource.size, imageSource.size,
      coords.x, coords.y, imageSource.size, imageSource.size);
  };

  function toggleSelectedDisplay() {
    selectedDisplay = !selectedDisplay;
    this.draw();
  }

  let flashSelectedDisplay;
  this.select = function select() {
    this.selected = true;
    selectedDisplay = true;
    flashSelectedDisplay = setInterval(toggleSelectedDisplay.bind(this), 600);
  };
  this.deselect = function deselect() {
    this.selected = false;
    clearInterval(flashSelectedDisplay);
  };
}
