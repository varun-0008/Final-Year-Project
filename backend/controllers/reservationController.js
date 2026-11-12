const db = require('../config/db');
const { sendNotification } = require('../services/notificationService');

// Generate unique human-readable Reservation ID: RES-YYYY-XXXX
function generateReservationCode() {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `RES-${year}-${random}`;
}

// Student: Create a new online reservation
exports.createReservation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { book_id, preferred_date, timeslot, notes } = req.body;

    if (!book_id || !preferred_date || !timeslot) {
      return res.status(400).json({ error: 'Book ID, preferred collection date, and timeslot are required.' });
    }

    // Check book availability
    const bookRes = await db.query(
      `SELECT id, title, author, available_copies, total_copies, block, floor, section, rack, shelf 
       FROM books WHERE id = $1`,
      [book_id]
    );

    if (bookRes.rowCount === 0) {
      return res.status(404).json({ error: 'Book not found.' });
    }
    const book = bookRes.rows[0];

    // Check student's active reservations / borrow limits
    const existingActive = await db.query(
      `SELECT id, reservation_code, status FROM reservations 
       WHERE user_id = $1 AND book_id = $2 AND status IN ('pending', 'approved', 'ready_for_pickup')`,
      [userId, book_id]
    );

    if (existingActive.rowCount > 0) {
      return res.status(400).json({
        error: `You already have an active reservation (${existingActive.rows[0].reservation_code}) for this book.`
      });
    }

    // Check if user currently has this book borrowed
    const existingLoan = await db.query(
      `SELECT id FROM borrow_records WHERE user_id = $1 AND book_id = $2 AND status = 'borrowed'`,
      [userId, book_id]
    );
    if (existingLoan.rowCount > 0) {
      return res.status(400).json({ error: 'You are currently borrowing this book. Please return it before reserving again.' });
    }

    // Check if copies are available; if 0, suggest waiting list
    if (book.available_copies <= 0) {
      return res.status(409).json({
        error: `No copies of "${book.title}" are currently available on the shelf. Would you like to join the Smart Waiting List instead?`,
        suggestWaitingList: true,
        bookId: book.id
      });
    }

    const reservationCode = generateReservationCode();

    const insertRes = await db.query(
      `INSERT INTO reservations (reservation_code, user_id, book_id, preferred_date, timeslot, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [reservationCode, userId, book_id, preferred_date, timeslot, notes || null]
    );

    const reservation = insertRes.rows[0];

    // Send in-app confirmation notification to student
    await sendNotification({
      userId,
      title: 'Reservation Received',
      message: `Your reservation request ${reservationCode} for "${book.title}" has been submitted for ${preferred_date} (${timeslot}). Waiting for librarian confirmation.`,
      type: 'reservation_received'
    });

    return res.status(201).json({
      message: 'Book reservation placed successfully!',
      reservation: {
        ...reservation,
        book_title: book.title,
        book_author: book.author,
        shelf_location: `Block ${book.block}, Floor ${book.floor}, ${book.section}, ${book.rack}, ${book.shelf}`
      }
    });
  } catch (err) {
    console.error('Error creating reservation:', err);
    return res.status(500).json({ error: 'Failed to place reservation.' });
  }
};

// Student: View own reservations (pending, approved, history)
exports.getMyReservations = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      `SELECT r.*, 
              b.title AS book_title, b.author AS book_author, b.isbn, b.cover_url,
              b.block, b.floor, b.section, b.rack, b.shelf, b.available_copies
       FROM reservations r
       JOIN books b ON r.book_id = b.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );

    return res.json({ reservations: result.rows });
  } catch (err) {
    console.error('Error fetching student reservations:', err);
    return res.status(500).json({ error: 'Failed to load reservations.' });
  }
};

