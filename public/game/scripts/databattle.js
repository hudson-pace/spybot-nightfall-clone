import { overlayTypes, tileTypes } from './tile.js';
import Agent from './agent.js';
import Button from './button.js';
import BattleMap from './battlemap.js';
import { calculateTextPadding } from './helpers.js';
import ProgramMenu from './menus/program-menu.js';

const itemTypes = {
  CREDIT: 'credit',
  DATA: 'data',
};

export default class DataBattle {
  constructor(canvas, context, battleData, assets, inventory, exitBattleCallback) {
    this.canvas = canvas;
    this.context = context;
    this.battleData = battleData;
    this.assets = assets;
    this.exitBattleCallback = exitBattleCallback;

    this.programList = inventory.getCopyOfProgramList();
    this.map = new BattleMap(battleData, canvas, assets.images);
    this.items = [...this.battleData.items];
    this.agents = [];
    this.enemyAgents = [];
    this.bonusCredits = 0;
    this.gameIsStarted = false;
    this.running = true;
    this.paused = false;
    this.playerTurn = true;
    this.popupMessage = {
      x: (canvas.width - 100) / 2,
      y: (canvas.height - 50) / 2,
      width: 200,
      height: 100,
    };
    this.showingPopup = false;
    this.enemyTurnCount = 0;

    this.programMenu = new ProgramMenu(
      assets,
      canvas,
      this.programList.map((program) => ({ name: program.name, desc: `x${program.quantity}` })),
      (programName) => {
        this.selectedProgram = assets.agents.find((prog) => prog.name === programName);
      },
    );

    this.startButton = new Button(250, 470, 100, 30, 'Start', () => {
      this.gameIsStarted = true;
      this.map.clearTileOverlays();
    });

    this.leaveButton = new Button(400, 470, 100, 30, 'Leave', () => {
      this.agents.forEach((agent) => {
        agent.deselect();
      });
      this.running = false;
      exitBattleCallback(false);
    });

    this.battleData.enemies.forEach((enemy) => {
      const agent = assets.agents.find((a) => a.name === enemy.name);
      if (agent) {
        this.enemyAgents.push(new Agent(agent, enemy.coords, assets, context, this.map));
      }
    });

    this.draw();
  }

  getTutorialInfo() {
    return {
      startButton: this.startButton,
      programMenu: this.programMenu,
      map: this.map,
    };
  }

  draw() {
    console.log('Redrawing databattle');
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.map.draw(this.context);
    this.items.forEach((item) => {
      this.drawItem(item);
    });
    this.map.drawOverlays(this.context);
    this.agents.forEach((agent) => agent.draw(this.context));
    this.enemyAgents.forEach((agent) => agent.draw(this.context));
    if (!this.gameIsStarted) {
      this.startButton.draw(this.context);
    }
    this.leaveButton.draw(this.context);
    this.programMenu.draw();
    if (this.showingPopup) {
      this.context.fillStyle = 'rgba(40, 40, 40, 0.95)';
      this.context.fillRect(this.popupMessage.x, this.popupMessage.y, this.popupMessage.width,
        this.popupMessage.height);
      this.context.fillStyle = 'white';
      this.context.font = '20px verdana';
      const [leftPad, topPad] = calculateTextPadding(this.popupMessage, this.popupMessage.message,
        this.context);
      this.context.fillText(this.popupMessage.message, this.popupMessage.x + leftPad,
        this.popupMessage.y + topPad);
    }
  }

  drawItem(item) {
    let sourceX = 13;
    if (item.type === itemTypes.CREDIT) {
      sourceX = 0;
    } else if (item.type === itemTypes.DATA) {
      sourceX = 27;
    }
    const { x, y } = this.map.getTileAtGridCoords(item.coords.x, item.coords.y).getDrawingCoords();
    this.context.drawImage(this.assets.images.items, sourceX, 0, 27, 27, x, y, 27, 27);
  }

