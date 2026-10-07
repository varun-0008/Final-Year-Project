const { query } = require('../config/db');

function esc(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  return "'" + String(val).replace(/'/g, "''") + "'";
}

const books = [
  {
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
    isbn: '9780262033848',
    published_year: 2009,
    genre: 'Algorithms',
    shelf: 'Stack ALG-1',
    cover: 'https://covers.openlibrary.org/b/id/13106560-M.jpg',
    desc: 'Comprehensive textbook on modern computer algorithms and data structures.'
  },
  {
    title: 'The Pragmatic Programmer',
    author: 'David Thomas, Andrew Hunt',
    isbn: '9780135957059',
    published_year: 2019,
    genre: 'Software Engineering',
    shelf: 'Stack SE-2',
    cover: 'https://covers.openlibrary.org/b/id/9309228-M.jpg',
    desc: 'Your journey to mastery: core practices for modern software development.'
  },
  {
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    isbn: '9780132350884',
    published_year: 2008,
    genre: 'Software Engineering',
    shelf: 'Stack SE-1',
    cover: 'https://covers.openlibrary.org/b/id/11183188-M.jpg',
    desc: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees.'
  },
  {
    title: 'Artificial Intelligence: A Modern Approach',
    author: 'Stuart Russell, Peter Norvig',
    isbn: '9780136042594',
    published_year: 2010,
    genre: 'Artificial Intelligence',
    shelf: 'Stack AI-1',
    cover: 'https://covers.openlibrary.org/b/id/14454944-M.jpg',
    desc: 'The authoritative, most widely used and acclaimed introduction to artificial intelligence.'
  },
  {
    title: 'Database System Concepts',
    author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
    isbn: '9780073523323',
    published_year: 2010,
    genre: 'Database Systems',
    shelf: 'Stack DB-1',
    cover: 'https://covers.openlibrary.org/b/id/8282361-M.jpg',
    desc: 'Fundamental concepts of database management and relational database theory.'
  },
  {
    title: 'Computer Networks',
    author: 'Andrew S. Tanenbaum, David J. Wetherall',
    isbn: '9780132126953',
    published_year: 2011,
    genre: 'Computer Science',
    shelf: 'Stack CS-3',
    cover: 'https://covers.openlibrary.org/b/id/8389650-M.jpg',
    desc: 'The definitive introduction to computer networking principles, protocols, and layers.'
  },
  {
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
    isbn: '9780201633610',
    published_year: 1994,
    genre: 'Software Engineering',
    shelf: 'Stack SE-4',
    cover: 'https://covers.openlibrary.org/b/id/8315275-M.jpg',
    desc: 'Captures a wealth of experience in object-oriented design and architecture.'
  },
  {
    title: 'Operating System Concepts',
    author: 'Abraham Silberschatz, Peter B. Galvin, Greg Gagne',
    isbn: '9781118063330',
    published_year: 2012,
    genre: 'Computer Science',
    shelf: 'Stack CS-2',
    cover: 'https://covers.openlibrary.org/b/id/8276707-M.jpg',
    desc: 'Classic reference and textbook on operating system design and internal architectures.'
  }
];

async function seed() {
  console.log('Seeding real books from Open Library catalog...');
  for (const b of books) {
    const sql = `
      INSERT INTO books (isbn, title, author, genre, published_year, total_copies, available_copies, shelf_location, description, cover_url)
      VALUES (${esc(b.isbn)}, ${esc(b.title)}, ${esc(b.author)}, ${esc(b.genre)}, ${esc(b.published_year)}, 5, 5, ${esc(b.shelf)}, ${esc(b.desc)}, ${esc(b.cover)})
      ON CONFLICT (isbn) DO NOTHING;
    `;
    await query(sql);
  }
  console.log(`✅ Seeded ${books.length} real books from Open Library!`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
