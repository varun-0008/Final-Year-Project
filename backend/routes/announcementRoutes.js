const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { authenticateToken, requireLibrarian } = require('../middleware/auth');

router.get('/', authenticateToken, announcementController.getAllAnnouncements);
router.post('/', authenticateToken, requireLibrarian, announcementController.createAnnouncement);
router.delete('/:id', authenticateToken, requireLibrarian, announcementController.deleteAnnouncement);

module.exports = router;
