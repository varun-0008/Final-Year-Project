const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const outputPath = path.join(__dirname, '..', '..', 'docs', 'Campus_Library_System_Professor_Review.pdf');
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 32, bottom: 32, left: 36, right: 36 },
  autoFirstPage: true,
  bufferPages: true
});

const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// Color Palette
const NAVY = '#1E3A8A';
const INDIGO = '#2563EB';
const DARK_SLATE = '#0F172A';
const BODY_COLOR = '#334155';
const MUTED_COLOR = '#64748B';
const CARD_BG = '#F8FAFC';
const CARD_BORDER = '#CBD5E1';
const ACCENT_GREEN = '#059669';
const WHITE = '#FFFFFF';

function drawHeaderBanner(title, subtitle, meta) {
  doc.rect(36, 32, 523, 62).fill(DARK_SLATE);
  doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(14).text(title, 48, 42);
  doc.font('Helvetica').fontSize(9.5).fillColor('#94A3B8').text(subtitle, 48, 60);
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#38BDF8').text(meta, 48, 76);
  doc.y = 104;
}

function drawSectionHeading(num, text) {
  const y = doc.y;
  doc.rect(36, y, 4, 16).fill(NAVY);
  doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(11.5).text(`${num}. ${text}`, 46, y + 2);
  doc.y = y + 21;
}

function drawSubheading(text) {
  doc.fillColor(DARK_SLATE).font('Helvetica-Bold').fontSize(9.5).text(text, 36, doc.y);
  doc.y += 3;
}

// ================= PAGE 1 =================
drawHeaderBanner(
  'FINAL YEAR ENGINEERING PROJECT REVIEW',
  'Campus Library Management System: A Dual-Client Native & Web Architecture',
  'AUTHOR: Final Year Project Team  |  DEPARTMENT: Computer Science & Engineering  |  DATE: October 2026'
);

doc.moveDown(0.2);
drawSectionHeading('1', 'Project Abstract & Executive Overview');

doc.font('Helvetica').fontSize(8.5).fillColor(BODY_COLOR).text(
  'The Campus Library Management System is a production-grade enterprise application designed to resolve the inefficiencies of traditional manual and legacy desktop library management. The solution bridges student convenience and administrative security by uniting two dedicated client platforms through a robust RESTful API backend:',
  { lineGap: 2 }
);
doc.moveDown(0.3);

// 4 Metric Highlight Cards
const cardY = doc.y;
const cardWidth = 124;
const cardHeight = 48;
const cards = [
  { label: 'CORE STACK', val: 'Node.js + Kotlin', sub: 'Zero extra frameworks' },
  { label: 'DATABASE', val: 'PostgreSQL', sub: 'Native 5432 & PGlite' },
  { label: 'REAL DATA', val: 'Open Library', sub: 'Internet Archive API' },
  { label: 'BULK IMPORT', val: 'MS Excel (.xlsx)', sub: 'Multi-student batch' }
];

cards.forEach((c, idx) => {
  const x = 36 + idx * (cardWidth + 9);
  doc.rect(x, cardY, cardWidth, cardHeight).fillAndStroke(CARD_BG, CARD_BORDER);
  doc.rect(x, cardY, cardWidth, 3).fill(NAVY);
  doc.fillColor(MUTED_COLOR).font('Helvetica-Bold').fontSize(7).text(c.label, x + 8, cardY + 7);
  doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(10).text(c.val, x + 8, cardY + 18);
  doc.fillColor(BODY_COLOR).font('Helvetica').fontSize(7).text(c.sub, x + 8, cardY + 33);
});

doc.y = cardY + cardHeight + 10;

drawSectionHeading('2', 'Architectural Constraints & Stack Adherence');
doc.font('Helvetica').fontSize(8).fillColor(BODY_COLOR).text(
  'Per strict academic project specifications, this project has been built strictly without third-party frameworks like React, Angular, Vue, Spring, or Django. It adheres strictly to the sanctioned stack:',
  { lineGap: 1.5 }
);
doc.moveDown(0.2);

