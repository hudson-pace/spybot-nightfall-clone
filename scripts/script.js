import NetMap from './netmap.js';

function preloadImage(name, src, imageLoadedCallback) {
  const image = new Image();
  image.src = src;
  image.onload = () => imageLoadedCallback(name, image);
}
const images = {};
function preloadImages(allImagesLoadedCallback) {
  const sourcePath = '../assets/images';
  const imageNames = [
    'nodeCAR', 'nodeDD', 'nodeLMM', 'nodePEDC', 'nodePharmhaus', 'nodeSmart', 'nodeUnknown', 'nodeWarez',
  ];
  let loadedCount = 0;

  function imageLoadedCallback(name, image) {
    loadedCount += 1;
    images[name] = image;
    console.log(`Image '${name}' loaded.`);
    if (loadedCount === imageNames.length) {
      allImagesLoadedCallback(images);
    }
  }
  imageNames.forEach((imageName) => {
    preloadImage(imageName, `${sourcePath}/${imageName}.png`, imageLoadedCallback);
  });
}
let canvas;
let currentView;
let netMap;

function startGame() {
  netMap = new NetMap('../assets/netmaps/nightfall_incident.json', images, () => {
    console.log('map loaded.');
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
