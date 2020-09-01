export function calculateTextPadding(container, text, context) {
  const leftPadding = (container.width - context.measureText(text).width) / 2;
  const topPadding = container.height / 2;
  return [leftPadding, topPadding];
}

export function rectContainsPoint(rect, point) {
  return point.x > rect.x && point.x < rect.x + rect.width
    && point.y > rect.y && point.y < rect.y + rect.height;
}

export function rectAsArray(rect) {
  return [rect.x, rect.y, rect.width, rect.height];
}

export function splitStringIntoLines(text, container, context) {
  const words = text.split(' ');
  const lines = [];
  while (words.length > 0) {
    let index = 0;
    while (index < words.length && (context.measureText(words.slice(0, index).join(' ')).width) < container.width - 30) {
      index += 1;
    }
    lines.push(words.splice(0, index).join(' '));
  }
  return lines;
}
