import ViewManager from './view-manager.js';

function preloadImage(name, src, imageLoadedCallback) {
  const image = new Image();
  image.src = src;
  image.onload = () => imageLoadedCallback(name, image);
}
const images = {};
function preloadImages(allImagesLoadedCallback) {
  const sourcePath = './assets/images';
  const imageNames = [
    'nodeCAR', 'nodeDD', 'nodeLMM', 'nodePEDC', 'nodePharmhaus', 'nodeSmart', 'nodeUnknown', 'nodeWarez', 'agents', 'tileOverlays', 'agentDone',
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

$(document).ready(() => {
  const canvas = $('canvas')[0];
  canvas.height = 500;
  canvas.width = 1000;
  preloadImages(() => {
    console.log('All images loaded.');
    ViewManager('./assets/worlds/nightfall_incident', images);
  });
});
