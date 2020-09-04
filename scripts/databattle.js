import { Tile, tileTypes, overlayTypes } from './tile.js';
import Agent from './agent.js';
import Inventory from './inventory.js';
import ProgramMenu from './program-menu.js';
import Button from './button.js';
import BattleMap from './battlemap.js';
import { calculateTextPadding } from './helpers.js';

const itemTypes = {
  CREDIT: 'credit',
  DATA: 'data',
}

export default function DataBattle(name, url, images, programMenu, battleLoadedCallback,
  exitBattleCallback) {
  const canvas = $('canvas')[0];
  const context = canvas.getContext('2d');
  let map;
  const agents = [];
  const enemyAgents = [];
  let items;
  let bonusCredits = 0;
  let gameIsStarted = false;
  let running = true;
  let paused = false;
  let playerTurn = true;
  const popupMessage = {
    x: (canvas.width - 100) / 2,
    y: (canvas.height - 50) / 2,
    width: 200,
    height: 100,
  };
  let showingPopup = false;
  let enemyTurnCount = 0;

  const startButton = new Button(250, 470, 100, 30, 'Start', () => {
    gameIsStarted = true;
    map.clearTileOverlays();
  });

  const leaveButton = new Button(400, 470, 100, 30, 'Leave', () => {
    agents.forEach((agent) => {
      agent.deselect();
    });
    running = false;
    exitBattleCallback(false);
  });

  this.tryToLoadEnemyAgents = function tryToLoadEnemyAgents() {
    if (this.agentData && this.battleData) {
      this.battleData.enemies.forEach((enemy) => {
        const agent = this.agentData.find((a) => a.name === enemy.name);
        if (agent) {
          enemyAgents.push(new Agent(agent,
            map.getTileAtGridCoords(enemy.coords.x, enemy.coords.y), images.agents,
            images.agentDone, context, map));
        }
      });
      this.draw();
    }
  };

  $.getJSON('./assets/agents.json', (data) => {
    this.agentData = data;
    console.log('agents loaded');
    this.tryToLoadEnemyAgents();
  });
  $.getJSON(url, (data) => {
    console.log('battle loaded');
    const battle = data.battles.find((b) => b.name === name);
    map = new BattleMap(battle, canvas, images);
    this.battleData = battle;
    items = this.battleData.items;

    battleLoadedCallback();
    this.tryToLoadEnemyAgents();
  });

  this.draw = function draw() {
    console.log('Redrawing databattle');
    context.clearRect(0, 0, canvas.width, canvas.height);
    map.draw(context);
    items.forEach((item) => {
      this.drawItem(item);
    });
    map.drawOverlays(context);
    agents.forEach((agent) => agent.draw(context));
    enemyAgents.forEach((agent) => agent.draw(context));
    if (!gameIsStarted) {
      startButton.draw(context);
    }
    leaveButton.draw(context);
    programMenu.draw(context);
    if (showingPopup) {
      context.fillStyle = 'rgba(40, 40, 40, 0.95)';
      context.fillRect(popupMessage.x, popupMessage.y, popupMessage.width, popupMessage.height);
      context.fillStyle = 'white';
      context.font = '20px verdana';
      const [leftPad, topPad] = calculateTextPadding(popupMessage, popupMessage.message, context);
      context.fillText(popupMessage.message, popupMessage.x + leftPad, popupMessage.y + topPad);
    }
  };

  this.drawItem = function drawItem(item) {
    let sourceX = 13;
    if (item.type === itemTypes.CREDIT) {
      sourceX = 0;
    } else if (item.type === itemTypes.DATA) {
      sourceX = 27;
    }
    console.log('drawing item');
    const { x, y } = map.getTileAtGridCoords(item.coords.x, item.coords.y).getDrawingCoords();
    context.drawImage(images.items, sourceX, 0, 27, 27, x, y, 27, 27);
  };

  this.nextEnemyTurn = function nextEnemyTurn() {
    if (enemyTurnCount < enemyAgents.length) {
      const agent = enemyAgents[enemyTurnCount];
      const delay = 300;

      let totalDelay = delay;
      setTimeout(() => {
        agent.select();
        this.draw();
      }, totalDelay);
      const turn = agent.calculateTurn(agents);
      if (turn.moves) {
        turn.moves.forEach((tile) => {
          totalDelay += delay;
          const repetitions = 1;
          this.pauseAndDoXTimes(agent.move.bind(agent), 0, repetitions, [tile], totalDelay);
        });
      }

      totalDelay += delay;
      setTimeout(() => {
        agent.showAttack(turn.targetTile);
        this.draw();
      }, totalDelay);
      totalDelay += delay;
      totalDelay += this.executeCommand(turn.targetTile, agent, totalDelay);
      totalDelay += delay;
      setTimeout(() => {
        agent.deselect();
        if (!this.checkForEndOfGame()) {
          this.nextEnemyTurn();
        }
      }, totalDelay);

      enemyTurnCount += 1;
    } else {
      enemyAgents.forEach((agent) => {
        agent.resetTurn();
      });
      this.startPlayerTurn();
    }
  };

  this.startEnemyTurn = function startEnemyTurn() {
    enemyTurnCount = 0;
    playerTurn = false;
    paused = true;
    this.flashMessage('Enemy Turn', 600);
    setTimeout(() => {
      this.nextEnemyTurn();
    }, 600);
  };

  this.startPlayerTurn = function startPlayerTurn() {
    this.flashMessage('Your Turn', 600);
    setTimeout(() => {
      playerTurn = true;
      paused = false;
    }, 600);
  };

  this.checkForEndOfTurn = function checkForEndOfTurn() {
    if (playerTurn && !this.checkForEndOfGame()) {
      if (!agents.find((agent) => !agent.turnIsOver)) {
        agents.forEach((a) => {
          if (a.selected) {
            a.deselect();
          }
          a.resetTurn();
        });
        if (!paused) {
          this.startEnemyTurn();
        }
      }
    }
  };
  this.checkForEndOfGame = function checkForEndOfGame() {
    if (agents.length === 0) {
      this.endGame(false);
      return true;
    } if (enemyAgents.length === 0) {
      this.endGame(true);
      return true;
    }
    return false;
  };
  this.endGame = function endGame(playerWon) {
    paused = true;
    if (playerWon) {
      agents.forEach((agent) => {
        if (agent.selected) {
          agent.deselect();
        }
      });
      this.flashMessage('You Win', 1000);
      setTimeout(() => {
        exitBattleCallback(true, this.battleData.reward, bonusCredits);
      }, 1000);
    } else {
      this.flashMessage('You Lose', 1000);
      setTimeout(() => {
        exitBattleCallback(false);
      }, 1000);
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
            agents.push(new Agent(agentData, tile, images.agents, images.agentDone, context, map));
            if (oldAgentIndex !== -1) {
              programMenu.addProgram(agents[oldAgentIndex].name);
              agents.splice(oldAgentIndex, 1);
            }
          }
        }
      } else if (tile) {
        const selectedAgent = agents.find((a) => a.selected);
        const clickedAgent = agents.find((a) => a.head === tile);
        if (clickedAgent && (!selectedAgent || selectedAgent.movesRemaining > 0
          || selectedAgent.turnIsOver)) {
          if (selectedAgent) {
            selectedAgent.deselect();
          }
          map.clearTileOverlays();
          programMenu.showActiveProgram(clickedAgent);
          clickedAgent.select();
        } else if (selectedAgent.movesRemaining > 0) {
          selectedAgent.move(tile);
          const newTile = selectedAgent.head;
          const itemIndex = items.findIndex((item) => item.coords.x === newTile.x
            && item.coords.y === newTile.y);
          if (itemIndex !== -1) {
            this.pickupItem(itemIndex);
          }
        } else if (!selectedAgent.turnIsOver
          && BattleMap.tilesAreWithinRange(tile, selectedAgent.head,
            selectedAgent.selectedCommand.range)) {
          this.executeCommand(tile, selectedAgent, 0);
        }
      }
      if (running) {
        this.draw();
      }
    }
  };

  this.flashMessage = function flashMessage(text, time) {
    popupMessage.message = text;
    showingPopup = true;
    this.draw();
    setTimeout(() => {
      showingPopup = false;
      this.draw();
    }, time);
  };

  this.onMouseWheel = function onMouseWheel(event) {
    programMenu.scroll(event.originalEvent.wheelDelta / -120);
    programMenu.draw(context);
  };
  this.attack = function attack(tile, command, totalDelay) {
    let delay = 0;
    let repetitions = 0;
    const target = this.findAgentOnTile(tile);
    if (target) {
      repetitions = Math.min(command.damage, target.tiles.length);
      delay = 200;
      this.pauseAndDoXTimes(target.hit.bind(target), delay, repetitions, undefined, totalDelay);
      setTimeout(() => {
        if (target.tiles.length === 0) {
          let agentList;
          let targetIndex = enemyAgents.findIndex((agent) => agent === target);
          if (targetIndex !== -1) {
            agentList = enemyAgents;
          } else {
            targetIndex = agents.findIndex((agent) => agent === target);
            if (targetIndex !== -1) {
              agentList = agents;
            }
          }
          if (agentList) {
            agentList.splice(targetIndex, 1);
          }
        }
      }, totalDelay + (delay * (repetitions + 1)));
    }

    setTimeout(() => {
      this.checkForEndOfTurn();
    }, totalDelay + (delay * (repetitions + 1)));
    return delay * (repetitions + 1);
  };
  this.alterTerrain = function alterTerrain(tile, command, totalDelay) {
    setTimeout(() => {
      if (command.damage < 0) {
        if (tile.type === tileTypes.NONE) {
          tile.changeType(tileTypes.BASIC);
        }
      } else {
        const itemOnTile = items.find((item) => item.coords.x === tile.x
          && item.coords.y === tile.y);
        if (tile.type === tileTypes.BASIC && !itemOnTile) {
          tile.changeType(tileTypes.NONE);
        }
      }
      this.checkForEndOfTurn();
      this.draw();
    }, totalDelay);
  };

  this.boost = function boost(tile, command, totalDelay) {
    let repetitions = 0;
    let delay = 0;
    const target = this.findAgentOnTile(tile);
    if (target) {
      if (command.stat === 'health') {
        repetitions = Math.min(command.damage, target.maxSize - target.tiles.length);
        delay = 200;
        if (repetitions > 0) {
          this.pauseAndDoXTimes(target.addToTail.bind(target), delay, repetitions, undefined,
            totalDelay);
        }
      } else {
        target.boostStat(command.stat, command.damage);
      }
    }

    setTimeout(() => {
      this.checkForEndOfTurn();
      this.draw();
    }, totalDelay + (delay * (repetitions + 1)));
    return delay * (repetitions + 1);
  };

  this.findAgentOnTile = function findAgentOnTile(tile) {
    let targetAgent;
    if (tile.type === tileTypes.OCCUPIED) {
      targetAgent = enemyAgents.find((agent) => agent.containsTile(tile));
      if (targetAgent) {
        return targetAgent;
      }
      targetAgent = agents.find((agent) => agent.containsTile(tile));
    }
    return targetAgent;
  };

  this.executeCommand = function executeCommand(tile, agent, totalDelay) {
    let delay = 0;
    setTimeout(() => {
      agent.executeCommand();
      this.draw();
    }, totalDelay);
    switch (agent.selectedCommand.type) {
      default:
        console.log('command type not implemented.');
        this.checkForEndOfTurn();
        break;
      case 'attack':
        delay = this.attack(tile, agent.selectedCommand, totalDelay);
        break;
      case 'terrain':
        this.alterTerrain(tile, agent.selectedCommand, totalDelay);
        break;
      case 'boost':
        delay = this.boost(tile, agent.selectedCommand, totalDelay);
        break;
    }
    return delay;
  };
  this.pauseAndDoXTimes = function pauseAndDoXTimes(callback, intervalDelay,
    repetitions, args, delay) {
    let counter = 0;
    if (repetitions < 1) {
      return;
    }
    setTimeout(() => {
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
        }
      }, intervalDelay);
    }, delay);
  };
  this.pickupItem = function pickupItem(itemIndex) {
    const item = items[itemIndex];
    items.splice(itemIndex, 1);
    if (item.type === itemTypes.DATA) {
      this.endGame(true);
    } else if (item.type === itemTypes.CREDIT) {
      bonusCredits += item.amount;
      console.log(item.amount);
    }
  };
}
