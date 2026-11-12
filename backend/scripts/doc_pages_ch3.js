// Chapter 3 Page Builders (Pages 24 to 29 in PDF, labeled Pages 19 to 24)

function registerChapter3(app) {
  const { doc, addPageWithBorder, RED, BLUE_HEADER, GREEN, DARK_SLATE, BLACK, TABLE_HEADER_BG, TABLE_BORDER, LIGHT_BG } = app;

  // ----------------------------------------------------
  // BODY PAGE 19 (PDF Page 24): CHAPTER 3 & CORE FEATURES
  // ----------------------------------------------------
  app.buildBodyPage19 = function() {
    addPageWithBorder('19');

    doc.font('Times-Bold').fontSize(14).fillColor(RED)
       .text('CHAPTER – 3', 45, 60, { width: 505, align: 'center' });
    doc.font('Times-Bold').fontSize(13.5).fillColor(BLACK)
       .text('CORE FEATURES AND SECURITY', 45, 78, { width: 505, align: 'center' });

    doc.font('Times-Bold').fontSize(11).fillColor(BLUE_HEADER)
       .text('3.1 FEATURES OF THE SMART CAMPUS LIBRARY APP', 45, 105);

    const fIntro = 'The Smart Campus Library Management System integrates eight specialized modules designed to optimize institutional circulation velocity, eliminate manual paperwork, and provide students with instant physical navigational guidance.';
    doc.font('Times-Roman').fontSize(9.5).fillColor(BLACK)
       .text(fIntro, 55, 122, { width: 485, align: 'justify', lineGap: 2.2 });

    const f1 = [
      {
        t: '1. Student Authentication & Profile Management',
        d: '• College Registration Number Login: Students authenticate securely using their permanent institutional roll number (e.g., 24054-CPS-062) or verified college email.\n• College Email Verification: System validates institutional domain format before granting borrowing privileges.\n• Cryptographic Password Management: Passwords undergo salted one-way hashing with bcryptjs (10 rounds); includes secure forgot password and self-service password reset token workflows.\n• Comprehensive Academic Profile: Maintains department, degree course, active semester, contact details, and current registration status.'
      },
      {
        t: '2. Enriched Book Catalog with Open Library Artwork',
        d: '• Rich Metadata Presentation: Displays high-resolution cover artwork, full bibliographic summaries, author attributions, published year, and edition count.\n• Real-Time Inventory Tracking: Explicitly displays total physical copies owned versus currently available unborrowed copies on the library floor.'
      },
      {
        t: '3. Book Finder – Exact Physical Shelf Locator',
        d: '• Micro-Spatial Navigation: When a student searches for any title, the locator dynamically calculates and displays:\n    - Library Block: Block A (Central Academic Wing)\n    - Floor Level: Floor 2 (Upper Technology Stacks)\n    - Subject Section: Computer Science (CS Collection)\n    - Rack Identifier: Rack 08 (Aisle 4 East)\n    - Shelf Level: Shelf 03 (Eye-Level Tier)\n• Eliminates aisle wandering and reduces physical book collection time from 15 minutes to under 60 seconds.'
      },
      {
        t: '4. Online Book Reservation & Timeslot Scheduling',
        d: '• Remote Hold Placement: Students select physical books, verify live availability, and reserve an active copy from their mobile device.\n• Preferred Timeslot Selection: Students choose a preferred collection date and an hourly pickup window (e.g., 14:00 - 16:00).\n• Unique Reservation Tracking: The system issues an alphanumeric Reservation ID (e.g., RES-2026-9042), allows tracking status (Pending, Approved, Fulfilled), and supports pre-approval cancellation.\n• Confirmation Alert: Instant in-app alert when the librarian confirms the reservation hold at the desk.'
      }
    ];

    let fy = 155;
    f1.forEach(f => {
      doc.font('Times-Bold').fontSize(9.5).fillColor(RED).text(f.t, 55, fy);
      doc.font('Times-Roman').fontSize(8.5).fillColor(BLACK).text(f.d, 65, fy + 14, { width: 475, align: 'justify', lineGap: 1.8 });
      fy += doc.heightOfString(f.d, { width: 475, lineGap: 1.8 }) + 20;
    });
  };

  // ----------------------------------------------------
  // BODY PAGE 20 (PDF Page 25): 3.1 FEATURES CONTINUED
  // ----------------------------------------------------
  app.buildBodyPage20 = function() {
    addPageWithBorder('20');

    doc.font('Times-Bold').fontSize(10.5).fillColor(BLUE_HEADER)
       .text('3.1 FEATURES OF THE SMART CAMPUS LIBRARY APP (CONTINUED)', 45, 60);

    const f2 = [
      {
        t: '5. Smart Waiting List Management (Automated Queue)',
        d: '• Automated Zero-Stock Queue: When all physical copies of a required textbook are currently borrowed (available copies = 0), the reservation button automatically shifts to "Join Smart Waiting List".\n• Fair FIFO Progression: The engine assigns a sequential queue position. When an existing borrower returns a copy at the circulation counter, the system automatically allocates the volume to the #1 queued student, locks the hold for 48 hours, and issues an immediate pickup alert.'
      },
      {
        t: '6. My Library Account Personal Dashboard',
        d: '• 360-Degree Self-Service Portal: Every student has an in-app dashboard centralizing all personal library engagements:\n    - Currently Borrowed Books: Live list of held volumes with issue dates, due dates, and remaining days countdown badges.\n    - Approved Reservations: Active holds ready for pickup at circulation desk counters.\n    - Pending Reservations & Waiting Queue: Real-time queue position in waiting lists.\n    - Previous Borrowing History: Permanent historical log of all past checkouts and returns.\n    - Overdue Alerts & Pending Fines: Live fine tracker calculating exact penalty amounts ($0.50/day grace policy).\n    - Borrowing Limit & Membership Status: Visual quota gauge showing used vs available book slots (e.g. 2 of 5 books borrowed) and card expiration validity.'
      },
      {
        t: '7. Module 7: Multi-Channel Library Notifications',
        d: '• Real-Time In-App Feeds First: Prioritizes instant, non-intrusive mobile notification cards with badge counters.\n• Supplementary Email Dispatch: High-priority operational alerts dispatch transactional emails via SMTP.\n• Comprehensive Event Coverage:\n    - Reservation approval and reservation rejection notices.\n    - Book ready for pickup alert with designated desk location and hold expiration timer.\n    - Upcoming return deadline reminders (dispatched 3 days and 1 day prior to due date).\n    - Overdue loan warnings with accumulated daily fine updates.\n    - Renewal approval or rejection confirmations.\n    - Book availability alerts for previously queued students.\n    - New book arrival announcements for department-specific curriculum acquisitions.\n    - Official library holiday announcements and examination extended-hour schedules.'
      },
      {
        t: '8. Module 8: Digital Library Membership Card',
        d: '• Collegiate Identity Standard: Bears the institutional motto “Peace through Wisdom”, official college header, student name, registration number, academic department, and high-resolution student portrait.\n• Unique Dynamic QR Code: Contains an encrypted HMAC-SHA256 token encoding the Student ID, Membership ID, and timestamp. Scanned by the librarian’s web camera/barcode reader during book checkouts and returns, eliminating manual keyboard entry and plastic card loss.'
      }
    ];

    let fy2 = 78;
    f2.forEach(f => {
      doc.font('Times-Bold').fontSize(9.5).fillColor(RED).text(f.t, 55, fy2);
      doc.font('Times-Roman').fontSize(8.5).fillColor(BLACK).text(f.d, 65, fy2 + 13, { width: 475, align: 'justify', lineGap: 1.8 });
      fy2 += doc.heightOfString(f.d, { width: 475, lineGap: 1.8 }) + 16;
    });
  };

  // ----------------------------------------------------
  // BODY PAGE 21 (PDF Page 26): 3.1.1 ROLES & FEATURE STATUS
  // ----------------------------------------------------
  app.buildBodyPage21 = function() {
    addPageWithBorder('21');

    doc.font('Times-Bold').fontSize(10.5).fillColor(BLUE_HEADER)
       .text('3.1.1 USER ROLES AND FEATURE IMPLEMENTATION MATRIX', 45, 60);

    doc.font('Times-Bold').fontSize(9.5).fillColor(BLACK).text('1. Institutional User Roles & Privilege Boundaries', 55, 78);

    // Table 3.1 Roles
    const rolesTable = [
      ['Role Name', 'Current Status', 'Operational Scope & Access Privileges'],
      ['Student', 'Fully Implemented', 'Search catalog, view exact shelf locators, reserve books, view digital card QR, track loans, and receive multi-channel alerts.'],
      ['Circulation Assistant', 'Fully Implemented', 'Scan student QR cards at desk, execute book issues and returns, calculate overdue fines, and confirm reservation pickups.'],
      ['Head Librarian', 'Fully Implemented', 'Full catalog inventory authority, Open Library live ingestion, batch Excel student roster onboarding, and library announcements.'],
      ['System Administrator', 'Planned (Phase 4)', 'Database maintenance, automated backup schedules, SMTP gateway configuration, and audit log analysis.']
    ];

    let ry = 95;
    rolesTable.forEach((row, idx) => {
      const isHeader = idx === 0;
      const h = isHeader ? 16 : 22;
      doc.rect(55, ry, 485, h).fillAndStroke(isHeader ? TABLE_HEADER_BG : (idx % 2 === 0 ? LIGHT_BG : '#FFFFFF'), TABLE_BORDER);
      doc.font('Times-Bold').fontSize(7.5).fillColor(isHeader ? BLACK : BLUE_HEADER)
         .text(row[0], 60, ry + 4, { width: 100 });
      doc.font('Times-Bold').fontSize(7).fillColor(isHeader ? BLACK : (idx === 4 ? RED : GREEN))
         .text(row[1], 165, ry + 4, { width: 90 });
      doc.font('Times-Roman').fontSize(7).fillColor(BLACK)
         .text(row[2], 260, ry + 3, { width: 275, lineGap: 1 });
      ry += h;
    });

    doc.font('Times-Italic').fontSize(8.5).fillColor(BLACK)
       .text('Table 3.1: Current and planned institutional user roles and authorization scopes', 45, ry + 4, { width: 505, align: 'center' });

    doc.font('Times-Bold').fontSize(9.5).fillColor(BLACK).text('2. Feature Implementation Status', 55, ry + 20);

    const fStatusText = 'The system tracks twenty-two comprehensive functional specifications across the client, backend, and external integration tiers. Eighteen features are fully built and validated in version 2.5, while four advanced enterprise features are slated for future rollouts.';
    doc.font('Times-Roman').fontSize(8.8).fillColor(BLACK)
       .text(fStatusText, 55, ry + 34, { width: 485, align: 'justify', lineGap: 1.8 });

    // Table 3.2 Features
    const featTable = [
      ['Built & Verified in Current Build (v2.5)', 'Planned for Future Rollout Phases'],
      ['• Digital Library Membership Card with dynamic QR\n• Book Finder Exact Shelf Locator (Block/Floor/Rack)\n• Online Book Reservation & Timeslot Scheduling\n• Smart Waiting List with FIFO Promotion Engine\n• My Library Account Personal Dashboard\n• Multi-Channel Notifications (In-app + Email)\n• College Registration Number Authentication\n• Salted Password Hashing with bcryptjs (10 rounds)\n• Open Library by Internet Archive Live Ingestion\n• Bulk Student Onboarding via Excel (.xlsx/.csv)\n• Circulation Desk QR Scanner for Instant Checkout\n• Automated Overdue Fine Math ($0.50/day policy)\n• Dual-Engine PostgreSQL Persistence (pg / PGlite)\n• Strict requireLibrarian RBAC Security Guard', '• Automated UHF RFID Turnstile Gate Hardware\n• Payment Gateway Integration for UPI/Card Fines\n• Push Notifications via Firebase Cloud Messaging (FCM)\n• Automated Self-Service Book Drop Box Sensors']
    ];

    let fy = ry + 70;
    doc.rect(55, fy, 240, 16).fillAndStroke(TABLE_HEADER_BG, TABLE_BORDER);
    doc.font('Times-Bold').fontSize(7.5).fillColor(GREEN).text('Built & Verified in Current Build (v2.5)', 60, fy + 4, { width: 230, align: 'center' });

    doc.rect(295, fy, 245, 16).fillAndStroke(TABLE_HEADER_BG, TABLE_BORDER);
    doc.font('Times-Bold').fontSize(7.5).fillColor(RED).text('Planned for Future Rollout Phases', 300, fy + 4, { width: 235, align: 'center' });

    doc.rect(55, fy + 16, 240, 175).fillAndStroke(LIGHT_BG, TABLE_BORDER);
    doc.font('Times-Roman').fontSize(6.8).fillColor(BLACK).text(featTable[0][0], 62, fy + 22, { width: 226, lineGap: 2.2 });

    doc.rect(295, fy + 16, 245, 175).fillAndStroke('#FFFFFF', TABLE_BORDER);
    doc.font('Times-Roman').fontSize(6.8).fillColor(BLACK).text(featTable[0][1], 302, fy + 22, { width: 231, lineGap: 3 });

    doc.font('Times-Italic').fontSize(8.5).fillColor(BLACK)
       .text('Table 3.2: Comprehensive feature implementation matrix across production tiers', 45, fy + 196, { width: 505, align: 'center' });
  };

  // ----------------------------------------------------
  // BODY PAGE 22 (PDF Page 27): 3.2 SECURITY MEASURES
  // ----------------------------------------------------
  app.buildBodyPage22 = function() {
    addPageWithBorder('22');

    doc.font('Times-Bold').fontSize(11).fillColor(BLUE_HEADER)
       .text('3.2 SECURITY MEASURES AND DATA INTEGRITY', 45, 60);

    const secIntro = 'Because the Smart Campus Library Management System manages official institutional records, student credentials, and circulation ledgers, security was implemented at every layer of the architecture, from the transport network to database row constraints.';
    doc.font('Times-Roman').fontSize(9.5).fillColor(BLACK)
       .text(secIntro, 55, 78, { width: 485, align: 'justify', lineGap: 2.2 });

    // Multi-Layer Security Diagram (Figure 3.4)
    const figY = 120;
    doc.rect(55, figY, 485, 230).fillAndStroke(LIGHT_BG, TABLE_BORDER);
    doc.rect(55, figY, 485, 18).fill('#0F172A');
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF')
       .text('FIGURE 3.4: MULTI-LAYERED DEFENSE-IN-DEPTH SECURITY ARCHITECTURE', 60, figY + 5, { width: 475, align: 'center' });

    const secLayers = [
      { l: 'LAYER 1: NETWORK & TRANSPORT SECURITY', d: 'HTTPS/TLS encryption on all client endpoints; strict loopback binding on 127.0.0.1 for local environments; CORS origin whitelisting.', c: '#1E40AF' },
      { l: 'LAYER 2: AUTHENTICATION & TOKEN SIGNING', d: 'Cryptographically signed JSON Web Tokens (HMAC-SHA256); 7-day expiration window; stateless validation without server session bloat.', c: '#0D9488' },
      { l: 'LAYER 3: ROLE-BASED ACCESS CONTROL (RBAC)', d: 'requireLibrarian middleware intercepts all loan issuance, returns, and inventory modifications; student access triggers instant HTTP 403.', c: '#D97706' },
      { l: 'LAYER 4: INPUT SANITIZATION & SQL INJECTION DEFENSE', d: '100% parameterized SQL queries via pg client pool; rejection of raw string concatenations; HTML entity escaping for all user fields.', c: '#DC2626' },
      { l: 'LAYER 5: DIGITAL QR TAMPER RESISTANCE', d: 'Dynamic QR token embeds student registration number, timestamp, and HMAC signature; re-verified by librarian server before desk checkout.', c: '#7C3AED' }
    ];

    let sly = figY + 28;
    secLayers.forEach(sl => {
      doc.rect(65, sly, 465, 36).fillAndStroke('#FFFFFF', '#CBD5E1');
      doc.rect(65, sly, 4, 36).fill(sl.c);
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor(sl.c).text(sl.l, 75, sly + 5);
      doc.font('Times-Roman').fontSize(7.2).fillColor(DARK_SLATE).text(sl.d, 75, sly + 17, { width: 445, lineGap: 1.2 });
      sly += 40;
    });

    doc.font('Times-Italic').fontSize(8.5).fillColor(BLACK)
       .text('Figure 3.4: Multi-layered security defense architecture protecting the campus library platform', 45, figY + 234, { width: 505, align: 'center' });

    doc.font('Times-Bold').fontSize(9.5).fillColor(BLACK).text('1. Role-Based Access Control (RBAC) Enforcement', 55, 375);
    const rbacD = 'The most critical institutional constraint is ensuring that students cannot self-issue books or modify circulation records. All circulation routes (/api/borrow/issue, /api/borrow/return/:id, /api/books) require the requireLibrarian middleware. If the verified token role is not "librarian", the request is rejected immediately with HTTP 403 Forbidden, logging an audit warning.';
    doc.font('Times-Roman').fontSize(8.8).fillColor(BLACK)
       .text(rbacD, 65, 390, { width: 475, align: 'justify', lineGap: 1.8 });

    doc.font('Times-Bold').fontSize(9.5).fillColor(BLACK).text('2. Password Encryption via Salted Hashing', 55, 450);
    const passD = 'Plain-text passwords are never stored or transmitted in application logs. When a student registers or is onboarded via Excel upload, their password is processed using bcryptjs with 10 salt rounds. Even if database tables were compromised, brute-force dictionary attacks remain computationally infeasible.';
    doc.font('Times-Roman').fontSize(8.8).fillColor(BLACK)
       .text(passD, 65, 465, { width: 475, align: 'justify', lineGap: 1.8 });

    doc.font('Times-Bold').fontSize(9.5).fillColor(BLACK).text('3. Data Isolation for Student Accounts', 55, 520);
    const isoD = 'When a student queries their personal dashboard (/api/borrow/my-books, /api/reservations/my), the controller extracts the user ID directly from the cryptographically validated req.user.id JWT payload. Students cannot supply arbitrary user IDs in query parameters to inspect peer borrowing records.';
    doc.font('Times-Roman').fontSize(8.8).fillColor(BLACK)
       .text(isoD, 65, 535, { width: 475, align: 'justify', lineGap: 1.8 });
  };

  // ----------------------------------------------------
  // BODY PAGE 23 (PDF Page 28): 3.2 SEC CONT. & 3.3 TESTING
  // ----------------------------------------------------
  app.buildBodyPage23 = function() {
    addPageWithBorder('23');

    doc.font('Times-Bold').fontSize(9.5).fillColor(BLACK).text('4. Data Privacy: Collected vs Excluded Parameters', 55, 60);

    // Table 3.3 Privacy
    const privTable = [
      ['Data Fields Collected & Persisted', 'Strictly Excluded (Never Stored or Logged)'],
      ['• Student Full Name, College Registration Number\n• College Email, Department, Course, Semester\n• Salted & Hashed Passwords (bcryptjs 10 rounds)\n• Book Bibliographic Details (Title, Author, ISBN)\n• Exact Shelf Physical Coordinates (Block/Floor/Rack)\n• Borrowing Timestamps, Due Dates, and Fines\n• In-App System Notifications & Announcement Texts', '• Plain-text Student Passwords or Recovery Keys\n• Student Banking, UPI, or Credit Card Details\n• Device Geolocation Coordinates or GPS Traces\n• Personal Private Web Browsing Histories\n• Biometric Fingerprint or Facial Scan Raw Data\n• External Third-Party Network Credentials']
    ];

    let py = 76;
    doc.rect(55, py, 240, 16).fillAndStroke(TABLE_HEADER_BG, TABLE_BORDER);
    doc.font('Times-Bold').fontSize(7.5).fillColor(GREEN).text('Data Fields Collected & Persisted', 60, py + 4, { width: 230, align: 'center' });

    doc.rect(295, py, 245, 16).fillAndStroke(TABLE_HEADER_BG, TABLE_BORDER);
    doc.font('Times-Bold').fontSize(7.5).fillColor(RED).text('Strictly Excluded (Never Stored or Logged)', 300, py + 4, { width: 235, align: 'center' });

    doc.rect(55, py + 16, 240, 95).fillAndStroke(LIGHT_BG, TABLE_BORDER);
    doc.font('Times-Roman').fontSize(6.8).fillColor(BLACK).text(privTable[0][0], 62, py + 22, { width: 226, lineGap: 2.2 });

    doc.rect(295, py + 16, 245, 95).fillAndStroke('#FFFFFF', TABLE_BORDER);
    doc.font('Times-Roman').fontSize(6.8).fillColor(BLACK).text(privTable[0][1], 302, py + 22, { width: 231, lineGap: 2.2 });

    doc.font('Times-Italic').fontSize(8.5).fillColor(BLACK)
       .text('Table 3.3: Data privacy classification and explicit information boundary matrix', 45, py + 116, { width: 505, align: 'center' });

    doc.font('Times-Bold').fontSize(11).fillColor(BLUE_HEADER)
       .text('3.3 TESTING AND QUALITY ASSURANCE', 45, py + 135);

    const qaIntro = 'A four-tier testing methodology was executed to validate the correctness, security boundaries, and performance benchmarks of the system. Testing covered automated unit assertions, end-to-end integration workflows, Android emulator simulations, and security penetration audits.';
    doc.font('Times-Roman').fontSize(9).fillColor(BLACK)
       .text(qaIntro, 55, py + 152, { width: 485, align: 'justify', lineGap: 2 });

    // Table 3.4 Testing Levels
    const testLevels = [
      ['Testing Tier', 'Validation Methodology & Tools', 'Verification Scope & Covered Scenarios'],
      ['Unit Testing', 'Node.js Test Assertions & Jest / Supertest', 'Controllers, password hashing verification, JWT token signing, and shelf coordinate parsing logic.'],
      ['Integration Testing', 'Automated API Test Suite (/api/health)', 'Multi-step reservation creation, waiting list FIFO promotion, and book return stock incrementation.'],
      ['Mobile Client Testing', 'Android Studio Emulator (API 34 / Pixel 7)', 'Material 3 UI rendering, dynamic QR card display, category chip filtering, and network timeout handling.'],
      ['Security & RBAC Auditing', 'OWASP ZAP & Postman Scripting', 'Testing unauthorized circulation requests (403 Forbidden verification), SQL injection probes, and token tampering.']
    ];

    let ty = py + 200;
    testLevels.forEach((row, idx) => {
      const isHeader = idx === 0;
      const h = isHeader ? 16 : 22;
      doc.rect(55, ty, 485, h).fillAndStroke(isHeader ? TABLE_HEADER_BG : (idx % 2 === 0 ? LIGHT_BG : '#FFFFFF'), TABLE_BORDER);
      doc.font('Times-Bold').fontSize(7.5).fillColor(isHeader ? BLACK : BLUE_HEADER)
         .text(row[0], 60, ty + 4, { width: 100 });
      doc.font('Times-Bold').fontSize(7).fillColor(DARK_SLATE)
         .text(row[1], 165, ty + 4, { width: 140 });
      doc.font('Times-Roman').fontSize(6.8).fillColor(BLACK)
         .text(row[2], 310, ty + 3, { width: 225, lineGap: 1 });
      ty += h;
    });

    doc.font('Times-Italic').fontSize(8.5).fillColor(BLACK)
       .text('Table 3.4: Four-tier quality assurance testing methodology and evaluation scopes', 45, ty + 4, { width: 505, align: 'center' });
  };

  // ----------------------------------------------------
  // BODY PAGE 24 (PDF Page 29): 3.3 TEST RESULTS & METRICS
  // ----------------------------------------------------
  app.buildBodyPage24 = function() {
    addPageWithBorder('24');

    doc.font('Times-Bold').fontSize(10.5).fillColor(BLUE_HEADER)
       .text('3.3 TEST VERIFICATION MATRIX AND PERFORMANCE RESULTS', 45, 60);

    // Table 3.5 Test Matrix
    const tMatrix = [
      ['ID', 'Test Scenario', 'Input & Execution Payload', 'Expected & Verified Outcome', 'Status'],
      ['TC-01', 'Librarian Authentication', 'POST /api/auth/login (admin@library.com)', 'HTTP 200 OK, JWT returned with role: librarian', 'PASSED'],
      ['TC-02', 'Student Registration No. Login', 'POST /api/auth/login (24054-CPS-062)', 'HTTP 200 OK, JWT returned with role: student', 'PASSED'],
      ['TC-03', 'Student Loan Tamper Block', 'Student token calling POST /api/borrow/issue', 'HTTP 403 Forbidden ("Librarian access required")', 'PASSED'],
      ['TC-04', 'Exact Shelf Locator Query', 'GET /api/books?search=Algorithms', 'HTTP 200 OK, returns Block A, Floor 2, Rack 08, Shelf 03', 'PASSED'],
      ['TC-05', 'Online Book Reservation', 'POST /api/reservations (bookId, timeslot)', 'HTTP 201 Created, unique Reservation ID generated', 'PASSED'],
      ['TC-06', 'Smart Waiting List Queue', 'POST /api/reservations on zero-stock book', 'HTTP 201 Created, assigned FIFO queue position #1', 'PASSED'],
      ['TC-07', 'Waiting List FIFO Promotion', 'POST /api/borrow/return/:id for waited book', 'HTTP 200 OK, copy held, pickup notification sent', 'PASSED'],
      ['TC-08', 'Digital QR Code Verification', 'Desk terminal scans dynamic student QR', 'HTTP 200 OK, student profile & active loans loaded', 'PASSED'],
      ['TC-09', 'Binary Excel Template Download', 'GET /api/auth/students/template', 'HTTP 200 OK, valid binary .xlsx workbook streamed', 'PASSED'],
      ['TC-10', 'Bulk Student Excel Upload', 'POST /api/auth/students/upload with .xlsx file', 'HTTP 201 Created, batch summary report returned', 'PASSED']
    ];

    let tmy = 78;
    tMatrix.forEach((row, idx) => {
      const isHeader = idx === 0;
      const h = isHeader ? 15 : 18;
      doc.rect(55, tmy, 485, h).fillAndStroke(isHeader ? TABLE_HEADER_BG : (idx % 2 === 0 ? LIGHT_BG : '#FFFFFF'), TABLE_BORDER);
      doc.font('Times-Bold').fontSize(7).fillColor(isHeader ? BLACK : DARK_SLATE)
         .text(row[0], 58, tmy + 4, { width: 28, align: 'center' });
      doc.font('Times-Bold').fontSize(7).fillColor(isHeader ? BLACK : BLUE_HEADER)
         .text(row[1], 90, tmy + 4, { width: 110 });
      doc.font('Times-Roman').fontSize(6.5).fillColor(DARK_SLATE)
         .text(row[2], 205, tmy + 3, { width: 125, lineGap: 1 });
      doc.font('Times-Roman').fontSize(6.5).fillColor(BLACK)
         .text(row[3], 335, tmy + 3, { width: 155, lineGap: 1 });
      doc.font('Times-Bold').fontSize(7).fillColor(isHeader ? BLACK : GREEN)
         .text(row[4], 495, tmy + 4, { width: 40, align: 'center' });
      tmy += h;
    });

    doc.font('Times-Italic').fontSize(8.5).fillColor(BLACK)
       .text('Table 3.5: Comprehensive test execution matrix demonstrating 100% pass verification', 45, tmy + 4, { width: 505, align: 'center' });

    // 4 Metric Highlight Cards (Figure 3.6)
    const mY = tmy + 22;
    doc.rect(55, mY, 485, 80).fillAndStroke(LIGHT_BG, TABLE_BORDER);
    doc.rect(55, mY, 485, 18).fill('#0F172A');
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF')
       .text('FIGURE 3.6: OBSERVED SYSTEM PERFORMANCE BENCHMARKS & RELIABILITY METRICS', 60, mY + 5, { width: 475, align: 'center' });

    const pMetrics = [
      { l: 'API RESPONSE TIME', v: '< 42 ms', s: 'REST Controller Latency' },
      { l: 'QR DESK SCAN TIME', v: '< 180 ms', s: 'Camera Decode Speed' },
      { l: 'DATABASE QUERIES', v: '< 6.5 ms', s: 'PostgreSQL Pool Exec' },
      { l: 'TEST SUITE PASS', v: '100 %', s: 'All 10 Test Cases Passed' }
    ];

    let pmx = 65;
    pMetrics.forEach(pm => {
      doc.rect(pmx, mY + 26, 110, 44).fillAndStroke('#FFFFFF', '#CBD5E1');
      doc.rect(pmx, mY + 26, 110, 3).fill(GREEN);
      doc.font('Helvetica-Bold').fontSize(6.5).fillColor('#64748B').text(pm.l, pmx + 4, mY + 32, { width: 102, align: 'center' });
      doc.font('Helvetica-Bold').fontSize(12).fillColor(GREEN).text(pm.v, pmx + 4, mY + 44, { width: 102, align: 'center' });
      doc.font('Helvetica').fontSize(6).fillColor(DARK_SLATE).text(pm.s, pmx + 4, mY + 60, { width: 102, align: 'center' });
      pmx += 120;
    });

    doc.font('Times-Italic').fontSize(8.5).fillColor(BLACK)
       .text('Figure 3.6: Summary of observed system response times, scan latencies, and reliability metrics', 45, mY + 84, { width: 505, align: 'center' });

    // Summary Narrative
    doc.font('Times-Roman').fontSize(8.8).fillColor(BLACK).text(
      'Observed test results confirm that the system meets all institutional throughput criteria. The elimination of heavy client-side frameworks and deployment of indexed PostgreSQL relational structures allows circulation checkouts to complete in under 200 milliseconds, fully eliminating student circulation desk queuing.',
      55, mY + 105, { width: 485, align: 'justify', lineGap: 1.8 }
    );
  };
}

module.exports = registerChapter3;
