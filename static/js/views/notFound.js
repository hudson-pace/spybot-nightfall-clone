import BaseView from './baseView.js';

export default class extends BaseView {
  constructor (switchView) {
    super();
    this.switchView = switchView;
  }

  getHtml () {
    return `
      <p>Something went wrong.</p>
      <a id="home-button" href="">Go Home.</a>
    `;
  }
  getNode () {
    const container = document.createElement('div');
    container.innerHTML = this.getHtml();

    const homeButton = container.querySelector('#home-button');
    homeButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.switchView('home');
    });

    return container;
  }
}