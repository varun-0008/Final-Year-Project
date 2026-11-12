const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const db = require('../config/db');
const { sendNotification } = require('../services/notificationService');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      student_id: user.student_id,
      role: user.role,
    },
    process.env.JWT_SECRET || 'library_management_secret_key_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Login for both Librarian and Student (Supports Registration Number, Email, or Membership ID)
exports.login = async (req, res) => {
  try {
    const { identifier, email, password } = req.body;
    const loginIdentifier = (identifier || email || '').trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({ error: 'College Registration Number / Email and password are required.' });
    }

    // Support searching either by email, student_id (registration number), or membership_id
    const userRes = await db.query(
      `SELECT id, name, email, student_id, password_hash, role, phone, department, course, semester, 
              membership_id, membership_valid_until, borrow_limit, photo_url, created_at
       FROM users 
       WHERE LOWER(email) = LOWER($1) 
          OR UPPER(student_id) = UPPER($1)
          OR UPPER(membership_id) = UPPER($1)
       LIMIT 1`,
      [loginIdentifier]
    );

    if (userRes.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid credentials. User account not found.' });
    }

    const user = userRes.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
    }

    const token = generateToken(user);

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        student_id: user.student_id,
        role: user.role,
        department: user.department,
        course: user.course || 'Diploma in Cyber Physical Systems and Security',
        semester: user.semester || 'Semester V',
        membership_id: user.membership_id || `LIB-${user.student_id}`,
        membership_valid_until: user.membership_valid_until || '2027-06-30',
        borrow_limit: user.borrow_limit || 3,
        photo_url: user.photo_url,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error('Error in login:', err);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
};

