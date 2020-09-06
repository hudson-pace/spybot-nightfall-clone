export default function Inventory() {
  this.credits = 10000;
  this.programs = [];
  this.programs.push({
    name: 'Hack',
    quantity: 2,
  });
  this.programs.push({
    name: 'Bug',
    quantity: 1,
  });
  this.programs.push({
    name: 'Slingshot',
    quantity: 1,
  });
  this.programs.push({
    name: 'Data Doctor',
    quantity: 1,
  });
  this.programs.push({
    name: 'Hack 2.0',
    quantity: 1,
  });
  this.programs.push({
    name: 'Mud Golem',
    quantity: 1,
  });
  this.programs.push({
    name: 'Wolf Spider',
    quantity: 1,
  });
  this.programs.push({
    name: 'Seeker',
    quantity: 1,
  });
  this.programs.push({
    name: 'Tower',
    quantity: 1,
  });
  this.programs.push({
    name: 'Medic',
    quantity: 1,
  });
  this.programs.push({
    name: 'Turbo',
    quantity: 1,
  });

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
  this.addProgram = function addProgram(programName) {
    const program = this.programs.find((p) => p.name === programName);
    if (program) {
      program.quantity += 1;
    } else {
      this.programs.push({
        name: programName,
        quantity: 1,
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
