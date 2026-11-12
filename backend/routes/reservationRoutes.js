const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { authenticateToken, requireLibrarian } = require('../middleware/auth');

// Student endpoints
router.post('/', authenticateToken, reservationController.createReservation);
router.get('/my', authenticateToken, reservationController.getMyReservations);
router.patch('/:id/cancel', authenticateToken, reservationController.cancelReservation);

// Librarian endpoints
router.get('/', authenticateToken, requireLibrarian, reservationController.getAllReservations);
router.patch('/:id/approve', authenticateToken, requireLibrarian, reservationController.approveReservation);
router.patch('/:id/reject', authenticateToken, requireLibrarian, reservationController.rejectReservation);
router.post('/:id/issue', authenticateToken, requireLibrarian, reservationController.issueFromReservation);

module.exports = router;