// Register a new Student
exports.registerStudent = async (req, res) => {
  try {
    const { name, email, student_id, password, department, course, semester, phone, photo_url } = req.body;

    if (!name || !email || !student_id || !password) {
      return res.status(400).json({
        error: 'Student Name, College Email, Registration Number (Student ID), and password are required.',
      });
    }

    // Check if email or student_id is taken
    const existing = await db.query(
      `SELECT email, student_id FROM users WHERE LOWER(email) = LOWER($1) OR UPPER(student_id) = UPPER($2)`,
      [email.trim(), student_id.trim()]
    );

    if (existing.rowCount > 0) {
      const match = existing.rows[0];
      if (match.email.toLowerCase() === email.trim().toLowerCase()) {
        return res.status(409).json({ error: 'College email is already registered.' });
      }
      return res.status(409).json({ error: 'College Registration Number is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const cleanStudentId = student_id.trim().toUpperCase();
    const membershipId = `LIB-${cleanStudentId}`;
    const defaultCourse = course || 'Diploma in Cyber Physical Systems and Security';
    const defaultSemester = semester || 'Semester V';
    const defaultDept = department || 'Cyber Physical Systems and Security';

    const insertRes = await db.query(
      `INSERT INTO users (
         name, email, student_id, password_hash, role, department, course, semester, 
         membership_id, membership_valid_until, borrow_limit, phone, photo_url
       )
       VALUES ($1, $2, $3, $4, 'student', $5, $6, $7, $8, '2027-06-30', 3, $9, $10)
       RETURNING id, name, email, student_id, role, department, course, semester, membership_id, membership_valid_until, borrow_limit, phone, photo_url, created_at`,
      [name.trim(), email.trim(), cleanStudentId, hashedPassword, defaultDept, defaultCourse, defaultSemester, membershipId, phone || null, photo_url || null]
    );

    const newUser = insertRes.rows[0];
    const token = generateToken(newUser);

    // Send welcome notification
    await sendNotification({
      userId: newUser.id,
      title: 'Digital Library Membership Card Issued',
      message: `Welcome to Smart Campus Library! Your digital ID (${membershipId}) is now active with a borrow limit of 3 books.`,
      type: 'general'
    });

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: newUser,
    });
  } catch (err) {
    console.error('Error in registerStudent:', err);
    return res.status(500).json({ error: 'Internal server error during student registration.' });
  }
};

// Get current profile
exports.getMe = async (req, res) => {
  try {
    const userRes = await db.query(
      `SELECT id, name, email, student_id, role, department, course, semester, 
              membership_id, membership_valid_until, borrow_limit, phone, photo_url, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (userRes.rowCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({ user: userRes.rows[0] });
  } catch (err) {
    console.error('Error in getMe:', err);
    return res.status(500).json({ error: 'Internal server error fetching user.' });
  }
};

// Update profile details
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, department, course, semester, photo_url } = req.body;

    const updateRes = await db.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           department = COALESCE($3, department),
           course = COALESCE($4, course),
           semester = COALESCE($5, semester),
           photo_url = COALESCE($6, photo_url)
       WHERE id = $7
       RETURNING id, name, email, student_id, role, department, course, semester, membership_id, membership_valid_until, borrow_limit, phone, photo_url`,
      [name, phone, department, course, semester, photo_url, userId]
    );

    return res.json({
      message: 'Profile updated successfully',
      user: updateRes.rows[0]
    });
  } catch (err) {
    console.error('Error in updateProfile:', err);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
};

// MODULE 8: DIGITAL LIBRARY MEMBERSHIP CARD
// Returns student name, reg number, department, photograph, library membership ID, unique QR code, validity
exports.getDigitalCard = async (req, res) => {
  try {
    const targetUserId = req.query.user_id ? parseInt(req.query.user_id, 10) : req.user.id;

    // Check permissions
    if (req.user.role !== 'librarian' && targetUserId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const userRes = await db.query(
      `SELECT id, name, email, student_id, department, course, semester, 
              membership_id, membership_valid_until, borrow_limit, photo_url, created_at
       FROM users WHERE id = $1`,
      [targetUserId]
    );

    if (userRes.rowCount === 0) {
      return res.status(404).json({ error: 'Student not found.' });
    }
    const student = userRes.rows[0];

    // Get active loan count
    const loanCountRes = await db.query(
      `SELECT COUNT(*) FROM borrow_records WHERE user_id = $1 AND status = 'borrowed'`,
      [student.id]
    );
    const activeLoans = parseInt(loanCountRes.rows[0].count, 10);
    const borrowLimit = student.borrow_limit || 3;
    const remainingLimit = Math.max(0, borrowLimit - activeLoans);

    // Construct verifiable dynamic QR data string
    const membershipId = student.membership_id || `LIB-${student.student_id}`;
    const validUntil = student.membership_valid_until ? student.membership_valid_until.toISOString().split('T')[0] : '2027-06-30';
    const qrDataPayload = `GIOE:SBTET:${student.student_id}:${membershipId}:VALID:${validUntil}`;

    // Generate Base64 QR Code image
    const qrDataUrl = await QRCode.toDataURL(qrDataPayload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 280,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF'
      }
    });

    return res.json({
      card: {
        institution: 'Government Institute of Electronics, Secunderabad',
        board: 'State Board of Technical Education, Telangana',
        motto: 'Peace through Wisdom',
        student_name: student.name,
        student_id: student.student_id, // College Registration Number
        department: student.department || 'Cyber Physical Systems and Security',
        course: student.course || 'Diploma in Cyber Physical Systems and Security',
        semester: student.semester || 'Semester V',
        membership_id: membershipId,
        validity: validUntil,
        status: 'Active',
        borrow_limit: borrowLimit,
        active_loans: activeLoans,
        remaining_slots: remainingLimit,
        photo_url: student.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        qr_data: qrDataPayload,
        qr_code_url: qrDataUrl
      }
    });
  } catch (err) {
    console.error('Error generating digital membership card:', err);
    return res.status(500).json({ error: 'Failed to generate digital membership card.' });
  }
};

// LIBRARIAN DESK SCANNER: Lookup student by scanned QR code string, student_id, or membership_id
exports.getStudentByCode = async (req, res) => {
  try {
    const rawCode = decodeURIComponent(req.params.code || '').trim();

    if (!rawCode) {
      return res.status(400).json({ error: 'Student registration number or QR code is required.' });
    }

    // Parse if QR code contains format: GIOE:SBTET:<student_id>:<membership_id>:...
    let searchId = rawCode;
    if (rawCode.startsWith('GIOE:SBTET:')) {
      const parts = rawCode.split(':');
      if (parts.length >= 3) {
        searchId = parts[2]; // student_id
      }
    }

    const studentRes = await db.query(
      `SELECT id, name, email, student_id, department, course, semester, 
              membership_id, membership_valid_until, borrow_limit, phone, photo_url
       FROM users 
       WHERE (UPPER(student_id) = UPPER($1) OR UPPER(membership_id) = UPPER($1) OR LOWER(email) = LOWER($1))
         AND role = 'student'
       LIMIT 1`,
      [searchId]
    );

    if (studentRes.rowCount === 0) {
      return res.status(404).json({ error: `No student found matching "${searchId}".` });
    }
    const student = studentRes.rows[0];

    // Fetch active borrowed books
    const activeLoansRes = await db.query(
      `SELECT br.id, br.borrow_date, br.due_date, br.status, br.fine_amount,
              b.id as book_id, b.title, b.author, b.isbn, b.cover_url,
              b.block, b.floor, b.section, b.rack, b.shelf,
              CASE WHEN br.due_date < CURRENT_DATE THEN (CURRENT_DATE - br.due_date) ELSE 0 END AS days_overdue
       FROM borrow_records br
       JOIN books b ON br.book_id = b.id
       WHERE br.user_id = $1 AND br.status = 'borrowed'
       ORDER BY br.due_date ASC`,
      [student.id]
    );

    // Calculate total pending fines
    const fineRate = parseFloat(process.env.FINE_PER_DAY) || 2.00;
    let totalFine = 0;
    const activeLoans = activeLoansRes.rows.map(loan => {
      let fine = parseFloat(loan.fine_amount) || 0;
      if (loan.days_overdue > 0) {
        fine += loan.days_overdue * fineRate;
      }
      totalFine += fine;
      return {
        ...loan,
        current_fine: fine
      };
    });

    // Fetch approved reservations ready for pickup
    const reservationsRes = await db.query(
      `SELECT r.id, r.reservation_code, r.preferred_date, r.timeslot, r.status, r.created_at,
              b.id as book_id, b.title, b.author, b.isbn, b.available_copies,
              b.block, b.floor, b.section, b.rack, b.shelf
       FROM reservations r
       JOIN books b ON r.book_id = b.id
       WHERE r.user_id = $1 AND r.status IN ('approved', 'ready_for_pickup', 'pending')
       ORDER BY r.created_at DESC`,
      [student.id]
    );

    const borrowLimit = student.borrow_limit || 3;
    const canBorrow = activeLoans.length < borrowLimit;

    return res.json({
      student,
      active_loans: activeLoans,
      active_loans_count: activeLoans.length,
      borrow_limit: borrowLimit,
      can_borrow: canBorrow,
      remaining_slots: Math.max(0, borrowLimit - activeLoans.length),
      total_pending_fine: totalFine,
      reservations: reservationsRes.rows,
      ready_for_pickup_count: reservationsRes.rows.filter(r => r.status === 'ready_for_pickup').length
    });
  } catch (err) {
    console.error('Error in getStudentByCode:', err);
    return res.status(500).json({ error: 'Internal server error scanning student QR code.' });
  }
};

// MY LIBRARY ACCOUNT DASHBOARD
// Personal student dashboard showing: borrowed books, approved/pending reservations, history, upcoming return dates, overdue books, fines, borrowing limit, membership status
exports.getMyAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Profile & Membership
    const userRes = await db.query(
      `SELECT id, name, email, student_id, department, course, semester, 
              membership_id, membership_valid_until, borrow_limit, phone, photo_url
       FROM users WHERE id = $1`,
      [userId]
    );
    if (userRes.rowCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const profile = userRes.rows[0];

    // 2. Active Loans & Overdue Books
    const loansRes = await db.query(
      `SELECT br.id, br.borrow_date, br.due_date, br.status, br.fine_amount,
              b.id as book_id, b.title, b.author, b.isbn, b.cover_url,
              b.block, b.floor, b.section, b.rack, b.shelf,
              CASE WHEN br.due_date < CURRENT_DATE THEN 'overdue' ELSE 'borrowed' END AS computed_status,
              CASE WHEN br.due_date < CURRENT_DATE THEN (CURRENT_DATE - br.due_date) ELSE 0 END AS days_overdue,
              CASE WHEN br.due_date >= CURRENT_DATE THEN (br.due_date - CURRENT_DATE) ELSE 0 END AS days_remaining
       FROM borrow_records br
       JOIN books b ON br.book_id = b.id
       WHERE br.user_id = $1 AND br.status = 'borrowed'
       ORDER BY br.due_date ASC`,
      [userId]
    );

    const fineRate = parseFloat(process.env.FINE_PER_DAY) || 2.00;
    let pendingFines = 0;
    const activeLoans = loansRes.rows.map(l => {
      let fine = parseFloat(l.fine_amount) || 0;
      if (l.days_overdue > 0) {
        fine += l.days_overdue * fineRate;
      }
      pendingFines += fine;
      return {
        ...l,
        calculated_fine: fine
      };
    });

    // 3. Reservations (Approved & Pending)
    const resRes = await db.query(
      `SELECT r.id, r.reservation_code, r.preferred_date, r.timeslot, r.status, r.created_at, r.pickup_deadline,
              b.id as book_id, b.title, b.author, b.isbn, b.cover_url,
              b.block, b.floor, b.section, b.rack, b.shelf
       FROM reservations r
       JOIN books b ON r.book_id = b.id
       WHERE r.user_id = $1 AND r.status IN ('pending', 'approved', 'ready_for_pickup')
       ORDER BY r.created_at DESC`,
      [userId]
    );

    // 4. Smart Waiting List entries
    const waitRes = await db.query(
      `SELECT w.id, w.queue_position, w.status, w.notified_at, w.created_at,
              b.id as book_id, b.title, b.author, b.isbn, b.cover_url, b.available_copies
       FROM waiting_list w
       JOIN books b ON w.book_id = b.id
       WHERE w.user_id = $1 AND w.status IN ('waiting', 'notified')
       ORDER BY w.queue_position ASC`,
      [userId]
    );

    // 5. Past Borrowing History
    const historyRes = await db.query(
      `SELECT br.id, br.borrow_date, br.due_date, br.return_date, br.fine_amount,
              b.title, b.author, b.isbn
       FROM borrow_records br
       JOIN books b ON br.book_id = b.id
       WHERE br.user_id = $1 AND br.status = 'returned'
       ORDER BY br.return_date DESC
       LIMIT 10`,
      [userId]
    );

    const borrowLimit = profile.borrow_limit || 3;
    const currentBorrowedCount = activeLoans.length;
    const availableBorrowLimit = Math.max(0, borrowLimit - currentBorrowedCount);

    return res.json({
      profile,
      summary: {
        membership_status: 'Active',
        membership_id: profile.membership_id || `LIB-${profile.student_id}`,
        valid_until: profile.membership_valid_until || '2027-06-30',
        total_borrow_limit: borrowLimit,
        current_borrowed: currentBorrowedCount,
        available_limit: availableBorrowLimit,
        pending_fines: pendingFines,
        overdue_books_count: activeLoans.filter(l => l.computed_status === 'overdue').length,
        approved_reservations_count: resRes.rows.filter(r => r.status === 'ready_for_pickup' || r.status === 'approved').length,
        waiting_list_count: waitRes.rows.length
      },
      currently_borrowed: activeLoans,
      reservations: resRes.rows,
      waiting_list: waitRes.rows,
      borrowing_history: historyRes.rows
    });
  } catch (err) {
    console.error('Error fetching my library account:', err);
    return res.status(500).json({ error: 'Failed to retrieve library account details.' });
  }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ error: 'College Registration Number or Email is required.' });
    }

    const userRes = await db.query(
      `SELECT id, name, email, student_id FROM users 
       WHERE LOWER(email) = LOWER($1) OR UPPER(student_id) = UPPER($1) LIMIT 1`,
      [identifier.trim()]
    );

    if (userRes.rowCount === 0) {
      return res.status(404).json({ error: 'No account found matching this identifier.' });
    }
    const user = userRes.rows[0];

    // Generate 6-digit PIN reset token valid for 1 hour
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 3600 * 1000).toISOString();

    await db.query(
      `UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3`,
      [token, expires, user.id]
    );

    await sendNotification({
      userId: user.id,
      title: 'Password Reset Code Generated',
      message: `Your password reset verification code is ${token}. Valid for 60 minutes.`,
      type: 'security_alert'
    });

    return res.json({
      message: `Password reset verification code generated for ${user.email}.`,
      reset_token: token, // Provided directly for local convenience
      expires_in_minutes: 60
    });
  } catch (err) {
    console.error('Error in forgotPassword:', err);
    return res.status(500).json({ error: 'Failed to initiate password reset.' });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;
    if (!token || !new_password) {
      return res.status(400).json({ error: 'Reset verification code and new password are required.' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters in length.' });
    }

    const userRes = await db.query(
      `SELECT id, name, email FROM users 
       WHERE reset_token = $1 AND reset_token_expires > NOW() LIMIT 1`,
      [token.trim()]
    );

    if (userRes.rowCount === 0) {
      return res.status(400).json({ error: 'Invalid or expired password reset verification code.' });
    }
    const user = userRes.rows[0];

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await db.query(
      `UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2`,
      [hashedPassword, user.id]
    );

    await sendNotification({
      userId: user.id,
      title: 'Password Changed Successfully',
      message: 'Your library account password has been updated. You can now login with your new credentials.',
      type: 'security_alert'
    });

    return res.json({ message: 'Password has been successfully reset! You can now log in.' });
  } catch (err) {
    console.error('Error in resetPassword:', err);
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
};

// Librarian: Get all registered students with loan counts
exports.getAllStudents = async (req, res) => {
  try {
    const studentsRes = await db.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.student_id,
        u.department,
        u.course,
        u.semester,
        u.membership_id,
        u.membership_valid_until,
        u.borrow_limit,
        u.phone,
        u.created_at,
        COUNT(CASE WHEN br.status = 'borrowed' THEN 1 END) AS active_loans,
        COUNT(CASE WHEN br.status = 'borrowed' AND br.due_date < CURRENT_DATE THEN 1 END) AS overdue_loans,
        COALESCE(SUM(CASE WHEN br.status = 'borrowed' AND br.due_date < CURRENT_DATE THEN (CURRENT_DATE - br.due_date) * 2.00 ELSE 0 END), 0) AS calculated_fines
      FROM users u
      LEFT JOIN borrow_records br ON u.id = br.user_id
      WHERE u.role = 'student'
      GROUP BY u.id
      ORDER BY u.name ASC
    `);

    return res.json({ students: studentsRes.rows });
  } catch (err) {
    console.error('Error in getAllStudents:', err);
    return res.status(500).json({ error: 'Internal server error fetching students.' });
  }
};

// Librarian: Upload Excel (.xlsx) / CSV file for bulk student import
exports.uploadStudentsExcel = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'No Excel (.xlsx) or CSV file uploaded.' });
    }

    const xlsx = require('xlsx');
    let workbook;
    try {
      workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    } catch (parseErr) {
      return res.status(400).json({ error: 'Failed to parse Excel file. Please ensure it is a valid .xlsx or .csv.' });
    }

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return res.status(400).json({ error: 'Uploaded workbook contains no sheets.' });
    }

    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: 'The uploaded sheet contains no data rows.' });
    }

    const defaultPasswordHash = await bcrypt.hash('student123', 10);
    const createdUsers = [];
    const skipped = [];
    let createdCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      const getCol = (...keys) => {
        for (const k of keys) {
          const found = Object.keys(row).find(
            col => col.trim().toLowerCase() === k.trim().toLowerCase()
          );
          if (found && row[found] !== undefined && row[found] !== '') {
            return String(row[found]).trim();
          }
        }
        return '';
      };

      const name = getCol('name', 'full name', 'student name');
      const email = getCol('email', 'email address', 'college email');
      const studentId = getCol('student id', 'student_id', 'studentid', 'roll no', 'registration number', 'id');
      const department = getCol('department', 'dept', 'major', 'branch');
      const course = getCol('course', 'degree', 'program');
      const semester = getCol('semester', 'sem');
      const phone = getCol('phone', 'phone number', 'mobile', 'contact');
      const password = getCol('password', 'pass');

      if (!name || !email || !studentId) {
        skipped.push({
          row: rowNum,
          reason: `Missing required field(s): ${[!name && 'Name', !email && 'Email', !studentId && 'Student ID'].filter(Boolean).join(', ')}`,
        });
        continue;
      }

      const checkRes = await db.query(
        `SELECT id, email, student_id FROM users 
         WHERE LOWER(email) = LOWER($1) OR UPPER(student_id) = UPPER($2)`,
        [email, studentId]
      );

      if (checkRes.rowCount > 0) {
        const existing = checkRes.rows[0];
        const matchField = existing.email.toLowerCase() === email.toLowerCase() ? 'Email' : 'Student ID';
        skipped.push({
          row: rowNum,
          studentId,
          name,
          reason: `${matchField} already exists (${matchField === 'Email' ? email : studentId})`,
        });
        continue;
      }

      let passwordHash = defaultPasswordHash;
      if (password && password.trim() !== '') {
        passwordHash = await bcrypt.hash(password.trim(), 10);
      }

      const cleanReg = studentId.toUpperCase();
      const membershipId = `LIB-${cleanReg}`;

      const insertRes = await db.query(
        `INSERT INTO users (
           name, email, student_id, password_hash, role, department, course, semester, 
           membership_id, membership_valid_until, borrow_limit, phone
         )
         VALUES ($1, $2, $3, $4, 'student', $5, $6, $7, $8, '2027-06-30', 3, $9)
         RETURNING id, name, email, student_id, department, course, semester, membership_id, phone, created_at`,
        [
          name, 
          email, 
          cleanReg, 
          passwordHash, 
          department || 'Cyber Physical Systems and Security',
          course || 'Diploma in Cyber Physical Systems and Security',
          semester || 'Semester V',
          membershipId,
          phone || null
        ]
      );

      createdCount++;
      createdUsers.push(insertRes.rows[0]);
    }

    return res.status(201).json({
      message: `Successfully imported ${createdCount} student(s). ${skipped.length} row(s) skipped.`,
      createdCount,
      skippedCount: skipped.length,
      skipped,
      createdUsers,
    });
  } catch (err) {
    console.error('Error in uploadStudentsExcel:', err);
    return res.status(500).json({ error: `Internal server error during Excel upload: ${err.message}` });
  }
};

// Librarian: Download Sample Students Excel Template
exports.downloadStudentsTemplate = (req, res) => {
  const xlsx = require('xlsx');

  const sampleData = [
    {
      'Student Name': 'Muniganti Rishith Reddy',
      'Email': 'rishith.cps011@gioe.ac.in',
      'Student ID': '24054-CPS-011',
      'Department': 'Cyber Physical Systems and Security',
      'Course': 'Diploma in Cyber Physical Systems and Security',
      'Semester': 'Semester V',
      'Phone': '+91-98480-12301',
      'Password': 'student123',
    },
    {
      'Student Name': 'Kadingula Eashwar',
      'Email': 'eashwar.cps020@gioe.ac.in',
      'Student ID': '24054-CPS-020',
      'Department': 'Cyber Physical Systems and Security',
      'Course': 'Diploma in Cyber Physical Systems and Security',
      'Semester': 'Semester V',
      'Phone': '+91-98480-12302',
      'Password': 'student123',
    },
    {
      'Student Name': 'Pantangi Neelima',
      'Email': 'neelima.cps050@gioe.ac.in',
      'Student ID': '24054-CPS-050',
      'Department': 'Cyber Physical Systems and Security',
      'Course': 'Diploma in Cyber Physical Systems and Security',
      'Semester': 'Semester V',
      'Phone': '+91-98480-12303',
      'Password': 'student123',
    },
    {
      'Student Name': 'Mattawada Tanish',
      'Email': 'tanish.cps062@gioe.ac.in',
      'Student ID': '24054-CPS-062',
      'Department': 'Cyber Physical Systems and Security',
      'Course': 'Diploma in Cyber Physical Systems and Security',
      'Semester': 'Semester V',
      'Phone': '+91-98480-12304',
      'Password': 'student123',
    },
    {
      'Student Name': 'Poluru Rebca Rani',
      'Email': 'rebca.cps071@gioe.ac.in',
      'Student ID': '24054-CPS-071',
      'Department': 'Cyber Physical Systems and Security',
      'Course': 'Diploma in Cyber Physical Systems and Security',
      'Semester': 'Semester V',
      'Phone': '+91-98480-12305',
      'Password': 'student123',
    }
  ];

  const ws = xlsx.utils.json_to_sheet(sampleData);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'GIOE Students Roster');

  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="gioe_students_import_template.xlsx"');
  res.setHeader('Content-Length', buffer.length);
  return res.status(200).end(buffer);
};
