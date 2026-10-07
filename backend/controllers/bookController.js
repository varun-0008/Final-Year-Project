const db = require('../config/db');
const openLibraryService = require('../services/openLibraryService');

// Get all books (with search and filters) - open to all authenticated users (students & librarians)
exports.getAllBooks = async (req, res) => {
  try {
    const { search, genre, availableOnly } = req.query;

    let queryText = `
      SELECT id, isbn, title, author, genre, published_year, total_copies, available_copies, shelf_location, description, cover_url, created_at
      FROM books
      WHERE 1=1
    `;
    const queryParams = [];

    if (search && search.trim() !== '') {
      queryParams.push(`%${search.trim().toLowerCase()}%`);
      const pIndex = queryParams.length;
      queryText += ` AND (
        LOWER(title) LIKE $${pIndex} OR 
        LOWER(author) LIKE $${pIndex} OR 
        LOWER(isbn) LIKE $${pIndex} OR 
        LOWER(genre) LIKE $${pIndex}
      )`;
    }

    if (genre && genre.trim() !== '' && genre.toLowerCase() !== 'all') {
      queryParams.push(genre.trim());
      queryText += ` AND LOWER(genre) = LOWER($${queryParams.length})`;
    }

    if (availableOnly === 'true' || availableOnly === '1') {
      queryText += ` AND available_copies > 0`;
    }

    queryText += ` ORDER BY title ASC`;

    const booksRes = await db.query(queryText, queryParams);
    return res.json({ books: booksRes.rows });
  } catch (err) {
    console.error('Error in getAllBooks:', err);
    return res.status(500).json({ error: 'Internal server error fetching books.' });
  }
};