// Technology breakdown table
const techRows = [
  ['Component / Layer', 'Sanctioned Technology', 'Implementation Details & Engineering Scope'],
  ['Student Mobile Client', 'Native Android / Kotlin', 'Retrofit2, OkHttp3, Material 3, ViewBinding, SharedPreferences JWT Session.'],
  ['Admin Web Portal', 'Vanilla HTML5 / CSS3 / JS', 'Zero frontend framework, CSS Grid/Flexbox, dynamic SPA routing, modal workflows.'],
  ['API Backend', 'Node.js (v24) + Express', 'RESTful API architecture, JWT token authentication, Multer file upload parsing.'],
  ['Relational Database', 'PostgreSQL Dual-Engine', 'ACID-compliant tables, foreign keys, ON DELETE CASCADE, PGlite persistent fallback.'],
  ['External Data Integration', 'Open Library (Internet Archive)', 'Direct REST integration with openlibrary.org for live book search, covers, & ISBN auto-fill.'],
  ['Bulk Spreadsheet Engine', 'SheetJS (xlsx) Engine', 'Pure binary parser and workbook generator for Microsoft Excel (.xlsx/.xls/.csv).']
];

let tableY = doc.y;
techRows.forEach((row, i) => {
  const isHeader = i === 0;
  const h = isHeader ? 15 : 16;
  doc.rect(36, tableY, 523, h).fill(isHeader ? NAVY : (i % 2 === 0 ? '#F8FAFC' : WHITE));
  doc.rect(36, tableY, 523, h).stroke(CARD_BORDER);

  doc.font('Helvetica-Bold').fontSize(7)
     .fillColor(isHeader ? WHITE : DARK_SLATE)
     .text(row[0], 42, tableY + (isHeader ? 4 : 4.5), { width: 110 });

  doc.font('Helvetica-Bold').fontSize(7)
     .fillColor(isHeader ? WHITE : INDIGO)
     .text(row[1], 156, tableY + (isHeader ? 4 : 4.5), { width: 120 });

  doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(7)
     .fillColor(isHeader ? WHITE : BODY_COLOR)
     .text(row[2], 280, tableY + (isHeader ? 4 : 4.5), { width: 275 });

  tableY += h;
});

doc.y = tableY + 10;

drawSectionHeading('3', 'System Architecture & High-Level Topology');
doc.font('Helvetica').fontSize(8).fillColor(BODY_COLOR).text(
  'The system follows a classic 3-Tier Enterprise Client-Server Architecture where both clients interact with a unified REST API backend, enforcing centralized security, business logic, and transactional database integrity.',
  { lineGap: 1.5 }
);
doc.moveDown(0.2);

// Architectural Box Representation
const archY = doc.y;
const clientBoxW = 255;
const clientBoxH = 58;

// Student App Box
doc.rect(36, archY, clientBoxW, clientBoxH).fillAndStroke(CARD_BG, CARD_BORDER);
doc.rect(36, archY, clientBoxW, 3).fill(INDIGO);
doc.fillColor(INDIGO).font('Helvetica-Bold').fontSize(8).text('STUDENT MOBILE CLIENT (KOTLIN)', 46, archY + 7);
doc.fillColor(BODY_COLOR).font('Helvetica').fontSize(7).text(
  '• Material 3 UI with Live Search & Category Chips\n• My Loans dashboard with Due Date & Overdue countdowns\n• Strict View-Only Access (Cannot issue or tamper with loans)',
  46, archY + 20, { lineGap: 1.5 }
);

// Admin Portal Box
doc.rect(304, archY, clientBoxW, clientBoxH).fillAndStroke(CARD_BG, CARD_BORDER);
doc.rect(304, archY, clientBoxW, 3).fill(NAVY);
doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(8).text('LIBRARIAN ADMIN PORTAL (VANILLA WEB)', 314, archY + 7);
doc.fillColor(BODY_COLOR).font('Helvetica').fontSize(7).text(
  '• Circulation Desk: Issue books & record returns with fines\n• Open Library Explorer: Live search & 1-click import\n• Excel Student Batch: Download template & upload roster',
  314, archY + 20, { lineGap: 1.5 }
);

