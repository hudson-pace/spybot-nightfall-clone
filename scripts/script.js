import ViewManager from './view-manager.js';

const canvas = document.getElementsByTagName('canvas')[0];
canvas.height = 500;
canvas.width = 1000;
let saves = JSON.parse(localStorage.getItem('saves'));
if (!saves) {
  saves = [];
}
ViewManager(saves, canvas);
