const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const outputPath = path.join(__dirname, '..', '..', 'docs', 'Team_Viva_Preparation_Guide.pdf');
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
const PURPLE = '#4F46E5';
const DARK_SLATE = '#0F172A';
const BODY_COLOR = '#334155';
const MUTED_COLOR = '#64748B';
const CARD_BG = '#F8FAFC';
const CARD_BORDER = '#CBD5E1';
const ACCENT_GREEN = '#059669';
const ACCENT_AMBER = '#D97706';
const WHITE = '#FFFFFF';

function drawHeaderBanner(title, subtitle, meta) {
  doc.rect(36, 32, 523, 62).fill(DARK_SLATE);
  doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(14).text(title, 48, 42);
  doc.font('Helvetica').fontSize(9.5).fillColor('#A5B4FC').text(subtitle, 48, 60);
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FCD34D').text(meta, 48, 76);
  doc.y = 104;
}

function drawSectionHeading(num, text) {
  const y = doc.y;
  doc.rect(36, y, 4, 16).fill(PURPLE);
  doc.fillColor(PURPLE).font('Helvetica-Bold').fontSize(11.5).text(`${num}. ${text}`, 46, y + 2);
  doc.y = y + 21;
}

function drawQAItem(q, answer, speaker) {
  const y = doc.y;
  doc.fillColor(DARK_SLATE).font('Helvetica-Bold').fontSize(8.5).text(`Q: "${q}"`, 36, y);
  doc.fillColor(ACCENT_AMBER).font('Helvetica-Bold').fontSize(7.5).text(`[Recommended Speaker: ${speaker}]`, 420, y, { width: 139, align: 'right' });
  doc.y += 12;
  doc.fillColor(BODY_COLOR).font('Helvetica').fontSize(7.5).text(`A: ${answer}`, 46, doc.y, { width: 505, lineGap: 1.5 });
  doc.y += 12;
}

// ================= PAGE 1 =================
drawHeaderBanner(
  'FINAL YEAR PROJECT: TEAM VIVA & DEFENSE GUIDE',
  'Campus Library Management System: Technical Q&A, Architecture & Demo Script',
  'AUDIENCE: Project Team Members  |  PREPARATION: External Examiner & Guide Review'
);

doc.moveDown(0.2);
drawSectionHeading('1', 'Team Member Role Allocations & Presentation Split');
doc.font('Helvetica').fontSize(8).fillColor(BODY_COLOR).text(
  'To deliver a confident, synchronized presentation in front of the examination committee, divide your defense responsibilities as follows:',
  { lineGap: 1.5 }
);
doc.moveDown(0.2);

const roles = [
  {
    role: 'PRESENTER 1: PROJECT LEAD & ARCHITECTURE',
    topics: 'Problem Statement, Objectives, 3-Tier Architecture, Constraint Adherence (Zero Frameworks), Dual-Engine PostgreSQL design.',
    demo: 'Introductory remarks, System Topology diagram, and final conclusion.'
  },
  {
    role: 'PRESENTER 2: BACKEND, API & DATABASE',
    topics: 'Node.js Express REST API, Relational Schema (3NF, cascades), JWT Authentication, RBAC (requireLibrarian guard), Security.',
    demo: 'Circulation desk actions, Overdue fine calculation logic, Database tables inspection.'
  },
  {
    role: 'PRESENTER 3: ADVANCED FEATURES (EXCEL & OPEN LIBRARY)',
    topics: 'SheetJS binary Excel parsing & generation, bulk duplicate validation, Open Library (Internet Archive) live REST client.',
    demo: 'Live book search on openlibrary.org, 1-click import, downloading template & bulk student upload.'
  },
  {
    role: 'PRESENTER 4: MOBILE APP & INTEGRATION TESTING',
    topics: 'Native Android Kotlin, Retrofit2 & OkHttp3 networking, ViewBinding, Material 3 UI, test suite results.',
    demo: 'Android Emulator walkthrough: Demo student login, catalog search, category chips, shelf location & loan countdowns.'
  }
];

