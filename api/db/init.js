const db = require('.');

const query = `
  create table if not exists 
`
db.query('select now()')
  .then((res) => {
    console.log(res)
    console.log('fine');
  })
  .catch((err) => {
    console.log('nah');
  })
  .then(() => {
    process.exit();
  });
