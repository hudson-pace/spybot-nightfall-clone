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
  const enemyAgents = [];
  let gameIsStarted = false;
  const inventory = new Inventory();
  const programMenu = new ProgramMenu(canvas, { ...inventory }, images.agents);
  let running = true;
  let paused = false;
  let playerTurn = true;

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

  this.tryToLoadEnemyAgents = function tryToLoadEnemyAgents() {
    if (this.agentData && this.battleData) {
      this.battleData.enemies.forEach((enemy) => {
        const agent = this.agentData.find((a) => a.name === enemy.name);
        if (agent) {
          enemyAgents.push(new Agent(agent,
            map.getTileAtGridCoords(enemy.coords.x, enemy.coords.y), images.agents,
            images.agentDone, context, map, this.executeCommand.bind(this)));
        }
      });
      this.draw();
    }
  };

  $.getJSON('../assets/agents.json', (data) => {
    this.agentData = data;
    console.log('agents loaded');
    this.tryToLoadEnemyAgents();
  });
  $.getJSON(url, (data) => {
    const battle = data.battles.find((b) => b.name === name);
    map = new BattleMap(battle, canvas, images);
    this.battleData = battle;

    battleLoadedCallback();
    this.tryToLoadEnemyAgents();
  });

  this.draw = function draw() {
    console.log('Redrawing databattle');
    context.clearRect(0, 0, canvas.width, canvas.height);
    map.draw(context);
    agents.forEach((agent) => agent.draw(context));
    enemyAgents.forEach((agent) => agent.draw(context));
    if (!gameIsStarted) {
      startButton.draw(context);
    }
    leaveButton.draw(context);
    programMenu.draw(context);
  };

  this.checkForEndOfTurn = function checkForEndOfTurn() {
    if (!agents.find((agent) => !agent.turnIsOver)) {
      agents.forEach((a) => {
        if (a.selected) {
          a.deselect();
        }
        a.resetTurn();
      });
      const delay = 300;
      let totalDelay = 0;
      enemyAgents.forEach((enemy) => {
        const enemyTurn = enemy.calculateTurn(agents);
        enemyTurn.moves.forEach((tile) => {
          totalDelay += delay;
          const repetitions = 1;
          this.pauseAndDoXTimes(enemy.chooseTile.bind(enemy), totalDelay, repetitions, [tile]);
        });
        totalDelay += delay;
        const repetitions = 1;
        this.pauseAndDoXTimes(enemy.chooseTile.bind(enemy),
          totalDelay, repetitions, [enemyTurn.targetTile]);
      });
      totalDelay += delay;
      setTimeout(() => {
        enemyAgents.forEach((enemy) => {
          console.log('reset');
          enemy.resetTurn();
        });
      }, totalDelay);
    }
  };
  this.onClick = function onClick(event) {
    if (playerTurn && !paused) {
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
        console.log('attacking.');
        if (tile.type === tileTypes.OCCUPIED) {
          let agentList;
          let targetIndex = enemyAgents.findIndex((agent) => agent.containsTile(tile));
          if (targetIndex !== -1) {
            agentList = enemyAgents;
          } else {
            targetIndex = agents.findIndex((agent) => agent.containsTile(tile));
            if (targetIndex !== -1) {
              agentList = agents;
            }
          }

          if (agentList) {
            const agent = agentList[targetIndex];
            const repetitions = Math.min(command.damage, agent.tiles.length);
            const delay = 200;
            this.pauseAndDoXTimes(agent.hit.bind(agent), delay, repetitions);
            setTimeout(() => {
              if (agent.tiles.length === 0) {
                agentList.splice(targetIndex, 1);
              }
              this.checkForEndOfTurn();
            }, delay * repetitions);
          } else {
            this.checkForEndOfTurn();
          }
        } else {
          this.checkForEndOfTurn();
        }
        break;
    }
  };
  this.pauseAndDoXTimes = function pauseAndDoXTimes(callback, delay, repetitions, args) {
    paused = true;
    let counter = 0;
    const interval = setInterval(() => {
      if (args) {
        callback(...args);
      } else {
        callback();
      }
      this.draw();
      counter += 1;
      if (counter === repetitions) {
        clearInterval(interval);
        paused = false;
      }
    }, delay);
  };
}
