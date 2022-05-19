import BaseView from './baseView.js';
import LevelObj from '../mapEditor.js';

export default class extends BaseView {
  constructor (switchView, map) {
    super();
    this.switchView = switchView;
    this.map = map;
  }
  getHtml () {
    return `
      <div id="netmap-options">
        <div class="netmap-option">
          <button id="return-button" type="button">Go Back</button>
        </div>
        <div class="netmap-option">
          <button id="generate-json-button">Generate JSON</button>
          <input id="json-input" type="text"><button id="load-from-json-button">Generate Map from JSON</button>
        </div>
        <form id="add-node-options" class="netmap-option hidden" autocomplete="off">
          <label for="owner">Owner: </label><select name="owner"></select> <br>
          <label for="name">Name: </label><input type="text" name="name"></input> <br>
          <label for="description">Desc: </label><input type="text" name="description"></input> <br>
          <label for="securityLevel">Sec. Level: </label><input type="number" min="1" max="99" value="1" name="securityLevel"></input> <br>
          <label for="startsOwned">Starts Owned: </label><input type="checkbox" name="startsOwned"></input> <br>
          <button id="add-node-button" type="button">Add Node</button>
        </form>
        <form id="edit-node-options" class="netmap-option hidden">
          <label for="owner">Owner: </label><select name="owner">
          </select> <br>
          <label for="name">Name: </label><input type="text" name="name"></input> <br>
          <label for="description">Desc: </label><input type="text" name="description"></input> <br>
          <label for="securityLevel">Sec. Level: </label><input type="number" min="1" max="99" value="1" name="securityLevel"></input> <br>
          <label for="startsOwned">Starts Owned: </label><input type="checkbox" name="startsOwned"></input> <br>
          
          Battle: <button id="edit-databattle-button" type="button">Edit Battle</button> <br>
          Event: <button id="edit-event-button" type="button">Edit Event</button> <br>
          Shop: <button id="edit-shop-button" type="button">Edit Shop</button> <br>
          
          <button id="add-connection-button" type="button">Add Connection</button>
          <button id="clear-connections-button" type="button">Clear Connections</button> <br>
          <button id="remove-node-button" type="button">Remove Node</button>
        </form>
        <div id="connection-options" class="netmap-option hidden">
          <button id="cancel-connection-button" type="button">Cancel</button>
        </div>
      </div>
      <div id="netmap-grid-container">
        <div id="netmap-table-wrapper">
          <div id="resize-top-plus" class="vertical-resizer resizer-plus"></div>
          <div id="resize-top-minus" class="vertical-resizer resizer-minus"></div>
          <div class="table-container">
            <div id="resize-left-plus" class="horizontal-resizer resizer-plus"></div>
            <div id="resize-left-minus" class="horizontal-resizer resizer-minus"></div>
            <table cellspacing="0" cellpadding="0" id="netmap" ng-style="netmap.tableMargin">
            </table>
            <div id="resize-right-minus" class="horizontal-resizer resizer-minus"></div>
            <div id="resize-right-plus" class="horizontal-resizer resizer-plus"></div>
          </div>
          <div id="resize-bottom-minus" class="vertical-resizer resizer-minus"></div>
          <div id="resize-bottom-plus" class="vertical-resizer resizer-plus"></div>
        </div>
      </div>
    `;
  }

  getNode () {
    const container = document.createElement('div');
    container.id = 'netmap-container';
    container.innerHTML = this.getHtml();
    const returnButton = container.querySelector('#return-button');
    returnButton.addEventListener('click', () => {
      this.switchView('mapList');
    });

    new LevelObj(container, this.map, this.switchView);
    return container;
  }
}