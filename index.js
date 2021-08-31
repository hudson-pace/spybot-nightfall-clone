const express = require('express');
const mongoose = require('mongoose');
const { port, dbUrl } = require('./config.json');
const apiRoutes = require('./api/routes')

const app = express();
app.use(express.static('public'))
app.use('/api', apiRoutes);

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
