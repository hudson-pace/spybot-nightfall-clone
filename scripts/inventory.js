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
  this.programs.sort();
}
