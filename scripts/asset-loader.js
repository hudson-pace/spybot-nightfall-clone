function loadJSON(src, callback) {
  const xmlHttpReq = new XMLHttpRequest();
  xmlHttpReq.overrideMimeType('application/json');
  xmlHttpReq.open('GET', src, true);
  xmlHttpReq.onreadystatechange = () => {
    if (xmlHttpReq.readyState === 4 && xmlHttpReq.status === 200) {
      callback(JSON.parse(xmlHttpReq.responseText));
    }
  };
  xmlHttpReq.send(null);
}

function loadAsset(src, assetLoadedCallback) {
  const [,, extension] = src.split('.');
  let asset;
  switch (extension) {
    default:
      console.log(`'.${extension}' files are not supported. Could not load '${src}'.`);
      break;
    case 'png':
      asset = new Image();
      asset.src = src;
      asset.onload = () => assetLoadedCallback(asset);
      break;
    case 'json':
      loadJSON(src, (data) => {
        assetLoadedCallback(data);
      });
      break;
  }
}

const assets = {};
assets.images = {};
export default function loadAssets(allAssetsLoadedCallback) {
  const sourcePath = './assets';
  const assetNames = [
    'images/nodeCAR.png', 'images/nodeDD.png', 'images/nodeLMM.png', 'images/nodePEDC.png', 'images/nodePharmhaus.png', 'images/nodeSmart.png',
    'images/nodeUnknown.png', 'images/nodeWarez.png', 'images/agents.png', 'images/tileOverlays.png', 'images/agentDone.png', 'images/items.png',
    'worlds/nightfall_incident/netmap.json', 'agents.json', 'commands.json',
  ];
  let loadedCount = 0;

  assetNames.forEach((source) => {
    const words = source.split('/');
    const name = words[words.length - 1].slice(0, words[words.length - 1].indexOf('.'));
    loadAsset(`${sourcePath}/${source}`, (asset) => {
      loadedCount += 1;
      if (source.startsWith('images/')) {
        assets.images[name] = asset;
      } else {
        assets[name] = asset;
      }
      console.log(`'${source}' loaded.`);
      if (loadedCount === assetNames.length) {
        console.log('All assets loaded.');
        allAssetsLoadedCallback(assets);
      }
    });
  });
}