roles.forEach(r => {
  const y = doc.y;
  doc.rect(36, y, 523, 40).fillAndStroke(CARD_BG, CARD_BORDER);
  doc.rect(36, y, 4, 40).fill(PURPLE);
  doc.fillColor(PURPLE).font('Helvetica-Bold').fontSize(8).text(r.role, 46, y + 5);
  doc.fillColor(DARK_SLATE).font('Helvetica-Bold').fontSize(7).text('Core Topics: ', 46, y + 16);
  doc.fillColor(BODY_COLOR).font('Helvetica').fontSize(7).text(r.topics, 98, y + 16, { width: 450 });
  doc.fillColor(DARK_SLATE).font('Helvetica-Bold').fontSize(7).text('Live Demo Responsibility: ', 46, y + 27);
  doc.fillColor(BODY_COLOR).font('Helvetica').fontSize(7).text(r.demo, 142, y + 27, { width: 405 });
  doc.y = y + 44;
});

doc.moveDown(0.2);
drawSectionHeading('2', '10-Minute Live Demonstration Walkthrough Script');
doc.font('Helvetica').fontSize(8).fillColor(BODY_COLOR).text(
  'Follow this exact sequential demonstration order to showcase all key capabilities without hiccups:',
  { lineGap: 1.5 }
);
doc.moveDown(0.2);

const demoSteps = [
  ['Step 1', 'Open Admin Portal', 'Navigate to http://localhost:5000 in Chrome. Log in with admin@library.com / admin123. Show Overview metrics.'],
  ['Step 2', 'Open Library Live Import', 'Go to "Book Catalog" -> click "Search Open Library". Search "Machine Learning". Show real covers. Click "Import".'],
  ['Step 3', 'ISBN Auto-Fill Demonstration', 'Click "Add Book", enter ISBN "9780132350884", click "Auto-Fill". Watch Title, Author & Cover populate instantly.'],
  ['Step 4', 'Excel Template Download', 'Go to "Students" tab -> click "Download Template". Open the downloaded .xlsx file to show binary formatting.'],
  ['Step 5', 'Bulk Student Upload', 'Click "Upload Excel / CSV" and select a test roster. Show the modal feedback (e.g. "3 students created, 0 skipped").'],
  ['Step 6', 'Android Mobile Client Demo', 'Open Android Emulator. Log in as Demo Student (student@college.edu / student123).'],
  ['Step 7', 'Mobile Catalog & Search', 'Filter by category chips (Algorithms, Software Engineering), search "Clean Code", view shelf location Stack SE-1.'],
  ['Step 8', 'Security & Student Restriction', 'Explain that the student app has NO "Issue Book" button. Show that loan issuance is strictly librarian-restricted.']
];

let demoTableY = doc.y;
demoSteps.forEach((row, i) => {
  const h = 15;
  doc.rect(36, demoTableY, 523, h).fill(i % 2 === 0 ? '#F8FAFC' : WHITE);
  doc.rect(36, demoTableY, 523, h).stroke(CARD_BORDER);

  doc.font('Helvetica-Bold').fontSize(7).fillColor(PURPLE).text(row[0], 42, demoTableY + 4, { width: 40 });
  doc.font('Helvetica-Bold').fontSize(7).fillColor(DARK_SLATE).text(row[1], 85, demoTableY + 4, { width: 120 });
  doc.font('Helvetica').fontSize(7).fillColor(BODY_COLOR).text(row[2], 210, demoTableY + 4, { width: 340 });
  demoTableY += h;
});

// ================= PAGE 2 =================
doc.addPage();

drawHeaderBanner(
  'FINAL YEAR PROJECT: TEAM VIVA & DEFENSE GUIDE',
  'Section II: High-Frequency Professor Viva Questions & Ideal Answers',
  'FOCUS: Examiner Defense, Edge Cases, Architectural Justifications'
);

doc.moveDown(0.2);
drawSectionHeading('3', 'Anticipated Viva Questions & Technical Model Answers');

drawQAItem(
  'Why did you choose Node.js and Vanilla JS instead of React or Angular?',
  'Our project strictly adheres to the fundamental technology constraints: Node.js, JavaScript, HTML, CSS, Kotlin, and PostgreSQL without third-party frameworks. Building the Admin Portal in Vanilla HTML5/CSS3/JS demonstrated deep mastery of DOM manipulation, asynchronous Fetch API, CSS Grid, and Single-Page Application (SPA) routing without framework bloat. It provides maximum execution speed and zero build dependencies.',
  'Presenter 1 (Lead)'
);

