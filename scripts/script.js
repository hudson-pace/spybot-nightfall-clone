import NetMap from './netmap.js';

function preloadImage(name, src, imageLoadedCallback) {
  const image = new Image();
  image.src = src;
  image.onload = () => imageLoadedCallback(name, image);
}
const images = {};
function preloadImages(allImagesLoadedCallback) {
  const sourcePath = '../assets/images';
  const totalImages = 1;
  let loadedCount = 0;

  function imageLoadedCallback(name, image) {
    loadedCount += 1;
    images[name] = image;
    console.log(`Image ${loadedCount} loaded.`);
    if (loadedCount === totalImages) {
      allImagesLoadedCallback(images);
    }
  }
  preloadImage('satelliteDish', `${sourcePath}/satelliteDish.png`, imageLoadedCallback);
}
let canvas;
let currentView;
let netMap;

function startGame() {
  netMap = new NetMap('../assets/netmaps/test_1.json', images, () => {
    currentView = netMap;
  });
}

$(document).ready(() => {
  [canvas] = $('canvas');
  canvas.height = 500;
  canvas.width = 1000;
  preloadImages(() => {
    console.log('All images loaded.');
    startGame();
  });
});
