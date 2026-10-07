const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

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

// Login for both Librarian and Student
exports.login = async (req, res) => {
  try {
    const { identifier, email, password } = req.body;
    const loginIdentifier = (identifier || email || '').trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({ error: 'Email or Student ID and password are required.' });
    }

    // Support searching either by email or by student_id
    const userRes = await db.query(
      `SELECT id, name, email, student_id, password_hash, role, phone, department, created_at
       FROM users 
       WHERE LOWER(email) = LOWER($1) OR UPPER(student_id) = UPPER($1)
       LIMIT 1`,
      [loginIdentifier]
    );

    if (userRes.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
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
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error('Error in login:', err);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
};

// Register a new Student (Students can self-register or be added)
exports.registerStudent = async (req, res) => {
  try {
    const { name, email, student_id, password, department, phone } = req.body;

    if (!name || !email || !student_id || !password) {
      return res.status(400).json({
        error: 'Name, email, student ID, and password are required.',
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
        return res.status(409).json({ error: 'Email is already registered.' });
      }
      return res.status(409).json({ error: 'Student ID is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertRes = await db.query(
      `INSERT INTO users (name, email, student_id, password_hash, role, department, phone)
       VALUES ($1, $2, $3, $4, 'student', $5, $6)
       RETURNING id, name, email, student_id, role, department, phone, created_at`,
      [name.trim(), email.trim(), student_id.trim().toUpperCase(), hashedPassword, department || null, phone || null]
    );

    const newUser = insertRes.rows[0];
    const token = generateToken(newUser);

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
      `SELECT id, name, email, student_id, role, department, phone, created_at
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
        u.phone,
        u.created_at,
        COUNT(CASE WHEN br.status = 'borrowed' THEN 1 END) AS active_borrowed_count,
        COALESCE(SUM(CASE WHEN br.status = 'borrowed' AND br.due_date < CURRENT_DATE THEN 1 ELSE 0 END), 0) AS overdue_count
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

// Librarian: Bulk Upload Students via Excel / CSV (.xlsx, .xls, .csv)
exports.uploadStudentsExcel = async (req, res) => {
  try {
    const xlsx = require('xlsx');

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'Please upload an Excel (.xlsx/.xls) or CSV file.' });
    }

    let rows = [];
    try {
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        return res.status(400).json({ error: 'The uploaded spreadsheet contains no sheets.' });
      }
      const worksheet = workbook.Sheets[firstSheetName];
      rows = xlsx.utils.sheet_to_json(worksheet, { defval: '' });
    } catch (parseErr) {
      return res.status(400).json({ error: `Could not parse spreadsheet: ${parseErr.message}` });
    }

    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: 'The uploaded file contains no data rows.' });
    }

    let createdCount = 0;
    const skipped = [];
    const createdUsers = [];

    // Default password hash for imported students if not provided in sheet
    const defaultPasswordHash = await bcrypt.hash('student123', 10);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // considering 1-based indexing and header at line 1

      // Case-insensitive key lookup helper
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
      const studentId = getCol('student id', 'student_id', 'studentid', 'roll no', 'id');
      const department = getCol('department', 'dept', 'major', 'branch');
      const phone = getCol('phone', 'phone number', 'mobile', 'contact');
      const password = getCol('password', 'pass');

      // Validation
      if (!name || !email || !studentId) {
        skipped.push({
          row: rowNum,
          reason: `Missing required field(s): ${[!name && 'Name', !email && 'Email', !studentId && 'Student ID'].filter(Boolean).join(', ')}`,
        });
        continue;
      }

      // Check for existing user by email or student_id
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

      // Hash password if custom, else use default
      let passwordHash = defaultPasswordHash;
      if (password && password.trim() !== '') {
        passwordHash = await bcrypt.hash(password.trim(), 10);
      }

      // Insert student into PostgreSQL
      const insertRes = await db.query(
        `INSERT INTO users (name, email, student_id, password_hash, role, department, phone)
         VALUES ($1, $2, $3, $4, 'student', $5, $6)
         RETURNING id, name, email, student_id, department, phone, created_at`,
        [name, email, studentId.toUpperCase(), passwordHash, department || null, phone || null]
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

// Librarian: Download Sample Students Excel / CSV Template
exports.downloadStudentsTemplate = (req, res) => {
  const xlsx = require('xlsx');

  const sampleData = [
    {
      'Student Name': 'John Doe',
      'Email': 'john.doe@college.edu',
      'Student ID': 'STU-2001',
      'Department': 'Computer Science',
      'Phone': '+1-555-0201',
      'Password': 'student123',
    },
    {
      'Student Name': 'Emma Watson',
      'Email': 'emma.watson@college.edu',
      'Student ID': 'STU-2002',
      'Department': 'Information Technology',
      'Phone': '+1-555-0202',
      'Password': 'student123',
    },
    {
      'Student Name': 'David Clark',
      'Email': 'david.clark@college.edu',
      'Student ID': 'STU-2003',
      'Department': 'Electrical Engineering',
      'Phone': '+1-555-0203',
      'Password': 'student123',
    },
  ];

  const ws = xlsx.utils.json_to_sheet(sampleData);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Students Template');

  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="students_import_template.xlsx"');
  res.setHeader('Content-Length', buffer.length);
  return res.status(200).end(buffer);
};
