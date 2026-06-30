const express = require('express');
const router = express.Router();
const moodleSsoController = require('../controllers/moodleSsoController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/url', verifyToken, moodleSsoController.getSsoUrl);

module.exports = router;
