const express = require('express');
const router = express.Router();
const cameraZoneController = require('../controllers/cameraZoneController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Protected routes for camera zone management (Admin only)
router.get('/hall/:hallId', verifyToken, checkRole(['Admin']), cameraZoneController.getZonesByHall);
router.post('/', verifyToken, checkRole(['Admin']), cameraZoneController.createZone);
router.put('/:zoneId', verifyToken, checkRole(['Admin']), cameraZoneController.updateZone);
router.delete('/:zoneId', verifyToken, checkRole(['Admin']), cameraZoneController.deleteZone);

module.exports = router;