// Librarian: Get all reservations with optional status filter
exports.getAllReservations = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = `
      SELECT r.*, 
             b.title AS book_title, b.author AS book_author, b.isbn, b.available_copies,
             b.block, b.floor, b.section, b.rack, b.shelf,
             u.name AS student_name, u.email AS student_email, u.student_id, u.department, u.phone
      FROM reservations r
      JOIN books b ON r.book_id = b.id
      JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      query += ` AND r.status = $${params.length}`;
    }

    if (search && search.trim() !== '') {
      params.push(`%${search.trim().toLowerCase()}%`);
      const p = params.length;
      query += ` AND (LOWER(r.reservation_code) LIKE $${p} OR LOWER(b.title) LIKE $${p} OR LOWER(u.name) LIKE $${p} OR LOWER(u.student_id) LIKE $${p})`;
    }

    query += ` ORDER BY CASE WHEN r.status = 'pending' THEN 1 WHEN r.status = 'approved' THEN 2 WHEN r.status = 'ready_for_pickup' THEN 3 ELSE 4 END, r.created_at DESC`;

    const result = await db.query(query, params);
    return res.json({ reservations: result.rows });
  } catch (err) {
    console.error('Error fetching all reservations:', err);
    return res.status(500).json({ error: 'Failed to retrieve reservations.' });
  }
};

// Librarian: Approve reservation & set Ready for Pickup
exports.approveReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { pickup_deadline, ready_for_pickup = true } = req.body;

    const resRecord = await db.query(
      `SELECT r.*, b.title AS book_title, u.id AS user_id, u.name AS student_name 
       FROM reservations r
       JOIN books b ON r.book_id = b.id
       JOIN users u ON r.user_id = u.id
       WHERE r.id = $1`,
      [id]
    );

    if (resRecord.rowCount === 0) {
      return res.status(404).json({ error: 'Reservation record not found.' });
    }
    const r = resRecord.rows[0];

    const newStatus = ready_for_pickup ? 'ready_for_pickup' : 'approved';
    const deadline = pickup_deadline || new Date(Date.now() + 48 * 3600 * 1000).toISOString();

    await db.query(
      `UPDATE reservations 
       SET status = $1, approved_at = NOW(), pickup_deadline = $2
       WHERE id = $3`,
      [newStatus, deadline, id]
    );

    // Send in-app notification to student
    const notifType = ready_for_pickup ? 'pickup_ready' : 'reservation_approval';
    const notifTitle = ready_for_pickup ? 'Book Ready for Pickup!' : 'Reservation Confirmed';
    const notifMsg = ready_for_pickup
      ? `Your reserved book "${r.book_title}" (ID: ${r.reservation_code}) has been prepared and is ready for pickup at the Circulation Desk until ${new Date(deadline).toLocaleDateString()}.`
      : `Your reservation ${r.reservation_code} for "${r.book_title}" has been approved by the librarian.`;

    await sendNotification({
      userId: r.user_id,
      title: notifTitle,
      message: notifMsg,
      type: notifType
    });

    return res.json({
      message: `Reservation ${r.reservation_code} marked as ${newStatus}.`,
      status: newStatus
    });
  } catch (err) {
    console.error('Error approving reservation:', err);
    return res.status(500).json({ error: 'Failed to approve reservation.' });
  }
};

// Librarian: Reject reservation with reason
exports.rejectReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const resRecord = await db.query(
      `SELECT r.*, b.title AS book_title, u.id AS user_id 
       FROM reservations r
       JOIN books b ON r.book_id = b.id
       JOIN users u ON r.user_id = u.id
       WHERE r.id = $1`,
      [id]
    );

    if (resRecord.rowCount === 0) {
      return res.status(404).json({ error: 'Reservation record not found.' });
    }
    const r = resRecord.rows[0];

    await db.query(
      `UPDATE reservations 
       SET status = 'rejected', rejection_reason = $1
       WHERE id = $2`,
      [reason || 'Unavailable for reservation', id]
    );

    await sendNotification({
      userId: r.user_id,
      title: 'Reservation Rejected',
      message: `Your reservation for "${r.book_title}" could not be fulfilled: ${reason || 'Physical copy currently in binding / damaged.'}`,
      type: 'reservation_rejection'
    });

    return res.json({ message: 'Reservation rejected and student notified.' });
  } catch (err) {
    console.error('Error rejecting reservation:', err);
    return res.status(500).json({ error: 'Failed to reject reservation.' });
  }
};

// Student: Cancel pending reservation
exports.cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const resRecord = await db.query(
      `SELECT r.*, b.title AS book_title 
       FROM reservations r
       JOIN books b ON r.book_id = b.id
       WHERE r.id = $1 AND (r.user_id = $2 OR $3 = 'librarian')`,
      [id, userId, req.user.role]
    );

    if (resRecord.rowCount === 0) {
      return res.status(404).json({ error: 'Reservation not found or unauthorized.' });
    }
    const r = resRecord.rows[0];

    if (['fulfilled', 'cancelled'].includes(r.status)) {
      return res.status(400).json({ error: `Reservation is already ${r.status}.` });
    }

    await db.query(`UPDATE reservations SET status = 'cancelled' WHERE id = $1`, [id]);

    await sendNotification({
      userId: r.user_id,
      title: 'Reservation Cancelled',
      message: `Reservation ${r.reservation_code} for "${r.book_title}" has been cancelled.`,
      type: 'general'
    });

    return res.json({ message: 'Reservation cancelled successfully.' });
  } catch (err) {
    console.error('Error cancelling reservation:', err);
    return res.status(500).json({ error: 'Failed to cancel reservation.' });
  }
};

// Librarian: 1-Click Issue from Approved Reservation
exports.issueFromReservation = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { id } = req.params;
    const { due_date } = req.body;

    const rRes = await client.query(
      `SELECT r.*, b.id AS book_id, b.title AS book_title, b.available_copies,
              u.id AS user_id, u.name AS student_name, u.student_id, u.borrow_limit
       FROM reservations r
       JOIN books b ON r.book_id = b.id
       JOIN users u ON r.user_id = u.id
       WHERE r.id = $1`,
      [id]
    );

    if (rRes.rowCount === 0) {
      return res.status(404).json({ error: 'Reservation record not found.' });
    }
    const r = rRes.rows[0];

    if (r.status === 'fulfilled') {
      return res.status(400).json({ error: 'This reservation has already been issued and fulfilled.' });
    }

    if (r.available_copies <= 0) {
      return res.status(400).json({ error: 'No physical copies available on shelf to issue.' });
    }

    // Check student's current active loans
    const loanCount = await client.query(
      `SELECT COUNT(*) FROM borrow_records WHERE user_id = $1 AND status = 'borrowed'`,
      [r.user_id]
    );
    const currentLoans = parseInt(loanCount.rows[0].count, 10);
    const limit = r.borrow_limit || 3;
    if (currentLoans >= limit) {
      return res.status(400).json({
        error: `Student has reached the maximum borrowing limit of ${limit} books. Please return an existing volume first.`
      });
    }

    let calculatedDueDate = due_date;
    if (!calculatedDueDate) {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      calculatedDueDate = d.toISOString().split('T')[0];
    }

    await client.query('BEGIN');

    // Decrement available copies
    await client.query(`UPDATE books SET available_copies = available_copies - 1 WHERE id = $1`, [r.book_id]);

    // Insert borrow record
    const borrowRes = await client.query(
      `INSERT INTO borrow_records (user_id, book_id, borrow_date, due_date, status, notes)
       VALUES ($1, $2, CURRENT_DATE, $3, 'borrowed', $4)
       RETURNING *`,
      [r.user_id, r.book_id, calculatedDueDate, `Issued via reservation ${r.reservation_code}`]
    );

    // Mark reservation fulfilled
    await client.query(`UPDATE reservations SET status = 'fulfilled' WHERE id = $1`, [id]);

    await client.query('COMMIT');

    await sendNotification({
      userId: r.user_id,
      title: 'Book Issued at Desk',
      message: `"${r.book_title}" has been issued to your account. Return deadline is ${calculatedDueDate}. Enjoy your reading!`,
      type: 'book_issued'
    });

    return res.json({
      message: `Book successfully issued to ${r.student_name}!`,
      borrow_record: borrowRes.rows[0]
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error issuing from reservation:', err);
    return res.status(500).json({ error: 'Failed to issue book from reservation.' });
  } finally {
    client.release();
  }
};
