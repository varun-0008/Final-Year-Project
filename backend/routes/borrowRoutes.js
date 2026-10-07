const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrowController');
const { authenticateToken, requireLibrarian } = require('../middleware/auth');

// Student route: View their own borrowed books
router.get('/my-books', authenticateToken, borrowController.getMyBorrowedBooks);

// ADMIN ONLY: Adding/issuing borrowed books, returning books, and viewing all records
router.post('/issue', authenticateToken, requireLibrarian, borrowController.issueBook);
router.post('/return', authenticateToken, requireLibrarian, borrowController.returnBook);
router.get('/all', authenticateToken, requireLibrarian, borrowController.getAllBorrowRecords);
router.get('/stats', authenticateToken, requireLibrarian, borrowController.getAdminStats);

module.exports = router;