  nextEnemyTurn() {
    if (this.enemyTurnCount < this.enemyAgents.length) {
      const agent = this.enemyAgents[this.enemyTurnCount];
      const delay = 300;

      let totalDelay = delay;
      setTimeout(() => {
        agent.select();
        this.draw();
      }, totalDelay);
      const turn = agent.calculateTurn(this.agents);
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
      } else {
        totalDelay += delay;
        setTimeout(() => {
          agent.executeCommand();
          this.draw();
        }, totalDelay);
      }
      totalDelay += delay;
      setTimeout(() => {
        agent.deselect();
        if (!this.checkForEndOfGame()) {
          this.nextEnemyTurn();
        }
      }, totalDelay);

      this.enemyTurnCount += 1;
    } else {
      this.enemyAgents.forEach((agent) => {
        agent.resetTurn();
      });
      this.startPlayerTurn();
    }
  }

  startEnemyTurn() {
    this.enemyTurnCount = 0;
    this.playerTurn = false;
    this.paused = true;
    this.flashMessage('Enemy Turn', 600);
    setTimeout(() => {
      this.nextEnemyTurn();
    }, 600);
  }

  startPlayerTurn() {
    this.flashMessage('Your Turn', 600);
    setTimeout(() => {
      this.playerTurn = true;
      this.paused = false;
    }, 600);
  }

  checkForEndOfTurn() {
    if (this.playerTurn && !this.checkForEndOfGame()) {
      if (!this.agents.find((agent) => !agent.turnIsOver)) {
        this.agents.forEach((a) => {
          if (a.selected) {
            a.deselect();
          }
          a.resetTurn();
        });
        if (!this.paused) {
          if (this.enemyAgents.length > 0) {
            this.startEnemyTurn();
          } else {
            this.draw();
          }
        }
      } else {
        // At least one agent's turn is not over.
        this.selectNextAgent();
      }
    }
  }

  checkForEndOfGame() {
    if (this.agents.length === 0) {
      this.endGame(false);
      return true;
    } if (this.enemyAgents.length === 0
      && !this.items.find((item) => item.type === itemTypes.DATA)) {
      this.endGame(true);
      return true;
    }
    return false;
  }

  endGame(playerWon) {
    this.paused = true;
    if (playerWon) {
      this.agents.forEach((agent) => {
        if (agent.selected) {
          agent.deselect();
        }
      });
      this.flashMessage('You Win', 1000);
      setTimeout(() => {
        this.exitBattleCallback(true, this.battleData.reward, this.bonusCredits);
      }, 1000);
    } else {
      this.flashMessage('You Lose', 1000);
      setTimeout(() => {
        this.exitBattleCallback(false);
      }, 1000);
    }
  }

  onClick(event) {
    if (this.playerTurn && !this.paused) {
      const x = (event.offsetX / this.canvas.clientWidth) * this.canvas.width;
      const y = (event.offsetY / this.canvas.clientHeight) * this.canvas.height;
      const tile = this.map.getTileAtPoint({ x, y });

      const clickedEnemy = this.enemyAgents.find((a) => a.head === tile);
      if (clickedEnemy) {
        this.programMenu.showProgramInfo(clickedEnemy);
      }

      if (this.leaveButton.containsPoint({ x, y })) {
        this.leaveButton.click();
      } else if (this.programMenu.containsPoint({ x, y })) {
        this.programMenu.onClick({ x, y });
        this.draw();
      } else if (!this.gameIsStarted) {
        if (this.startButton.containsPoint({ x, y })) {
          this.startButton.click();
        } else if (tile && tile.overlay === overlayTypes.UPLOAD) {
          if (this.selectedProgram) {
            const newProgram = this.programList.find(
              (prog) => prog.name === this.selectedProgram.name,
            );
            if (newProgram && newProgram.quantity > 0) {
              newProgram.quantity -= 1;
              const agentData = this.assets.agents.find((agent) => agent.name === newProgram.name);
              const oldAgentIndex = this.agents.findIndex((agent) => agent.head === tile);
              this.agents.push(new Agent(agentData, [{ x: tile.x, y: tile.y }], this.assets,
                this.context, this.map));
              if (oldAgentIndex !== -1) {
                const program = this.programList.find(
                  (prog) => prog.name === this.agents[oldAgentIndex].name,
                );
                program.quantity += 1;
                this.agents.splice(oldAgentIndex, 1);
              }
              this.programMenu.updateProgramList(this.programList.map((prog) => ({
                name: prog.name, desc: `x${prog.quantity}`,
              })));
            }
          }
        }
      } else if (tile) {
        const selectedAgent = this.agents.find((a) => a.selected);
        const clickedAgent = this.agents.find((a) => a.head === tile);
        if (clickedAgent && (!selectedAgent || !selectedAgent.isAttacking
          || selectedAgent.turnIsOver || (selectedAgent.isAttacking
            && !BattleMap.tilesAreWithinRange(selectedAgent.head, clickedAgent.head,
              selectedAgent.selectedCommand.range)))) {
          // Switch to the clicked program unless the selected program is attacking it.
          if (selectedAgent) {
            selectedAgent.deselect();
          }
          this.selectAgent(clickedAgent);
        } else if (selectedAgent && !selectedAgent.isAttacking && !selectedAgent.turnIsOver) {
          selectedAgent.move(tile);
          const newTile = selectedAgent.head;
          const itemIndex = this.items.findIndex((item) => item.coords.x === newTile.x
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
      if (this.running) {
        this.draw();
      }
    }
  }

  flashMessage(text, time) {
    this.popupMessage.message = text;
    this.showingPopup = true;
    this.draw();
    setTimeout(() => {
      this.showingPopup = false;
      this.draw();
    }, time);
  }

  onMouseWheel(event) {
    const point = {
      x: 1000 * (event.offsetX / this.canvas.clientWidth),
      y: 500 * (event.offsetY / this.canvas.clientHeight),
    };
    if (this.programMenu.containsPoint(point)) {
      this.programMenu.onScroll(point, event.wheelDelta / 120);
    }
  }

  attack(tile, command, totalDelay) {
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
  }

  checkIfAgentIsDeleted(target) {
    if (target.selected) {
      target.deselect();
    }
    if (target.tiles.length === 0) {
      let agentList;
      let targetIndex = this.enemyAgents.findIndex((agent) => agent === target);
      if (targetIndex !== -1) {
        agentList = this.enemyAgents;
      } else {
        targetIndex = this.agents.findIndex((agent) => agent === target);
        if (targetIndex !== -1) {
          agentList = this.agents;
        }
      }
      if (agentList) {
        agentList.splice(targetIndex, 1);
      }
    }
  }

  alterTerrain(tile, command, totalDelay) {
    setTimeout(() => {
      if (command.damage < 0) {
        if (tile.type === tileTypes.NONE) {
          tile.changeType(tileTypes.BASIC);
          this.draw();
        }
      } else {
        const itemOnTile = this.items.find((item) => item.coords.x === tile.x
          && item.coords.y === tile.y);
        if (tile.type === tileTypes.BASIC && !itemOnTile) {
          tile.changeType(tileTypes.NONE);
          this.draw();
        }
      }
    }, totalDelay);
  }

  boost(tile, command, totalDelay) {
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
  }

  findAgentOnTile(tile) {
    let targetAgent;
    if (tile.type === tileTypes.OCCUPIED) {
      targetAgent = this.enemyAgents.find((agent) => agent.containsTile(tile));
      if (targetAgent) {
        return targetAgent;
      }
      targetAgent = this.agents.find((agent) => agent.containsTile(tile));
    }
    return targetAgent;
  }

  executeCommand(tile, agent, totalDelay) {
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
  }

  pauseAndDoXTimes(callback, intervalDelay,
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
  }

  pickupItem(itemIndex) {
    const item = this.items[itemIndex];
    this.items.splice(itemIndex, 1);
    if (item.type === itemTypes.DATA) {
      this.endGame(true);
    } else if (item.type === itemTypes.CREDIT) {
      this.bonusCredits += item.amount;
      console.log(item.amount);
    }
  }

  selectNextAgent() {
    const selectedAgent = this.agents.find((a) => a.selected);
    selectedAgent.deselect();
    const nextAgent = this.agents.find((a) => !a.turnIsOver);
    if (nextAgent) {
      this.selectAgent(nextAgent);
    }
  }

  selectAgent(agent) {
    agent.select();
    this.programMenu.showProgramInfo(agent, (commandName) => {
      agent.chooseCommand(commandName);
    }, () => {
      agent.chooseMove();
    }, () => {
      agent.chooseEndTurn();
      this.checkForEndOfTurn();
    });
    this.draw();
  }
}
