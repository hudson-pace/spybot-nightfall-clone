import { calculateTextPadding, drawRect, rectContainsPoint } from './helpers.js';
import loadAssets from './asset-loader.js';

export default class StartMenu {
  constructor(canvas, startGameCallback) {
    this.startButton = {
      x: 100,
      y: 100,
      width: 200,
      height: 50,
    };
    this.levelEditorButton = {
      x: 100,
      y: 200,
      width: 200,
      height: 50,
    };
    this.startGameCallback = startGameCallback;
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d');
    this.draw();
  }

  draw() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = 'white';
    drawRect(this.startButton, this.context);
    drawRect(this.levelEditorButton, this.context);
    this.context.font = '20px verdana';
    this.context.textBaseline = 'middle';
    this.context.fillStyle = 'black';
    let [leftPad, topPad] = calculateTextPadding(this.startButton, 'Start Game', this.context);
    this.context.fillText('Start Game', this.startButton.x + leftPad, this.startButton.y + topPad);
    [leftPad, topPad] = calculateTextPadding(this.levelEditorButton, 'Level Editor', this.context);
    this.context.fillText('Level Editor', this.levelEditorButton.x + leftPad, this.levelEditorButton.y + topPad);
  }

  onClick(event) {
    const point = {
      x: (event.offsetX / this.canvas.clientWidth) * this.canvas.width,
      y: (event.offsetY / this.canvas.clientHeight) * this.canvas.height,
    };
    if (rectContainsPoint(this.startButton, point)) {
      loadAssets((assets) => {
        this.startGameCallback(assets);
      });
    } else if (rectContainsPoint(this.levelEditorButton, point)) {
      const path = window.location.pathname;
      window.open(`${path}level-editor`, '_blank');
    }
  }
}
