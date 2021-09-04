import BaseView from './baseView.js';

export default class extends BaseView {
  constructor(switchView) {
    super();
    this.switchView = switchView;
  }
  getHtml () {
    return `
      <h1>spybot</h1>
      <p>you made it. gratz.</p>
      <a id="play-button" href="">let's play</a>
      <br>
      <a id="edit-button" href="">let's edit</a>
    `;
  }
  getNode () {
    const homeContainer = document.createElement('div');
    homeContainer.id = 'home-container';
    homeContainer.innerHTML = this.getHtml();

    const playButton = homeContainer.querySelector('#play-button');
    playButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.switchView('game');
    });

    const editButton = homeContainer.querySelector('#edit-button');
    editButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.switchView('mapList');
    })
    return homeContainer;
  }
}