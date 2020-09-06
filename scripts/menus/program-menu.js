import Menu from './menu.js';

export default class ProgramMenu {
  constructor(assets, canvas, programList, selectProgramCallback) {
    this.assets = assets;
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    this.context = context;
    this.programListMenu = new Menu(0, 0, 200, canvas.height * 0.4, context);
    this.programInfoMenu = new Menu(0, canvas.height * 0.4, 200, canvas.height * 0.6, context);
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

  showProgramInfo(program, selectCommandCallback) {
    this.programInfoMenu = new Menu(0, this.canvas.height * 0.4, 200,
      this.canvas.height * 0.6, this.context);
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
        let commandInfo = `Name: ${command.name}\n`;
        commandInfo += `Type: ${command.type.charAt(0).toUpperCase() + command.type.slice(1)}\n`;
        if (command.stat) {
          commandInfo += `Stat: ${command.stat.charAt(0).toUpperCase() + command.stat.slice(1)}\n`;
        }
        commandInfo += `Range: ${command.range}\n`;
        commandInfo += `Damage: ${command.damage}\n`;
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
      });

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
      this.draw();
    } else if (this.programInfoMenu && this.programInfoMenu.containsPoint(point)) {
      this.programInfoMenu.onClick(point);
      this.draw();
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
