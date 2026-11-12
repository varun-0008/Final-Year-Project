const express = require('express');
const router = express.Router();
const waitingListController = require('../controllers/waitingListController');
const { authenticateToken, requireLibrarian } = require('../middleware/auth');

// Student endpoints
router.post('/join', authenticateToken, waitingListController.joinWaitingList);
router.get('/', authenticateToken, waitingListController.getMyWaitingList);
router.get('/my', authenticateToken, waitingListController.getMyWaitingList);
router.delete('/:id', authenticateToken, waitingListController.leaveWaitingList);

// Librarian endpoint
router.get('/all', authenticateToken, requireLibrarian, waitingListController.getAllWaitingLists);

module.exports = router;
