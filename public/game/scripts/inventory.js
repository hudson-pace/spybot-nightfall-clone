export default class Inventory {
  constructor() {
    this.credits = 0;
    this.programs = [];
  }

  addCredits(amount) {
    this.credits += amount;
  }

  spendCredits(amount) {
    if (this.credits >= amount) {
      this.credits -= amount;
      return true;
    }
    return false;
  }

  addProgram(programName, count) {
    let quantity = count;
    if (!count) {
      quantity = 1;
    }
    const program = this.programs.find((p) => p.name === programName);
    if (program) {
      program.quantity += quantity;
    } else {
      this.programs.push({
        name: programName,
        quantity,
      });
      this.sortPrograms();
    }
  }

  sortPrograms() {
    this.programs.sort((a, b) => ((a.name > b.name) ? 1 : -1));
  }

  getCopyOfProgramList() {
    const programList = [];
    this.programs.forEach((program) => {
      programList.push({ ...program });
    });
    return programList;
  }
}
