const db = require('../config/db');

async function upgradeSchema() {
  console.log('🔄 Upgrading database schema with all advanced modules...');
  const engine = await db.getEngine();
  const client = await db.pool.connect();

  try {
    // 1. Upgrade users table
    console.log('1. Checking and updating users table...');
    const userColumns = [
      { name: 'course', type: "VARCHAR(150) DEFAULT 'Diploma in Cyber Physical Systems and Security'" },
      { name: 'semester', type: "VARCHAR(50) DEFAULT 'Semester V'" },
      { name: 'membership_id', type: 'VARCHAR(50)' },
      { name: 'membership_valid_until', type: "DATE DEFAULT '2027-06-30'" },
      { name: 'borrow_limit', type: 'INT DEFAULT 3' },
      { name: 'photo_url', type: 'VARCHAR(500)' },
      { name: 'reset_token', type: 'VARCHAR(100)' },
      { name: 'reset_token_expires', type: 'TIMESTAMP WITH TIME ZONE' }
    ];

    for (const col of userColumns) {
      try {
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
      } catch (e) {
        // Fallback for engines that don't support ADD COLUMN IF NOT EXISTS in one go
        try {
          await client.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
        } catch (_) {}
      }
    }

    // 2. Upgrade books table with exact shelf coordinates
    console.log('2. Checking and updating books table with exact physical shelf coordinates...');
    const bookColumns = [
      { name: 'block', type: "VARCHAR(20) DEFAULT 'A'" },
      { name: 'floor', type: 'INT DEFAULT 2' },
      { name: 'section', type: "VARCHAR(100) DEFAULT 'Computer Science'" },
      { name: 'rack', type: "VARCHAR(50) DEFAULT 'Rack 08'" },
      { name: 'shelf', type: "VARCHAR(50) DEFAULT 'Shelf 03'" }
    ];

    for (const col of bookColumns) {
      try {
        await client.query(`ALTER TABLE books ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
      } catch (e) {
        try {
          await client.query(`ALTER TABLE books ADD COLUMN ${col.name} ${col.type}`);
        } catch (_) {}
      }
    }

    // 3. Create reservations table
    console.log('3. Creating reservations table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        reservation_code VARCHAR(50) UNIQUE NOT NULL,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        reserved_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        preferred_date DATE NOT NULL,
        timeslot VARCHAR(100) NOT NULL,
        status VARCHAR(30) DEFAULT 'pending',
        rejection_reason TEXT,
        approved_at TIMESTAMP WITH TIME ZONE,
        pickup_deadline TIMESTAMP WITH TIME ZONE,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    try {
      await client.query(`CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_reservations_book ON reservations(book_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);`);
    } catch (_) {}

    // 4. Create waiting_list table
    console.log('4. Creating smart waiting_list table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS waiting_list (
        id SERIAL PRIMARY KEY,
        book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        queue_position INT NOT NULL,
        status VARCHAR(30) DEFAULT 'waiting',
        notified_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    try {
      await client.query(`CREATE INDEX IF NOT EXISTS idx_waiting_book ON waiting_list(book_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_waiting_user ON waiting_list(user_id);`);
    } catch (_) {}

    // 5. Create announcements table
    console.log('5. Creating announcements table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'general',
        created_by INT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Create notifications table
    console.log('6. Creating notifications table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    try {
      await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);`);
    } catch (_) {}

    // 7. Update Demo Student with official GIOE details
    console.log('7. Syncing demo student credentials with GIOE specifications...');
    await client.query(`
      UPDATE users 
      SET 
        name = 'Mattawada Tanish',
        student_id = '24054-CPS-062',
        email = 'tanish.24054cps062@gioe.ac.in',
        department = 'Cyber Physical Systems and Security',
        course = 'Diploma in Cyber Physical Systems and Security',
        semester = 'Semester V',
        membership_id = 'LIB-24054-062',
        membership_valid_until = '2027-06-30',
        borrow_limit = 3,
        photo_url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
      WHERE role = 'student' AND (student_id = 'STU-1001' OR student_id = '24054-CPS-062' OR email = 'student@college.edu' OR id = 2);
    `);

    // 8. Update books with specific exact physical shelf coordinates matching documentation
    console.log('8. Populating exact physical shelf locations for catalog books...');
    const shelfMappings = [
      { isbn: '9780262033848', block: 'A', floor: 2, section: 'Algorithms', rack: 'Rack 08', shelf: 'Shelf 03' }, // CLRS
      { isbn: '9780135957059', block: 'A', floor: 2, section: 'Software Engineering', rack: 'Rack 04', shelf: 'Shelf 02' }, // Pragmatic
      { isbn: '9780132350884', block: 'A', floor: 2, section: 'Software Engineering', rack: 'Rack 04', shelf: 'Shelf 01' }, // Clean Code
      { isbn: '9780136042594', block: 'B', floor: 1, section: 'Artificial Intelligence', rack: 'Rack 12', shelf: 'Shelf 04' }, // AI
      { isbn: '9780073523323', block: 'A', floor: 2, section: 'Computer Science', rack: 'Rack 06', shelf: 'Shelf 02' }, // Database
      { isbn: '9780132126953', block: 'B', floor: 1, section: 'Computer Science', rack: 'Rack 02', shelf: 'Shelf 03' }, // Networks
      { isbn: '9780201633610', block: 'A', floor: 2, section: 'Software Engineering', rack: 'Rack 05', shelf: 'Shelf 03' }, // Design Patterns
      { isbn: '9781118063330', block: 'B', floor: 1, section: 'Computer Science', rack: 'Rack 01', shelf: 'Shelf 02' }  // OS
    ];

    for (const sm of shelfMappings) {
      await client.query(`
        UPDATE books 
        SET 
          block = $1, floor = $2, section = $3, rack = $4, shelf = $5,
          shelf_location = $6
        WHERE isbn = $7;
      `, [sm.block, sm.floor, sm.section, sm.rack, sm.shelf, `Block ${sm.block}, Floor ${sm.floor}, ${sm.section}, ${sm.rack}, ${sm.shelf}`, sm.isbn]);
    }

    // 9. Seed standard campus announcements
    console.log('9. Seeding initial institutional library announcements...');
    const checkAnn = await client.query('SELECT COUNT(*) FROM announcements');
    if (parseInt(checkAnn.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO announcements (title, content, category)
        VALUES 
          ('Welcome to Digital Library Portal 2026', 'All students can now access their Digital Library Card, check real-time exact shelf coordinates, and reserve physical volumes online.', 'general'),
          ('New Cyber Physical Systems Books Available', 'Latest editions on Embedded Systems, RTOS, and IoT Security have arrived at Block A, Floor 2, Rack 08.', 'new_arrival'),
          ('Library Holiday Notice - State Day', 'Central Library circulation desk will remain closed on Saturday for State Festival. Online digital catalog and reservations remain active 24/7.', 'holiday');
      `);
    }

    // 10. Seed demo notifications for Demo Student
    console.log('10. Seeding welcome notification...');
    const studentUser = await client.query("SELECT id FROM users WHERE role = 'student' LIMIT 1");
    if (studentUser.rowCount > 0) {
      const sId = studentUser.rows[0].id;
      const checkNotif = await client.query('SELECT COUNT(*) FROM notifications WHERE user_id = $1', [sId]);
      if (parseInt(checkNotif.rows[0].count) === 0) {
        await client.query(`
          INSERT INTO notifications (user_id, title, message, type)
          VALUES 
            ($1, 'Digital Membership Card Activated', 'Your digital library identity card (LIB-24054-062) is active with borrowing limit of 3 books.', 'general'),
            ($1, 'Welcome to Smart Campus Library', 'Use the Book Finder Exact Shelf Locator to navigate directly to your required rack and shelf in Block A, Floor 2.', 'general');
        `, [sId]);
      }
    }

    console.log('✅ Database upgrade and feature seeding completed successfully!');
  } catch (err) {
    console.error('❌ Error upgrading database schema:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  upgradeSchema()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = upgradeSchema;
