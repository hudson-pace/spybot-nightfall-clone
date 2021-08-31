import initGame from '../game/scripts/script.js';
import BaseView from './baseView.js';

export default class extends BaseView {
  getHtml () {
    return `
      <canvas class="game-container"></canvas>
    `;
  }

  runScript () {
    initGame();
  }
}