drawQAItem(
  'How does your database handle PostgreSQL if the service is not installed on the professor\'s machine?',
  'We engineered a dual-engine database architecture in config/db.js. When external PostgreSQL on port 5432 is running, the system connects via a native connection pool (pg). If port 5432 is unavailable, our backend automatically activates an embedded persistent PostgreSQL engine (PGlite) that stores tables in backend/database/pgdata. This ensures zero-configuration portability for professors during grading while guaranteeing full PostgreSQL SQL syntax compliance.',
  'Presenter 2 (Database)'
);

drawQAItem(
  'How do you enforce that students cannot issue books to themselves?',
  'Security is enforced at the REST API middleware layer, not just the UI. Every circulation endpoint (POST /api/borrow/issue, POST /api/borrow/return/:id) is guarded by the requireLibrarian middleware. Even if a student crafts a direct HTTP request or uses Postman, the server verifies the JWT token payload. If req.user.role !== "librarian", the request is immediately aborted with HTTP 403 Forbidden.',
  'Presenter 2 (Backend)'
);

drawQAItem(
  'How does the Open Library integration work, and what happens if the network is down?',
  'In backend/services/openLibraryService.js, our backend acts as an authenticated proxy communicating with openlibrary.org/search.json and openlibrary.org/isbn/{isbn}.json. We parse the response, extract primary ISBN-13/10, resolve authors and high-res cover image IDs, and map them to our schema. If the external network fails, the service catches the error gracefully, returns meaningful error messages, and allows librarians to proceed with manual book additions.',
  'Presenter 3 (Advanced)'
);

drawQAItem(
  'How does bulk student Excel upload prevent duplicates and handle invalid data?',
  'In backend/controllers/authController.js, we parse uploaded buffers using the SheetJS engine. We validate mandatory columns (name, email, student ID, password), normalize email and student ID casing, and check existing database records using SELECT queries. Duplicate emails or student IDs are automatically skipped and cataloged in a skipped report. Valid rows have passwords hashed with bcryptjs (10 rounds) before insertion.',
  'Presenter 3 (Advanced)'
);

drawQAItem(
  'How does the Android mobile client communicate with the backend, and how is session state managed?',
  'The Android app is built natively in Kotlin using Retrofit2 and OkHttp3 for RESTful communication, and Gson for JSON serialization. Upon successful login, the JWT token and user profile are saved to encrypted Android SharedPreferences via SessionManager. An AuthInterceptor automatically attaches the Authorization: Bearer <token> header to all subsequent requests. Material 3 ViewBinding renders the UI.',
  'Presenter 4 (Mobile)'
);

// ================= PAGE 3 =================
doc.addPage();

drawHeaderBanner(
  'FINAL YEAR PROJECT: TEAM VIVA & DEFENSE GUIDE',
  'Section III: Architecture Deep Dive, Troubleshooting & Checklist',
  'FOCUS: Rapid Debugging, Project Handover, Confidence Checklist'
);

doc.moveDown(0.2);
drawSectionHeading('4', 'Examiner Technical Deep Dive (Key File Reference)');
doc.font('Helvetica').fontSize(8).fillColor(BODY_COLOR).text(
  'When an examiner asks to "open the code and show me where X is implemented", immediately navigate to these exact files:',
  { lineGap: 1.5 }
);
doc.moveDown(0.2);

const fileRefs = [
  ['JWT & RBAC Middleware', 'backend/middleware/auth.js', 'Shows authenticateToken and requireLibrarian (403 guard).'],
  ['Dual Database Engine', 'backend/config/db.js', 'Shows pg connection pool & PGlite persistent fallback logic.'],
  ['Open Library Gateway', 'backend/services/openLibraryService.js', 'Shows fetch client calling openlibrary.org and cover URL builder.'],
  ['Excel Bulk Processing', 'backend/controllers/authController.js', 'Shows uploadStudentsExcel and downloadStudentsTemplate with SheetJS.'],
  ['Circulation & Fines', 'backend/controllers/borrowController.js', 'Shows issueBook, returnBook, overdue days calculation & $0.50 fine math.'],
  ['Android Networking', 'student-app/.../data/ApiService.kt', 'Shows Retrofit interface definitions and endpoints.'],
  ['Android Session Auth', 'student-app/.../data/SessionManager.kt', 'Shows SharedPreferences JWT storage and user caching.'],
  ['Admin SPA Interface', 'admin-web/js/app.js & index.html', 'Shows Open Library search modal, live table rendering, and upload dropzone.']
];

