import { calculateTextPadding } from './helpers.js';
import Agent from './agent.js';

export default function ProgramMenu(canvas, inventory) {
  const textHeight = 20;
  const context = canvas.getContext('2d');
  let selectedProgram;
  const rect = {
    x: 10,
    y: 10,
    width: canvas.width * 0.25,
    height: canvas.height * 0.8,
  };
  const title = {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: 40,
  };
  const programs = [];
  inventory.programs.forEach((program, index) => {
    programs.push({
      program,
      x: rect.x + 10,
      y: rect.y + 60 + (index * textHeight),
      width: rect.width - 20,
      height: textHeight,
    });
  });
  let agentData;
  $.getJSON('../assets/agents.json', (data) => {
    agentData = data;
    console.log('agents loaded');
  });

  this.draw = function draw() {
    context.clearRect(rect.x, rect.y, rect.width, rect.height);
    context.fillStyle = 'rgba(40, 40, 40, 0.95)';
    context.fillRect(rect.x, rect.y, rect.width, rect.height);
    context.fillStyle = 'white';
    context.font = `${textHeight}px verdana`;
    context.textBaseline = 'middle';
    const padding = calculateTextPadding(title, 'Program List', context);
    context.fillText('Program List', rect.x + padding[0], rect.y + padding[1]);
    context.font = `${Math.floor(textHeight / 1.3)}px verdana`;
    programs.forEach((program) => {
      if (selectedProgram && selectedProgram === program.program) {
        context.fillStyle = 'rgba(80, 80, 80, 0.95)';
        context.fillRect(program.x, program.y, program.width, program.height);
      }
      context.fillStyle = 'white';
      context.fillText(`${program.program.name} x${program.program.quantity}`, program.x, program.y + textHeight / 2);
    });
  };
  this.containsPoint = function containsPoint(point) {
    return (point.x > rect.x && point.x < rect.x + rect.width
      && point.y > rect.y && point.y < rect.y + rect.height);
  };
  this.onClick = function onClick(point) {
    programs.forEach((program) => {
      if (point.x > program.x && point.x < program.x + program.width
        && point.y > program.y && point.y < program.y + program.height) {
        selectedProgram = program.program;
        this.draw();
      }
    });
  };
  this.getProgramChoice = function getProgramChoice() {
    let agent;
    if (selectedProgram && selectedProgram.quantity > 0) {
      agent = agentData.find((data) => data.name === selectedProgram.name);
      selectedProgram.quantity -= 1;
    }
    return agent;
  };
  this.addProgram = function addProgram(programName) {
    const program = programs.find((p) => p.program.name === programName);
    if (program) {
      program.program.quantity += 1;
      this.draw();
    }
  };
}
