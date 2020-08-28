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
    console.log(`image ${loadedCount} loaded.`);
    console.log(image);
    if (loadedCount === totalImages) {
      allImagesLoadedCallback(images);
    }
  }
  preloadImage('satellite', `${sourcePath}/satellite.png`, imageLoadedCallback);
}
let context;
let currentView;
let netMap;

function draw() {
  if (currentView) {
    currentView.draw(context);
  }
}

function startGame() {
  netMap = new NetMap('../assets/netmaps/test_1.json', images, () => {
    currentView = netMap;
    setInterval(draw, 10);
  });
}

$(document).ready(() => {
  const canvas = $('canvas')[0];
  canvas.height = 500;
  canvas.width = 1000;
  context = canvas.getContext('2d');
  preloadImages(() => {
    console.log('all images loaded.');
    startGame();
  });
});

$('canvas').on('click', (event) => {
  currentView.onClick(event);
});
