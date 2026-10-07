const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const outputPath = path.join(__dirname, '..', '..', 'docs', 'Zero_To_Hero_Learning_Roadmap.pdf');
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
const TEAL = '#0D9488';
const DARK_SLATE = '#0F172A';
const NAVY = '#1E3A8A';
const BODY_COLOR = '#334155';
const MUTED_COLOR = '#64748B';
const CARD_BG = '#F8FAFC';
const CARD_BORDER = '#CBD5E1';
const ACCENT_AMBER = '#D97706';
const WHITE = '#FFFFFF';

function drawHeaderBanner(title, subtitle, meta) {
  doc.rect(36, 32, 523, 62).fill(DARK_SLATE);
  doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(13.5).text(title, 48, 42);
  doc.font('Helvetica').fontSize(9.5).fillColor('#99F6E4').text(subtitle, 48, 60);
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FDE047').text(meta, 48, 76);
  doc.y = 104;
}

function drawSectionHeading(num, text) {
  const y = doc.y;
  doc.rect(36, y, 4, 16).fill(TEAL);
  doc.fillColor(TEAL).font('Helvetica-Bold').fontSize(11).text(`${num}. ${text}`, 46, y + 2);
  doc.y = y + 20;
}

function drawStageCard(stageNum, title, timeframe, concepts, projectMilestone) {
  const y = doc.y;
  const h = 54;
  doc.rect(36, y, 523, h).fillAndStroke(CARD_BG, CARD_BORDER);
  doc.rect(36, y, 4, h).fill(TEAL);
  
  doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(8).text(`STAGE ${stageNum}: ${title.toUpperCase()}`, 46, y + 5);
  doc.fillColor(ACCENT_AMBER).font('Helvetica-Bold').fontSize(7).text(`[Timeline: ${timeframe}]`, 370, y + 5, { width: 180, align: 'right' });
  
  // Two-column layout for Concepts vs Milestone
  doc.fillColor(DARK_SLATE).font('Helvetica-Bold').fontSize(7).text('Core Topics to Master:', 46, y + 17);
  doc.fillColor(BODY_COLOR).font('Helvetica').fontSize(6.8).text(concepts, 46, y + 27, { width: 300, lineGap: 1.2 });
  
  doc.rect(355, y + 16, 1, 32).fill(CARD_BORDER);

  doc.fillColor(DARK_SLATE).font('Helvetica-Bold').fontSize(7).text('Hands-on Coding Milestone:', 365, y + 17);
  doc.fillColor(TEAL).font('Helvetica-Bold').fontSize(6.8).text(projectMilestone, 365, y + 27, { width: 184, lineGap: 1.2 });
  
  doc.y = y + h + 6;
}

// ================= PAGE 1 =================
drawHeaderBanner(
  'FROM ZERO TO HERO: COMPLETE LEARNING ROADMAP',
  'Mastering Node.js, PostgreSQL, Vanilla Web & Kotlin to Build Full-Stack Systems',
  'CURRICULUM DESIGN: 8-Week Progressive Learning Path for Final Year Projects & Career Readiness'
);

doc.moveDown(0.2);
drawSectionHeading('1', 'Why This Specific Tech Stack Matters');
doc.font('Helvetica').fontSize(8).fillColor(BODY_COLOR).text(
  'Building an enterprise project without relying on bulky all-in-one frameworks (like React, Angular, or Django) forces you to master core computer science and software engineering fundamentals: protocols, DOM architecture, relational calculus, asynchronous event loops, and native mobile rendering. This knowledge transfers directly to any future language or framework.',
  { lineGap: 1.5 }
);
doc.moveDown(0.2);

// 4 Pill Highlights
const pillY = doc.y;
const pillW = 124;
const pillH = 42;
const pillars = [
  { p: '1. RELATIONAL DATA', d: 'PostgreSQL, 3NF, Keys, ACID transactions' },
  { p: '2. REST ARCHITECTURE', d: 'Node.js, Express, JWT, RBAC security' },
  { p: '3. FRAMEWORK-FREE WEB', d: 'HTML5, CSS3 Grid, Vanilla JS SPAs' },
  { p: '4. NATIVE MOBILE', d: 'Kotlin, Retrofit2, Material 3, Android SDK' }
];

pillars.forEach((p, i) => {
  const x = 36 + i * (pillW + 9);
  doc.rect(x, pillY, pillW, pillH).fillAndStroke(CARD_BG, CARD_BORDER);
  doc.rect(x, pillY, pillW, 3).fill(TEAL);
  doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(7.5).text(p.p, x + 6, pillY + 6);
  doc.fillColor(BODY_COLOR).font('Helvetica').fontSize(6.8).text(p.d, x + 6, pillY + 18, { width: 112, lineGap: 1 });
});

doc.y = pillY + pillH + 10;

drawSectionHeading('2', 'Phase 1: Foundations & Relational Database Mastery');

