const express = require('express');

const saveRoutes = require('./controllers/saves');

const router = express.Router();

router.use('/saves', saveRoutes);

router.use('/*', (req, res) => {
  return res.json({ 'err': '404 not found' }).status(404);
})

module.exports = router;
