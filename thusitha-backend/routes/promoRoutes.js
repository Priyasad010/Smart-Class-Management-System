const express = require('express');
const router = express.Router();
const promoController = require('../controllers/promoController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('node:path');

const upload = multer({ 
    dest: 'uploads/promos/',
    limits: { fileSize: 5 * 1024 * 1024 } 
});

router.get('/', promoController.getPromos);
router.post('/', verifyToken, checkRole(['Admin']), upload.single('image'), promoController.createPromo);
router.delete('/:id', verifyToken, checkRole(['Admin']), promoController.deletePromo);

module.exports = router;