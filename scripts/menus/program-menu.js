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
        const selectedProgram = {
          ...assets.agents.find((program) => program.name === programName),
        };
        selectedProgram.commands = selectedProgram.commands.map(
          (command) => ({ name: command }),
        );
        this.showProgramInfo(selectedProgram);

        if (selectProgramCallback) {
          selectProgramCallback(selectedProgram.name);
        }
      });
  }

  updateProgramList(members) {
    this.programList.updateMembers(members);
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
        let commandInfo = `name: ${command.name}\n`;
        commandInfo += `type: ${command.type}\n`;
        if (commandInfo.stat) {
          commandInfo += `stat: ${command.stat}\n`;
        }
        commandInfo += `range: ${command.range}\n`;
        commandInfo += `damage: ${command.damage}\n`;
        this.programInfoMenu.addTextBlock(commandInfo, 14, false);
        if (selectCommandCallback) {
          selectCommandCallback(commandName);
        }
      });
    this.programInfoMenu.addTextBlock(program.desc, 14, false);
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
