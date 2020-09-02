import { calculateTextPadding } from './helpers.js';

export default function NodeMenu(node, canvas, startNodeCallback, closeNodeMenuCallback) {
  const textHeight = 20;
  const rect = {
    x: canvas.width * 0.7,
    y: canvas.height * 0.1,
    width: canvas.width * 0.25,
    height: canvas.height * 0.6,
  };
  const cancelButton = {
    x: rect.x + 10,
    y: rect.y + rect.height - 40,
    width: (rect.width / 2) - 10,
    height: 30,
  };
  const startButton = {
    x: rect.x + (rect.width / 2),
    y: rect.y + rect.height - 40,
    width: (rect.width / 2) - 10,
    height: 30,
  };
  this.draw = function draw(context) {
    context.fillStyle = 'rgba(40, 40, 40, 0.95)';
    context.fillRect(rect.x, rect.y, rect.width, rect.height);
    context.fillStyle = 'red';
    context.fillRect(cancelButton.x, cancelButton.y, cancelButton.width, cancelButton.height);
    context.fillStyle = 'blue';
    context.fillRect(startButton.x, startButton.y, startButton.width, startButton.height);
    context.fillStyle = 'white';
    context.font = `${textHeight}px verdana`;
    context.textBaseline = 'middle';
    context.fillText(node.owner, rect.x, rect.y + textHeight);
    context.fillText(node.name, rect.x, rect.y + (textHeight * 2));

    let [leftPad, topPad] = calculateTextPadding(cancelButton, 'Cancel', context);
    context.fillText('Cancel', cancelButton.x + leftPad, cancelButton.y + topPad);
    [leftPad, topPad] = calculateTextPadding(startButton, 'Start', context);
    context.fillText('Start', startButton.x + leftPad, startButton.y + topPad);

    context.fillStyle = 'rgba(60, 60, 60, 0.95)';
  };
  this.containsPoint = function containsPoint(point) {
    return (point.x > rect.x && point.x < rect.x + rect.width
      && point.y > rect.y && point.y < rect.y + rect.height);
  };
  this.onClick = function onClick(point) {
    if (point.x > startButton.x && point.x < startButton.x + startButton.width
      && point.y > startButton.y && point.y < startButton.y + startButton.height) {
      console.log(`Starting node '${node.name}.'`);
      closeNodeMenuCallback();
      startNodeCallback();
    } else if (point.x > cancelButton.x && point.x < cancelButton.x + cancelButton.width
      && point.y > cancelButton.y && point.y < cancelButton.y + cancelButton.height) {
      closeNodeMenuCallback();
    }
  };
}
