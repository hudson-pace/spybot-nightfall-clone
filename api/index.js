const express = require('express');
const mongoose = require('mongoose');
const { port, dbUrl } = require('./config.json');
const Save = require('./models/save');

const app = express();

app.get('/', (req, res) => {
  Save.find((err, saves) => {
    if (err) return console.error(err);
    return res.json(saves).status(200);
  });
});

app.post('/', (req, res) => {
  Save.save(new Save(res.body), (err, save) => {
    if (err) return console.error(err);
    return res.json(save).status(201);
  });
});

app.put('/', (req, res) => {
  Save.findByIdAndUpdate(res.body._id, new Save(res.body), (err, save) => {
    if (err) return console.error(err);
    return res.json(save).status(200);
  },
  { new: true });
});

app.delete('/', (req, res) => {
  Save.findByIdAndDelete(res.body._id, (err) => {
    if (err) return console.error(err);
    return res.status(204);
  });
});

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('connected to db.');
  app.listen(port, () => {
    console.log(`listening on port ${port}...`);
  });
});
