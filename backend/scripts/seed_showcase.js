// Smart Campus Library — Production Institutional Data Seeder
// Government Institute of Electronics (GIOE), Secunderabad
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function seedShowcase(customClient = null) {
  const client = customClient || require('../config/db');
  console.log('🌱 Seeding complete production-grade institutional catalog and student records...');

  try {
    // 0. Ensure schema and tables exist first
    try {
      const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        if (typeof client.exec === 'function') {
          await client.exec(schemaSql);
        } else {
          const statements = schemaSql.split(/;\s*$/m).map(s => s.trim()).filter(s => s.length > 0);
          for (const stmt of statements) {
            try { await client.query(stmt); } catch (_) {}
          }
        }
      }
    } catch (e) {
      console.warn('Notice applying schema.sql:', e.message);
    }

    // 1. Password Hashes
    const adminHash = bcrypt.hashSync('admin123', 10);
    const studentHash = bcrypt.hashSync('student123', 10);

    // 2. Clear Existing Data
    try {
      await client.query('DELETE FROM notifications');
      await client.query('DELETE FROM waiting_list');
      await client.query('DELETE FROM reservations');
      await client.query('DELETE FROM borrow_records');
      await client.query('DELETE FROM announcements');
      await client.query('DELETE FROM books');
      await client.query('DELETE FROM users');
    } catch (_) {}

    // Reset sequences
    try {
      await client.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
      await client.query('ALTER SEQUENCE books_id_seq RESTART WITH 1');
      await client.query('ALTER SEQUENCE borrow_records_id_seq RESTART WITH 1');
      await client.query('ALTER SEQUENCE reservations_id_seq RESTART WITH 1');
      await client.query('ALTER SEQUENCE waiting_list_id_seq RESTART WITH 1');
      await client.query('ALTER SEQUENCE announcements_id_seq RESTART WITH 1');
      await client.query('ALTER SEQUENCE notifications_id_seq RESTART WITH 1');
    } catch (_) {}

    // 3. Seed Users (1 Chief Librarian + 10 Authentic Students + 1 Universal Testing Alias)
    const usersData = [
      {
        name: 'Mr. K. Ranga Rao',
        email: 'admin@library.com',
        student_id: 'LIB-001',
        hash: adminHash,
        role: 'librarian',
        phone: '+91-9876543210',
        dept: 'Library Administration',
        course: 'Central Information Resource Centre',
        sem: 'Staff',
        memId: 'LIB-ADM-001',
        valid: '2030-12-31',
        limit: 10
      },
      {
        name: 'Mattawada Tanish',
        email: 'tanish.24054cps062@gioe.ac.in',
        student_id: '24054-CPS-062',
        hash: studentHash,
        role: 'student',
        phone: '+91-9848012345',
        dept: 'Cyber Physical Systems and Security',
        course: 'Diploma in Cyber Physical Systems and Security',
        sem: 'Semester V',
        memId: 'LIB-STU-24054062',
        valid: '2027-06-30',
        limit: 3
      },
      {
        name: 'Varun Kumar',
        email: 'varun.24054cps018@gioe.ac.in',
        student_id: '24054-CPS-018',
        hash: studentHash,
        role: 'student',
        phone: '+91-9848054321',
        dept: 'Cyber Physical Systems and Security',
        course: 'Diploma in Cyber Physical Systems and Security',
        sem: 'Semester V',
        memId: 'LIB-STU-24054018',
        valid: '2027-06-30',
        limit: 3
      },
      {
        name: 'Ananya Sharma',
        email: 'ananya.24054cse045@gioe.ac.in',
        student_id: '24054-CSE-045',
        hash: studentHash,
        role: 'student',
        phone: '+91-9848098765',
        dept: 'Computer Science and Engineering',
        course: 'Diploma in Computer Science and Engineering',
        sem: 'Semester V',
        memId: 'LIB-STU-24054045',
        valid: '2027-06-30',
        limit: 3
      },
      {
        name: 'Rahul Varma',
        email: 'rahul.24054ece012@gioe.ac.in',
        student_id: '24054-ECE-012',
        hash: studentHash,
        role: 'student',
        phone: '+91-9848123456',
        dept: 'Electronics and Communication Engineering',
        course: 'Diploma in Electronics and Communication Engineering',
        sem: 'Semester III',
        memId: 'LIB-STU-24054012',
        valid: '2028-06-30',
        limit: 3
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha.24054cps033@gioe.ac.in',
        student_id: '24054-CPS-033',
        hash: studentHash,
        role: 'student',
        phone: '+91-9848234567',
        dept: 'Cyber Physical Systems and Security',
        course: 'Diploma in Cyber Physical Systems and Security',
        sem: 'Semester V',
        memId: 'LIB-STU-24054033',
        valid: '2027-06-30',
        limit: 3
      },
      {
        name: 'P. Sai Teja',
        email: 'saiteja.24054cse078@gioe.ac.in',
        student_id: '24054-CSE-078',
        hash: studentHash,
        role: 'student',
        phone: '+91-9848345678',
        dept: 'Computer Science and Engineering',
        course: 'Diploma in Computer Science and Engineering',
        sem: 'Semester III',
        memId: 'LIB-STU-24054078',
        valid: '2028-06-30',
        limit: 3
      },
      {
        name: 'Keerthi Patel',
        email: 'keerthi.24054aiml009@gioe.ac.in',
        student_id: '24054-AIML-009',
        hash: studentHash,
        role: 'student',
        phone: '+91-9848456789',
        dept: 'Artificial Intelligence & Machine Learning',
        course: 'Diploma in Artificial Intelligence & Machine Learning',
        sem: 'Semester III',
        memId: 'LIB-STU-24054009',
        valid: '2028-06-30',
        limit: 3
      },
      {
        name: 'Mohammed Zeeshan',
        email: 'zeeshan.24054iot022@gioe.ac.in',
        student_id: '24054-IOT-022',
        hash: studentHash,
        role: 'student',
        phone: '+91-9848567890',
        dept: 'Internet of Things & Embedded Systems',
        course: 'Diploma in Internet of Things & Embedded Systems',
        sem: 'Semester V',
        memId: 'LIB-STU-24054022',
        valid: '2027-06-30',
        limit: 3
      },
      {
        name: 'Divya Sri',
        email: 'divya.24054cse019@gioe.ac.in',
        student_id: '24054-CSE-019',
        hash: studentHash,
        role: 'student',
        phone: '+91-9848678901',
        dept: 'Computer Science and Engineering',
        course: 'Diploma in Computer Science and Engineering',
        sem: 'Semester V',
        memId: 'LIB-STU-24054019',
        valid: '2027-06-30',
        limit: 3
      },
      {
        name: 'R. Karthik',
        email: 'karthik.24054ece055@gioe.ac.in',
        student_id: '24054-ECE-055',
        hash: studentHash,
        role: 'student',
        phone: '+91-9848789012',
        dept: 'Electronics and Communication Engineering',
        course: 'Diploma in Electronics and Communication Engineering',
        sem: 'Semester V',
        memId: 'LIB-STU-24054055',
        valid: '2027-06-30',
        limit: 3
      },
      // Universal Student Fallback Account
      {
        name: 'Student Portal Scholar',
        email: 'student@college.edu',
        student_id: 'STU-1001',
        hash: studentHash,
        role: 'student',
        phone: '+91-9876543299',
        dept: 'Cyber Physical Systems and Security',
        course: 'Diploma in Cyber Physical Systems and Security',
        sem: 'Semester V',
        memId: 'LIB-STU-1001',
        valid: '2027-06-30',
        limit: 3
      }
    ];

    const usersMap = {};
    for (const u of usersData) {
      const res = await client.query(`
        INSERT INTO users (name, email, student_id, password_hash, role, phone, department, course, semester, membership_id, membership_valid_until, borrow_limit)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, student_id, role;
      `, [u.name, u.email, u.student_id, u.hash, u.role, u.phone, u.dept, u.course, u.sem, u.memId, u.valid, u.limit]);
      usersMap[u.student_id] = res.rows[0];
    }
    console.log(`✅ Seeded ${usersData.length} Users (1 Chief Librarian & 11 Student Accounts)`);

    // 4. Seed Books with Exact Physical Shelf Coordinates (16 Standard Academic Titles)
    const books = [
      {
        isbn: '9780262033848',
        title: 'Introduction to Algorithms (CLRS)',
        author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
        genre: 'Algorithms',
        year: 2009,
        total_copies: 6,
        available_copies: 5,
        block: 'A',
        floor: 2,
        section: 'Algorithms & Data Structures',
        rack: 'Rack 08',
        shelf: 'Shelf 03',
        shelf_location: 'Block A, Floor 2, Section: Algorithms & Data Structures, Rack 08, Shelf 03',
        description: 'The standard reference for modern algorithms, asymptotic analysis, dynamic programming, and greedy graph theory.',
        cover_url: 'https://covers.openlibrary.org/b/id/13106560-M.jpg'
      },
      {
        isbn: '9780135957059',
        title: 'The Pragmatic Programmer: 20th Anniversary Edition',
        author: 'David Thomas, Andrew Hunt',
        genre: 'Software Engineering',
        year: 2019,
        total_copies: 5,
        available_copies: 4,
        block: 'A',
        floor: 2,
        section: 'Software Engineering',
        rack: 'Rack 04',
        shelf: 'Shelf 02',
        shelf_location: 'Block A, Floor 2, Section: Software Engineering, Rack 04, Shelf 02',
        description: 'Timeless principles for technical craftsmanship, clean modularity, continuous automation, and career longevity.',
        cover_url: 'https://covers.openlibrary.org/b/id/9309228-M.jpg'
      },
      {
        isbn: '9780132350884',
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        author: 'Robert C. Martin',
        genre: 'Software Engineering',
        year: 2008,
        total_copies: 5,
        available_copies: 3,
        block: 'A',
        floor: 2,
        section: 'Software Engineering',
        rack: 'Rack 04',
        shelf: 'Shelf 01',
        shelf_location: 'Block A, Floor 2, Section: Software Engineering, Rack 04, Shelf 01',
        description: 'Rules and heuristics of professional programming: meaningful names, small functions, unit testing, and refactoring.',
        cover_url: 'https://covers.openlibrary.org/b/id/11183188-M.jpg'
      },
      {
        isbn: '9780136042594',
        title: 'Artificial Intelligence: A Modern Approach',
        author: 'Stuart Russell, Peter Norvig',
        genre: 'Artificial Intelligence',
        year: 2010,
        total_copies: 4,
        available_copies: 0, // In active waiting list queue
        block: 'B',
        floor: 1,
        section: 'Artificial Intelligence',
        rack: 'Rack 12',
        shelf: 'Shelf 04',
        shelf_location: 'Block B, Floor 1, Section: Artificial Intelligence, Rack 12, Shelf 04',
        description: 'Authoritative guide to intelligent agents, neural networks, machine learning, probabilistic reasoning, and robotics.',
        cover_url: 'https://covers.openlibrary.org/b/id/14454944-M.jpg'
      },
      {
        isbn: '9780073523323',
        title: 'Database System Concepts (6th Edition)',
        author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
        genre: 'Database Systems',
        year: 2010,
        total_copies: 5,
        available_copies: 3,
        block: 'A',
        floor: 3,
        section: 'Database Systems',
        rack: 'Rack 06',
        shelf: 'Shelf 02',
        shelf_location: 'Block A, Floor 3, Section: Database Systems, Rack 06, Shelf 02',
        description: 'Comprehensive coverage of relational database engines, SQL querying, concurrency control, ACID transactions, and storage.',
        cover_url: 'https://covers.openlibrary.org/b/id/8282361-M.jpg'
      },
      {
        isbn: '9780132126953',
        title: 'Computer Networks (5th Edition)',
        author: 'Andrew S. Tanenbaum, David J. Wetherall',
        genre: 'Networking',
        year: 2011,
        total_copies: 5,
        available_copies: 3,
        block: 'A',
        floor: 3,
        section: 'Computer Networks',
        rack: 'Rack 09',
        shelf: 'Shelf 01',
        shelf_location: 'Block A, Floor 3, Section: Computer Networks, Rack 09, Shelf 01',
        description: 'Definitive networking text explaining physical media, routing algorithms, transport protocols (TCP/UDP), and DNS.',
        cover_url: 'https://covers.openlibrary.org/b/id/8389650-M.jpg'
      },
      {
        isbn: '9780201633610',
        title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
        author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
        genre: 'Software Architecture',
        year: 1994,
        total_copies: 4,
        available_copies: 3,
        block: 'A',
        floor: 2,
        section: 'Software Engineering',
        rack: 'Rack 04',
        shelf: 'Shelf 03',
        shelf_location: 'Block A, Floor 2, Section: Software Engineering, Rack 04, Shelf 03',
        description: 'Classic Gang of Four reference detailing Creational, Structural, and Behavioral design patterns.',
        cover_url: 'https://covers.openlibrary.org/b/id/8315275-M.jpg'
      },
      {
        isbn: '9781118063330',
        title: 'Operating System Concepts (9th Edition)',
        author: 'Abraham Silberschatz, Peter B. Galvin, Greg Gagne',
        genre: 'Operating Systems',
        year: 2012,
        total_copies: 5,
        available_copies: 4,
        block: 'A',
        floor: 1,
        section: 'Systems Programming',
        rack: 'Rack 02',
        shelf: 'Shelf 05',
        shelf_location: 'Block A, Floor 1, Section: Systems Programming, Rack 02, Shelf 05',
        description: 'Process management, virtual memory paging, CPU scheduling algorithms, file system internals, and POSIX concurrency.',
        cover_url: 'https://covers.openlibrary.org/b/id/8276707-M.jpg'
      },
      {
        isbn: '9781492032649',
        title: 'Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow',
        author: 'Aurélien Géron',
        genre: 'Machine Learning',
        year: 2019,
        total_copies: 4,
        available_copies: 3,
        block: 'B',
        floor: 2,
        section: 'Artificial Intelligence',
        rack: 'Rack 05',
        shelf: 'Shelf 03',
        shelf_location: 'Block B, Floor 2, Section: Artificial Intelligence, Rack 05, Shelf 03',
        description: 'Practical project-driven guide to deep neural nets, transformers, gradient boosting, and scikit-learn pipelines.',
        cover_url: 'https://covers.openlibrary.org/b/id/10524458-M.jpg'
      },
      {
        isbn: '9780134444284',
        title: 'Cryptography and Network Security: Principles and Practice',
        author: 'William Stallings',
        genre: 'Cybersecurity',
        year: 2017,
        total_copies: 4,
        available_copies: 2,
        block: 'C',
        floor: 1,
        section: 'Cyber Physical Systems',
        rack: 'Rack 02',
        shelf: 'Shelf 04',
        shelf_location: 'Block C, Floor 1, Section: Cyber Physical Systems, Rack 02, Shelf 04',
        description: 'Mathematical and practical cryptography: AES, RSA, ECC, hash algorithms, Kerberos authentication, and IPsec.',
        cover_url: 'https://covers.openlibrary.org/b/id/8314120-M.jpg'
      },
      {
        isbn: '9780128000564',
        title: 'Digital Design and Computer Architecture (ARM Edition)',
        author: 'Sarah L. Harris, David Money Harris',
        genre: 'Computer Architecture',
        year: 2015,
        total_copies: 4,
        available_copies: 2,
        block: 'B',
        floor: 1,
        section: 'Hardware & VLSI',
        rack: 'Rack 03',
        shelf: 'Shelf 02',
        shelf_location: 'Block B, Floor 1, Section: Hardware & VLSI, Rack 03, Shelf 02',
        description: 'From transistor logic gates to building a functional pipelined ARM microprocessor core in SystemVerilog.',
        cover_url: 'https://covers.openlibrary.org/b/id/8394411-M.jpg'
      },
      {
        isbn: '9781466468863',
        title: 'Embedded Systems: Real-Time Operating Systems for ARM Cortex-M',
        author: 'Jonathan W. Valvano',
        genre: 'Embedded Systems',
        year: 2017,
        total_copies: 5,
        available_copies: 4,
        block: 'C',
        floor: 1,
        section: 'Cyber Physical Systems',
        rack: 'Rack 01',
        shelf: 'Shelf 01',
        shelf_location: 'Block C, Floor 1, Section: Cyber Physical Systems, Rack 01, Shelf 01',
        description: 'Microcontroller architecture, board-level I/O interfacing, priority thread scheduling, and hardware semaphores.',
        cover_url: 'https://covers.openlibrary.org/b/id/8231991-M.jpg'
      },
      {
        isbn: '9780136156734',
        title: 'Modern Control Engineering (5th Edition)',
        author: 'Katsuhiko Ogata',
        genre: 'Control Systems',
        year: 2010,
        total_copies: 3,
        available_copies: 2,
        block: 'C',
        floor: 2,
        section: 'Instrumentation & Control',
        rack: 'Rack 01',
        shelf: 'Shelf 03',
        shelf_location: 'Block C, Floor 2, Section: Instrumentation & Control, Rack 01, Shelf 03',
        description: 'State-space analysis, root-locus design, frequency-response methods, and PID controller tuning for physical plants.',
        cover_url: 'https://covers.openlibrary.org/b/id/7984852-M.jpg'
      },
      {
        isbn: '9780199339136',
        title: 'Microelectronic Circuits (7th Edition)',
        author: 'Adel S. Sedra, Kenneth C. Smith',
        genre: 'Electronics',
        year: 2014,
        total_copies: 5,
        available_copies: 4,
        block: 'B',
        floor: 1,
        section: 'Electronics Engineering',
        rack: 'Rack 04',
        shelf: 'Shelf 01',
        shelf_location: 'Block B, Floor 1, Section: Electronics Engineering, Rack 04, Shelf 01',
        description: 'The standard text on analog and digital electronic circuits, MOSFET amplifiers, and frequency response.',
        cover_url: 'https://covers.openlibrary.org/b/id/8276856-M.jpg'
      },
      {
        isbn: '9781492056478',
        title: 'Cloud Native DevOps with Kubernetes',
        author: 'John Arundel, Justin Domingus',
        genre: 'Cloud Computing',
        year: 2019,
        total_copies: 4,
        available_copies: 3,
        block: 'A',
        floor: 3,
        section: 'Cloud Infrastructure',
        rack: 'Rack 01',
        shelf: 'Shelf 02',
        shelf_location: 'Block A, Floor 3, Section: Cloud Infrastructure, Rack 01, Shelf 02',
        description: 'Building and running resilient containerized services, Helm chart deployments, ingress traffic, and service meshes.',
        cover_url: 'https://covers.openlibrary.org/b/id/10234710-M.jpg'
      },
      {
        isbn: '9780596517748',
        title: 'JavaScript: The Good Parts',
        author: 'Douglas Crockford',
        genre: 'Web Technologies',
        year: 2008,
        total_copies: 5,
        available_copies: 4,
        block: 'A',
        floor: 2,
        section: 'Web Technologies',
        rack: 'Rack 03',
        shelf: 'Shelf 04',
        shelf_location: 'Block A, Floor 2, Section: Web Technologies, Rack 03, Shelf 04',
        description: 'A deep-dive analysis of closures, prototypical inheritance, object literal patterns, and robust language idioms.',
        cover_url: 'https://covers.openlibrary.org/b/id/7984855-M.jpg'
      }
    ];

    const bookIds = {};
    for (const b of books) {
      const q = `
        INSERT INTO books (isbn, title, author, genre, published_year, total_copies, available_copies, shelf_location, block, floor, section, rack, shelf, description, cover_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id, isbn;
      `;
      const res = await client.query(q, [
        b.isbn, b.title, b.author, b.genre, b.year, b.total_copies, b.available_copies,
        b.shelf_location, b.block, b.floor, b.section, b.rack, b.shelf, b.description, b.cover_url
      ]);
      bookIds[b.isbn] = res.rows[0].id;
    }
    console.log(`✅ Seeded ${books.length} Books with Exact Physical Shelf Coordinates`);

    // 5. Seed Borrow Records (Active, Returned, and Overdue)
    const tanish = usersMap['24054-CPS-062'];
    const varun = usersMap['24054-CPS-018'];
    const ananya = usersMap['24054-CSE-045'];
    const rahul = usersMap['24054-ECE-012'];
    const sneha = usersMap['24054-CPS-033'];
    const saiteja = usersMap['24054-CSE-078'];

    // 5a. Mattawada Tanish — Active Loan (Operating System Concepts)
    await client.query(`
      INSERT INTO borrow_records (user_id, book_id, borrow_date, due_date, status, fine_amount, notes)
      VALUES ($1, $2, CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE + INTERVAL '10 days', 'borrowed', 0.00, 'Issued via Circulation Desk QR Scanner')
    `, [tanish.id, bookIds['9781118063330']]);

    // 5b. Mattawada Tanish — Past History (Clean Code - Returned)
    await client.query(`
      INSERT INTO borrow_records (user_id, book_id, borrow_date, due_date, return_date, status, fine_amount, notes)
      VALUES ($1, $2, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '16 days', CURRENT_DATE - INTERVAL '17 days', 'returned', 0.00, 'Returned on time in good condition')
    `, [tanish.id, bookIds['9780132350884']]);

    // 5c. Varun Kumar — Active Loan (Computer Networks)
    await client.query(`
      INSERT INTO borrow_records (user_id, book_id, borrow_date, due_date, status, fine_amount, notes)
      VALUES ($1, $2, CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '11 days', 'borrowed', 0.00, 'Coursework loan for Networking Laboratory')
    `, [varun.id, bookIds['9780132126953']]);

    // 5d. Ananya Sharma — Active Loan (Hands-On Machine Learning)
    await client.query(`
      INSERT INTO borrow_records (user_id, book_id, borrow_date, due_date, status, fine_amount, notes)
      VALUES ($1, $2, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '12 days', 'borrowed', 0.00, 'Department of Computer Science Capstone Project')
    `, [ananya.id, bookIds['9781492032649']]);

    // 5e. Rahul Varma — Overdue Loan (Digital Design & Computer Architecture - 4 days overdue)
    await client.query(`
      INSERT INTO borrow_records (user_id, book_id, borrow_date, due_date, status, fine_amount, notes)
      VALUES ($1, $2, CURRENT_DATE - INTERVAL '18 days', CURRENT_DATE - INTERVAL '4 days', 'overdue', 8.00, 'Fine rate applied: Rs. 2.00 per overdue day')
    `, [rahul.id, bookIds['9780128000564']]);

    // 5f. Sneha Reddy — Active Loan (Cryptography and Network Security)
    await client.query(`
      INSERT INTO borrow_records (user_id, book_id, borrow_date, due_date, status, fine_amount, notes)
      VALUES ($1, $2, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '9 days', 'borrowed', 0.00, 'Cyber Physical Systems Security reference')
    `, [sneha.id, bookIds['9780134444284']]);

    // 5g. P. Sai Teja — Overdue Loan (Database System Concepts - 6 days overdue)
    await client.query(`
      INSERT INTO borrow_records (user_id, book_id, borrow_date, due_date, status, fine_amount, notes)
      VALUES ($1, $2, CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '6 days', 'overdue', 12.00, 'Fine rate applied: Rs. 2.00 per overdue day')
    `, [saiteja.id, bookIds['9780073523323']]);

    // 5h. Varun Kumar — Returned History (The Pragmatic Programmer)
    await client.query(`
      INSERT INTO borrow_records (user_id, book_id, borrow_date, due_date, return_date, status, fine_amount, notes)
      VALUES ($1, $2, CURRENT_DATE - INTERVAL '45 days', CURRENT_DATE - INTERVAL '31 days', CURRENT_DATE - INTERVAL '32 days', 'returned', 0.00, 'Returned on time')
    `, [varun.id, bookIds['9780135957059']]);

    console.log(`✅ Seeded 8 Borrow Records (Active, Overdue with fine calculations, and Returned)`);

    // 6. Seed Reservations
    // 6a. Tanish — Approved Reservation Ready for Pickup
    await client.query(`
      INSERT INTO reservations (reservation_code, user_id, book_id, preferred_date, timeslot, status, approved_at, pickup_deadline, notes)
      VALUES ('RES-2026-9481', $1, $2, CURRENT_DATE + INTERVAL '1 day', '10:30 AM - 12:00 PM', 'approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '2 days', 'Counter 2 - Hold until 12:00 PM')
    `, [tanish.id, bookIds['9780262033848']]);

    // 6b. Tanish — Pending Reservation awaiting staff review
    await client.query(`
      INSERT INTO reservations (reservation_code, user_id, book_id, preferred_date, timeslot, status, notes)
      VALUES ('RES-2026-3104', $1, $2, CURRENT_DATE + INTERVAL '3 days', '02:30 PM - 04:00 PM', 'pending', 'Student requested afternoon pickup slot')
    `, [tanish.id, bookIds['9780134444284']]);

    // 6c. Varun Kumar — Approved Reservation Ready for Pickup
    await client.query(`
      INSERT INTO reservations (reservation_code, user_id, book_id, preferred_date, timeslot, status, approved_at, pickup_deadline, notes)
      VALUES ('RES-2026-7720', $1, $2, CURRENT_DATE + INTERVAL '1 day', '11:00 AM - 01:00 PM', 'approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '2 days', 'Counter 1 - Collection Desk')
    `, [varun.id, bookIds['9780135957059']]);

    // 6d. Ananya Sharma — Pending Reservation
    await client.query(`
      INSERT INTO reservations (reservation_code, user_id, book_id, preferred_date, timeslot, status, notes)
      VALUES ('RES-2026-5542', $1, $2, CURRENT_DATE + INTERVAL '2 days', '03:00 PM - 04:30 PM', 'pending', 'Awaiting counter allocation')
    `, [ananya.id, bookIds['9781492056478']]);

    console.log(`✅ Seeded 4 Reservations (Approved & Pending)`);

    // 7. Seed Smart Waiting List (For AI: A Modern Approach which is 0 copies available)
    await client.query(`
      INSERT INTO waiting_list (book_id, user_id, queue_position, status)
      VALUES ($1, $2, 1, 'waiting')
    `, [bookIds['9780136042594'], tanish.id]);

    await client.query(`
      INSERT INTO waiting_list (book_id, user_id, queue_position, status)
      VALUES ($1, $2, 2, 'waiting')
    `, [bookIds['9780136042594'], varun.id]);

    await client.query(`
      INSERT INTO waiting_list (book_id, user_id, queue_position, status)
      VALUES ($1, $2, 3, 'waiting')
    `, [bookIds['9780136042594'], usersMap['24054-IOT-022'].id]);

    console.log(`✅ Seeded 3 Smart Waiting List queue positions`);

    // 8. Seed Institutional Announcements
    const announcements = [
      {
        title: 'Central Library Extended Reading Hall Hours for Examinations',
        content: 'In view of upcoming mid-term semester assessments, the Central Library reading halls will remain open from 8:00 AM to 8:30 PM on all instructional days. High-speed academic Wi-Fi and reference desks remain staffed throughout.',
        category: 'announcement'
      },
      {
        title: 'Curriculum Edition Ingestion: 30 Reference Volumes Added',
        content: 'New syllabus-recommended volumes on Cyber Physical Systems, Cryptography, ARM Cortex Embedded Systems, and AI have arrived and been cataloged across Blocks B and C.',
        category: 'arrival'
      },
      {
        title: 'National Digital Library of India (NDLI) Institutional Access',
        content: 'Students can now authenticate on the NDLI national portal using their GIOE institutional email address (@gioe.ac.in) for access to over 60 million peer-reviewed conference proceedings and e-journals.',
        category: 'general'
      },
      {
        title: 'Digital Library Card Circulation Desk Operational Guidelines',
        content: 'Students are requested to generate their dynamic QR code on the Student Portal or Mobile Application before reaching the circulation counter for zero-wait book issue and renewal validation.',
        category: 'announcement'
      }
    ];

    const admin = usersMap['LIB-001'];
    for (const a of announcements) {
      await client.query(`
        INSERT INTO announcements (title, content, category, created_by)
        VALUES ($1, $2, $3, $4)
      `, [a.title, a.content, a.category, admin.id]);
    }
    console.log(`✅ Seeded ${announcements.length} Institutional Announcements`);

    // 9. Seed In-App Notifications for Mattawada Tanish
    const notifs = [
      {
        title: 'Book Checked Out',
        message: 'Operating System Concepts (9th Edition) issued on Nov 10, 2026. Scheduled due date is Nov 24, 2026.',
        type: 'book_issued'
      },
      {
        title: 'Reservation Approved',
        message: 'Your reservation for "Introduction to Algorithms (CLRS)" (Code: RES-2026-9481) has been approved. Please collect at Counter 2 between 10:30 AM and 12:00 PM tomorrow.',
        type: 'reservation_approved'
      },
      {
        title: 'Smart Waiting List Position #1',
        message: 'You have advanced to Queue Position #1 for "Artificial Intelligence: A Modern Approach". You will receive instant priority notification when a returned copy is scanned.',
        type: 'waiting_list_update'
      },
      {
        title: 'Library Hours Extended',
        message: 'Central Library study halls remain open until 8:30 PM this week for semester exam preparations.',
        type: 'general'
      },
      {
        title: 'Digital Membership Card Active',
        message: 'Your institutional library card (LIB-STU-24054062) is active and verified for the 2026-2027 academic session.',
        type: 'membership_verified'
      }
    ];

    for (const n of notifs) {
      await client.query(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES ($1, $2, $3, $4)
      `, [tanish.id, n.title, n.message, n.type]);
    }
    console.log(`✅ Seeded ${notifs.length} In-App Notifications`);

    console.log('\n======================================================');
    console.log('🎉 INSTITUTIONAL CATALOG & STUDENT SEEDING COMPLETE!');
    console.log('======================================================');
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    throw err;
  }
}

module.exports = { seedShowcase };

if (require.main === module) {
  seedShowcase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
