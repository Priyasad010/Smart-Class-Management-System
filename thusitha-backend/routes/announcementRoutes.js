const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Public route for landing page
router.get('/public', announcementController.getPublicAnnouncements);

// Protected routes
router.use(verifyToken);
router.get('/', checkRole(['Admin', 'Teacher', 'Counter Person', 'Student', 'Parent']), announcementController.getAnnouncements);
router.post('/', checkRole(['Admin']), announcementController.createAnnouncement);
router.put('/:id', checkRole(['Admin']), announcementController.updateAnnouncement);
router.delete('/:id', checkRole(['Admin']), announcementController.deleteAnnouncement);

module.exports = router;