// Central Backend Box
const backendY = archY + clientBoxH + 8;
doc.rect(36, backendY, 523, 46).fillAndStroke('#EFF6FF', '#BFDBFE');
doc.rect(36, backendY, 523, 3).fill(NAVY);
doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(8.5).text('UNIFIED REST API BACKEND & DATABASE TIER (NODE.JS + POSTGRESQL)', 48, backendY + 7);
doc.fillColor(BODY_COLOR).font('Helvetica').fontSize(7).text(
  '• Middleware: authenticateToken (JWT verification) | requireLibrarian (403 Forbidden enforcement)\n• PostgreSQL Relational Tables: users (students & librarians), books (catalog & stock), borrow_records (active & history)\n• External Gateway: openlibrary.org API client with error handling & cover image parsing',
  48, backendY + 18, { lineGap: 1.5 }
);

// ================= PAGE 2 =================
doc.addPage();

drawHeaderBanner(
  'FINAL YEAR ENGINEERING PROJECT REVIEW',
  'Section II: Relational Schema, Security Model & Novel Features',
  'CORE FOCUS: Database Normalization, RBAC Protection & External API Integration'
);

doc.moveDown(0.2);
drawSectionHeading('4', 'Relational Database Design & Schema Specifications');
doc.font('Helvetica').fontSize(8).fillColor(BODY_COLOR).text(
  'The database is engineered in third normal form (3NF) to eliminate data redundancy and preserve referential integrity across all transactional operations. Dual-engine support enables native PostgreSQL or embedded zero-config PGlite.',
  { lineGap: 1.5 }
);
doc.moveDown(0.2);

// Table schemas
const dbTables = [
  {
    name: 'users',
    desc: 'Stores student and librarian accounts. Passwords securely hashed via bcryptjs (10 salt rounds).',
    cols: 'id (PK SERIAL), name (VARCHAR 100), email (VARCHAR 150 UNIQUE), student_id (VARCHAR 50 UNIQUE), password_hash (VARCHAR 255), role (VARCHAR: student | librarian), department (VARCHAR 100), phone (VARCHAR 20), created_at (TIMESTAMP)'
  },
  {
    name: 'books',
    desc: 'Inventory catalog holding bibliographic details, total/available copies, shelf tags, and Open Library artwork.',
    cols: 'id (PK SERIAL), isbn (VARCHAR 50 UNIQUE), title (VARCHAR 255), author (VARCHAR 255), genre (VARCHAR 100), published_year (INT), total_copies (INT DEFAULT 1), available_copies (INT DEFAULT 1), shelf_location (VARCHAR 50), description (TEXT), cover_url (TEXT), created_at (TIMESTAMP)'
  },
  {
    name: 'borrow_records',
    desc: 'Maintains lending ledger with foreign keys to users and books. Enforces loan periods, return dates, and fine amounts.',
    cols: 'id (PK SERIAL), user_id (FK -> users.id ON DELETE CASCADE), book_id (FK -> books.id ON DELETE RESTRICT), issue_date (DATE), due_date (DATE), return_date (DATE NULL), status (VARCHAR: active | returned | overdue), fine_amount (NUMERIC(8,2) DEFAULT 0.00)'
  }
];

dbTables.forEach(t => {
  const y = doc.y;
  doc.rect(36, y, 523, 40).fillAndStroke(CARD_BG, CARD_BORDER);
  doc.rect(36, y, 4, 40).fill(INDIGO);
  doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(8).text(`Table: ${t.name}`, 46, y + 5);
  doc.fillColor(BODY_COLOR).font('Helvetica').fontSize(7).text(t.desc, 46, y + 15, { width: 505 });
  doc.fillColor(DARK_SLATE).font('Courier-Bold').fontSize(6.5).text(t.cols, 46, y + 26, { width: 505 });
  doc.y = y + 45;
});

