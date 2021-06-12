import Menu from './menu.js';

export default class DialogueMenu {
  constructor(context, dialogue, endDialogueCallback) {
    this.endDialogueCallback = endDialogueCallback;
    this.createNewDialogueMenu(dialogue, context, 0);
  }

  createNewDialogueMenu(dialogue, context, index) {
    this.menu = new Menu(600, 200, 400, 150, context);
    this.menu.addTextBlock(dialogue[index].text, 16, false);
    let choiceValue;
    dialogue[index].responses.forEach((response) => {
      const number = parseInt(response.number, 10);
      this.menu.addButton(response.text, 16, 300, false, true, () => {
        if (response.choiceValue) {
          choiceValue = response.choiceValue;
        }
        if (number < dialogue.length) {
          this.createNewDialogueMenu(dialogue, context, number);
        } else {
          this.endDialogueCallback(choiceValue);
        }
      });
    });
  }

  draw() {
    this.menu.draw();
  }

  onClick(point) {
    this.menu.onClick(point);
  }

  onMouseMove(point) {
    this.menu.onMouseMove(point);
  }

  containsPoint(point) {
    return this.menu.containsPoint(point);
  }
}
