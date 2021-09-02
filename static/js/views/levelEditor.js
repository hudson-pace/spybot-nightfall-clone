import BaseView from './baseView.js';
import LevelObj from '../levelEditor.js';

export default class extends BaseView {
  getHtml () {
    return `
      <div id="netmap-container">
        <div id="netmap-options">
          <div class="netmap-option">
            <button ng-click="generateJson()">Generate JSON</button>
            <input ng-model="inputJson" type="text"><button ng-click="loadNetmap(inputJson)">Generate Map from JSON</button>
          </div>
          <form id="add-node-options" class="netmap-option hidden" autocomplete="off">
            <label for="owner">Owner: </label><select name="owner" required>
            </select> <br>
            <label for="name">Name: </label><input type="text" name="name" required></input> <br>
            <label for="description">Desc: </label><input type="text" name="description" required></input> <br>
            <label for="securityLevel">Sec. Level: </label><input type="number" min="1" max="99" value="1" name="securityLevel"></input> <br>
            <label for="startsOwned">Starts Owned: </label><input type="checkbox" name="startsOwned"></input> <br>
            <button id="add-node-button">Add Node</button>
          </form>
          <div id="edit-node-options" class="netmap-option hidden">
            <label for="owner">Owner: </label><select name="owner" required>
            </select>
            Name: <input type="text"></input> <br>
            Desc: <input type="text"></input> <br>
            Sec. Level: <input type="number" min="1" max="99" value="1"></input> <br>
            Starts Owned: <input type="checkbox"></input> <br>
            Battle: <button ng-click="editDatabattle(selectedNode)">Edit Battle</button> <br>
            Event: <button ng-click="editEvent(selectedNode)">Edit Event</button> <br>
            Shop: <button ng-click="editShop(selectedNode)">Edit Shop</button> <br>
            
            <button ng-click="addConnection()">Add Connection</button>
            <button ng-click="clearConnections()">Clear Connections</button> <br>
            <button ng-click="removeNode()">Remove Node</button>
          </div>
          <div id="connection-options" class="netmap-option hidden">
            <button ng-click="cancelConnection()">Cancel</button>
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
      </div>
    `;
  }

  runScript () {
    const ttt = new LevelObj();
  }
}