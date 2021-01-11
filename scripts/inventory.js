export default function Inventory() {
  this.credits = 0;
  this.programs = [];

  this.addCredits = function addCredits(amount) {
    this.credits += amount;
  };
  this.spendCredits = function spendCredits(amount) {
    if (this.credits >= amount) {
      this.credits -= amount;
      return true;
    }
    return false;
  };
  this.addProgram = function addProgram(programName, count) {
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
  };
  this.sortPrograms = function sortPrograms() {
    this.programs.sort((a, b) => ((a.name > b.name) ? 1 : -1));
  };
  this.sortPrograms();
  this.getCopyOfProgramList = function getCopyOfProgramList() {
    const programList = [];
    this.programs.forEach((program) => {
      programList.push({ ...program });
    });
    return programList;
  };
}
