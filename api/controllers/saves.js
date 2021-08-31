const express = require('express');
const Save = require('../models/save');

const router = express.Router();

router.get('/', (req, res) => {
  Save.find((err, saves) => {
    if (err) {
      console.error(err);
      return res.json({ 'err': `400 ${err.message}` }).status(400);
    }
    return res.json(saves).status(200);
  });
});

router.post('/', (req, res) => {
  Save.save(new Save(res.body), (err, save) => {
    if (err) {
      console.error(err);
      return res.json({ 'err': `400 ${err.message}` }).status(400);
    }
    return res.json(save).status(201);
  });
});

router.put('/', (req, res) => {
  Save.findByIdAndUpdate(res.body._id, new Save(res.body), (err, save) => {
    if (err) {
      console.error(err);
      return res.json({ 'err': `400 ${err.message}` }).status(400);
    }
    return res.json(save).status(200);
  },
  { new: true });
});

router.delete('/', (req, res) => {
  Save.findByIdAndDelete(res.body._id, (err) => {
    if (err) {
      console.error(err);
      return res.json({ 'err': `400 ${err.message}` }).status(400);
    }
    return res.status(204);
  });
});

module.exports = router;