doc.moveDown(0.2);
drawSectionHeading('5', 'Role-Based Access Control (RBAC) & Security Enforcement');
doc.font('Helvetica').fontSize(8).fillColor(BODY_COLOR).text(
  'A core academic requirement is that student loan issuance is strictly restricted to librarians. The system enforces multi-tier security:',
  { lineGap: 1.5 }
);
doc.moveDown(0.2);

const rbacPoints = [
  {
    title: '1. Stateless JWT Authentication',
    detail: 'Users receive a signed JSON Web Token upon validating credentials at /api/auth/login. The payload encapsulates user ID, email, student ID, and role. Token expiration is configured to 7 days.'
  },
  {
    title: '2. requireLibrarian Middleware (Strict 403 Forbidden)',
    detail: 'Protected administrative routes (POST /api/borrow/issue, POST /api/borrow/return/:id, POST /api/books, POST /api/books/openlibrary/import, POST /api/auth/students/upload) intercept requests. If req.user.role !== "librarian", the request is immediately terminated with HTTP 403 Forbidden.'
  },
  {
    title: '3. Data Isolation for Students',
    detail: 'Students can only query their own loan records via GET /api/borrow/my-books, which binds exclusively to req.user.id extracted from the cryptographically verified JWT token, preventing cross-student data leakage.'
  },
  {
    title: '4. Cryptographic Password Hashing',
    detail: 'Passwords are never stored in plain text. All passwords (registered manually or imported via Excel) undergo salted one-way hashing with bcryptjs using 10 rounds of salt before database insertion.'
  }
];

rbacPoints.forEach(p => {
  doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(7.5).text(p.title, 36, doc.y);
  doc.fillColor(BODY_COLOR).font('Helvetica').fontSize(7).text(p.detail, 46, doc.y + 2, { width: 513, lineGap: 1.5 });
  doc.y += 16;
});

doc.moveDown(0.2);
drawSectionHeading('6', 'Novel Feature Implementations');

drawSubheading('A. Open Library Integration by Internet Archive (openlibrary.org)');
doc.font('Helvetica').fontSize(7.5).fillColor(BODY_COLOR).text(
  'Instead of static, mock catalog entries, the application features an enterprise integration with the Internet Archive Open Library API:\n' +
  '• Live Catalog Search: Librarians query millions of real published books directly inside the portal (title, author, year, edition, and cover thumbnail).\n' +
  '• 1-Click Catalog Import: Automatically imports selected titles into PostgreSQL with custom copies and shelf location.\n' +
  '• ISBN Auto-Fill: When adding individual titles, entering a 10 or 13-digit ISBN automatically retrieves full bibliographic metadata.',
  { lineGap: 1.5 }
);
doc.moveDown(0.3);

drawSubheading('B. Bulk Student Onboarding via Microsoft Excel (.xlsx / .csv)');
doc.font('Helvetica').fontSize(7.5).fillColor(BODY_COLOR).text(
  'To support real-world university rollouts with hundreds of incoming students, the system provides bulk onboarding:\n' +
  '• Genuine Binary Excel Template: Downloadable via GET /api/auth/students/template as a real Microsoft Excel .xlsx workbook.\n' +
  '• Smart Column Mapping & Validation: Handles flexible headers (Full Name, Email, Student ID, Phone, Department, Initial Password).\n' +
  '• Duplicate Prevention & Batch Report: Skips duplicate student IDs/emails and provides an exact summary report (created vs skipped).',
  { lineGap: 1.5 }
);

// ================= PAGE 3 =================
doc.addPage();

drawHeaderBanner(
  'FINAL YEAR ENGINEERING PROJECT REVIEW',
  'Section III: Verification Matrix, Test Results & Academic Sign-Off',
  'STATUS: Complete Integration Verified  |  NATIVE MOBILE + WEB + API VALIDATED'
);

