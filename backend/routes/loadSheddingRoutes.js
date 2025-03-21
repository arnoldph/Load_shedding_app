const express = require('express');
const router = express.Router();
const loadSheddingController = require('../controllers/loadSheddingController');

// Fetch load-shedding schedule
router.get('/LoadShedding', loadSheddingController.getSchedule);

module.exports = router;