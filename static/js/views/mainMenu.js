import BaseView from './baseView.js';

export default class extends BaseView {
  getHtml () {
    return `
    <a href="/play">Play!</a>
    `
  }
}