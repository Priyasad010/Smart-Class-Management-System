const express = require('express');
const router = express.Router();
const cameraZoneController = require('../controllers/cameraZoneController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// All routes require Admin role for camera zone management
router.get('/hall/:hallId', verifyToken, checkRole(['Admin']), cameraZoneController.getZonesByHall);
router.post('/', verifyToken, checkRole(['Admin']), cameraZoneController.createZone);
router.put('/:zoneId', verifyToken, checkRole(['Admin']), cameraZoneController.updateZone);
router.delete('/:zoneId', verifyToken, checkRole(['Admin']), cameraZoneController.deleteZone);

module.exports = router;