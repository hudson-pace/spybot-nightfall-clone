const express = require('express');

const saveRoutes = require('./controllers/saves');

const router = express.Router();

router.use('/saves', saveRoutes);

module.exports = router;
