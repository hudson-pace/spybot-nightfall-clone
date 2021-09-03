export default class {
  contructor (mapData) {
    this.mapData = mapData;
  }

  getHtml () {
    return `
      <div id="level-editor-container">
        <ul id="map-list"></ul>
      </div>
    `;
  }

  startScript () {
    const mapList = document.querySelector('#map-list');
    this.mapData.forEach((map) => {
      const mapEntry = document.createElement('li');
      mapEntry.innerHTML = `"${map.name}": ${map.width}x${map.height}, ${map.nodes.length} nodes`;
      mapList.appendChild(mapEntry);
    });

    const newMapButton = document.querySelector('#new-map-button')
  }
}