doc.moveDown(0.2);
drawSectionHeading('7', 'Comprehensive Test & Verification Matrix');
doc.font('Helvetica').fontSize(8).fillColor(BODY_COLOR).text(
  'The complete application has undergone exhaustive end-to-end integration and security testing. All test scenarios have passed successfully:',
  { lineGap: 1.5 }
);
doc.moveDown(0.2);

const testMatrix = [
  ['ID', 'Test Scenario', 'Execution & Payload', 'Expected & Verified Outcome', 'Status'],
  ['TC-01', 'Librarian Authentication', 'POST /api/auth/login (admin@library.com)', 'HTTP 200 OK, JWT issued with role: librarian', 'PASSED'],
  ['TC-02', 'Demo Student Login', 'POST /api/auth/login (student@college.edu)', 'HTTP 200 OK, JWT issued with role: student', 'PASSED'],
  ['TC-03', 'Student Loan Tamper Block', 'Student token calling POST /api/borrow/issue', 'HTTP 403 Forbidden ("Librarian access required")', 'PASSED'],
  ['TC-04', 'Student Catalog Retrieval', 'GET /api/books with student JWT', 'HTTP 200 OK, 8 real Open Library books loaded', 'PASSED'],
  ['TC-05', 'Binary Excel Template Download', 'GET /api/auth/students/template', 'HTTP 200 OK, binary application/vnd.openxmlformats (.xlsx)', 'PASSED'],
  ['TC-06', 'Open Library Live Proxy', 'GET /api/books/openlibrary/search?q=harry+potter', 'HTTP 200 OK, live data & cover URLs from openlibrary.org', 'PASSED'],
  ['TC-07', 'Excel Batch Student Import', 'POST /api/auth/students/upload with .xlsx file', 'HTTP 201 Created, batch created/skipped summary returned', 'PASSED'],
  ['TC-08', 'Circulation Fine Calculation', 'POST /api/borrow/return/:id on overdue book', 'HTTP 200 OK, fine computed ($0.50/day overdue), stock +1', 'PASSED'],
  ['TC-09', 'Native Android Mobile Execution', 'Kotlin app running on Android Emulator', 'Full catalog rendering with shelf location & live stock', 'PASSED']
];

let testTableY = doc.y;
testMatrix.forEach((row, i) => {
  const isHeader = i === 0;
  const h = isHeader ? 15 : 16;
  doc.rect(36, testTableY, 523, h).fill(isHeader ? NAVY : (i % 2 === 0 ? '#F8FAFC' : WHITE));
  doc.rect(36, testTableY, 523, h).stroke(CARD_BORDER);

  doc.font('Helvetica-Bold').fontSize(7).fillColor(isHeader ? WHITE : DARK_SLATE)
     .text(row[0], 40, testTableY + (isHeader ? 4 : 4.5), { width: 32 });

  doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica-Bold').fontSize(7)
     .fillColor(isHeader ? WHITE : INDIGO)
     .text(row[1], 75, testTableY + (isHeader ? 4 : 4.5), { width: 110 });

  doc.font('Helvetica').fontSize(6.5).fillColor(isHeader ? WHITE : BODY_COLOR)
     .text(row[2], 190, testTableY + (isHeader ? 4 : 4.5), { width: 140 });

  doc.font('Helvetica').fontSize(6.5).fillColor(isHeader ? WHITE : BODY_COLOR)
     .text(row[3], 335, testTableY + (isHeader ? 4 : 4.5), { width: 170 });

  doc.font('Helvetica-Bold').fontSize(7)
     .fillColor(isHeader ? WHITE : ACCENT_GREEN)
     .text(row[4], 510, testTableY + (isHeader ? 4 : 4.5), { width: 45 });

  testTableY += h;
});

doc.y = testTableY + 12;

drawSectionHeading('8', 'Current Deployed State & Demonstration Credentials');
doc.font('Helvetica').fontSize(8).fillColor(BODY_COLOR).text(
  'The live test environment is operational and configured for evaluation:',
  { lineGap: 1.5 }
);
doc.moveDown(0.2);

