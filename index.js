const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const { port, dbUrl } = require('./config.json');
const apiRoutes = require('./api/routes')

const app = express();

app.use('/api', apiRoutes);
app.use('/static', express.static('static'));

app.get('/*', (req, res) => {
  res.sendFile(path.resolve('public', 'index.html'))
});

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('db connection established.\n')
  })
  .catch((err) => {
    console.error(`db error: ${err.message}\n`)
  });

app.listen(port, () => {
  console.log(`listening on port ${port}...\n`);
});
