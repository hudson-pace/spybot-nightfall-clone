import { calculateTextPadding, splitStringIntoLines } from './helpers.js';

export default class ProgramMenu {
  constructor(canvas, inventory, image) {
    $.getJSON('../assets/agents.json', (data) => {
      this.agentData = data;
      console.log('agents loaded');
    });

    $.getJSON('../assets/commands.json', (data) => {
      this.commandData = data;
      console.log('commands loaded');
    });

    this.image = image;

    this.rect = {
      x: 10,
      y: 10,
      width: canvas.width * 0.2,
      height: canvas.height - 20,
    };
    this.textHeight = 15;
    this.listTitle = {
      x: this.rect.x,
      y: this.rect.y + 10,
      width: this.rect.width,
      height: this.textHeight,
    };
    this.programs = inventory.programs;

    const programListLength = 8;
    this.programList = {
      x: this.rect.x + 10,
      y: this.listTitle.y + this.listTitle.height + this.textHeight,
      width: this.rect.width - 20,
      height: this.textHeight * programListLength,
    };
    this.programSlots = [];
    for (let i = 0; i < programListLength; i += 1) {
      this.programSlots.push({
        x: this.rect.x + 10,
        y: this.programList.y + (this.textHeight * i),
        width: this.rect.width - 20,
        height: this.textHeight,
      });
    }

    this.infoTitle = {
      x: this.rect.x,
      y: this.programList.y + this.programList.height + this.textHeight,
      width: this.rect.width,
      height: this.textHeight,
    };

    this.programInfo = {
      x: this.rect.x + 10,
      y: this.infoTitle.y + this.infoTitle.height + this.textHeight,
      width: this.rect.width - 20,
      height: this.rect.height - (this.infoTitle.y + this.infoTitle.height + this.textHeight),
    };

    this.commandLabel = {
      x: this.rect.x + 10,
      y: this.programInfo.y + 80,
      width: this.rect.width - 20,
      height: this.textHeight,
    };
    const commandListLength = 3;
    this.commandList = {
      x: this.commandLabel.x,
      y: this.commandLabel.y + this.commandLabel.height,
      width: this.commandLabel.width,
      height: this.textHeight * commandListLength,
    };
    this.commandSlots = [];
    for (let i = 0; i < commandListLength; i += 1) {
      this.commandSlots.push({
        x: this.commandList.x,
        y: this.commandList.y + (i * this.textHeight),
        width: this.commandList.width,
        height: this.textHeight,
      });
    }

    this.description = {
      x: this.programInfo.x + 10,
      y: this.commandList.y + this.commandList.height + 10,
      width: this.programInfo.width - 20,
      height: this.rect.height - (this.commandList.y + this.commandList.height + 20),
    };

    this.scrollAmount = 0;
  }

  draw(context) {
    // Draw the whole menu container.
    context.clearRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
    context.fillStyle = 'rgba(40, 40, 40, 0.95)';
    context.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);

    // Draw the 'Program List' title.
    context.fillStyle = 'white';
    context.font = `${this.textHeight}px verdana`;
    context.textBaseline = 'middle';
    let [leftPad, topPad] = calculateTextPadding(this.listTitle, 'Program List', context);
    context.fillText('Program List', this.listTitle.x + leftPad, this.listTitle.y + topPad);

    // Draw the container for the program list.
    context.fillStyle = 'rgba(50, 50, 50, 1)';
    context.fillRect(this.programList.x, this.programList.y,
      this.programList.width, this.programList.height);

    // Draw each program in the program list.
    context.fillStyle = 'white';
    context.font = `${Math.floor(this.textHeight / 1.3)}px verdana`;
    for (let i = 0; i < Math.min(this.programSlots.length, this.programs.length); i += 1) {
      const program = this.programs[i + this.scrollAmount];
      const programSlot = this.programSlots[i];
      if (this.selectedProgram && this.selectedProgram === program) {
        context.fillStyle = 'rgba(80, 80, 80, 1)';
        context.fillRect(programSlot.x, programSlot.y,
          programSlot.width, programSlot.height);
      }
      context.fillStyle = 'white';
      context.fillText(`${program.name} x${program.quantity}`, programSlot.x, programSlot.y + (programSlot.height / 2));
    }

