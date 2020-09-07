import Menu from "./menu.js";

export default class DialogueMenu {
  constructor(context, dialogue, endDialogueCallback) {
    this.endDialogueCallback = endDialogueCallback;
    this.createNewDialogueMenu(dialogue, context, 0);
  }

  createNewDialogueMenu(dialogue, context, index) {
    this.menu = new Menu(600, 200, 350, 150, context);
    this.menu.addTextBlock(dialogue[index].text, 16, false);
    dialogue[index].responses.forEach((response) => {
      this.menu.addButton(response, 16, 300, false, true, () => {
        if (index < dialogue.length - 1) {
          this.createNewDialogueMenu(dialogue, context, index + 1);
        } else {
          this.endDialogueCallback();
        }
      });
    });
    this.draw();
  }

  draw() {
    this.menu.draw();
  }

  onClick(point) {
    this.menu.onClick(point);
  }

  containsPoint(point) {
    return this.menu.containsPoint(point);
  }
}
