import ViewManager from './view-manager.js';

$(document).ready(() => {
  const canvas = $('canvas')[0];
  canvas.height = 500;
  canvas.width = 1000;
  ViewManager();
});
