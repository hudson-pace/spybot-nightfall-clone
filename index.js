const express = require('express');
const mongoose = require('mongoose');
const { port, dbUrl } = require('./config.json');
const apiRoutes = require('./api/routes')

const app = express();
app.use(express.static('public'))
app.use('/api', apiRoutes);
console.log('ffj')
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((hey) => {
    console.log('yo!')
  })
  .catch((err) => {
    console.log('shiz')
  })
  /*
const db = mongoose.connection;
db.on('error', () => {
  console.log('oh shiz')
});
db.once('open', () => {
  console.log('connected to db.');
  app.listen(port, () => {
    console.log(`listening on port ${port}...`);
  });
});
*/
