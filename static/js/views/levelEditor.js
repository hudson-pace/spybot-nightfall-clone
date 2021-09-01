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
          <div id="add-node-options" class="netmap-option hidden">
            Add Node: <br>
            Owner: <select ng-model="newNode.owner">
              <option ng-repeat="owner in ownerList">{{ owner }}</option>
            </select> <br>
            Name: <input type="text" ng-model="newNode.name"></input> <br>
            Desc: <input type="text" ng-model="newNode.desc"></input> <br>
            Sec. Level: <input type="text" maxLength="3" ng-model="newNode.securityLevel"></input> <br>
            Image: <input type="text" ng-model="newNode.image"></input> <br>
            Starts Owned: <input type="checkbox" ng-model="newNode.ownedByUser"></input> <br>
            <button ng-click="addNode(newNode)">Add Node</button>
          </div>
          <div id="edit-node-options" class="netmap-option hidden">
            Owner: <select ng-model="selectedNode.owner">
              <option ng-repeat="owner in ownerList">{{ owner }}</option>
            </select>
            Name: <input type="text" ng-model="selectedNode.name"></input> <br>
            Desc: <input type="text" ng-model="selectedNode.desc"></input> <br>
            Sec. Level: <input type="text" maxLength="2" ng-model="selectedNode.securityLevel"></input> <br>
            Image: <input type="text" ng-model="selectedNode.image"></input> <br>
            Starts Owned: <input type="checkbox" ng-model="selectedNode.ownedByUser"></input> <br>
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