drawStageCard(
  '1',
  'Relational Database Modeling & PostgreSQL (SQL)',
  'Week 1 (Days 1 - 7)',
  'Relational theory, 1NF/2NF/3NF normalization, Primary/Foreign Keys, ON DELETE CASCADE vs RESTRICT, indexes, joins (INNER, LEFT), subqueries, and ACID transaction rules.',
  'Design schema.sql: Create users, books, and borrow_records tables with constraints and foreign key linkages.'
);

drawStageCard(
  '2',
  'JavaScript Fundamentals & Asynchronous Programming (ES6+)',
  'Week 2 (Days 8 - 14)',
  'Arrow functions, destructuring, CommonJS modules, Promises, async/await, Array methods (map, filter, reduce), error handling with try/catch, and the Node.js Event Loop.',
  'Write a standalone Node script that connects to PostgreSQL and performs asynchronous CRUD operations.'
);

drawSectionHeading('3', 'Phase 2: Backend RESTful API & Security Engineering');

drawStageCard(
  '3',
  'Node.js & Express RESTful API Development',
  'Week 3 (Days 15 - 21)',
  'HTTP methods (GET, POST, PUT, DELETE), status codes (200, 201, 400, 401, 403, 404, 500), Express Router modularization, body parsing (express.json), and error middleware.',
  'Build /api/books and /api/borrow endpoints with input validation and clean JSON responses.'
);

drawStageCard(
  '4',
  'Authentication, JWT Tokens & Role-Based Access Control',
  'Week 4 (Days 22 - 28)',
  'Stateless session management, password hashing with bcryptjs (salt rounds), signing & verifying JSON Web Tokens (jsonwebtoken), Bearer headers, and role guards.',
  'Implement secure login, student registration, and guard circulation routes against unauthorized student requests.'
);

// ================= PAGE 2 =================
doc.addPage();

drawHeaderBanner(
  'FROM ZERO TO HERO: COMPLETE LEARNING ROADMAP',
  'Section II: Advanced Backend, Vanilla Web & Native Android Mastery',
  'PHASES 3 & 4: External Integrations, Framework-Free SPA & Mobile App Engineering'
);

doc.moveDown(0.2);
drawSectionHeading('4', 'Phase 3: Advanced Integrations (Excel & External APIs)');

drawStageCard(
  '5',
  'External API Integration (Open Library by Internet Archive)',
  'Week 5 (Days 29 - 35)',
  'Third-party HTTP requests using Native Fetch / Axios, User-Agent policies, rate limits, parsing nested external JSON structures, image URL construction, and ISBN normalization.',
  'Build openLibraryService.js to proxy live searches to openlibrary.org and enable 1-click book importing.'
);

drawStageCard(
  '6',
  'Bulk Spreadsheet Processing with SheetJS (xlsx) & Multer',
  'Week 6 (Days 36 - 42)',
  'Multipart/form-data file uploads with Multer, memory buffer manipulation, parsing Excel (.xlsx, .csv) workbooks, flexible column mapping, and duplicate prevention in batches.',
  'Implement /api/auth/students/upload for batch roster uploads and /api/auth/students/template for binary downloads.'
);

drawSectionHeading('5', 'Phase 4: Client Development (Vanilla Web & Native Android)');

drawStageCard(
  '7',
  'Librarian Admin Web Portal (Vanilla HTML5, CSS3 & JavaScript)',
  'Week 7 (Days 43 - 49)',
  'Semantic HTML5, CSS Grid & Flexbox, CSS Variables, DOM manipulation (document.querySelector, addEventListener), dynamic tables, custom modals, Drag-and-Drop file API, and SPAs.',
  'Construct the complete Admin Portal with Dashboard tabs, Live Search modals, Circulation Desk, and Student roster.'
);

drawStageCard(
  '8',
  'Student Mobile Application (Native Android with Kotlin)',
  'Week 8 (Days 50 - 56)',
  'Kotlin syntax (data classes, null safety, coroutines), Android Activity lifecycle, ViewBinding, Material 3 Design, Retrofit2 & OkHttp3 networking, and SharedPreferences session caching.',
  'Build the Android Student App with Login, Catalog search with Category Chips, Shelf tags, and My Loans tracker.'
);

// ================= PAGE 3 =================
doc.addPage();

drawHeaderBanner(
  'FROM ZERO TO HERO: COMPLETE LEARNING ROADMAP',
  'Section III: Recommended Free Resources, Practice Projects & Checklist',
  'SELF-ASSESSMENT: Step-by-Step Milestones to Build Your Own Enterprise Project'
);

doc.moveDown(0.2);
drawSectionHeading('6', 'Curated High-Yield Free Learning Resources');
doc.font('Helvetica').fontSize(8).fillColor(BODY_COLOR).text(
  'You do not need paid courses to master this stack. Leverage these top-tier official documentations and tutorials:',
  { lineGap: 1.5 }
);
doc.moveDown(0.2);

