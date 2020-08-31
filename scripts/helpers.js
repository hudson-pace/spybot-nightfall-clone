export function calculateTextPadding(container, text, context) {
  const leftPadding = (container.width - context.measureText(text).width) / 2;
  const topPadding = container.height / 2;
  return [leftPadding, topPadding];
}
