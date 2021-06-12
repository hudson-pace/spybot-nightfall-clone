export function calculateTextPadding(width, text, context) {
  return (width - context.measureText(text).width) / 2;
}

export function splitTextIntoLines(width, text, context) {
  if (text.indexOf('\n') !== -1) {
    let lines = [];
    const segments = text.split('\n');
    segments.forEach((segment) => {
      lines = lines.concat(splitTextIntoLines(width, segment, context));
    });
    return lines;
  }
  const words = text.split(' ');
  const lines = [];
  while (words.length > 0) {
    let currentLineLength = 0;
    let index = 0;
    while (index <= words.length && currentLineLength < width) {
      const line = words.slice(0, index);
      currentLineLength = context.measureText(line.join(' ')).width;
      index += 1;
    }
    let line;
    if (currentLineLength < width) {
      line = words.splice(0, (words.length));
    } else {
      line = words.splice(0, (index - 2));
    }
    lines.push(line.join(' '));
  }
  return lines;
}