const resources = [
  ['PostgreSQL & SQL', 'PostgreSQL Official Docs (postgresqltutorial.com)', 'Interactive SQL exercises on queries, schema design, and indexes.'],
  ['Modern JavaScript (ES6+)', 'javascript.info & MDN Web Docs', 'The gold standard for understanding Promises, async/await, and the DOM.'],
  ['Node.js & Express', 'nodejs.org/docs & expressjs.com guide', 'Step-by-step guides for routing, middleware, and request/response lifecycles.'],
  ['JWT & Web Security', 'jwt.io/introduction & OWASP API Top 10', 'Best practices on token signing, password hashing, and endpoint protection.'],
  ['SheetJS & File Processing', 'docs.sheetjs.com', 'Comprehensive guide to reading, writing, and manipulating Excel workbooks in JS.'],
  ['Open Library API', 'openlibrary.org/developers/api', 'Documentation for search.json, isbn.json, and the Covers API.'],
  ['Kotlin & Android Basics', 'developer.android.com/courses', 'Google\'s official Android Basics with Kotlin course (free with code labs).'],
  ['Retrofit2 Networking', 'square.github.io/retrofit', 'Official documentation for type-safe HTTP client communication in Android.']
];

let resTableY = doc.y;
resources.forEach((row, i) => {
  const h = 15;
  doc.rect(36, resTableY, 523, h).fill(i % 2 === 0 ? '#F8FAFC' : WHITE);
  doc.rect(36, resTableY, 523, h).stroke(CARD_BORDER);

  doc.font('Helvetica-Bold').fontSize(7).fillColor(DARK_SLATE).text(row[0], 42, resTableY + 4, { width: 110 });
  doc.font('Helvetica-Bold').fontSize(7).fillColor(TEAL).text(row[1], 155, resTableY + 4, { width: 165 });
  doc.font('Helvetica').fontSize(6.8).fillColor(BODY_COLOR).text(row[2], 325, resTableY + 4, { width: 225 });
  resTableY += h;
});

doc.y = resTableY + 12;

drawSectionHeading('7', 'Progressive Mini-Projects (Build Up to the Final Project)');
doc.font('Helvetica').fontSize(8).fillColor(BODY_COLOR).text(
  'Do not attempt to build the entire system all at once. Build these 4 progressive stepping-stone projects:',
  { lineGap: 1.5 }
);
doc.moveDown(0.2);

const miniProjects = [
  { name: '1. CLI Book Tracker (Node.js + PostgreSQL)', desc: 'Create a terminal app that adds books, lists them from PostgreSQL, and deletes them. Teaches SQL queries and Node.js db connection.' },
  { name: '2. RESTful Auth Service (Express + JWT + bcrypt)', desc: 'Build an API with register, login, and protected /profile route. Teaches passwords hashing, token generation, and middleware guards.' },
  { name: '3. Web Circulation Dashboard (Vanilla HTML/CSS/JS)', desc: 'Build a single-page web app with fetch() to list books, search dynamically, and submit forms without refreshing the browser.' },
  { name: '4. Android Catalog Viewer (Kotlin + Retrofit)', desc: 'Build a mobile app with RecyclerView to fetch and display the book catalog from your local Node.js API with cover images.' }
];

miniProjects.forEach(mp => {
  const y = doc.y;
  doc.rect(36, y, 523, 24).fillAndStroke(CARD_BG, CARD_BORDER);
  doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(7.5).text(mp.name, 44, y + 4);
  doc.fillColor(BODY_COLOR).font('Helvetica').fontSize(6.8).text(mp.desc, 44, y + 13, { width: 505 });
  doc.y = y + 28;
});

doc.moveDown(0.2);
drawSectionHeading('8', 'Self-Readiness Checklist Before Building');
doc.font('Helvetica').fontSize(7.5).fillColor(BODY_COLOR).text(
  '[ ] I understand how foreign keys, cascades, and indexes work in PostgreSQL.\n' +
  '[ ] I can write async/await functions and handle rejected promises gracefully in Node.js.\n' +
  '[ ] I can explain what a JWT header, payload, and signature are and why they are stateless.\n' +
  '[ ] I know how to manipulate the DOM with document.createElement and fetch() without React.\n' +
  '[ ] I understand Android Activities, Retrofit ApiService interfaces, and Kotlin coroutines.',
  { lineGap: 2.5 }
);

// Add Page Footers cleanly without triggering new pages
const totalRoadmapPages = doc.bufferedPageRange().count;
for (let i = 0; i < totalRoadmapPages; i++) {
  doc.switchToPage(i);
  doc.page.margins.bottom = 0;
  doc.rect(36, 810, 523, 0.5).fill(CARD_BORDER);
  doc.fillColor(MUTED_COLOR).font('Helvetica').fontSize(7.5)
     .text('Campus Library Management System | Zero-to-Hero Full-Stack Engineering Roadmap', 36, 818, { lineBreak: false });
  doc.fillColor(MUTED_COLOR).font('Helvetica-Bold').fontSize(7.5)
     .text(`Page ${i + 1} of ${totalRoadmapPages}`, 36, 818, { width: 523, align: 'right', lineBreak: false });
}

doc.end();

stream.on('finish', () => {
  console.log(`✅ Zero to Hero Learning Roadmap PDF successfully generated (Exactly ${totalRoadmapPages} pages) at: ${outputPath}`);
});
