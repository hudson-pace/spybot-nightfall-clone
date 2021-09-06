import Game from './views/game.js';
import MapEditor from './views/mapEditor.js';
import Home from './views/home.js';
import NotFound from './views/notFound.js';
import MapList from './views/mapList.js';

let maps = JSON.parse(window.localStorage.getItem('maps'));
if (!Array.isArray(maps)) {
  maps = [];
}

const views = {
  'mapEditor': {
    'view': MapEditor,
  },
  'home': {
    'view': Home,
  },
  'game': {
    'view': Game,
  },
  'mapList': {
    'view': MapList,
    'params': maps,
  },
}

document.addEventListener("DOMContentLoaded", () => {
  const appContainer = document.querySelector('#app');
  const switchView = (viewName, params) => {
    const view = views[viewName].view;
    if (view) {
      appContainer.replaceChildren(new view(switchView, params || views[viewName].params).getNode());
    } else {
      appContainer.replaceChildren(new NotFound(switchView).getNode());
    }
  };
  switchView('home');
});

addEventListener('beforeunload', () => {
  window.localStorage.setItem('maps', JSON.stringify(maps));
});