let fileTableY = doc.y;
fileRefs.forEach((row, i) => {
  const h = 15;
  doc.rect(36, fileTableY, 523, h).fill(i % 2 === 0 ? '#F8FAFC' : WHITE);
  doc.rect(36, fileTableY, 523, h).stroke(CARD_BORDER);

  doc.font('Helvetica-Bold').fontSize(7).fillColor(DARK_SLATE).text(row[0], 42, fileTableY + 4, { width: 105 });
  doc.font('Courier-Bold').fontSize(6.5).fillColor(PURPLE).text(row[1], 150, fileTableY + 4, { width: 175 });
  doc.font('Helvetica').fontSize(7).fillColor(BODY_COLOR).text(row[2], 330, fileTableY + 4, { width: 220 });
  fileTableY += h;
});

doc.y = fileTableY + 12;

drawSectionHeading('5', 'Emergency Live Troubleshooting & Fallbacks');
doc.font('Helvetica').fontSize(8).fillColor(BODY_COLOR).text(
  'If any technical issue arises during the presentation, stay calm and execute these immediate 5-second remedies:',
  { lineGap: 1.5 }
);
doc.moveDown(0.2);

const fallbacks = [
  { issue: 'Backend Server Not Responding', fix: 'Open terminal, run "cd backend && npm start". Server starts in under 2 seconds on port 5000.' },
  { issue: 'Android App Cannot Connect to Server', fix: 'On Android Emulator, 10.0.2.2 maps to localhost. Ensure Retrofit BASE_URL is "http://10.0.2.2:5000/api/".' },
  { issue: 'Database Shows 0 Books After Reset', fix: 'Run "node database/seedRealBooks.js" inside the backend folder to instantly restore the 8 Open Library books.' },
  { issue: 'Examiner Asks for Fresh Database Reset', fix: 'Run "npm run setup-db". Reinitializes schema, seeds Chief Librarian and Demo Student.' }
];

fallbacks.forEach(f => {
  const y = doc.y;
  doc.rect(36, y, 523, 24).fillAndStroke(CARD_BG, CARD_BORDER);
  doc.fillColor(ACCENT_AMBER).font('Helvetica-Bold').fontSize(7).text(`Issue: ${f.issue}`, 44, y + 4);
  doc.fillColor(DARK_SLATE).font('Helvetica-Bold').fontSize(7).text('Fix: ', 44, y + 13);
  doc.fillColor(BODY_COLOR).font('Helvetica').fontSize(7).text(f.fix, 64, y + 13, { width: 485 });
  doc.y = y + 27;
});

doc.moveDown(0.2);
drawSectionHeading('6', 'Final Team Presentation Day Checklist');
doc.font('Helvetica').fontSize(7.5).fillColor(BODY_COLOR).text(
  '[X] Node.js server running in background on port 5000 (verified with /api/health).\n' +
  '[X] Browser tab pre-opened to http://localhost:5000 logged in as Chief Librarian.\n' +
  '[X] Android Studio Emulator running with Campus Library student app launched.\n' +
  '[X] Sample Excel file (students_import_template.xlsx) downloaded on Desktop ready for live upload.\n' +
  '[X] Two printed copies of "Professor_Project_Review_Report.pdf" placed on the review committee desk.',
  { lineGap: 2.5 }
);

// Add Page Footers cleanly without triggering new pages
const totalTeamPages = doc.bufferedPageRange().count;
for (let i = 0; i < totalTeamPages; i++) {
  doc.switchToPage(i);
  doc.page.margins.bottom = 0;
  doc.rect(36, 810, 523, 0.5).fill(CARD_BORDER);
  doc.fillColor(MUTED_COLOR).font('Helvetica').fontSize(7.5)
     .text('Campus Library Management System | Final Year Project Viva & Team Defense Guide', 36, 818, { lineBreak: false });
  doc.fillColor(MUTED_COLOR).font('Helvetica-Bold').fontSize(7.5)
     .text(`Page ${i + 1} of ${totalTeamPages}`, 36, 818, { width: 523, align: 'right', lineBreak: false });
}

doc.end();

stream.on('finish', () => {
  console.log(`✅ Team Viva Preparation PDF successfully generated (Exactly ${totalTeamPages} pages) at: ${outputPath}`);
});
