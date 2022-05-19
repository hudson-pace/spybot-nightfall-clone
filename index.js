const express = require('express');
const path = require('path');
const apiRoutes = require('./api/routes');
const { port } = require('./config.json');
const db = require('./api/db');

const app = express();

app.use('/api', apiRoutes);
app.use('/static', express.static('static'));

app.get('/*', (req, res) => {
  res.sendFile(path.resolve('public', 'index.html'));
});

app.listen(port, () => {
  console.log(`listening on port ${port}...\n`);
});

db.query('SELECT NOW()')
  .then(() => {
    console.log('database connection successful');
  })
  .catch((err) => {
    console.log('error with database connection:');
    console.log(err);
  });