    // Draw the 'Program Info' title.
    context.fillStyle = 'white';
    context.font = `${this.textHeight}px verdana`;
    context.textBaseline = 'middle';
    [leftPad, topPad] = calculateTextPadding(this.listTitle, 'Program Info', context);
    context.fillText('Program Info', this.infoTitle.x + leftPad, this.infoTitle.y + topPad);
    if (this.displayProgram) {
      // Draw the container for the program info.
      context.fillStyle = 'rgba(50, 50, 50, 1)';
      context.fillRect(this.programInfo.x, this.programInfo.y,
        this.programInfo.width, this.programInfo.height);

      // Draw the program's image.
      const imageSource = {
        x: (this.displayProgram.imgSource % 8) * 27,
        y: Math.floor(this.displayProgram.imgSource / 8) * 27,
        size: 27,
      };
      context.drawImage(this.image, imageSource.x, imageSource.y,
        imageSource.size, imageSource.size, this.programInfo.x + 10, this.programInfo.y + 10,
        imageSource.size * 1.3, imageSource.size * 1.3);

      // Draw the program's moves and max size.'
      context.fillStyle = 'white';
      context.font = `${Math.floor(this.textHeight / 1.3)}px verdana`;
      context.fillText(`Move: ${this.displayProgram.moves}`, this.programInfo.x + imageSource.size * 1.3 + 20, this.programInfo.y + 10 + (this.textHeight / 2));
      context.fillText(`Max Size: ${this.displayProgram.maxSize}`, this.programInfo.x + imageSource.size * 1.3 + 20, this.programInfo.y + 10 + (this.textHeight * 1.5));

      // Draw the program's name.
      context.font = `${this.textHeight}px verdana`;
      context.fillText(`${this.displayProgram.name}`, this.programInfo.x + 10, this.programInfo.y + imageSource.size * 1.3 + 30);

      // Draw label for command list.
      context.fillText('Commands', this.commandLabel.x, this.commandLabel.y + (this.textHeight / 2));

      // Draw command names.
      for (let i = 0;
        i < Math.min(this.commandSlots.length, this.displayProgram.commandData.length);
        i += 1) {
        const command = this.displayProgram.commandData[i];
        const commandSlot = this.commandSlots[i];
        if (this.selectedCommand && this.selectedCommand === command) {
          context.fillStyle = 'rgba(80, 80, 80, 1)';
          context.fillRect(commandSlot.x, commandSlot.y, commandSlot.width, commandSlot.height);
        }
        context.fillStyle = 'white';
        context.fillText(`${command.name}`, commandSlot.x, commandSlot.y + (commandSlot.height / 2));
      }

      context.font = `${this.textHeight / 1.3}px verdana`;
      // Draw description.
      let lines;
      if (this.selectedCommand) {
        lines = [
          `Damage: ${this.selectedCommand.damage}`,
          `Range: ${this.selectedCommand.range}`,
        ];
      } else {
        lines = splitStringIntoLines(this.displayProgram.desc, this.description, context);
      }
      lines.forEach((line, index) => {
        context.fillText(line, this.description.x, this.description.y + (this.textHeight * index));
      });
    }
  }

  addProgram(programName) {
    const program = this.programs.find((p) => p.name === programName);
    if (program) {
      program.quantity += 1;
    }
  }

  containsPoint(point) {
    return (point.x > this.rect.x && point.x < this.rect.x + this.rect.width
      && point.y > this.rect.y && point.y < this.rect.y + this.rect.height);
  }

  onClick(point) {
    for (let i = 0; i < Math.min(this.programSlots.length, this.programs.length); i += 1) {
      const programSlot = this.programSlots[i];
      if (point.x > programSlot.x && point.x < programSlot.x + programSlot.width
        && point.y > programSlot.y && point.y < programSlot.y + programSlot.height) {
        this.selectedProgram = this.programs[i + this.scrollAmount];
        this.setDisplayProgram(this.selectedProgram.name);
      }
    }
    for (let i = 0;
      i < Math.min(this.commandSlots.length, this.displayProgram.commandData.length);
      i += 1) {
      const commandSlot = this.commandSlots[i];
      if (point.x > commandSlot.x && point.x < commandSlot.x + commandSlot.width
      && point.y > commandSlot.y && point.y < commandSlot.y + commandSlot.height) {
        this.selectedCommand = this.displayProgram.commandData[i];
        if (this.chooseCommandCallback) {
          this.chooseCommandCallback(this.selectedCommand);
        }
      }
    }
  }

  getProgramChoice() {
    let agent;
    if (this.selectedProgram && this.selectedProgram.quantity > 0) {
      agent = this.agentData.find((data) => data.name === this.selectedProgram.name);
      agent.commandData = [];
      agent.commands.forEach((commandName) => {
        agent.commandData.push(this.commandData.find((command) => command.name === commandName));
      });
      this.selectedProgram.quantity -= 1;
    }
    return agent;
  }

  setDisplayProgram(programName) {
    this.selectedCommand = undefined;
    this.chooseCommandCallback = undefined;
    const agent = this.agentData.find((data) => data.name === programName);
    agent.commandData = [];
    agent.commands.forEach((commandName) => {
      agent.commandData.push(this.commandData.find((command) => command.name === commandName));
    });
    this.displayProgram = agent;
  }

  showActiveProgram(program) {
    this.setDisplayProgram(program.name);
    this.chooseCommandCallback = program.chooseCommand.bind(program);
  }

  scroll(amount) {
    const programListDisplayHeight = 8;
    this.scrollAmount += amount;
    if (this.scrollAmount < 0) {
      this.scrollAmount = 0;
    } else if (this.scrollAmount > this.programs.length - programListDisplayHeight) {
      this.scrollAmount = this.programs.length - programListDisplayHeight;
    }
  }
}
