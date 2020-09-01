import { Tile, tileTypes, overlayTypes } from './tile.js';
import Agent from './agent.js';
import Inventory from './inventory.js';
import ProgramMenu from './program-menu.js';
import Button from './button.js';
import BattleMap from './battlemap.js';

export default function DataBattle(name, url, images, battleLoadedCallback, exitBattleCallback) {
  const canvas = $('canvas')[0];
  const context = canvas.getContext('2d');
  let map;
  const agents = [];
  let gameIsStarted = false;
  const inventory = new Inventory();
  const programMenu = new ProgramMenu(canvas, { ...inventory }, images.agents);
  let running = true;
  let paused = false;

  const startButton = new Button(250, 470, 100, 30, 'Start', () => {
    gameIsStarted = true;
    map.clearTileOverlays();
  });

  const leaveButton = new Button(400, 470, 100, 30, 'Leave', () => {
    agents.forEach((agent) => {
      agent.deselect();
    });
    running = false;
    exitBattleCallback();
  });

  $.getJSON(url, (data) => {
    const battle = data.battles.find((b) => b.name === name);
    map = new BattleMap(battle, canvas, images);

    battleLoadedCallback();

    this.draw();
  });

  this.draw = function draw() {
    console.log('Redrawing databattle');
    context.clearRect(0, 0, canvas.width, canvas.height);
    map.draw(context);
    agents.forEach((agent) => agent.draw(context));
    if (!gameIsStarted) {
      startButton.draw(context);
    }
    leaveButton.draw(context);
    programMenu.draw(context);
  };

  function checkForEndOfTurn() {
    return !agents.find((agent) => !agent.turnIsOver);
  }
  this.onClick = function onClick(event) {
    if (!paused) {
      const x = (event.offsetX / canvas.clientWidth) * canvas.width;
      const y = (event.offsetY / canvas.clientHeight) * canvas.height;
      const tile = map.getTileAtPoint({ x, y });

      if (leaveButton.containsPoint({ x, y })) {
        leaveButton.click();
      } else if (programMenu.containsPoint({ x, y })) {
        programMenu.onClick({ x, y });
      } else if (!gameIsStarted) {
        if (startButton.containsPoint({ x, y })) {
          startButton.click();
        } else if (tile && tile.overlay === overlayTypes.UPLOAD) {
          const agentData = programMenu.getProgramChoice();
          if (agentData) {
            const oldAgentIndex = agents.findIndex((agent) => agent.head === tile);
            agents.push(new Agent(agentData, tile, images.agents, images.agentDone, context, map,
              this.executeCommand.bind(this)));
            if (oldAgentIndex !== -1) {
              programMenu.addProgram(agents[oldAgentIndex].name);
              agents.splice(oldAgentIndex, 1);
            }
          }
        }
      } else {
        const agent = agents.find((a) => a.head === tile);
        if (agent && !agent.selected) {
          agents.forEach((a) => a.deselect());
          map.clearTileOverlays();
          programMenu.showActiveProgram(agent);
          agent.select();
        } else {
          const selectedAgent = agents.find((a) => a.selected);

          if (selectedAgent && tile) {
            selectedAgent.chooseTile(tile);
            if (checkForEndOfTurn()) {
              console.log('turn is over.');
              agents.forEach((a) => {
                if (a.selected) {
                  a.deselect();
                }
                a.resetTurn();
              });
            }
          }
        }
      }
      if (running) {
        this.draw();
      }
    }
  };

  this.onMouseWheel = function onMouseWheel(event) {
    programMenu.scroll(event.originalEvent.wheelDelta / -120);
    programMenu.draw(context);
  };
  this.executeCommand = function executeCommand(tile, command) {
    switch (command.type) {
      default:
        console.log('command type not implemented.');
        break;
      case 'attack':
        if (tile.type === tileTypes.OCCUPIED) {
          const targetIndex = agents.findIndex((agent) => agent.containsTile(tile));
          if (targetIndex !== -1) {
            const agent = agents[targetIndex];
            const repetitions = Math.min(command.damage, agent.tiles.length);
            const delay = 200;
            this.pauseAndDoXTimes(agent.hit.bind(agent), delay, repetitions);
            setTimeout(() => {
              if (agent.tiles.length === 0) {
                console.log('removing agent');
                agents.splice(targetIndex, 1);
              }
            }, delay * repetitions);
          }
        }
        break;
    }
  };
  this.pauseAndDoXTimes = function pauseAndDoXTimes(callback, delay, repetitions) {
    paused = true;
    let counter = 0;
    const interval = setInterval(() => {
      callback();
      this.draw();
      counter += 1;
      if (counter === repetitions) {
        clearInterval(interval);
        paused = false;
      }
    }, delay);
  };
}
