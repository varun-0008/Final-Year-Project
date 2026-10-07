const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { PGlite } = require('@electric-sql/pglite');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function seedWithClient(dbClient) {
  // Apply schema
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  if (typeof dbClient.exec === 'function') {
    await dbClient.exec(schemaSql);
  } else {
    await dbClient.query(schemaSql);
  }

  // Hash passwords
  const adminHash = bcrypt.hashSync('admin123', 10);
  const studentHash = bcrypt.hashSync('student123', 10);

  // Insert Chief Librarian Admin Account and ONE Demo Student Account
  const userInsertQuery = `
    INSERT INTO users (name, email, student_id, password_hash, role, phone, department)
    VALUES 
      ('Chief Librarian', 'admin@library.com', 'LIB-001', $1, 'librarian', '+1-555-0100', 'Library Services'),
      ('Demo Student', 'student@college.edu', 'STU-1001', $2, 'student', '+1-555-0199', 'Computer Science')
    RETURNING id, name, email, student_id, role;
  `;
  const usersResult = await dbClient.query(userInsertQuery, [adminHash, studentHash]);
  console.log(`✅ Seeded Administrator account: ${usersResult.rows[0].email} (Password: admin123)`);
  console.log(`✅ Seeded Demo Student account: ${usersResult.rows[1].student_id} / ${usersResult.rows[1].email} (Password: student123)`);

  // Seed real initial books from Open Library catalog
  const realBooks = [
    { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein', isbn: '9780262033848', year: 2009, genre: 'Algorithms', shelf: 'Stack ALG-1', cover: 'https://covers.openlibrary.org/b/id/13106560-M.jpg', desc: 'Comprehensive textbook on modern computer algorithms and data structures.' },
    { title: 'The Pragmatic Programmer', author: 'David Thomas, Andrew Hunt', isbn: '9780135957059', year: 2019, genre: 'Software Engineering', shelf: 'Stack SE-2', cover: 'https://covers.openlibrary.org/b/id/9309228-M.jpg', desc: 'Core practices for modern software development.' },
    { title: 'Clean Code: A Handbook of Agile Software Craftsmanship', author: 'Robert C. Martin', isbn: '9780132350884', year: 2008, genre: 'Software Engineering', shelf: 'Stack SE-1', cover: 'https://covers.openlibrary.org/b/id/11183188-M.jpg', desc: 'A handbook of agile software craftsmanship.' },
    { title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell, Peter Norvig', isbn: '9780136042594', year: 2010, genre: 'Artificial Intelligence', shelf: 'Stack AI-1', cover: 'https://covers.openlibrary.org/b/id/14454944-M.jpg', desc: 'The authoritative introduction to artificial intelligence.' },
    { title: 'Database System Concepts', author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan', isbn: '9780073523323', year: 2010, genre: 'Database Systems', shelf: 'Stack DB-1', cover: 'https://covers.openlibrary.org/b/id/8282361-M.jpg', desc: 'Fundamental concepts of database management and relational theory.' },
    { title: 'Computer Networks', author: 'Andrew S. Tanenbaum, David J. Wetherall', isbn: '9780132126953', year: 2011, genre: 'Computer Science', shelf: 'Stack CS-3', cover: 'https://covers.openlibrary.org/b/id/8389650-M.jpg', desc: 'Principles, protocols, and layers of computer networking.' },
    { title: 'Design Patterns: Elements of Reusable Object-Oriented Software', author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', isbn: '9780201633610', year: 1994, genre: 'Software Engineering', shelf: 'Stack SE-4', cover: 'https://covers.openlibrary.org/b/id/8315275-M.jpg', desc: 'Classic catalog of reusable software design patterns.' },
    { title: 'Operating System Concepts', author: 'Abraham Silberschatz, Peter B. Galvin, Greg Gagne', isbn: '9781118063330', year: 2012, genre: 'Computer Science', shelf: 'Stack CS-2', cover: 'https://covers.openlibrary.org/b/id/8276707-M.jpg', desc: 'Classic reference on operating system design.' }
  ];

  for (const b of realBooks) {
    const esc = v => v === null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`;
    await dbClient.query(`
      INSERT INTO books (isbn, title, author, genre, published_year, total_copies, available_copies, shelf_location, description, cover_url)
      VALUES (${esc(b.isbn)}, ${esc(b.title)}, ${esc(b.author)}, ${esc(b.genre)}, ${b.year}, 5, 5, ${esc(b.shelf)}, ${esc(b.desc)}, ${esc(b.cover)})
      ON CONFLICT (isbn) DO NOTHING;
    `);
  }
  console.log(`✅ Seeded ${realBooks.length} real books from Open Library into catalog.`);
}

async function setupDatabase() {
  const host = process.env.PGHOST || 'localhost';
  const port = parseInt(process.env.PGPORT, 10) || 5432;
  const user = process.env.PGUSER || 'postgres';
  const password = process.env.PGPASSWORD || 'postgres';
  const targetDb = process.env.PGDATABASE || 'library_db';

  console.log(`\n======================================================`);
  console.log(`Checking PostgreSQL connection on ${host}:${port}...`);
  console.log(`======================================================\n`);

  let nativeConnected = false;
  const rootClient = new Client({ host, port, user, password, database: 'postgres' });

  try {
    await rootClient.connect();
    nativeConnected = true;
    console.log('✅ Connected to external PostgreSQL service.');

    const checkDbRes = await rootClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [targetDb]
    );

    if (checkDbRes.rowCount === 0) {
      console.log(`Database "${targetDb}" does not exist. Creating...`);
      await rootClient.query(`CREATE DATABASE "${targetDb}"`);
      console.log(`Database "${targetDb}" created successfully!`);
    } else {
      console.log(`Database "${targetDb}" already exists.`);
    }
  } catch (err) {
    console.log('Notice: External PostgreSQL on port 5432 is not currently running.');
    console.log('-> Automatically setting up the embedded persistent PostgreSQL engine.');
  } finally {
    try { await rootClient.end(); } catch (_) {}
  }

  if (nativeConnected) {
    const dbClient = new Client({ host, port, user, password, database: targetDb });
    try {
      await dbClient.connect();
      console.log(`Applying clean schema to target database "${targetDb}"...`);
      await seedWithClient(dbClient);
      console.log('\n======================================================');
      console.log('✅ External PostgreSQL database setup completed!');
      console.log('======================================================\n');
    } catch (err) {
      console.error('Error applying schema to external PostgreSQL:', err.message);
    } finally {
      await dbClient.end();
    }
  } else {
    // Setup embedded persistent PostgreSQL
    const dataDir = path.join(__dirname, 'pgdata');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const pglite = new PGlite(dataDir);
    try {
      console.log('Applying clean schema to embedded persistent PostgreSQL database...');
      await seedWithClient(pglite);
      console.log('\n======================================================');
      console.log('✅ Embedded PostgreSQL database setup completed!');
      console.log('   Storage location: backend/database/pgdata');
      console.log('======================================================\n');
    } catch (err) {
      console.error('Error setting up embedded PostgreSQL:', err.message);
    } finally {
      await pglite.close();
    }
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = {
  setupDatabase,
  seedWithClient,
};
