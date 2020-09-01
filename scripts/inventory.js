export default function Inventory() {
  this.credits = 0;
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
    name: 'Bit-Man',
    quantity: 3,
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
  this.programs.sort((a, b) => ((a.name > b.name) ? 1 : -1));
}
