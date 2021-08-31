import StartMenu from './start-menu.js';

export default () => {
  console.log('init gam');
  const canvas = document.getElementsByTagName('canvas')[0];
  canvas.height = 500;
  canvas.width = 1000;

  const startMenu = new StartMenu(canvas);
  canvas.addEventListener('mousedown', (event) => {
    startMenu.onMouseDown(event);
  });
  canvas.addEventListener('mouseup', (event) => {
    startMenu.onMouseUp(event);
  });
  canvas.addEventListener('mouseleave', (event) => {
    startMenu.onMouseLeave(event);
  });
  canvas.addEventListener('mousemove', (event) => {
    startMenu.onMouseMove(event);
  });
  canvas.addEventListener('click', (event) => {
    startMenu.onClick(event);
  });
  canvas.addEventListener('mousewheel', (event) => {
    startMenu.onMouseWheel(event);
  });
  document.addEventListener('keydown', (event) => {
    startMenu.onKeyDown(event);
  });
};
