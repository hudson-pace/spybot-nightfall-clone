import { Tile, tileTypes, overlayTypes } from './tile.js';
import Agent from './agent.js';

export default function DataBattle(name, url, images, battleLoadedCallback, exitBattleCallback) {
  const canvas = $('canvas')[0];
  const context = canvas.getContext('2d');
  const map = [];
  const agents = [];
  let width;
  let height;
  let gameIsStarted = false;

  const startButton = {
    x: 200,
    y: 470,
    width: 100,
    height: 30,
  };

  function initializeMap(battle) {
    width = battle.width;
    height = battle.height;
    const leftPad = (canvas.width - (30 * width)) / 2;
    const topPad = (canvas.height - (30 * height)) / 2;
    battle.field.forEach((row, rowIndex) => {
      row.split('').forEach((square, colIndex) => {
        const tile = new Tile(colIndex, rowIndex, 27, 3, leftPad, topPad, images.tileOverlays);
        switch (square) {
          default:
            tile.type = tileTypes.NONE;
            break;
          case '#':
            tile.type = tileTypes.BASIC;
            break;
          case '@':
            tile.type = tileTypes.UPLOAD;
            break;
        }
        map.push(tile);
      });
    });
  }

  let agentData;
  $.getJSON(url, (data) => {
    const battle = data.battles.find((b) => b.name === name);
    console.log(battle);
    initializeMap(battle);

    battleLoadedCallback();

    this.draw();
  });
  $.getJSON('../assets/agents.json', (data) => {
    agentData = data;
    console.log('agents loaded');
  });

  this.draw = function draw() {
    console.log('Redrawing databattle');
    context.clearRect(0, 0, canvas.width, canvas.height);
    map.forEach((tile) => {
      tile.draw(context);
    });
    agents.forEach((agent) => agent.draw(context));
    if (!gameIsStarted) {
      context.fillStyle = 'grey';
      context.fillRect(startButton.x, startButton.y, startButton.width, startButton.height);
      context.fillStyle = 'white';
      context.font = '20px verdana';
      context.textBaseline = 'middle';
      context.fillText('start', startButton.x + 20, startButton.y + (startButton.height / 2));
    }
  };

  function getTileFromCoords(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) {
      return undefined;
    }
    return map[(y * width) + x];
  }

  function highlightValidMoves(agent) {
    const visitedTiles = [];
    const explorationQueue = [];
    explorationQueue.push([agent.head, 0]);
    while (explorationQueue.length > 0) {
      const tile = explorationQueue.splice(0, 1)[0];
      if (tile[1] < agent.movesRemaining) {
        let nextTile = getTileFromCoords(tile[0].x - 1, tile[0].y);
        if (nextTile && nextTile.type === tileTypes.BASIC
          && !visitedTiles.find((t) => t === nextTile)) {
          explorationQueue.push([nextTile, tile[1] + 1]);
          visitedTiles.push(nextTile);
        }
        nextTile = getTileFromCoords(tile[0].x + 1, tile[0].y);
        if (nextTile && nextTile.type === tileTypes.BASIC
          && !visitedTiles.find((t) => t === nextTile)) {
          explorationQueue.push([nextTile, tile[1] + 1]);
          visitedTiles.push(nextTile);
        }
        nextTile = getTileFromCoords(tile[0].x, tile[0].y - 1);
        if (nextTile && nextTile.type === tileTypes.BASIC
          && !visitedTiles.find((t) => t === nextTile)) {
          explorationQueue.push([nextTile, tile[1] + 1]);
          visitedTiles.push(nextTile);
        }
        nextTile = getTileFromCoords(tile[0].x, tile[0].y + 1);
        if (nextTile && nextTile.type === tileTypes.BASIC
          && !visitedTiles.find((t) => t === nextTile)) {
          explorationQueue.push([nextTile, tile[1] + 1]);
          visitedTiles.push(nextTile);
        }
      }
    }
    map.forEach((t) => {
      t.changeOverlay(overlayTypes.NONE);
    });
    visitedTiles.forEach((t) => {
      if (t === getTileFromCoords(agent.head.x - 1, agent.head.y)) {
        t.changeOverlay(overlayTypes.MOVE_LEFT);
      } else if (t === getTileFromCoords(agent.head.x + 1, agent.head.y)) {
        t.changeOverlay(overlayTypes.MOVE_RIGHT);
      } else if (t === getTileFromCoords(agent.head.x, agent.head.y - 1)) {
        t.changeOverlay(overlayTypes.MOVE_UP);
      } else if (t === getTileFromCoords(agent.head.x, agent.head.y + 1)) {
        t.changeOverlay(overlayTypes.MOVE_DOWN);
      } else {
        t.changeOverlay(overlayTypes.VALID_MOVE);
      }
    });
  }
  this.onClick = function onClick(event) {
    const x = (event.offsetX / canvas.clientWidth) * canvas.width;
    const y = (event.offsetY / canvas.clientHeight) * canvas.height;
    const tile = map.find((t) => t.containsPoint({ x, y }));
    if (!gameIsStarted) {
      if (tile && tile.type === tileTypes.UPLOAD) {
        if (!agents.find((agent) => agent.head === tile)) {
          const tempAgentData = agentData.find((data) => data.name === 'Slingshot');
          if (tempAgentData) {
            agents.push(new Agent(tempAgentData, tile, images.agents, context));
            this.draw();
          }
        }
      } else if (x > startButton.x && x < startButton.x + startButton.width
          && y > startButton.y && y < startButton.y + startButton.height) {
        gameIsStarted = true;
        map.forEach((t) => {
          if (t.type === tileTypes.UPLOAD) {
            t.changeType(tileTypes.BASIC);
          }
        });
        this.draw();
      }
    } else {
      const agent = agents.find((a) => a.head === tile);
      if (agent && !agent.selected) {
        agents.forEach((a) => a.deselect());
        agent.select();
        highlightValidMoves(agent);
        this.draw();
      } else {
        const selectedAgent = agents.find((a) => a.selected);
        if (selectedAgent && selectedAgent.movesRemaining > 0 && tile
          && tile.type === tileTypes.BASIC && Math.abs(tile.x - selectedAgent.head.x)
          + Math.abs(tile.y - selectedAgent.head.y) === 1) {
          selectedAgent.move(tile);
          highlightValidMoves(selectedAgent);
          this.draw();
        }
      }
    }
  };
}
