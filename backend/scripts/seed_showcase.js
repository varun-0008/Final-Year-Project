// Smart Campus Library — Production Showcase Data Seeder
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function seedShowcase(customClient = null) {
  const client = customClient || require('../config/db');
  console.log('🌱 Seeding complete production-grade showcase data...');

  try {
    // 0. Ensure schema and tables exist first
    try {
      const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        if (typeof client.exec === 'function') {
          await client.exec(schemaSql);
        } else {
          await client.query(schemaSql);
        }
      }
    } catch (e) {
      console.warn('Notice applying schema.sql:', e.message);
    }

    // 1. Password Hashes
    const adminHash = bcrypt.hashSync('admin123', 10);
    const studentHash = bcrypt.hashSync('student123', 10);

    // 2. Clear Existing Data (Clean reset for showcase)
    try {
      await client.query('DELETE FROM notifications');
      await client.query('DELETE FROM waiting_list');
      await client.query('DELETE FROM reservations');
      await client.query('DELETE FROM borrow_records');
      await client.query('DELETE FROM announcements');
      await client.query('DELETE FROM books');
      await client.query('DELETE FROM users');
    } catch (_) {}

    // Reset sequences if supported
    try {
      await client.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
      await client.query('ALTER SEQUENCE books_id_seq RESTART WITH 1');
      await client.query('ALTER SEQUENCE borrow_records_id_seq RESTART WITH 1');
      await client.query('ALTER SEQUENCE reservations_id_seq RESTART WITH 1');
      await client.query('ALTER SEQUENCE waiting_list_id_seq RESTART WITH 1');
      await client.query('ALTER SEQUENCE announcements_id_seq RESTART WITH 1');
      await client.query('ALTER SEQUENCE notifications_id_seq RESTART WITH 1');
    } catch (_) {}

    // 3. Seed Users (1 Admin, 3 Students)
    const userInsert = `
      INSERT INTO users (name, email, student_id, password_hash, role, phone, department, course, semester, membership_id, membership_valid_until, borrow_limit)
      VALUES 
        ('Chief Librarian', 'admin@library.com', 'LIB-001', $1, 'librarian', '+91-9876543210', 'Library Administration', 'Central Administration', 'Staff', 'LIB-ADM-001', '2030-12-31', 10),
        ('Demo Student', 'student@college.edu', 'STU-1001', $2, 'student', '+91-9876543299', 'Computer Science and Engineering', 'Diploma in Computer Science and Engineering', 'Semester V', 'LIB-STU-1001', '2027-06-30', 3),
        ('Mattawada Tanish', 'tanish.24054cps062@gioe.ac.in', '24054-CPS-062', $2, 'student', '+91-9848012345', 'Cyber Physical Systems and Security', 'Diploma in Cyber Physical Systems and Security', 'Semester V', 'LIB-STU-24054062', '2027-06-30', 3),
        ('Varun Kumar', 'varun.24054cps018@gioe.ac.in', '24054-CPS-018', $2, 'student', '+91-9848054321', 'Cyber Physical Systems and Security', 'Diploma in Cyber Physical Systems and Security', 'Semester V', 'LIB-STU-24054018', '2027-06-30', 3),
        ('Ananya Sharma', 'ananya.24054cps045@gioe.ac.in', '24054-CPS-045', $2, 'student', '+91-9848098765', 'Computer Science and Engineering', 'Diploma in Computer Science and Engineering', 'Semester V', 'LIB-STU-24054045', '2027-06-30', 3)
      RETURNING id, name, email, student_id, role;
    `;
    const usersRes = await client.query(userInsert, [adminHash, studentHash]);
    const adminUser = usersRes.rows[0];
    const tanishUser = usersRes.rows[1];
    const varunUser = usersRes.rows[2];
    const ananyaUser = usersRes.rows[3];
    console.log(`✅ Seeded 4 Users: 1 Admin & 3 Students`);

    // 4. Seed Books with Exact Shelf Coordinates
    const books = [
      {
        isbn: '9780262033848',
        title: 'Introduction to Algorithms (CLRS)',
        author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
        genre: 'Algorithms',
        year: 2009,
        total_copies: 5,
        available_copies: 4,
        block: 'A',
        floor: 2,
        section: 'Algorithms',
        rack: 'Rack 08',
        shelf: 'Shelf 03',
        shelf_location: 'Block A, Floor 2, Section: Algorithms, Rack 08, Shelf 03',
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
        total_copies: 3,
        available_copies: 0, // OUT OF STOCK TO SHOWCASE SMART WAITING LIST!
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
        available_copies: 5,
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
        genre: 'Computer Science',
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
        genre: 'Software Engineering',
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
        genre: 'Computer Science',
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
    console.log(`✅ Seeded ${books.length} Books with Physical Coordinates`);

    // 5. Seed Borrow Records (Active, Returned, and Overdue)
    // 5a. Mattawada Tanish — Active Loan (Clean Code)
    await client.query(`
      INSERT INTO borrow_records (user_id, book_id, borrow_date, due_date, status, fine_amount, notes)
      VALUES ($1, $2, CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE + INTERVAL '10 days', 'borrowed', 0.00, 'Checked out via Desk Scan & Go')
    `, [tanishUser.id, bookIds['9780132350884']]);

    // 5b. Mattawada Tanish — Past History (Pragmatic Programmer - Returned)
    await client.query(`
      INSERT INTO borrow_records (user_id, book_id, borrow_date, due_date, return_date, status, fine_amount, notes)
      VALUES ($1, $2, CURRENT_DATE - INTERVAL '28 days', CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE - INTERVAL '15 days', 'returned', 0.00, 'Returned on time in pristine condition')
    `, [tanishUser.id, bookIds['9780135957059']]);

    // 5c. Varun Kumar — Overdue Loan (Computer Networks - 6 Days Overdue for Fine Showcase!)
    await client.query(`
      INSERT INTO borrow_records (user_id, book_id, borrow_date, due_date, status, fine_amount, notes)
      VALUES ($1, $2, CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '6 days', 'overdue', 6.00, 'Automated overdue fine applied ($1.00/day)')
    `, [varunUser.id, bookIds['9780132126953']]);

    // 5d. Ananya Sharma — Active Loan (Intro to Algorithms)
    await client.query(`
      INSERT INTO borrow_records (user_id, book_id, borrow_date, due_date, status, fine_amount, notes)
      VALUES ($1, $2, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '12 days', 'borrowed', 0.00, 'Issued for Algorithm Design coursework')
    `, [ananyaUser.id, bookIds['9780262033848']]);

    console.log(`✅ Seeded 4 Borrow Records (Active, Overdue, Returned)`);

    // 6. Seed Reservations for Mattawada Tanish
    // 6a. Approved Reservation Ready for Pickup
    await client.query(`
      INSERT INTO reservations (reservation_code, user_id, book_id, preferred_date, timeslot, status, approved_at, pickup_deadline, notes)
      VALUES ('RES-2026-9481', $1, $2, CURRENT_DATE + INTERVAL '1 day', '10:00 AM - 12:00 PM', 'approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '2 days', 'Librarian approved for morning pickup slot')
    `, [tanishUser.id, bookIds['9781118063330']]);

    // 6b. Pending Reservation awaiting librarian review
    await client.query(`
      INSERT INTO reservations (reservation_code, user_id, book_id, preferred_date, timeslot, status, notes)
      VALUES ('RES-2026-3104', $1, $2, CURRENT_DATE + INTERVAL '3 days', '02:00 PM - 04:00 PM', 'pending', 'Student requested afternoon collection')
    `, [tanishUser.id, bookIds['9780073523323']]);
    console.log(`✅ Seeded 2 Reservations for Mattawada Tanish (1 Approved, 1 Pending)`);

    // 7. Seed Smart Waiting List (For AI: A Modern Approach which is 0 copies)
    // Position 1: Mattawada Tanish
    await client.query(`
      INSERT INTO waiting_list (book_id, user_id, queue_position, status)
      VALUES ($1, $2, 1, 'waiting')
    `, [bookIds['9780136042594'], tanishUser.id]);

    // Position 2: Varun Kumar
    await client.query(`
      INSERT INTO waiting_list (book_id, user_id, queue_position, status)
      VALUES ($1, $2, 2, 'waiting')
    `, [bookIds['9780136042594'], varunUser.id]);
    console.log(`✅ Seeded 2 Waiting List queue positions (Tanish is #1, Varun is #2)`);

    // 8. Seed Campus Announcements
    const announcements = [
      {
        title: '⚡ Digital Library Card & Self-Checkout Live at Desk',
        content: 'All students can now present their dynamic 2D QR card on the Student Web or Mobile App at the Central Circulation desk for instantaneous check-ins and returns.',
        category: 'announcement'
      },
      {
        title: '📚 New Arrival: 25 Reference Volumes on AI and Cyber Physical Systems',
        content: 'The Department of Technical Education has allocated new curriculum editions located in Block B, Floor 1, Section: Artificial Intelligence (Racks 12-14).',
        category: 'arrival'
      },
      {
        title: '⏱️ Extended Reading Hall Hours for Mid-Semester Exams',
        content: 'The Central Library reading hall will remain open until 10:00 PM on weekdays with high-speed campus Wi-Fi and reference support.',
        category: 'general'
      },
      {
        title: '📢 Public Holiday: Library Closed on Friday for Regional Holiday',
        content: 'Physical circulation counters will be closed this Friday. Online catalog search, reservations, and digital cards remain operational 24/7.',
        category: 'holiday'
      }
    ];

    for (const a of announcements) {
      await client.query(`
        INSERT INTO announcements (title, content, category, created_by)
        VALUES ($1, $2, $3, $4)
      `, [a.title, a.content, a.category, adminUser.id]);
    }
    console.log(`✅ Seeded ${announcements.length} Campus Announcements`);

    // 9. Seed In-App Notifications for Mattawada Tanish (Module 7)
    const notifs = [
      {
        title: '📋 Reservation Approved',
        message: 'Your reservation for "Operating System Concepts" (Code: RES-2026-9481) has been approved! Ready for pickup tomorrow at 10:00 AM.',
        type: 'reservation_approved'
      },
      {
        title: '⏳ Smart Waiting List Position #1',
        message: 'You are currently position #1 in queue for "Artificial Intelligence: A Modern Approach". You will receive instant priority when a volume is returned.',
        type: 'waiting_list_update'
      },
      {
        title: '⏰ Upcoming Return Deadline',
        message: 'Friendly reminder: "Clean Code: A Handbook of Agile Software Craftsmanship" is due on November 23, 2026.',
        type: 'return_reminder'
      },
      {
        title: '📚 New Book Arrival Alert',
        message: '25 new reference volumes on Cyber Physical Systems and Embedded Security have arrived in Block B, Floor 1.',
        type: 'book_arrival'
      },
      {
        title: '🪪 Digital Membership Card Active',
        message: 'Your digital card is verified with registration 24054-CPS-062 and valid until June 30, 2027.',
        type: 'membership_verified'
      }
    ];

    for (const n of notifs) {
      await client.query(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES ($1, $2, $3, $4)
      `, [tanishUser.id, n.title, n.message, n.type]);
    }
    console.log(`✅ Seeded ${notifs.length} In-App Notifications for Mattawada Tanish`);

    console.log('\n======================================================');
    console.log('🎉 SHOWCASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('   - 1 Admin + 3 Students');
    console.log('   - 8 Books with exact shelf locations');
    console.log('   - Active, Returned, and Overdue Loans');
    console.log('   - Approved & Pending Reservations');
    console.log('   - Smart Waiting List with #1 in queue');
    console.log('   - 4 Announcements & 5 Real-Time Notifications');
    console.log('======================================================\n');

  } catch (err) {
    console.error('❌ Error seeding showcase data:', err);
  } finally {
    if (require.main === module) process.exit(0);
  }
}

seedShowcase();

module.exports = { seedShowcase };
