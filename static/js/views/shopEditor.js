import BaseView from './baseView.js';
import ShopEditor from '../shopEditor.js';

export default class extends BaseView {
  constructor (switchView, params) {
    super();
    this.switchView = switchView;
    this.map = params.map;
    this.node = params.node;
    if (!Array.isArray(this.node.shop)) {
      this.node.shop = []
    }
  }

  getHtml () {
    return `
      <button id="return-button">Go back!!</button>

      <form id="add-shop-item">
        <label for="program">Program Type:</label>
        <select name="program" id="program-selector"></select>

        <label for="price">Price:</label>
        <input type="text" name="price" id="price-input"></input>

        <button id="add-shop-item-button" type="button">Add Item</button>
      </form>

      <div id="shop-item-list"></div>
    `;
  }

  getNode () {
    const container = document.createElement('div');
    container.id = 'shop-editor-container';
    container.innerHTML = this.getHtml();
    const returnButton = container.querySelector('#return-button');
    returnButton.addEventListener('click', () => {
      this.switchView('mapEditor', this.map);
    });

    new ShopEditor(container, this.node.shop);
    return container;
  }
}