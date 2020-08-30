import { Tile, tileTypes } from './tile.js';
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
        const tile = new Tile(colIndex, rowIndex, 27, 3, leftPad, topPad);
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

  this.onClick = function onClick(event) {
    const x = (event.offsetX / canvas.clientWidth) * canvas.width;
    const y = (event.offsetY / canvas.clientHeight) * canvas.height;
    const tile = map.find((t) => t.containsPoint({ x, y }));
    if (!gameIsStarted) {
      if (tile && tile.type === tileTypes.UPLOAD) {
        if (!agents.find((agent) => agent.tile === tile)) {
          const tempAgentData = agentData.find((data) => data.name === 'Bug');
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
      const agent = agents.find((a) => a.tile === tile);
      if (agent && !agent.selected) {
        agents.forEach((a) => a.deselect());
        agent.select();
        this.draw();
      } else {
        const selectedAgent = agents.find((a) => a.selected);
        if (selectedAgent && tile && tile.type === tileTypes.BASIC
          && Math.abs(tile.x - selectedAgent.tile.x)
          + Math.abs(tile.y - selectedAgent.tile.y) === 1) {
          selectedAgent.tile = tile;
          this.draw();
        }
      }
    }
  };
}
