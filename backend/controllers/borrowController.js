const db = require('../config/db');
const { sendNotification } = require('../services/notificationService');

// ISSUE BOOK: ONLY AVAILABLE TO ADMIN / LIBRARIAN
exports.issueBook = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { student_identifier, book_identifier, due_date, notes } = req.body;

    if (!student_identifier || !book_identifier) {
      return res.status(400).json({
        error: 'Student identifier (ID or Email) and Book identifier (ID or ISBN) are required.',
      });
    }

    // 1. Identify the student
    const studentRes = await client.query(
      `SELECT id, name, email, student_id, role, borrow_limit 
       FROM users 
       WHERE role = 'student' 
         AND (id::text = $1 OR UPPER(student_id) = UPPER($1) OR LOWER(email) = LOWER($1))
       LIMIT 1`,
      [student_identifier.toString().trim()]
    );

    if (studentRes.rowCount === 0) {
      return res.status(404).json({ error: 'Student not found with provided identifier.' });
    }
    const student = studentRes.rows[0];

    // Check student borrow limit (default 3)
    const activeLoanCount = await client.query(
      `SELECT COUNT(*) FROM borrow_records WHERE user_id = $1 AND status = 'borrowed'`,
      [student.id]
    );
    const currentLoans = parseInt(activeLoanCount.rows[0].count, 10);
    const limit = student.borrow_limit || 3;
    if (currentLoans >= limit) {
      return res.status(400).json({
        error: `Student ${student.name} (${student.student_id}) has reached the maximum borrowing limit of ${limit} books.`,
      });
    }

    // 2. Identify the book
    const bookRes = await client.query(
      `SELECT id, title, author, isbn, available_copies, total_copies, block, floor, section, rack, shelf 
       FROM books 
       WHERE id::text = $1 OR isbn = $1
       LIMIT 1`,
      [book_identifier.toString().trim()]
    );

    if (bookRes.rowCount === 0) {
      return res.status(404).json({ error: 'Book not found with provided identifier.' });
    }
    const book = bookRes.rows[0];

    if (book.available_copies <= 0) {
      return res.status(400).json({
        error: `Book "${book.title}" is currently out of stock (0 available copies).`,
      });
    }

    // 3. Check if student already has an active loan of this book
    const activeLoan = await client.query(
      `SELECT id FROM borrow_records 
       WHERE user_id = $1 AND book_id = $2 AND status = 'borrowed'`,
      [student.id]
    );

    if (activeLoan.rowCount > 0) {
      return res.status(400).json({
        error: `Student already has an active borrowed copy of "${book.title}".`,
      });
    }

    // 4. Determine due date (default: 14 days from today if not specified)
    let calculatedDueDate = due_date;
    if (!calculatedDueDate) {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      calculatedDueDate = d.toISOString().split('T')[0];
    }

    // 5. Begin transaction: decrement copies, create borrow record
    await client.query('BEGIN');

    await client.query(
      `UPDATE books SET available_copies = available_copies - 1 WHERE id = $1`,
      [book.id]
    );

    const borrowRes = await client.query(
      `INSERT INTO borrow_records (user_id, book_id, borrow_date, due_date, status, fine_amount, notes)
       VALUES ($1, $2, CURRENT_DATE, $3, 'borrowed', 0.00, $4)
       RETURNING *`,
      [student.id, book.id, calculatedDueDate, notes || 'Issued at desk via Digital ID']
    );

    // If student had a waiting list entry or reservation for this book, mark fulfilled
    await client.query(
      `UPDATE reservations SET status = 'fulfilled' 
       WHERE user_id = $1 AND book_id = $2 AND status IN ('pending', 'approved', 'ready_for_pickup')`,
      [student.id, book.id]
    );
    await client.query(
      `UPDATE waiting_list SET status = 'fulfilled' 
       WHERE user_id = $1 AND book_id = $2 AND status IN ('waiting', 'notified')`,
      [student.id, book.id]
    );

    await client.query('COMMIT');

    // Send in-app notification to student
    await sendNotification({
      userId: student.id,
      title: 'Book Issued Successfully',
      message: `"${book.title}" was issued to your account. Return deadline is ${calculatedDueDate}. Location: Block ${book.block}, Floor ${book.floor}, ${book.rack}.`,
      type: 'book_issued'
    });

    return res.status(201).json({
      message: `Successfully issued "${book.title}" to ${student.name}.`,
      record: borrowRes.rows[0],
      student: { id: student.id, name: student.name, student_id: student.student_id },
      book: { id: book.id, title: book.title, author: book.author },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error in issueBook:', err);
    return res.status(500).json({ error: 'Internal server error while issuing book.' });
  } finally {
    client.release();
  }
};

