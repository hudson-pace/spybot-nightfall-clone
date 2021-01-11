import Menu from './menu.js';

export default class ProgramMenu {
  constructor(assets, canvas, programList, selectProgramCallback) {
    this.assets = assets;
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    this.context = context;
    this.programListMenu = new Menu(0, 0, 200, canvas.height * 0.3, context);
    this.programInfoMenu = new Menu(0, canvas.height * 0.3, 200, canvas.height * 0.7, context);
    this.programListMenu.addTextBlock('Program List', 18, true);
    this.programList = this.programListMenu.addScrollList(8, 14,
      programList, (programName) => {
        this.showProgramInfoFromName(programName);
        if (selectProgramCallback) {
          selectProgramCallback(programName);
        }
      });
  }

  updateProgramList(members) {
    this.programList.updateMembers(members);
  }

  showProgramInfoFromName(programName) {
    const program = { ...this.assets.agents.find((prog) => prog.name === programName) };
    program.commands = program.commands.map((command) => ({ name: command }));
    this.showProgramInfo(program);
  }

  showProgramInfo(program, selectCommandCallback, selectMoveCallback, selectEndTurnCallback) {
    this.selectedProgram = program.name;
    this.programInfoMenu = new Menu(0, this.canvas.height * 0.3, 200,
      this.canvas.height * 0.7, this.context);
    this.programInfoMenu.addTextBlock('Program Info', 18, true);
    const imgSourceRect = {
      x: (program.imgSource % 8) * 27,
      y: Math.floor(program.imgSource / 8) * 27,
      width: 27,
      height: 27,
    };
    this.programInfoMenu.addImage(this.assets.images.agents, imgSourceRect, true);
    this.programInfoMenu.addTextBlock(program.name, 16, true);
    this.programInfoMenu.addTextBlock('Commands', 14, false);
    this.programInfoMenu.addScrollList(3, 14, program.commands.map((command) => ({ name: command.name, desc: '' })),
      (commandName) => {
        this.programInfoMenu.popComponent();
        const command = this.assets.commands.find((com) => com.name === commandName);

        let commandInfo = `Range: ${command.range}\n`;
        switch (command.type) {
          default:
            commandInfo += 'This command is unknown.\n';
            break;
          case 'attack':
            commandInfo += `Deletes ${command.damage} segments from target.\n`;
            break;
          case 'boost':
            if (command.damage > 0) {
              commandInfo += `Increases ${command.stat} of target by ${command.damage}.\n`;
            } else {
              commandInfo += `Decreases ${command.stat} of target by ${command.damage * -1}.\n`;
            }
            break;
          case 'terrain':
            if (command.damage > 0) {
              commandInfo += 'Deletes the targeted tile.\n';
            } else {
              commandInfo += 'Repairs the targeted tile.\n';
            }
            break;
        }
        if (command.sizeReq) {
          commandInfo += `Size Requirement: ${command.sizeReq}\n`;
        } if (command.sacrifice) {
          commandInfo += `Sacrifice: ${command.sacrifice}\n`;
        }

        // Slice off the trailing newline.
        commandInfo = commandInfo.slice(0, commandInfo.length - 1);

        this.programInfoMenu.addTextBlock(commandInfo, 14, false);
        if (selectCommandCallback) {
          selectCommandCallback(commandName);
        }

        program.highlightTiles(
          program.getValidMoves(command.range, command.type),
          command.type,
        );
      });

    if (selectMoveCallback) {
      this.programInfoMenu.addButton('Move', 12, 100, true, true, () => selectMoveCallback());
    } if (selectEndTurnCallback) {
      this.programInfoMenu.addButton('End Turn', 12, 100, true, true, () => selectEndTurnCallback());
    }

    let programInfo = `${program.desc}\n`;
    programInfo += `Speed: ${program.speed}\n`;
    programInfo += `Max Size: ${program.maxSize}\n`;
    this.programInfoMenu.addTextBlock(programInfo, 14, false);
  }

  draw() {
    this.programListMenu.draw();
    this.programInfoMenu.draw();
  }

  onClick(point) {
    if (this.programListMenu.containsPoint(point)) {
      this.programListMenu.onClick(point);
    } else if (this.programInfoMenu && this.programInfoMenu.containsPoint(point)) {
      this.programInfoMenu.onClick(point);
    }
  }

  onScroll(point, amount) {
    if (this.programListMenu && this.programListMenu.containsPoint(point)) {
      this.programListMenu.onScroll(amount);
    } else if (this.programInfoMenu && this.programInfoMenu.containsPoint(point)) {
      this.programInfoMenu.onScroll(amount);
    }
  }

  containsPoint(point) {
    return this.programListMenu.containsPoint(point) || this.programInfoMenu.containsPoint(point);
  }
}
