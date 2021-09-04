import initGame from '../game/scripts/script.js';
import BaseView from './baseView.js';

export default class extends BaseView {
  constructor (switchView) {
    super();
    this.switchView = switchView;
  }

  getNode () {
    const canvas = document.createElement('canvas');
    canvas.className = 'game-container';
    initGame(canvas);
    return canvas;
  }
}