const db = require('../config/db');
const { sendNotification } = require('../services/notificationService');

// Student: Join Smart Waiting List for an unavailable book
exports.joinWaitingList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { book_id } = req.body;

    if (!book_id) {
      return res.status(400).json({ error: 'Book ID is required.' });
    }

    const bookRes = await db.query(
      `SELECT id, title, author, available_copies, total_copies FROM books WHERE id = $1`,
      [book_id]
    );

    if (bookRes.rowCount === 0) {
      return res.status(404).json({ error: 'Book not found.' });
    }
    const book = bookRes.rows[0];

    // Check if user is already waiting for this book
    const existing = await db.query(
      `SELECT id, queue_position, status FROM waiting_list 
       WHERE book_id = $1 AND user_id = $2 AND status = 'waiting'`,
      [book_id, userId]
    );

    if (existing.rowCount > 0) {
      return res.status(400).json({
        error: `You are already in the waiting list for this book at position #${existing.rows[0].queue_position}.`
      });
    }

    // Check if user already has an active loan of this book
    const activeLoan = await db.query(
      `SELECT id FROM borrow_records WHERE user_id = $1 AND book_id = $2 AND status = 'borrowed'`,
      [userId, book_id]
    );
    if (activeLoan.rowCount > 0) {
      return res.status(400).json({ error: 'You are currently borrowing this book.' });
    }

    // Calculate next FIFO position for this specific book
    const maxPosRes = await db.query(
      `SELECT COALESCE(MAX(queue_position), 0) AS max_pos FROM waiting_list 
       WHERE book_id = $1 AND status = 'waiting'`,
      [book_id]
    );
    const nextPosition = parseInt(maxPosRes.rows[0].max_pos, 10) + 1;

    const insertRes = await db.query(
      `INSERT INTO waiting_list (book_id, user_id, queue_position, status)
       VALUES ($1, $2, $3, 'waiting')
       RETURNING *`,
      [book_id, userId, nextPosition]
    );

    await sendNotification({
      userId,
      title: 'Joined Smart Waiting List',
      message: `You are #${nextPosition} in line for "${book.title}". You will receive an instant notification when a copy is returned to the library.`,
      type: 'waiting_list_alert'
    });

    return res.status(201).json({
      message: `Successfully joined waiting list for "${book.title}". Your queue position is #${nextPosition}.`,
      waiting_entry: insertRes.rows[0],
      queue_position: nextPosition
    });
  } catch (err) {
    console.error('Error joining waiting list:', err);
    return res.status(500).json({ error: 'Failed to join waiting list.' });
  }
};

// Student: Get my active waiting list entries
exports.getMyWaitingList = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      `SELECT w.*, 
              b.title AS book_title, b.author AS book_author, b.isbn, b.cover_url,
              b.available_copies, b.total_copies, b.shelf_location,
              b.block, b.floor, b.section, b.rack, b.shelf
       FROM waiting_list w
       JOIN books b ON w.book_id = b.id
       WHERE w.user_id = $1 AND w.status IN ('waiting', 'notified')
       ORDER BY w.created_at DESC`,
      [userId]
    );

    return res.json({ waiting_list: result.rows });
  } catch (err) {
    console.error('Error getting student waiting list:', err);
    return res.status(500).json({ error: 'Failed to retrieve waiting list.' });
  }
};

// Librarian: View all waiting queues across all books
exports.getAllWaitingLists = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT w.*, 
              b.title AS book_title, b.author AS book_author, b.isbn, b.available_copies,
              u.name AS student_name, u.student_id, u.email AS student_email, u.department, u.phone
       FROM waiting_list w
       JOIN books b ON w.book_id = b.id
       JOIN users u ON w.user_id = u.id
       ORDER BY w.book_id ASC, w.queue_position ASC`
    );

    return res.json({ waiting_list: result.rows });
  } catch (err) {
    console.error('Error fetching all waiting lists:', err);
    return res.status(500).json({ error: 'Failed to retrieve waiting lists.' });
  }
};

// Student or Librarian: Cancel / leave waiting list
exports.leaveWaitingList = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const entryRes = await db.query(
      `SELECT w.*, b.title AS book_title 
       FROM waiting_list w
       JOIN books b ON w.book_id = b.id
       WHERE w.id = $1 AND (w.user_id = $2 OR $3 = 'librarian')`,
      [id, userId, req.user.role]
    );

    if (entryRes.rowCount === 0) {
      return res.status(404).json({ error: 'Waiting list entry not found or unauthorized.' });
    }
    const entry = entryRes.rows[0];

    // Mark as cancelled
    await db.query(`UPDATE waiting_list SET status = 'cancelled' WHERE id = $1`, [id]);

    // Reorder remaining queue positions for this book
    await db.query(
      `UPDATE waiting_list 
       SET queue_position = queue_position - 1 
       WHERE book_id = $1 AND status = 'waiting' AND queue_position > $2`,
      [entry.book_id, entry.queue_position]
    );

    return res.json({ message: `Left waiting list for "${entry.book_title}".` });
  } catch (err) {
    console.error('Error leaving waiting list:', err);
    return res.status(500).json({ error: 'Failed to leave waiting list.' });
  }
};
