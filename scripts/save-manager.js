export default class SaveManager {
  constructor() {
    this.saves = JSON.parse(window.localStorage.getItem('saves'));
    if (!this.saves) {
      this.saves = [];
    }
  }

  updateSave(newSaveData) {
    const saveData = { ...newSaveData };
    if (!saveData.name) {
      let highest = 0;
      this.saves.forEach((save) => {
        const saveNum = parseInt(save.name.slice(5), 10);
        if (saveNum > highest) {
          highest = saveNum;
        }
      });
      saveData.name = `save_${highest + 1}`;
      this.saves.push(saveData);
    } else {
      const index = this.saves.findIndex((save) => save.name === saveData.name);
      this.saves[index] = saveData;
    }
    localStorage.setItem('saves', JSON.stringify(this.saves));
  }

  deleteSave(name) {
    const index = this.saves.findIndex((save) => save.name === name);
    this.saves.splice(index, 1);
    localStorage.setItem('saves', JSON.stringify(this.saves));
  }
}
