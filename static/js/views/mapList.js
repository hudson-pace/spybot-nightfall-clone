import BaseView from './baseView.js';

export default class extends BaseView {
  constructor (switchView, mapList) {
    super();
    this.switchView = switchView;
    this.mapList = mapList;
    console.log(mapList);
  }

  getHtml () {
    let html = `
      <button id="create-new-map-button" type="button">Create New Map</button>
    `;
    this.mapList.forEach((map) => {
      html += `
        <div>
          <button class="open-map-button" type="button">Open</button> ${map.name} ${map.width}x${map.height} ${map.nodes.length} nodes
        </div>
      `;
    });
    return html;
  }

  getNode () {
    const container = document.createElement('div');
    container.id = 'map-list-container';
    container.innerHTML = this.getHtml();
    const buttons = container.querySelectorAll('.open-map-button');
    for (let i = 0; i < this.mapList.length; i++) {
      buttons[i].addEventListener('click', () => {
        this.switchView('mapEditor', this.mapList[i]);
      });
    }

    const createNewMapButton = container.querySelector('#create-new-map-button');
    createNewMapButton.addEventListener('click', () => {
      const newMap = {}
      this.mapList.push(newMap);
      this.switchView('mapEditor', newMap);
    });
    return container;
  }
}