// Get distinct book categories / genres
exports.getCategories = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT DISTINCT genre FROM books WHERE genre IS NOT NULL ORDER BY genre ASC`
    );
    const categories = result.rows.map(r => r.genre);
    return res.json({ categories });
  } catch (err) {
    console.error('Error in getCategories:', err);
    return res.status(500).json({ error: 'Internal server error fetching categories.' });
  }
};

// Get single book by ID
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const bookRes = await db.query(
      `SELECT id, isbn, title, author, genre, published_year, total_copies, available_copies, shelf_location, description, cover_url, created_at
       FROM books WHERE id = $1`,
      [id]
    );

    if (bookRes.rowCount === 0) {
      return res.status(404).json({ error: 'Book not found.' });
    }

    return res.json({ book: bookRes.rows[0] });
  } catch (err) {
    console.error('Error in getBookById:', err);
    return res.status(500).json({ error: 'Internal server error fetching book.' });
  }
};

// Add new book - Librarian only
exports.createBook = async (req, res) => {
  try {
    const { isbn, title, author, genre, published_year, total_copies, shelf_location, description, cover_url } = req.body;

    if (!isbn || !title || !author || !genre || !shelf_location) {
      return res.status(400).json({
        error: 'ISBN, Title, Author, Genre, and Shelf Location are required.',
      });
    }

    const copies = parseInt(total_copies, 10) || 1;
    if (copies < 1) {
      return res.status(400).json({ error: 'Total copies must be at least 1.' });
    }

    // Check if ISBN already exists
    const existing = await db.query(`SELECT id FROM books WHERE isbn = $1`, [isbn.trim()]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ error: 'A book with this ISBN already exists.' });
    }

    const insertRes = await db.query(
      `INSERT INTO books (isbn, title, author, genre, published_year, total_copies, available_copies, shelf_location, description, cover_url)
       VALUES ($1, $2, $3, $4, $5, $6, $6, $7, $8, $9)
       RETURNING *`,
      [
        isbn.trim(),
        title.trim(),
        author.trim(),
        genre.trim(),
        published_year ? parseInt(published_year, 10) : null,
        copies,
        shelf_location.trim(),
        description ? description.trim() : null,
        cover_url ? cover_url.trim() : null,
      ]
    );

    return res.status(201).json({
      message: 'Book added successfully',
      book: insertRes.rows[0],
    });
  } catch (err) {
    console.error('Error in createBook:', err);
    return res.status(500).json({ error: 'Internal server error adding book.' });
  }
};

// Update book - Librarian only
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { isbn, title, author, genre, published_year, total_copies, shelf_location, description, cover_url } = req.body;

    const currentBookRes = await db.query(`SELECT * FROM books WHERE id = $1`, [id]);
    if (currentBookRes.rowCount === 0) {
      return res.status(404).json({ error: 'Book not found.' });
    }

    const currentBook = currentBookRes.rows[0];
    const newTotal = total_copies !== undefined ? parseInt(total_copies, 10) : currentBook.total_copies;
    const borrowedCopies = currentBook.total_copies - currentBook.available_copies;

    if (newTotal < borrowedCopies) {
      return res.status(400).json({
        error: `Cannot reduce total copies below currently borrowed count (${borrowedCopies} copies currently on loan).`,
      });
    }

    const newAvailable = newTotal - borrowedCopies;

    const updateRes = await db.query(
      `UPDATE books
       SET isbn = $1,
           title = $2,
           author = $3,
           genre = $4,
           published_year = $5,
           total_copies = $6,
           available_copies = $7,
           shelf_location = $8,
           description = $9,
           cover_url = $10
       WHERE id = $11
       RETURNING *`,
      [
        isbn ? isbn.trim() : currentBook.isbn,
        title ? title.trim() : currentBook.title,
        author ? author.trim() : currentBook.author,
        genre ? genre.trim() : currentBook.genre,
        published_year !== undefined ? parseInt(published_year, 10) : currentBook.published_year,
        newTotal,
        newAvailable,
        shelf_location ? shelf_location.trim() : currentBook.shelf_location,
        description !== undefined ? description : currentBook.description,
        cover_url !== undefined ? cover_url : currentBook.cover_url,
        id,
      ]
    );

    return res.json({
      message: 'Book updated successfully',
      book: updateRes.rows[0],
    });
  } catch (err) {
    console.error('Error in updateBook:', err);
    return res.status(500).json({ error: 'Internal server error updating book.' });
  }
};

// Delete book - Librarian only
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if book has active borrow records
    const activeBorrows = await db.query(
      `SELECT id FROM borrow_records WHERE book_id = $1 AND status = 'borrowed'`,
      [id]
    );

    if (activeBorrows.rowCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete book: there are active borrow records for this title. Please return them first.',
      });
    }

    const deleteRes = await db.query(`DELETE FROM books WHERE id = $1 RETURNING id, title`, [id]);
    if (deleteRes.rowCount === 0) {
      return res.status(404).json({ error: 'Book not found.' });
    }

    return res.json({ message: 'Book deleted successfully', deleted: deleteRes.rows[0] });
  } catch (err) {
    console.error('Error in deleteBook:', err);
    return res.status(500).json({ error: 'Internal server error deleting book.' });
  }
};

// ==================== OPEN LIBRARY INTEGRATION ====================

// Search Open Library API
exports.searchOpenLibrary = async (req, res) => {
  try {
    const query = req.query.q || req.query.query;
    const limit = parseInt(req.query.limit, 10) || 12;

    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Search query is required.' });
    }

    const results = await openLibraryService.searchOpenLibrary(query, limit);
    return res.json({ query: query.trim(), count: results.length, results });
  } catch (err) {
    console.error('Error searching Open Library:', err);
    return res.status(500).json({ error: `Open Library search failed: ${err.message}` });
  }
};

// Lookup single book metadata by ISBN from Open Library
exports.lookupOpenLibraryISBN = async (req, res) => {
  try {
    const { isbn } = req.params;
    if (!isbn) {
      return res.status(400).json({ error: 'ISBN is required.' });
    }

    const book = await openLibraryService.lookupByISBN(isbn);
    if (!book) {
      return res.status(404).json({ error: 'Book not found on Open Library with this ISBN.' });
    }

    return res.json({ book });
  } catch (err) {
    console.error('Error looking up Open Library ISBN:', err);
    return res.status(500).json({ error: `ISBN lookup failed: ${err.message}` });
  }
};

// Import book from Open Library directly into Library catalog - Librarian only
exports.importOpenLibraryBook = async (req, res) => {
  try {
    const {
      isbn,
      title,
      author,
      genre,
      published_year,
      total_copies,
      shelf_location,
      description,
      cover_url,
    } = req.body;

    if (!title || !author) {
      return res.status(400).json({ error: 'Title and Author are required to import book.' });
    }

    const bookIsbn = (isbn || `OL-${Date.now()}`).trim();
    const copies = parseInt(total_copies, 10) || 3;
    const shelf = (shelf_location || 'Main Stacks A-1').trim();
    const bookGenre = (genre || 'General').trim();

    // Check if book with this ISBN already exists
    const existing = await db.query(`SELECT id, title, total_copies, available_copies FROM books WHERE isbn = $1`, [bookIsbn]);
    if (existing.rowCount > 0) {
      // Book already in library - increment total copies
      const current = existing.rows[0];
      const updatedRes = await db.query(
        `UPDATE books 
         SET total_copies = total_copies + $1, 
             available_copies = available_copies + $1 
         WHERE id = $2 
         RETURNING *`,
        [copies, current.id]
      );

      return res.json({
        message: `Book "${title}" already existed. Increased stock by ${copies} copies.`,
        book: updatedRes.rows[0],
        action: 'updated',
      });
    }

    // Insert new book
    const insertRes = await db.query(
      `INSERT INTO books (isbn, title, author, genre, published_year, total_copies, available_copies, shelf_location, description, cover_url)
       VALUES ($1, $2, $3, $4, $5, $6, $6, $7, $8, $9)
       RETURNING *`,
      [
        bookIsbn,
        title.trim(),
        author.trim(),
        bookGenre,
        published_year ? parseInt(published_year, 10) : null,
        copies,
        shelf,
        description ? description.trim() : `Imported from Open Library / Internet Archive.`,
        cover_url || null,
      ]
    );

    return res.status(201).json({
      message: `Successfully imported "${title}" into library catalog!`,
      book: insertRes.rows[0],
      action: 'created',
    });
  } catch (err) {
    console.error('Error importing book from Open Library:', err);
    return res.status(500).json({ error: `Failed to import book: ${err.message}` });
  }
};