// RETURN BOOK: ONLY AVAILABLE TO ADMIN / LIBRARIAN
exports.returnBook = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { borrow_id } = req.body;

    if (!borrow_id) {
      return res.status(400).json({ error: 'Borrow record ID is required.' });
    }

    const recordRes = await client.query(
      `SELECT br.*, b.title as book_title, b.id as book_id, u.id as user_id, u.name as student_name
       FROM borrow_records br
       JOIN books b ON br.book_id = b.id
       JOIN users u ON br.user_id = u.id
       WHERE br.id = $1`,
      [borrow_id]
    );

    if (recordRes.rowCount === 0) {
      return res.status(404).json({ error: 'Borrow record not found.' });
    }

    const record = recordRes.rows[0];
    if (record.status === 'returned') {
      return res.status(400).json({ error: 'This book has already been marked as returned.' });
    }

    // Calculate overdue fine if applicable
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(record.due_date);
    dueDate.setHours(0, 0, 0, 0);

    let fine = 0.00;
    const fineRate = parseFloat(process.env.FINE_PER_DAY) || 2.00;
    if (today > dueDate) {
      const diffTime = Math.abs(today - dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fine = parseFloat((diffDays * fineRate).toFixed(2));
    }

    await client.query('BEGIN');

    // Increment available copies
    await client.query(
      `UPDATE books SET available_copies = available_copies + 1 WHERE id = $1`,
      [record.book_id]
    );

    // Update borrow record
    const updateRes = await client.query(
      `UPDATE borrow_records 
       SET status = 'returned',
           return_date = CURRENT_DATE,
           fine_amount = $1
       WHERE id = $2
       RETURNING *`,
      [fine, borrow_id]
    );

    // Smart Waiting List: Check if any student is waiting for this book
    const nextWaitingRes = await client.query(
      `SELECT w.*, u.id as user_id, u.name as user_name, u.email as user_email 
       FROM waiting_list w
       JOIN users u ON w.user_id = u.id
       WHERE w.book_id = $1 AND w.status = 'waiting'
       ORDER BY w.queue_position ASC
       LIMIT 1`,
      [record.book_id]
    );

    let promotedStudent = null;
    if (nextWaitingRes.rowCount > 0) {
      const nextInLine = nextWaitingRes.rows[0];
      promotedStudent = nextInLine.user_name;
      // Mark as notified
      await client.query(
        `UPDATE waiting_list SET status = 'notified', notified_at = NOW() WHERE id = $1`,
        [nextInLine.id]
      );
      // Re-order remaining waiting list
      await client.query(
        `UPDATE waiting_list SET queue_position = queue_position - 1 
         WHERE book_id = $1 AND status = 'waiting' AND queue_position > $2`,
        [record.book_id, nextInLine.queue_position]
      );

      // Send automated priority notification to student
      await sendNotification({
        userId: nextInLine.user_id,
        title: 'Book Availability Alert (Waiting List)',
        message: `Great news! "${record.book_title}" is now available at the Circulation Desk. A hold has been placed for you for the next 48 hours.`,
        type: 'waiting_list_alert'
      });
    }

    await client.query('COMMIT');

    // Send return receipt notification
    const returnMsg = fine > 0
      ? `Book "${record.book_title}" has been returned. An overdue late fee of ₹${fine.toFixed(2)} was recorded.`
      : `Book "${record.book_title}" has been returned on time. Thank you!`;

    await sendNotification({
      userId: record.user_id,
      title: 'Book Return Confirmation',
      message: returnMsg,
      type: fine > 0 ? 'fine_update' : 'book_returned'
    });

    return res.json({
      message: `Book "${record.book_title}" returned successfully.` + (promotedStudent ? ` Next student (${promotedStudent}) on Smart Waiting List was notified!` : ''),
      record: updateRes.rows[0],
      fineCalculated: fine,
      studentName: record.student_name,
      promotedWaitingStudent: promotedStudent
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error in returnBook:', err);
    return res.status(500).json({ error: 'Internal server error while returning book.' });
  } finally {
    client.release();
  }
};

// STUDENT: VIEW MY BORROWED BOOKS
exports.getMyBorrowedBooks = async (req, res) => {
  try {
    const studentId = req.user.id;

    const loansRes = await db.query(
      `SELECT 
         br.id as borrow_id,
         br.borrow_date,
         br.due_date,
         br.return_date,
         br.status,
         br.fine_amount,
         br.notes,
         b.id as book_id,
         b.title,
         b.author,
         b.isbn,
         b.genre,
         b.shelf_location,
        b.block,
        b.floor,
        b.section,
        b.rack,
        b.shelf,
        b.cover_url,
         b.block,
         b.floor,
         b.section,
         b.rack,
         b.shelf,
         b.cover_url,
         CASE 
           WHEN br.status = 'borrowed' AND br.due_date < CURRENT_DATE THEN 'overdue'
           ELSE br.status
         END AS computed_status,
         CASE 
           WHEN br.status = 'borrowed' AND br.due_date < CURRENT_DATE THEN (CURRENT_DATE - br.due_date)
           ELSE 0
         END AS days_overdue,
         CASE 
           WHEN br.status = 'borrowed' AND br.due_date >= CURRENT_DATE THEN (br.due_date - CURRENT_DATE)
           ELSE 0
         END AS days_remaining
       FROM borrow_records br
       JOIN books b ON br.book_id = b.id
       WHERE br.user_id = $1
       ORDER BY 
         CASE WHEN br.status = 'borrowed' THEN 1 ELSE 2 END,
         br.due_date ASC`,
      [studentId]
    );

    return res.json({ borrowedBooks: loansRes.rows });
  } catch (err) {
    console.error('Error in getMyBorrowedBooks:', err);
    return res.status(500).json({ error: 'Internal server error fetching your borrowed books.' });
  }
};

// ADMIN: GET ALL BORROW RECORDS
exports.getAllBorrowRecords = async (req, res) => {
  try {
    const { status, search } = req.query;

    let queryText = `
      SELECT 
        br.id,
        br.borrow_date,
        br.due_date,
        br.return_date,
        br.status,
        br.fine_amount,
        br.notes,
        u.id as user_id,
        u.name as student_name,
        u.student_id,
        u.email as student_email,
        u.department as student_dept,
        b.id as book_id,
        b.title as book_title,
        b.author as book_author,
        b.isbn as book_isbn,
        b.shelf_location,
        b.block,
        b.floor,
        b.section,
        b.rack,
        b.shelf,
        b.cover_url,
        CASE 
          WHEN br.status = 'borrowed' AND br.due_date < CURRENT_DATE THEN 'overdue'
          ELSE br.status
        END AS computed_status,
        CASE 
          WHEN br.status = 'borrowed' AND br.due_date < CURRENT_DATE THEN (CURRENT_DATE - br.due_date)
          ELSE 0
        END AS days_overdue
      FROM borrow_records br
      JOIN users u ON br.user_id = u.id
      JOIN books b ON br.book_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      if (status === 'overdue') {
        queryText += ` AND br.status = 'borrowed' AND br.due_date < CURRENT_DATE`;
      } else {
        params.push(status);
        queryText += ` AND br.status = $${params.length}`;
      }
    }

    if (search && search.trim() !== '') {
      params.push(`%${search.trim().toLowerCase()}%`);
      const pIndex = params.length;
      queryText += ` AND (
        LOWER(u.name) LIKE $${pIndex} OR 
        UPPER(u.student_id) LIKE UPPER($${pIndex}) OR 
        LOWER(b.title) LIKE $${pIndex} OR
        LOWER(b.isbn) LIKE $${pIndex}
      )`;
    }

    queryText += ` ORDER BY br.id DESC`;

    const recordsRes = await db.query(queryText, params);
    return res.json({ records: recordsRes.rows });
  } catch (err) {
    console.error('Error in getAllBorrowRecords:', err);
    return res.status(500).json({ error: 'Internal server error fetching borrow records.' });
  }
};

// ADMIN: GET STATS FOR DASHBOARD
exports.getAdminStats = async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM books) AS total_titles,
        (SELECT COALESCE(SUM(total_copies), 0) FROM books) AS total_copies,
        (SELECT COALESCE(SUM(available_copies), 0) FROM books) AS available_copies,
        (SELECT COUNT(*) FROM borrow_records WHERE status = 'borrowed') AS active_borrows,
        (SELECT COUNT(*) FROM borrow_records WHERE status = 'borrowed' AND due_date < CURRENT_DATE) AS overdue_count,
        (SELECT COUNT(*) FROM users WHERE role = 'student') AS total_students
    `;
    const result = await db.query(statsQuery);
    return res.json({ stats: result.rows[0] });
  } catch (err) {
    console.error('Error in getAdminStats:', err);
    return res.status(500).json({ error: 'Internal server error fetching stats.' });
  }
};