const demoCreds = [
  { role: 'CHIEF LIBRARIAN (ADMIN)', creds: 'admin@library.com\nPassword: admin123 (LIB-001)', access: 'Admin Portal (http://localhost:5000)' },
  { role: 'DEMO STUDENT', creds: 'student@college.edu\nPassword: student123 (STU-1001)', access: 'Native Android App & Student APIs' },
  { role: 'LIVE CATALOG', creds: '8 Real Engineering Books\nwith Open Library Cover Art', access: 'Sourced from Open Library (Internet Archive)' }
];

const credY = doc.y;
demoCreds.forEach((c, idx) => {
  const x = 36 + idx * (168 + 9);
  doc.rect(x, credY, 168, 48).fillAndStroke(CARD_BG, CARD_BORDER);
  doc.rect(x, credY, 168, 3).fill(NAVY);
  doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(7).text(c.role, x + 6, credY + 6);
  doc.fillColor(DARK_SLATE).font('Helvetica-Bold').fontSize(7).text(c.creds, x + 6, credY + 17, { width: 156, lineGap: 1.5 });
  doc.fillColor(MUTED_COLOR).font('Helvetica').fontSize(6.5).text(c.access, x + 6, credY + 36);
});

doc.y = credY + 48 + 12;

drawSectionHeading('9', 'Conclusion & Project Sign-Off');
doc.font('Helvetica').fontSize(8).fillColor(BODY_COLOR).text(
  'The Campus Library Management System meets all engineering, functional, and non-functional requirements specified for the Final Year Project. The solution provides a modular, highly scalable foundation that strictly honors the assigned technology stack and delivers tangible real-world utility through Open Library live cataloging and bulk spreadsheet onboarding.',
  { lineGap: 1.5 }
);

doc.moveDown(1.0);

// Signature Blocks
const sigY = doc.y;
const sigW = 150;

doc.moveTo(36, sigY).lineTo(36 + sigW, sigY).stroke(CARD_BORDER);
doc.fillColor(DARK_SLATE).font('Helvetica-Bold').fontSize(8).text('Candidate / Project Lead', 36, sigY + 5);
doc.fillColor(MUTED_COLOR).font('Helvetica').fontSize(7).text('Final Year B.Tech / B.E.', 36, sigY + 16);

doc.moveTo(222, sigY).lineTo(222 + sigW, sigY).stroke(CARD_BORDER);
doc.fillColor(DARK_SLATE).font('Helvetica-Bold').fontSize(8).text('Project Internal Guide', 222, sigY + 5);
doc.fillColor(MUTED_COLOR).font('Helvetica').fontSize(7).text('Dept. of Computer Science & Engg.', 222, sigY + 16);

doc.moveTo(409, sigY).lineTo(409 + sigW, sigY).stroke(CARD_BORDER);
doc.fillColor(DARK_SLATE).font('Helvetica-Bold').fontSize(8).text('Head of Department / Reviewer', 409, sigY + 5);
doc.fillColor(MUTED_COLOR).font('Helvetica').fontSize(7).text('Academic Review Committee', 409, sigY + 16);

// Add Page Footers cleanly without triggering new pages
const totalPages = doc.bufferedPageRange().count;
for (let i = 0; i < totalPages; i++) {
  doc.switchToPage(i);
  doc.page.margins.bottom = 0;
  doc.rect(36, 810, 523, 0.5).fill(CARD_BORDER);
  doc.fillColor(MUTED_COLOR).font('Helvetica').fontSize(7.5)
     .text('Campus Library Management System | Final Year Engineering Project Review Report', 36, 818, { lineBreak: false });
  doc.fillColor(MUTED_COLOR).font('Helvetica-Bold').fontSize(7.5)
     .text(`Page ${i + 1} of ${totalPages}`, 36, 818, { width: 523, align: 'right', lineBreak: false });
}

doc.end();

stream.on('finish', () => {
  console.log(`✅ Professor Review PDF successfully generated (Exactly ${totalPages} pages) at: ${outputPath}`);
});
