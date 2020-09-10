import { overlayTypes } from './tile.js';
import Agent from './agent.js';
import Button from './button.js';
import BattleMap from './battlemap.js';
import { calculateTextPadding } from './helpers.js';
import { tileTypes } from './tile.js'
import ProgramMenu from './menus/program-menu.js';

const itemTypes = {
  CREDIT: 'credit',
  DATA: 'data',
};

export default function DataBattle(battleData, assets, inventory, exitBattleCallback) {
  const canvas = $('canvas')[0];
  const context = canvas.getContext('2d');
  let map;
  const agents = [];
  const enemyAgents = [];
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

  let selectedProgram;
  const programList = inventory.getCopyOfProgramList();
  const programMenu = new ProgramMenu(
    assets,
    canvas,
    programList.map((program) => ({ name: program.name, desc: `x${program.quantity}` })),
    (programName) => {
      selectedProgram = assets.agents.find((prog) => prog.name === programName);
    },
  );

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
          enemyAgents.push(new Agent(agent, enemy.coords, assets, context, map));
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
  this.battleData = battleData;
  map = new BattleMap(battleData, canvas, assets.images);
  const { items } = this.battleData;

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
    programMenu.draw();
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
    const { x, y } = map.getTileAtGridCoords(item.coords.x, item.coords.y).getDrawingCoords();
    context.drawImage(assets.images.items, sourceX, 0, 27, 27, x, y, 27, 27);
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

      if (turn.targetTile) {
        totalDelay += delay;
        setTimeout(() => {
          agent.showAttack(turn.targetTile);
          this.draw();
        }, totalDelay);
        totalDelay += delay;
        totalDelay += this.executeCommand(turn.targetTile, agent, totalDelay);
      }
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
          if (enemyAgents.length > 0) {
            this.startEnemyTurn();
          } else {
            this.draw();
          }
        }
      }
    }
  };
  this.checkForEndOfGame = function checkForEndOfGame() {
    if (agents.length === 0) {
      this.endGame(false);
      return true;
    } if (enemyAgents.length === 0 && !items.find((item) => item.type === itemTypes.DATA)) {
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

      const clickedEnemy = enemyAgents.find((a) => a.head === tile);
      if (clickedEnemy) {
        programMenu.showProgramInfo(clickedEnemy);
      }

      if (leaveButton.containsPoint({ x, y })) {
        leaveButton.click();
      } else if (programMenu.containsPoint({ x, y })) {
        programMenu.onClick({ x, y });
      } else if (!gameIsStarted) {
        if (startButton.containsPoint({ x, y })) {
          startButton.click();
        } else if (tile && tile.overlay === overlayTypes.UPLOAD) {
          if (selectedProgram) {
            const newProgram = programList.find((prog) => prog.name === selectedProgram.name);
            if (newProgram && newProgram.quantity > 0) {
              newProgram.quantity -= 1;
              const agentData = assets.agents.find((agent) => agent.name === newProgram.name);
              const oldAgentIndex = agents.findIndex((agent) => agent.head === tile);
              agents.push(new Agent(agentData, [{ x: tile.x, y: tile.y }], assets, context, map));
              if (oldAgentIndex !== -1) {
                const program = programList.find(
                  (prog) => prog.name === agents[oldAgentIndex].name,
                );
                program.quantity += 1;
                agents.splice(oldAgentIndex, 1);
              }
              programMenu.updateProgramList(programList.map((prog) => ({
                name: prog.name, desc: `x${prog.quantity}`,
              })));
            }
          }
        }
      } else if (tile) {
        const selectedAgent = agents.find((a) => a.selected);
        const clickedAgent = agents.find((a) => a.head === tile);
        if (clickedAgent && (!selectedAgent || !selectedAgent.isAttacking
          || selectedAgent.turnIsOver || (selectedAgent.isAttacking
            && !BattleMap.tilesAreWithinRange(selectedAgent.head, clickedAgent.head,
              selectedAgent.selectedCommand.range)))) {
          // Switch to the clicked program unless the selected program is attacking it.
          if (selectedAgent) {
            selectedAgent.deselect();
          }
          map.clearTileOverlays();
          clickedAgent.select();
          programMenu.showProgramInfo(clickedAgent, (commandName) => {
            clickedAgent.chooseCommand(commandName);
          }, () => {
            clickedAgent.chooseMove();
          }, () => {
            clickedAgent.chooseEndTurn();
            this.checkForEndOfTurn();
          });
        } else if (selectedAgent && !selectedAgent.isAttacking && !selectedAgent.turnIsOver) {
          selectedAgent.move(tile);
          const newTile = selectedAgent.head;
          const itemIndex = items.findIndex((item) => item.coords.x === newTile.x
            && item.coords.y === newTile.y);
          if (itemIndex !== -1) {
            this.pickupItem(itemIndex);
          }
        } else if (selectedAgent && !selectedAgent.turnIsOver
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
    const point = {
      x: 1000 * (event.offsetX / canvas.clientWidth),
      y: 500 * (event.offsetY / canvas.clientHeight),
    };
    if (programMenu.containsPoint(point)) {
      programMenu.onScroll(point, event.originalEvent.wheelDelta / 120);
    }
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
        this.checkIfAgentIsDeleted(target);
      }, totalDelay + (delay * (repetitions + 1)));
    }

    return delay * (repetitions + 1);
  };

  this.checkIfAgentIsDeleted = function checkIfAgentIsDeleted(target) {
    if (target.selected) {
      target.deselect();
    }
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
    let sacrificeRepetitions = 0;
    let sacrificeDelay = 0;
    let delay = 0;
    let commandDelay = 0;
    if (!agent.selectedCommand.sizeReq || agent.tiles.length >= agent.selectedCommand.sizeReq) {
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
      if (agent.selectedCommand.sacrifice) {
        sacrificeRepetitions = Math.min(agent.selectedCommand.sacrifice, agent.tiles.length);
        sacrificeDelay = 200;
        this.pauseAndDoXTimes(agent.hit.bind(agent), sacrificeDelay, sacrificeRepetitions,
          undefined, totalDelay);
        commandDelay = Math.max(delay, (sacrificeRepetitions + 1) * sacrificeDelay);
        setTimeout(() => {
          this.checkIfAgentIsDeleted(agent);
        }, totalDelay + commandDelay);
      }
    }
    commandDelay = Math.max(delay, (sacrificeRepetitions + 1) * sacrificeDelay);
    setTimeout(() => {
      this.checkForEndOfTurn();
    }, totalDelay + commandDelay);
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
