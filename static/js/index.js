import Game from './views/game.js';
import MainMenu from './views/mainMenu.js';
import LevelEditor from './views/levelEditor.js';

const router = async () => {
  const route = window.location.pathname;
  switch (route) {
    case '/level-editor':
      const levelEditor = new LevelEditor();
      document.querySelector('#app').innerHTML = levelEditor.getHtml();
      levelEditor.runScript();
      break;
    case '/play':
      const gameView = new Game();
      document.querySelector('#app').innerHTML = gameView.getHtml();
      gameView.runScript();
      break;
    default:
      const mainMenu = new MainMenu();
      window.history.pushState(null, null, '/');
      document.querySelector('#app').innerHTML = mainMenu.getHtml();
      console.log(document.querySelector('#app').innerHTML);
      break;
  }
}


document.addEventListener("DOMContentLoaded", () => {
  /*
  document.body.addEventListener("click", e => {
      if (e.target.matches("[data-link]")) {
          e.preventDefault();
          navigateTo(e.target.href);
      }
  });
  */

  /* Document has loaded -  run the router! */
  router();
});