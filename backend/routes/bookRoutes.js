const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authenticateToken, requireLibrarian } = require('../middleware/auth');

// Open Library Integration (Internet Archive)
router.get('/openlibrary/search', authenticateToken, bookController.searchOpenLibrary);
router.get('/openlibrary/lookup/:isbn', authenticateToken, bookController.lookupOpenLibraryISBN);
router.post('/openlibrary/import', authenticateToken, requireLibrarian, bookController.importOpenLibraryBook);

// Catalog routes
router.get('/categories', authenticateToken, bookController.getCategories);
router.get('/', authenticateToken, bookController.getAllBooks);
router.get('/:id', authenticateToken, bookController.getBookById);

// Admin / Librarian only operations
router.post('/', authenticateToken, requireLibrarian, bookController.createBook);
router.put('/:id', authenticateToken, requireLibrarian, bookController.updateBook);
router.delete('/:id', authenticateToken, requireLibrarian, bookController.deleteBook);

module.exports = router;
