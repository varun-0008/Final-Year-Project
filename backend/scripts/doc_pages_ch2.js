// Chapter 2 Page Builders (Pages 11 to 23 in PDF, labeled Pages 6 to 18)

function registerChapter2(app) {
  const { doc, addPageWithBorder, RED, BLUE_HEADER, GREEN, DARK_SLATE, BLACK, TABLE_HEADER_BG, TABLE_BORDER, LIGHT_BG, MUTED_COLOR } = app;

  // ----------------------------------------------------
  // BODY PAGE 6 (PDF Page 11): 2.1 TECHNOLOGY STACK
  // ----------------------------------------------------
  app.buildBodyPage6 = function() {
    addPageWithBorder('6');

    doc.font('Times-Bold').fontSize(14).fillColor(RED)
       .text('CHAPTER – 2', 45, 60, { width: 505, align: 'center' });
    doc.font('Times-Bold').fontSize(13.5).fillColor(BLACK)
       .text('TECHNICAL FOUNDATIONS AND DESIGN', 45, 78, { width: 505, align: 'center' });

    doc.font('Times-Bold').fontSize(11).fillColor(BLUE_HEADER)
       .text('2.1 TECHNOLOGY STACK', 45, 105);

    const tsIntro = 'The technology stack represents the foundational programming languages, runtime environments, application servers, persistence engines, and client libraries selected to build the Smart Campus Library Management System. The stack was deliberately chosen to prioritize performance, native responsiveness, and zero third-party framework overhead.';
    doc.font('Times-Roman').fontSize(9.5).fillColor(BLACK)
       .text(tsIntro, 55, 122, { width: 485, align: 'justify', lineGap: 2.2 });

    // Technology Stack 3-Box Graphic (Figure 2.1)
    const boxY = 175;
    const boxW = 155;
    const boxH = 145;

    // Backend Box
    doc.rect(55, boxY, boxW, boxH).fillAndStroke('#EFF6FF', '#BFDBFE');
    doc.rect(55, boxY, boxW, 20).fill('#1E40AF');
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#FFFFFF').text('BACKEND & API', 55, boxY + 6, { width: boxW, align: 'center' });
    doc.font('Helvetica').fontSize(7.2).fillColor(DARK_SLATE).text(
      '• Node.js v24.14.0 (LTS)\n• Express.js 4.19+ REST API\n• PostgreSQL (Dual Engine: pg / PGlite)\n• jsonwebtoken (JWT Auth)\n• bcryptjs (Salted Hashing)\n• SheetJS (xlsx) Engine\n• Multer (Multipart Form Parser)\n• Node Native Fetch (Open Library API)',
      62, boxY + 26, { lineGap: 3 }
    );

    // Frontend Web Box
    doc.rect(220, boxY, boxW, boxH).fillAndStroke('#F0FDF4', '#BBF7D0');
    doc.rect(220, boxY, boxW, 20).fill('#166534');
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#FFFFFF').text('ADMIN WEB PORTAL', 220, boxY + 6, { width: boxW, align: 'center' });
    doc.font('Helvetica').fontSize(7.2).fillColor(DARK_SLATE).text(
      '• Semantic HTML5 Markup\n• Modern CSS3 (Grid & Flexbox)\n• Vanilla JavaScript (ES6+)\n• Zero Frontend Framework Bloat\n• Custom Modal & Dropzone Engine\n• Camera Video Stream API (QR)\n• Asynchronous Fetch API Client\n• Responsive Fluid Design System',
      227, boxY + 26, { lineGap: 3 }
    );

    // Mobile App Box
    doc.rect(385, boxY, boxW, boxH).fillAndStroke('#FEF3C7', '#FDE68A');
    doc.rect(385, boxY, boxW, 20).fill('#B45309');
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#FFFFFF').text('STUDENT MOBILE CLIENT', 385, boxY + 6, { width: boxW, align: 'center' });
    doc.font('Helvetica').fontSize(7.2).fillColor(DARK_SLATE).text(
      '• Native Android SDK (API 26-34)\n• Kotlin 1.9+ Programming\n• Retrofit2 & OkHttp3 Client\n• Android Jetpack ViewBinding\n• Google Material 3 Design\n• SharedPreferences Session Store\n• Dynamic QR Code Generator\n• High-Res Image Cache (Glide/Picasso)',
      392, boxY + 26, { lineGap: 3 }
    );

    doc.font('Times-Italic').fontSize(8.5).fillColor(BLACK)
       .text('Figure 2.1: Core technology stack of Smart Campus Library Management System', 45, boxY + boxH + 6, { width: 505, align: 'center' });

    // Detailed descriptions
    doc.font('Times-Bold').fontSize(9.5).fillColor(BLACK).text('1. Backend Runtime: Node.js & Express.js', 55, 345);
    doc.font('Times-Roman').fontSize(8.8).fillColor(BLACK).text(
      'Node.js provides a single-threaded, non-blocking asynchronous event loop ideally suited for high-concurrency campus library traffic. Express.js orchestrates REST routing, modular controllers, and security middleware.',
      65, 359, { width: 475, align: 'justify', lineGap: 1.8 }
    );

    doc.font('Times-Bold').fontSize(9.5).fillColor(BLACK).text('2. Administrative Web Portal: Pure Vanilla Web Standards', 55, 400);
    doc.font('Times-Roman').fontSize(8.8).fillColor(BLACK).text(
      'Built strictly without client frameworks (no React, Angular, or Vue), the admin portal leverages modern CSS3 Custom Properties, CSS Grid layouts, and Vanilla JS DOM manipulation. The result is instant initial rendering under 250ms and complete independence from node packaging in production web serving.',
      65, 414, { width: 475, align: 'justify', lineGap: 1.8 }
    );

    doc.font('Times-Bold').fontSize(9.5).fillColor(BLACK).text('3. Student Mobile Application: Native Android with Kotlin', 55, 465);
    doc.font('Times-Roman').fontSize(8.8).fillColor(BLACK).text(
      'Native Kotlin on the Android SDK guarantees superior execution performance, full hardware integration (camera, local encrypted storage), fluid 60fps Material 3 animations, and background notification capability.',
      65, 479, { width: 475, align: 'justify', lineGap: 1.8 }
    );

    doc.font('Times-Bold').fontSize(9.5).fillColor(BLACK).text('4. Database Architecture: Dual-Engine PostgreSQL', 55, 520);
    doc.font('Times-Roman').fontSize(8.8).fillColor(BLACK).text(
      'PostgreSQL offers robust ACID guarantees, foreign key cascades, and complex analytical filtering. The system supports native external PostgreSQL on port 5432, alongside an embedded persistent engine (PGlite) storing tables in backend/database/pgdata for zero-config demonstration.',
      65, 534, { width: 475, align: 'justify', lineGap: 1.8 }
    );

    doc.font('Times-Bold').fontSize(9.5).fillColor(BLACK).text('5. External Integrations: Open Library & SheetJS', 55, 585);
    doc.font('Times-Roman').fontSize(8.8).fillColor(BLACK).text(
      'Direct REST connectivity with openlibrary.org provides bibliographic metadata, author normalization, and book cover thumbnails. The SheetJS engine processes binary Excel workbooks in memory without temporary disk exposure.',
      65, 599, { width: 475, align: 'justify', lineGap: 1.8 }
    );
  };

  // ----------------------------------------------------
  // BODY PAGE 7 (PDF Page 12): 2.2 SYSTEM ARCHITECTURE
  // ----------------------------------------------------
  app.buildBodyPage7 = function() {
    addPageWithBorder('7');

    doc.font('Times-Bold').fontSize(11).fillColor(BLUE_HEADER)
       .text('2.2 SYSTEM ARCHITECTURE', 45, 60);

    const archText = 'The Smart Campus Library Management System is architected in a classic 3-Tier Enterprise Client-Server pattern. This separation of concerns guarantees complete decoupling between client visual representations, core business logic rules, and transactional database persistence.';
    doc.font('Times-Roman').fontSize(9.5).fillColor(BLACK)
       .text(archText, 55, 78, { width: 485, align: 'justify', lineGap: 2.2 });

    // Architectural Layer Diagram (Figure 2.2)
    const archY = 120;
    doc.rect(55, archY, 485, 290).fillAndStroke(LIGHT_BG, TABLE_BORDER);
    doc.rect(55, archY, 485, 20).fill('#0F172A');
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#FFFFFF')
       .text('FIGURE 2.2: THREE-TIER SYSTEM ARCHITECTURE & COMPONENT TOPOLOGY', 60, archY + 6, { width: 475, align: 'center' });

    // Tier 1
    const t1Y = archY + 30;
    doc.rect(65, t1Y, 465, 60).fillAndStroke('#EFF6FF', '#93C5FD');
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#1E3A8A').text('TIER 1: CLIENT PRESENTATION LAYER (USER TOUCHPOINTS)', 75, t1Y + 5);
    doc.font('Helvetica').fontSize(6.8).fillColor(DARK_SLATE).text(
      '• Kotlin Native Mobile Client (Android): Material 3 UX, Retrofit2, Book Finder Shelf Locator, Digital Card with QR, My Library Account Dashboard.\n• Librarian Web Portal (Vanilla HTML5/CSS3/JS): Single-Page Application (SPA), Circulation Counter, Real-Time Open Library Explorer, Excel Upload Dropzone.',
      75, t1Y + 18, { width: 450, lineGap: 2 }
    );

    // Connector
    doc.font('Helvetica-Bold').fontSize(7).fillColor(MUTED_COLOR)
       .text('▲▼  HTTP/2 & HTTPS RESTful API (JSON Payload / Bearer JWT Authentication Token)  ▲▼', 55, t1Y + 66, { width: 485, align: 'center' });

    // Tier 2
    const t2Y = t1Y + 80;
    doc.rect(65, t2Y, 465, 80).fillAndStroke('#FEF3C7', '#FCD34D');
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#78350F').text('TIER 2: APPLICATION & BUSINESS LOGIC LAYER (NODE.JS EXPRESS REST API)', 75, t2Y + 5);
    doc.font('Helvetica').fontSize(6.8).fillColor(DARK_SLATE).text(
      '• Modular Controllers: authController | bookController | borrowController | reservationController | notificationController\n• Security Guards: authenticateToken (Cryptographic JWT Signature Verification) & requireLibrarian (403 Forbidden RBAC Enforcement)\n• Core Algorithms: Smart Waiting List FIFO Progression Engine | Exact Shelf Coordinate Parser (Block/Floor/Rack/Shelf)\n• Ingestion Engines: SheetJS (.xlsx/.csv binary buffer parsing & streaming generation) | Open Library HTTP Client Gateway',
      75, t2Y + 18, { width: 450, lineGap: 2 }
    );

    // Connector
    doc.font('Helvetica-Bold').fontSize(7).fillColor(MUTED_COLOR)
       .text('▲▼  PostgreSQL Relational Client Connection Pool (SQL)  ▲▼                 ▲▼  External HTTPS  ▲▼', 55, t2Y + 86, { width: 485, align: 'center' });

    // Tier 3
    const t3Y = t2Y + 100;
    doc.rect(65, t3Y, 260, 48).fillAndStroke('#DCFCE7', '#86EFAC');
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#166534').text('TIER 3A: PERSISTENT POSTGRESQL DATABASE', 75, t3Y + 5);
    doc.font('Helvetica').fontSize(6.8).fillColor(DARK_SLATE).text(
      '• Relational Tables in 3NF: users, books, borrow_records, reservations, waiting_list, notifications, announcements.\n• Dual Engine: External pg (5432) or Embedded PGlite.',
      75, t3Y + 16, { width: 245, lineGap: 1.5 }
    );

    doc.rect(335, t3Y, 195, 48).fillAndStroke('#F3E8FF', '#D8B4FE');
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#6B21A8').text('TIER 3B: EXTERNAL DATA & SMTP', 345, t3Y + 5);
    doc.font('Helvetica').fontSize(6.8).fillColor(DARK_SLATE).text(
      '• Open Library (Internet Archive) API\n• SMTP Mail Server (Email Alerts)\n• Dynamic QR Matrix Encoding Engine',
      345, t3Y + 16, { width: 180, lineGap: 1.5 }
    );

    doc.font('Times-Italic').fontSize(8.5).fillColor(BLACK)
       .text('Figure 2.2: Layered architecture and operational boundaries of Smart Campus Library', 45, archY + 295, { width: 505, align: 'center' });

    // Descriptions below
    doc.font('Times-Bold').fontSize(9).fillColor(BLACK).text('1. Presentation Layer (Decoupled Clients)', 55, 435);
    doc.font('Times-Roman').fontSize(8.5).fillColor(BLACK).text(
      'The presentation layer hosts two dedicated clients. The Native Android Kotlin application delivers high-performance student interactions, offline session caching, and camera-ready digital card rendering. The Vanilla Web portal offers library staff an ergonomic, tabbed circulation dashboard with zero runtime bundle dependencies.',
      65, 448, { width: 475, align: 'justify', lineGap: 1.5 }
    );

    doc.font('Times-Bold').fontSize(9).fillColor(BLACK).text('2. Application Layer (Centralized Logic & Security)', 55, 498);
    doc.font('Times-Roman').fontSize(8.5).fillColor(BLACK).text(
      'The application tier acts as the central orchestrator. All inbound requests must negotiate authentication and authorization middleware before execution. It enforces inventory invariants (e.g., available copies cannot exceed total copies, loans cannot be self-issued by students).',
      65, 511, { width: 475, align: 'justify', lineGap: 1.5 }
    );

    doc.font('Times-Bold').fontSize(9).fillColor(BLACK).text('3. Data Persistence Layer (Relational Integrity)', 55, 560);
    doc.font('Times-Roman').fontSize(8.5).fillColor(BLACK).text(
      'Data integrity is guaranteed through PostgreSQL relational constraints. Foreign key relationships enforce referential integrity with ON DELETE CASCADE on student records and ON DELETE RESTRICT on active book loans.',
      65, 573, { width: 475, align: 'justify', lineGap: 1.5 }
    );
  };

  // ----------------------------------------------------
  // BODY PAGE 8 (PDF Page 13): 2.3 MODULE DESCRIPTION & STRUCTURE
  // ----------------------------------------------------
  app.buildBodyPage8 = function() {
    addPageWithBorder('8');

    doc.font('Times-Bold').fontSize(11).fillColor(BLUE_HEADER)
       .text('2.3 MODULE DESCRIPTION AND PROJECT STRUCTURE', 45, 60);

    doc.font('Times-Bold').fontSize(9.5).fillColor(BLACK).text('1. Backend Architecture & Controller Modules', 55, 78);

    // Table 2.1 Backend Modules
    const bModules = [
      ['Module / Service', 'File Location', 'Core Responsibilities & Capabilities'],
      ['Auth Controller', 'backend/controllers/authController.js', 'Registration, login, password hashing (bcryptjs), JWT token signing, Excel roster upload, and binary template download.'],
      ['Book Controller', 'backend/controllers/bookController.js', 'Catalog CRUD, search, category extraction, shelf coordinate parsing, and Open Library import proxy.'],
      ['Borrow Controller', 'backend/controllers/borrowController.js', 'Circulation issuance, return processing, overdue calculation, daily fine math, and student personal loan histories.'],
      ['Reservation Controller', 'backend/controllers/reservationController.js', 'Book reservation lifecycle, timeslot scheduling, waiting list FIFO assignment, and status updates.'],
      ['Notification Controller', 'backend/controllers/notificationController.js', 'In-app notification feeds, unread badge tracking, broadcast announcements, and SMTP email dispatching.'],
      ['Open Library Service', 'backend/services/openLibraryService.js', 'External client interfacing with openlibrary.org, resolving author arrays, ISBN-10/13, and cover artwork.'],
      ['Database Engine', 'backend/config/db.js', 'Dual-engine PostgreSQL connector: native pg connection pool with auto-fallback to embedded PGlite.']
    ];

    let my = 95;
    bModules.forEach((row, idx) => {
      const isHeader = idx === 0;
      const h = isHeader ? 16 : 22;
      doc.rect(55, my, 485, h).fillAndStroke(isHeader ? TABLE_HEADER_BG : (idx % 2 === 0 ? LIGHT_BG : '#FFFFFF'), TABLE_BORDER);
      doc.font(isHeader ? 'Times-Bold' : 'Times-Bold').fontSize(7.5).fillColor(isHeader ? BLACK : BLUE_HEADER)
         .text(row[0], 60, my + 4, { width: 95 });
      doc.font('Courier').fontSize(6.5).fillColor(DARK_SLATE)
         .text(row[1], 160, my + 4, { width: 145 });
      doc.font('Times-Roman').fontSize(7).fillColor(BLACK)
         .text(row[2], 310, my + 3, { width: 225, lineGap: 1 });
      my += h;
    });

    doc.font('Times-Italic').fontSize(8.5).fillColor(BLACK)
       .text('Table 2.1: Backend modular components and primary operational scopes', 45, my + 4, { width: 505, align: 'center' });

    doc.font('Times-Bold').fontSize(9.5).fillColor(BLACK).text('2. Client Interface & Mobile Components', 55, my + 20);

    // Table 2.2 Frontend Components
    const cModules = [
      ['Component / Activity', 'Platform', 'Technical Function & UI Role'],
      ['MainActivity.kt', 'Android / Kotlin', 'Tab host container for Catalog, My Loans, Profile, and Notifications.'],
      ['BookDetailActivity.kt', 'Android / Kotlin', 'Displays cover art, description, copies, and Book Finder Exact Shelf Locator.'],
      ['DigitalCardActivity.kt', 'Android / Kotlin', 'Renders Digital Library Membership Card with dynamic QR & collegiate motto.'],
      ['ReservationActivity.kt', 'Android / Kotlin', 'Handles date/timeslot selection, reservation tracking, and cancellation.'],
      ['index.html & app.js', 'Web / Vanilla JS', 'Single-Page Application dashboard: Overview, Catalog, Circulation, Excel dropzone.'],
      ['api.js', 'Web / Vanilla JS', 'Asynchronous HTTP fetch client with automated JWT bearer attachment and error handling.']
    ];

    let cy = my + 34;
    cModules.forEach((row, idx) => {
      const isHeader = idx === 0;
      const h = isHeader ? 16 : 20;
      doc.rect(55, cy, 485, h).fillAndStroke(isHeader ? TABLE_HEADER_BG : (idx % 2 === 0 ? LIGHT_BG : '#FFFFFF'), TABLE_BORDER);
      doc.font('Times-Bold').fontSize(7.5).fillColor(isHeader ? BLACK : GREEN)
         .text(row[0], 60, cy + 4, { width: 110 });
      doc.font('Times-Bold').fontSize(7).fillColor(DARK_SLATE)
         .text(row[1], 175, cy + 4, { width: 85 });
      doc.font('Times-Roman').fontSize(7).fillColor(BLACK)
         .text(row[2], 265, cy + 3, { width: 270, lineGap: 1 });
      cy += h;
    });

    doc.font('Times-Italic').fontSize(8.5).fillColor(BLACK)
       .text('Table 2.2: Client-side components across Web and Native Mobile platforms', 45, cy + 4, { width: 505, align: 'center' });

    // Module Interaction Diagram (Figure 2.3)
    const figY = cy + 20;
    doc.rect(55, figY, 485, 78).fillAndStroke(LIGHT_BG, TABLE_BORDER);
    doc.rect(55, figY, 485, 16).fill('#0F172A');
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF')
       .text('FIGURE 2.3: SYSTEM INTERACTION TOPOLOGY & CALL DELEGATION FLOW', 60, figY + 4, { width: 475, align: 'center' });

    doc.font('Courier').fontSize(6.5).fillColor(DARK_SLATE).text(
      '  [Android Client / Web Portal]\n' +
      '           | (HTTP POST / GET with Bearer JWT)\n' +
      '           v\n' +
      '     [server.js] --> [auth.js Middleware: verifyToken & requireLibrarian]\n' +
      '           |\n' +
      '     +-----+-------------------+-------------------+-------------------+\n' +
      '     |                         |                   |                   |\n' +
      '  [authController]     [bookController]    [borrowController]  [reservationController]\n' +
      '     | (SheetJS/bcrypt)        | (OpenLibrary API) | (Fine Calculation)| (FIFO Waiting List)\n' +
      '     +-------------------------+-------------------+-------------------+\n' +
      '                               |\n' +
      '                               v\n' +
      '                   [config/db.js: PostgreSQL Pool]',
      60, figY + 20, { lineGap: 1.2 }
    );
  };

  // ----------------------------------------------------
  // BODY PAGE 9 (PDF Page 14): 2.4 DATA FLOW AND DATABASE DESIGN
  // ----------------------------------------------------
  app.buildBodyPage9 = function() {
    addPageWithBorder('9');

    doc.font('Times-Bold').fontSize(11).fillColor(BLUE_HEADER)
       .text('2.4 DATA FLOW AND DATABASE DESIGN', 45, 60);

    const dfText = 'The data flow of the Smart Campus Library Management System follows a strictly verified, unidirectional pipeline from initial client request authentication through algorithmic validation to transactional relational persistence. Every transaction maintains strict auditability, ensuring no state modification occurs without explicit identity verification.';
    doc.font('Times-Roman').fontSize(9.5).fillColor(BLACK)
       .text(dfText, 55, 78, { width: 485, align: 'justify', lineGap: 2.2 });

    // Figure 2.4 Data Flow Diagram
    const figY = 125;
    doc.rect(55, figY, 485, 420).fillAndStroke(LIGHT_BG, TABLE_BORDER);
    doc.rect(55, figY, 485, 20).fill('#0F172A');
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#FFFFFF')
       .text('FIGURE 2.4: SEVEN-STAGE TRANSACTIONAL DATA FLOW ARCHITECTURE', 60, figY + 6, { width: 475, align: 'center' });

    const stages = [
      { s: 'STAGE 1: STUDENT AUTHENTICATION & IDENTITY REGISTRATION', d: 'Student logs in using College Registration Number and Password. Server verifies bcrypt hash, validates college email domain, and issues signed JWT bearer token containing User ID, Role, and Membership Validity.' },
      { s: 'STAGE 2: CATALOG QUERY & EXACT SHELF COORDINATE RESOLUTION', d: 'User queries books by title, author, or genre. Database executes parameterized SQL with LIKE filters. System maps physical shelf coordinates (Block A, Floor 2, Section CS, Rack 08, Shelf 03) and displays live inventory.' },
      { s: 'STAGE 3: ONLINE BOOK RESERVATION & TIMESLOT SCHEDULING', d: 'Student initiates physical copy reservation and selects preferred pickup window. If available copies > 0, system creates pending reservation record and issues unique alphanumeric Reservation ID.' },
      { s: 'STAGE 4: DETERMINISTIC SMART WAITING LIST ALLOCATION', d: 'If book stock is exhausted (available copies = 0), request is automatically routed to the Smart Waiting List table with a timestamped FIFO priority queue rank.' },
      { s: 'STAGE 5: CIRCULATION CHECKOUT VIA DIGITAL QR VERIFICATION', d: 'Student presents in-app Digital Library Membership Card at circulation counter. Librarian scans dynamic QR code, verifies student identity, and transitions book to active borrowed status in borrow_records.' },
      { s: 'STAGE 6: BOOK RETURN PROCESSING & AUTOMATED FINE COMPUTATION', d: 'Upon book return, librarian marks record returned. Server recalculates return date against due date, computing daily overdue fine ($0.50/day). Available copies increment by +1.' },
      { s: 'STAGE 7: AUTOMATED MULTI-CHANNEL NOTIFICATION BROADCAST', d: 'Inventory increment triggers Smart Waiting List check. If queued students exist, copy is held and in-app/email alerts dispatch immediately. System broadcasts loan reminders and overdue warnings.' }
    ];

    let sy = figY + 28;
    stages.forEach((st, idx) => {
      doc.rect(65, sy, 465, 48).fillAndStroke('#FFFFFF', '#CBD5E1');
      doc.rect(65, sy, 4, 48).fill(BLUE_HEADER);
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor(BLUE_HEADER).text(st.s, 75, sy + 5);
      doc.font('Times-Roman').fontSize(7.2).fillColor(DARK_SLATE).text(st.d, 75, sy + 17, { width: 445, lineGap: 1.5 });
      if (idx < stages.length - 1) {
        doc.font('Helvetica-Bold').fontSize(7).fillColor(MUTED_COLOR).text('▼', 290, sy + 49);
      }
      sy += 55;
    });

    doc.font('Times-Italic').fontSize(8.5).fillColor(BLACK)
       .text('Figure 2.4: Complete data flow lifecycle from student search to loan return', 45, figY + 425, { width: 505, align: 'center' });

    doc.font('Times-Roman').fontSize(8.8).fillColor(BLACK).text(
      'Every stage in this pipeline is atomic. Database transactions are isolated to guarantee that simultaneous reservations for the final available copy of a textbook cannot trigger negative inventory or race conditions.',
      55, figY + 445, { width: 485, align: 'justify', lineGap: 1.8 }
    );
  };

  // ----------------------------------------------------
  // BODY PAGE 10 (PDF Page 15): 2.4 DATA FLOW STAGES CONTINUED
  // ----------------------------------------------------
  app.buildBodyPage10 = function() {
    addPageWithBorder('10');

    doc.font('Times-Bold').fontSize(11).fillColor(BLUE_HEADER)
       .text('2.4 STAGES OF THE DATA FLOW (DETAILED SPECIFICATIONS)', 45, 60);

    const stagesDetailed = [
      {
        num: '1. Registration & Authentication Pipeline',
        desc: 'Authentication accepts either College Registration Number (e.g. 24054-CPS-062) or verified institutional email. Passwords undergo 10 rounds of cryptographic salting via bcryptjs. Upon successful validation, the server generates a cryptographically signed JWT token carrying student identification parameters and a 7-day expiration window. The token is stored locally in Android EncryptedSharedPreferences.'
      },
      {
        num: '2. Exact Shelf Locator Resolution Pipeline',
        desc: 'When a book query executes, the backend joins the books table with spatial coordinates. The system constructs a structured spatial locator JSON payload specifying Block, Floor, Section, Rack, and Shelf. The Android client parses these coordinates into an interactive visual stack card.'
      },
      {
        num: '3. Reservation & Preferred Timeslot Dispatch',
        desc: 'Students submit a reservation specifying a pickup date and hourly collection window. The database executes an atomic check: IF available_copies > 0, the book status transitions to RESERVED, decrementing available inventory and generating a unique Reservation ID with a 24-hour collection hold timer.'
      },
      {
        num: '4. Smart Waiting List FIFO Promotion',
        desc: 'When an item has zero available inventory, the student reservation is pushed into the waiting_list table with status=QUEUED and priority=MAX(priority)+1. When an active borrower returns that volume, a database trigger or controller routine executes a FIFO promotion, automatically shifting the top waiting record to RESERVED and issuing a pickup alert.'
      },
      {
        num: '5. Circulation Desk Scan-and-Go Processing',
        desc: 'At the circulation desk, the student presents their in-app Digital Membership Card. The librarian web camera scans the QR code, decoding the signed token. The librarian verifies the student portrait and clicks "Confirm Issue", instantly transitioning the book to active loan with a 14-day return due date.'
      },
      {
        num: '6. Overdue Return & Daily Fine Calculation',
        desc: 'When a book is checked in, the system compares current timestamp with due_date. If days_late > 0, fine_amount = days_late * $0.50 (customizable campus rate). The transaction logs to borrowing_history and the book’s available count is safely incremented.'
      },
      {
        num: '7. Multi-Channel Notification Dispatcher',
        desc: 'The notification engine evaluates system events against user notification preferences. In-app alerts are written directly to the notifications table with read=false, while transactional emails dispatch asynchronously via SMTP for high-priority alerts.'
      }
    ];

    let dy = 82;
    stagesDetailed.forEach(sd => {
      doc.font('Times-Bold').fontSize(9).fillColor(DARK_SLATE).text(sd.num, 55, dy);
      doc.font('Times-Roman').fontSize(8.5).fillColor(BLACK).text(sd.desc, 65, dy + 13, { width: 475, align: 'justify', lineGap: 1.5 });
      dy += doc.heightOfString(sd.desc, { width: 475, lineGap: 1.5 }) + 18;
    });

    // Summary Box
    doc.rect(55, dy + 5, 485, 45).fillAndStroke('#EFF6FF', '#93C5FD');
    doc.font('Times-Bold').fontSize(8.5).fillColor('#1E3A8A').text('Database Concurrency & Transactional Safety', 65, dy + 12);
    doc.font('Times-Roman').fontSize(7.5).fillColor(DARK_SLATE).text(
      'To prevent race conditions during simultaneous textbook reservation attempts during exam rush periods, the reservation and checkout controllers utilize SQL row-level locking (SELECT ... FOR UPDATE), guaranteeing that inventory counters remain 100% accurate under concurrent multi-user load.',
      65, dy + 24, { width: 465, lineGap: 1.2 }
    );
  };

  // ----------------------------------------------------
  // BODY PAGE 11 (PDF Page 16): 2.4 DB SCHEMA & 2.5 CORE ALGORITHMS
  // ----------------------------------------------------
  app.buildBodyPage11 = function() {
    addPageWithBorder('11');

    doc.font('Times-Bold').fontSize(9.5).fillColor(BLACK).text('2.4 Database Schema Structure (Third Normal Form - 3NF)', 55, 60);

    // Table 2.3 Relational Schema Table
    const schemaRows = [
      ['Table Name', 'Primary Key', 'Foreign Keys', 'Core Attributes & Data Types'],
      ['users', 'id (SERIAL)', 'None', 'name (VARCHAR), email (VARCHAR UNIQUE), student_id (VARCHAR UNIQUE), password_hash, role (student/librarian), department, course, semester, created_at.'],
      ['books', 'id (SERIAL)', 'None', 'isbn (VARCHAR UNIQUE), title, author, genre, published_year, total_copies, available_copies, block, floor, section, rack, shelf, description, cover_url.'],
      ['borrow_records', 'id (SERIAL)', 'user_id -> users(id)\nbook_id -> books(id)', 'issue_date (DATE), due_date (DATE), return_date (DATE NULL), status (active/returned/overdue), fine_amount (DECIMAL).'],
      ['reservations', 'id (SERIAL)', 'user_id -> users(id)\nbook_id -> books(id)', 'reservation_code (VARCHAR), pickup_date (DATE), timeslot (VARCHAR), status (pending/approved/cancelled/fulfilled), created_at.'],
      ['waiting_list', 'id (SERIAL)', 'user_id -> users(id)\nbook_id -> books(id)', 'queue_position (INT), status (waiting/notified/expired), queued_at (TIMESTAMP), notified_at (TIMESTAMP).'],
      ['notifications', 'id (SERIAL)', 'user_id -> users(id)', 'title (VARCHAR), message (TEXT), type (pickup/overdue/alert/announcement), is_read (BOOLEAN), created_at.'],
      ['announcements', 'id (SERIAL)', 'librarian_id -> users', 'headline (VARCHAR), body (TEXT), category (holiday/event/policy), published_at.']
    ];

    let sty = 76;
    schemaRows.forEach((row, idx) => {
      const isHeader = idx === 0;
      const h = isHeader ? 16 : 24;
      doc.rect(55, sty, 485, h).fillAndStroke(isHeader ? TABLE_HEADER_BG : (idx % 2 === 0 ? LIGHT_BG : '#FFFFFF'), TABLE_BORDER);
      doc.font('Times-Bold').fontSize(7.5).fillColor(isHeader ? BLACK : BLUE_HEADER)
         .text(row[0], 60, sty + 4, { width: 75 });
      doc.font('Courier').fontSize(6.5).fillColor(DARK_SLATE)
         .text(row[1], 140, sty + 4, { width: 65 });
      doc.font('Courier').fontSize(6).fillColor('#64748B')
         .text(row[2], 210, sty + 3, { width: 95, lineGap: 1 });
      doc.font('Times-Roman').fontSize(6.8).fillColor(BLACK)
         .text(row[3], 310, sty + 3, { width: 225, lineGap: 1 });
      sty += h;
    });

    doc.font('Times-Italic').fontSize(8.5).fillColor(BLACK)
       .text('Table 2.3: Relational database schema structure in Third Normal Form (3NF)', 45, sty + 4, { width: 505, align: 'center' });

    doc.font('Times-Bold').fontSize(11).fillColor(BLUE_HEADER)
       .text('2.5 CORE ALGORITHMS AND LOGIC', 45, sty + 20);

    doc.font('Times-Bold').fontSize(9.5).fillColor(BLACK).text('1. Book Finder – Exact Shelf Location Mapping Algorithm', 55, sty + 36);

    const algo1 = 'The exact shelf locator algorithm takes a physical book inventory item and resolves its physical coordinates through a five-dimensional hierarchical indexing matrix: Block -> Floor -> Section -> Rack -> Shelf. When a student enters a search query, the engine matches bibliographic keywords and outputs precise spatial markers.';

    doc.font('Times-Roman').fontSize(8.8).fillColor(BLACK)
       .text(algo1, 55, sty + 50, { width: 485, align: 'justify', lineGap: 1.8 });

    // Algorithm Code Snippet Box
    const codeY = sty + 84;
    doc.rect(55, codeY, 485, 95).fillAndStroke('#0F172A', '#334155');
    doc.font('Courier-Bold').fontSize(7.5).fillColor('#38BDF8').text('// Algorithm 1: Exact Shelf Coordinate Resolver & Navigation Mapper', 65, codeY + 8);
    doc.font('Courier').fontSize(6.8).fillColor('#F8FAFC').text(
      'function resolveShelfLocator(bookRecord) {\n' +
      '  const { block, floor, section, rack, shelf, total_copies, available_copies } = bookRecord;\n' +
      '  return {\n' +
      '    physicalLocation: `Library Block: ${block} | Floor: ${floor} | Section: ${section}`,\n' +
      '    stackCoordinates: `Rack: ${rack.padStart(2, "0")} | Shelf: ${shelf.padStart(2, "0")}`,\n' +
      '    availabilityStatus: available_copies > 0 ? "IN_STOCK" : "RESERVE_WAITING_LIST",\n' +
      '    visualMapPin: { blockId: block, floorLevel: parseInt(floor), rackIndex: parseInt(rack) }\n' +
      '  };\n' +
      '}',
      65, codeY + 22, { lineGap: 1.5 }
    );

    doc.font('Times-Italic').fontSize(8.5).fillColor(BLACK)
       .text('Figure 2.5: Algorithmic coordinate mapping for exact physical shelf navigation', 45, codeY + 100, { width: 505, align: 'center' });
  };

  // ----------------------------------------------------
  // BODY PAGE 12 (PDF Page 17): 2.5 CORE ALGORITHMS CONTINUED
  // ----------------------------------------------------
  app.buildBodyPage12 = function() {
    addPageWithBorder('12');

    doc.font('Times-Bold').fontSize(9.5).fillColor(BLACK).text('2. Smart Waiting List FIFO Promotion Algorithm', 55, 60);

    const algo2 = 'The Smart Waiting List engine enforces fair, automated allocation when textbook inventory drops to zero. Rather than allowing first-come physical rushes, the engine maintains an ordered priority queue based on request timestamp. When a borrowed copy is returned, the algorithm promotes the first student in the queue, transitions the book to RESERVED status, sets a 48-hour pickup deadline, and triggers a real-time notification.';

    doc.font('Times-Roman').fontSize(8.8).fillColor(BLACK)
       .text(algo2, 55, 74, { width: 485, align: 'justify', lineGap: 1.8 });

    // Algorithm 2 Box
    const code2Y = 120;
    doc.rect(55, code2Y, 485, 120).fillAndStroke('#0F172A', '#334155');
    doc.font('Courier-Bold').fontSize(7.5).fillColor('#38BDF8').text('// Algorithm 2: Deterministic FIFO Waiting List Promotion on Book Return', 65, code2Y + 8);
    doc.font('Courier').fontSize(6.8).fillColor('#F8FAFC').text(
      'async function handleBookReturnWithWaitingList(client, bookId) {\n' +
      '  // Check if active waiting list queue exists for this volume\n' +
      '  const nextInQueue = await client.query(\n' +
      '    `SELECT * FROM waiting_list WHERE book_id = $1 AND status = \'waiting\' ORDER BY queue_position ASC LIMIT 1`,\n' +
      '    [bookId]\n' +
      '  );\n' +
      '  if (nextInQueue.rowCount > 0) {\n' +
      '    const candidate = nextInQueue.rows[0];\n' +
      '    await client.query(`UPDATE waiting_list SET status = \'notified\', notified_at = NOW() WHERE id = $1`, [candidate.id]);\n' +
      '    await createReservation(client, candidate.user_id, bookId, "AUTO_WAITING_LIST_PROMOTION");\n' +
      '    await dispatchNotification(candidate.user_id, "BOOK_READY_FOR_PICKUP", "Your waited book is ready at circulation desk.");\n' +
      '  } else {\n' +
      '    await client.query(`UPDATE books SET available_copies = available_copies + 1 WHERE id = $1`, [bookId]);\n' +
      '  }\n' +
      '}',
      65, code2Y + 22, { lineGap: 1.2 }
    );

    doc.font('Times-Italic').fontSize(8.5).fillColor(BLACK)
       .text('Figure 2.6: Deterministic Smart Waiting List FIFO promotion state machine', 45, code2Y + 125, { width: 505, align: 'center' });

    doc.font('Times-Bold').fontSize(9.5).fillColor(BLACK).text('3. Dynamic Digital ID Card QR Code Generation & Verification', 55, 275);
    const algo3 = 'The Digital Library Membership Card generates a cryptographically signed QR code payload containing Student ID, Library Membership Number, Issue Timestamp, and an HMAC-SHA256 signature token. When scanned at the circulation counter, the desk terminal decodes the payload, validates the cryptographic signature against the secret key, and instantly pulls the student’s live borrowing ledger.';

    doc.font('Times-Roman').fontSize(8.8).fillColor(BLACK)
       .text(algo3, 55, 290, { width: 485, align: 'justify', lineGap: 1.8 });

    doc.font('Times-Bold').fontSize(9.5).fillColor(BLACK).text('4. Automated Overdue Fine Math Engine ($0.50/day grace policy)', 55, 345);
    const algo4 = 'The fine calculation engine deterministically computes penalties based on calendar days elapsed beyond the contracted due date. Standard student borrowing grants a 14-day loan period. If returned on Day 17, daysOverdue = 3, fine = 3 * $0.50 = $1.50. The calculated fine is logged to pending_fines and immediately displayed on the student’s My Library Account dashboard.';

    doc.font('Times-Roman').fontSize(8.8).fillColor(BLACK)
       .text(algo4, 55, 360, { width: 485, align: 'justify', lineGap: 1.8 });

    // Figure 2.7 Flow diagram box
    const fig27Y = 415;
    doc.rect(55, fig27Y, 485, 120).fillAndStroke(LIGHT_BG, TABLE_BORDER);
    doc.rect(55, fig27Y, 485, 18).fill('#0F172A');
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF')
       .text('FIGURE 2.7: DIGITAL QR CODE AUTHENTICATION & DESK CHECKOUT FLOW', 60, fig27Y + 5, { width: 475, align: 'center' });

    doc.font('Courier').fontSize(6.8).fillColor(DARK_SLATE).text(
      ' [Student Android App]                    [Librarian Desk Terminal]              [PostgreSQL Database]\n' +
      '         |                                           |                                     |\n' +
      '         |-- Opens Digital Membership Card --------->|                                     |\n' +
      '         |   (Displays Encrypted Dynamic QR)         |                                     |\n' +
      '         |                                           |-- Scans QR Code with Web Camera --->|\n' +
      '         |                                           |   Verifies HMAC-SHA256 Signature    |\n' +
      '         |                                           |<-- Returns Student Profile & Loans -|\n' +
      '         |                                           |                                     |\n' +
      '         |                                           |-- Scans Physical Book Barcode ----->|\n' +
      '         |                                           |   Executes issueBook() Transaction  |\n' +
      '         |<-- Dispatches Real-Time Loan Notification-|                                     |',
      60, fig27Y + 24, { lineGap: 1.2 }
    );

    doc.font('Times-Italic').fontSize(8.5).fillColor(BLACK)
       .text('Figure 2.7: Digital QR membership verification and contactless circulation checkout', 45, fig27Y + 124, { width: 505, align: 'center' });
  };

  // ----------------------------------------------------
  // BODY PAGE 13 (PDF Page 18): 2.6 UI/UX DESIGN
  // ----------------------------------------------------
  app.buildBodyPage13 = function() {
    addPageWithBorder('13');

    doc.font('Times-Bold').fontSize(11).fillColor(BLUE_HEADER)
       .text('2.6 UI/UX DESIGN PRINCIPLES AND SYSTEM INTERFACES', 45, 60);

    const uiIntro = 'The user experience architecture of the Smart Campus Library Management System was designed around one paramount rule: “Clarity, Velocity, and Contextual Orientation.” Every interface ensures that essential catalog data, exact shelf coordinates, and membership identities are accessible in fewer than two taps or clicks.';

    doc.font('Times-Roman').fontSize(9.5).fillColor(BLACK)
       .text(uiIntro, 55, 78, { width: 485, align: 'justify', lineGap: 2.2 });

    doc.font('Times-Bold').fontSize(9.5).fillColor(BLACK).text('1. Core Design Principles', 55, 115);

    const prin = [
      '• Visual Physical Localization: Book cards display prominent location badges (Block, Floor, Section, Rack, Shelf) with distinct color coding to minimize cognitive load.',
      '• High-Contrast Material 3 Palette: Built with WCAG 2.1 AA accessibility standards, featuring crisp navy blue primary tones, clean slate text, and vibrant status chips (Green for In-Stock, Amber for Reserved, Red for Overdue).',
      '• Frictionless Scan-and-Go Circulation: The digital membership card renders instantly upon opening, keeping screen brightness high to ensure instantaneous barcode/QR scanner acquisition.',
      '• Responsive Adaptive Layout: The web portal dynamically reshapes across desktop monitors, tablet checkout stations, and mobile browsers using CSS Grid and Flexbox with zero framework lag.'
    ];

    let py = 132;
    prin.forEach(p => {
      doc.font('Times-Roman').fontSize(8.8).fillColor(BLACK).text(p, 65, py, { width: 475, align: 'justify', lineGap: 1.8 });
      py += doc.heightOfString(p, { width: 475, lineGap: 1.8 }) + 6;
    });

    doc.font('Times-Bold').fontSize(9.5).fillColor(BLACK).text('2. Inventory of Primary System Views', 55, py + 10);

    // Table 2.4 Views
    const views = [
      ['No.', 'Interface / View Name', 'Target Platform', 'Functional Purpose & Key Capabilities'],
      ['1', 'Student Catalog & Search', 'Android Kotlin', 'Real-time book search, category filter chips, cover artwork, and live inventory count.'],
      ['2', 'Book Finder Shelf Locator', 'Android Kotlin', 'Detailed book overview with exact coordinates: Block A, Floor 2, Sec CS, Rack 08, Shelf 03.'],
      ['3', 'Online Reservation Modal', 'Android Kotlin', 'Preferred collection date picker, timeslot selector, and reservation cancellation.'],
      ['4', 'Digital Membership Card', 'Android Kotlin', 'Collegiate motto “Peace through Wisdom”, student portrait, reg number, and dynamic QR.'],
      ['5', 'My Library Account Dashboard', 'Android Kotlin', 'Active loans, due dates, approved/pending reservations, borrowing history, and fine balance.'],
      ['6', 'Notification Feed', 'Android Kotlin', 'In-app alert inbox for pickup notices, return reminders, new book arrivals, and holidays.'],
      ['7', 'Admin Dashboard Overview', 'Vanilla Web SPA', 'Real-time campus metrics: total books, active borrowings, overdue counts, and active holds.'],
      ['8', 'Circulation Desk Terminal', 'Vanilla Web SPA', 'QR code camera scanner, 1-click issue, return processing, and overdue fine collection.'],
      ['9', 'Open Library Explorer', 'Vanilla Web SPA', 'Direct internet archive book discovery modal with cover preview and 1-click catalog import.'],
      ['10', 'Bulk Student Excel Manager', 'Vanilla Web SPA', 'Drag-and-drop .xlsx/.csv upload dropzone with automated duplicate check & template download.']
    ];

    let vy = py + 26;
    views.forEach((row, idx) => {
      const isHeader = idx === 0;
      const h = isHeader ? 16 : 18;
      doc.rect(55, vy, 485, h).fillAndStroke(isHeader ? TABLE_HEADER_BG : (idx % 2 === 0 ? LIGHT_BG : '#FFFFFF'), TABLE_BORDER);
      doc.font('Times-Bold').fontSize(7.5).fillColor(isHeader ? BLACK : DARK_SLATE)
         .text(row[0], 58, vy + 4, { width: 22, align: 'center' });
      doc.font(isHeader ? 'Times-Bold' : 'Times-Bold').fontSize(7.5).fillColor(isHeader ? BLACK : BLUE_HEADER)
         .text(row[1], 84, vy + 4, { width: 125 });
      doc.font('Times-Roman').fontSize(7).fillColor(DARK_SLATE)
         .text(row[2], 215, vy + 4, { width: 75 });
      doc.font('Times-Roman').fontSize(6.8).fillColor(BLACK)
         .text(row[3], 295, vy + 3, { width: 240, lineGap: 1 });
      vy += h;
    });

    doc.font('Times-Italic').fontSize(8.5).fillColor(BLACK)
       .text('Table 2.4: Primary user views across Student Mobile and Administrator Web platforms', 45, vy + 4, { width: 505, align: 'center' });
  };

  // ----------------------------------------------------
  // BODY PAGE 14 (PDF Page 19): UI SCREENS: CATALOG & SHELF LOCATOR
  // ----------------------------------------------------
  app.buildBodyPage14 = function() {
    addPageWithBorder('14');

    doc.font('Times-Bold').fontSize(10.5).fillColor(BLUE_HEADER)
       .text('UI/UX DESIGN: STUDENT CATALOG & EXACT SHELF LOCATOR', 45, 60);

    // Box 1: Figure 2.8 Mobile Catalog
    const b1Y = 78;
    doc.rect(55, b1Y, 485, 210).fillAndStroke(LIGHT_BG, TABLE_BORDER);
    doc.rect(55, b1Y, 485, 18).fill('#0F172A');
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF')
       .text('FIGURE 2.8: STUDENT MOBILE APP – LIVE CATALOG & SEARCH INTERFACE', 60, b1Y + 5, { width: 475, align: 'center' });

    // Draw catalog cards inside
    const cx = 85;
    const cw = 425;
    let cy = b1Y + 28;

    const sampleCatalog = [
      { t: 'Introduction to Algorithms (4th Edition)', a: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein', g: 'Algorithms', st: '5 / 5 available', b: 'A', f: '2', s: 'CS', r: '08', sh: '03' },
      { t: 'Clean Code: A Handbook of Agile Software Craftsmanship', a: 'Robert C. Martin (Uncle Bob)', g: 'Software Engineering', st: '4 / 5 available', b: 'A', f: '1', s: 'SE', r: '03', sh: '01' },
      { t: 'Database System Concepts (7th Edition)', a: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan', g: 'Database Systems', st: '2 / 5 available', b: 'A', f: '2', s: 'DB', r: '05', sh: '02' }
    ];

    sampleCatalog.forEach(b => {
      doc.rect(cx, cy, cw, 52).fillAndStroke('#FFFFFF', '#CBD5E1');
      doc.rect(cx, cy, 4, 52).fill('#2563EB');
      // Category badge
      doc.rect(cx + 10, cy + 5, 80, 10).fill('#EFF6FF');
      doc.font('Helvetica-Bold').fontSize(6).fillColor('#1E40AF').text(b.g, cx + 10, cy + 7, { width: 80, align: 'center' });
      // Stock badge
      doc.rect(cx + cw - 75, cy + 5, 65, 10).fill('#DCFCE7');
      doc.font('Helvetica-Bold').fontSize(6).fillColor('#166534').text(`✓ ${b.st}`, cx + cw - 75, cy + 7, { width: 65, align: 'center' });

      doc.font('Helvetica-Bold').fontSize(8).fillColor('#0F172A').text(b.t, cx + 10, cy + 18);
      doc.font('Helvetica').fontSize(6.8).fillColor('#475569').text(`By ${b.a}`, cx + 10, cy + 29);
      doc.font('Helvetica-Bold').fontSize(7).fillColor('#0D9488')
         .text(`📍 Exact Location: Block ${b.b} | Floor ${b.f} | Section ${b.s} | Rack ${b.r} | Shelf ${b.sh}`, cx + 10, cy + 40);

      cy += 58;
    });

    doc.font('Times-Italic').fontSize(8.5).fillColor(BLACK)
       .text('Figure 2.8: Mobile application catalog search with live stock badges and shelf coordinates', 45, b1Y + 214, { width: 505, align: 'center' });

    // Box 2: Figure 2.9 Exact Shelf Locator Screen
    const b2Y = b1Y + 230;
    doc.rect(55, b2Y, 485, 230).fillAndStroke(LIGHT_BG, TABLE_BORDER);
    doc.rect(55, b2Y, 485, 18).fill('#0F172A');
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF')
       .text('FIGURE 2.9: BOOK FINDER – EXACT SHELF LOCATOR DETAILED MAPPING VIEW', 60, b2Y + 5, { width: 475, align: 'center' });

    // Detailed locator diagram
    const locX = 75;
    const locY = b2Y + 28;
    doc.rect(locX, locY, 445, 185).fillAndStroke('#FFFFFF', '#CBD5E1');

    doc.font('Helvetica-Bold').fontSize(10).fillColor('#1E3A8A').text('Introduction to Algorithms', locX + 15, locY + 12);
    doc.font('Helvetica').fontSize(8).fillColor('#475569').text('ISBN: 9780262033848 | Total Copies: 5 | Available: 5', locX + 15, locY + 26);

    // 5-Grid Coordinate Indicator
    const coords = [
      { label: 'LIBRARY BLOCK', val: 'BLOCK A', sub: 'Central Academic Wing' },
      { label: 'FLOOR LEVEL', val: 'FLOOR 2', sub: 'Upper Technology Stacks' },
      { label: 'SECTION', val: 'COMP. SCIENCE', sub: 'CS / IT Collection' },
      { label: 'RACK NUMBER', val: 'RACK 08', sub: 'Aisle 4 East' },
      { label: 'SHELF LEVEL', val: 'SHELF 03', sub: 'Eye-Level Tier' }
    ];

    let cxPos = locX + 15;
    coords.forEach(c => {
      doc.rect(cxPos, locY + 44, 78, 55).fillAndStroke('#F8FAFC', '#3B82F6');
      doc.rect(cxPos, locY + 44, 78, 3).fill('#2563EB');
      doc.font('Helvetica-Bold').fontSize(6).fillColor('#64748B').text(c.label, cxPos + 4, locY + 50, { width: 70, align: 'center' });
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#1E3A8A').text(c.val, cxPos + 4, locY + 62, { width: 70, align: 'center' });
      doc.font('Helvetica').fontSize(5.5).fillColor('#475569').text(c.sub, cxPos + 4, locY + 78, { width: 70, align: 'center' });
      cxPos += 84;
    });

    // Action buttons inside mockup
    doc.rect(locX + 15, locY + 112, 205, 24).fillAndStroke('#2563EB', '#1D4ED8');
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF').text('📌 RESERVE THIS COPY', locX + 15, locY + 120, { width: 205, align: 'center' });

    doc.rect(locX + 235, locY + 112, 205, 24).fillAndStroke('#F1F5F9', '#CBD5E1');
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#0F172A').text('🗺️ VIEW FLOORPLAN GUIDANCE', locX + 235, locY + 120, { width: 205, align: 'center' });

    doc.font('Times-Roman').fontSize(7.5).fillColor('#475569').text(
      'Description: The authoritative, comprehensive reference on algorithms, data structures, and computational complexity. Widely adopted across undergraduate and postgraduate computer engineering curricula.',
      locX + 15, locY + 144, { width: 415, lineGap: 1.5 }
    );

    doc.font('Times-Italic').fontSize(8.5).fillColor(BLACK)
       .text('Figure 2.9: Exact Shelf Locator detailed spatial visualization for Library Block A, Floor 2, Rack 08', 45, b2Y + 234, { width: 505, align: 'center' });
  };

  // ----------------------------------------------------
  // BODY PAGE 15 (PDF Page 20): UI: DIGITAL CARD & DASHBOARD
  // ----------------------------------------------------
  app.buildBodyPage15 = function() {
    addPageWithBorder('15');

    doc.font('Times-Bold').fontSize(10.5).fillColor(BLUE_HEADER)
       .text('UI/UX DESIGN: DIGITAL MEMBERSHIP CARD & STUDENT DASHBOARD', 45, 60);

    // Box 1: Digital Library Membership Card (Figure 2.11)
    const b1Y = 78;
    doc.rect(55, b1Y, 485, 235).fillAndStroke(LIGHT_BG, TABLE_BORDER);
    doc.rect(55, b1Y, 485, 18).fill('#0F172A');
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF')
       .text('FIGURE 2.11: DIGITAL LIBRARY MEMBERSHIP CARD (MODULE 8 SPECIFICATION)', 60, b1Y + 5, { width: 475, align: 'center' });

    // Draw the Digital Card Mockup
    const cardX = 125;
    const cardY = b1Y + 26;
    const cardW = 345;
    const cardH = 195;

    doc.rect(cardX, cardY, cardW, cardH).fillAndStroke('#FFFFFF', '#1E3A8A');
    // Gold top bar
    doc.rect(cardX, cardY, cardW, 26).fill('#1E3A8A');
    doc.font('Times-Bold').fontSize(10).fillColor('#FEF08A').text('PEACE THROUGH WISDOM', cardX, cardY + 5, { width: cardW, align: 'center' });
    doc.font('Helvetica').fontSize(6.5).fillColor('#FFFFFF').text('GOVERNMENT INSTITUTE OF ELECTRONICS – CENTRAL LIBRARY', cardX, cardY + 16, { width: cardW, align: 'center' });

    // Photo Box Placeholder
    doc.rect(cardX + 15, cardY + 36, 70, 85).fillAndStroke('#F1F5F9', '#94A3B8');
    doc.font('Helvetica-Bold').fontSize(7).fillColor('#64748B').text('STUDENT\nPORTRAIT', cardX + 15, cardY + 68, { width: 70, align: 'center' });

    // Student Info
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#0F172A').text('MATTAWADA TANISH', cardX + 95, cardY + 38);
    doc.font('Helvetica').fontSize(7.5).fillColor('#334155').text('Reg. No: 24054-CPS-062', cardX + 95, cardY + 51);
    doc.font('Helvetica').fontSize(7.5).fillColor('#334155').text('Dept: Cyber Physical Systems & Security', cardX + 95, cardY + 63);
    doc.font('Helvetica').fontSize(7.5).fillColor('#334155').text('Course: Diploma in Engineering (3rd Year)', cardX + 95, cardY + 75);
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#0D9488').text('Membership ID: LIB-MEM-2026-062', cardX + 95, cardY + 87);
    doc.font('Helvetica').fontSize(7).fillColor('#DC2626').text('Validity: 30-JUN-2027  |  Status: ACTIVE', cardX + 95, cardY + 99);

    // QR Code Box (Simulated High-Density Matrix)
    const qrX = cardX + cardW - 75;
    const qrY = cardY + 125;
    doc.rect(qrX, qrY, 60, 60).fillAndStroke('#F8FAFC', '#000000');
    // Simulated QR pattern
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if ((i + j) % 2 === 0 || (i === 0 && j === 0) || (i === 4 && j === 0) || (i === 0 && j === 4)) {
          doc.rect(qrX + 4 + i * 10, qrY + 4 + j * 10, 8, 8).fill('#000000');
        }
      }
    }

    doc.font('Helvetica').fontSize(6).fillColor('#475569').text('Scan QR at Circulation Desk for Instant Checkout & Return', cardX + 15, cardY + 135, { width: 170 });
    doc.font('Courier').fontSize(5.5).fillColor('#64748B').text('TOKEN: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.062', cardX + 15, cardY + 155, { width: 180 });

    doc.font('Times-Italic').fontSize(8.5).fillColor(BLACK)
       .text('Figure 2.11: Digital Library Membership Card with dynamic QR verification and collegiate motto', 45, b1Y + 239, { width: 505, align: 'center' });

    // Box 2: My Library Account Dashboard (Figure 2.12)
    const b2Y = b1Y + 255;
    doc.rect(55, b2Y, 485, 205).fillAndStroke(LIGHT_BG, TABLE_BORDER);
    doc.rect(55, b2Y, 485, 18).fill('#0F172A');
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF')
       .text('FIGURE 2.12: MY LIBRARY ACCOUNT – STUDENT PERSONAL DASHBOARD', 60, b2Y + 5, { width: 475, align: 'center' });

    // 4 Dashboard Metric Counters
    const metrics = [
      { l: 'ACTIVE LOANS', v: '2 Books', c: '#2563EB' },
      { l: 'RESERVATIONS', v: '1 Approved', c: '#059669' },
      { l: 'OVERDUE / FINES', v: '$0.00 Due', c: '#16A34A' },
      { l: 'QUOTA REMAINING', v: '3 / 5 Allowed', c: '#7C3AED' }
    ];

    let mx = 70;
    metrics.forEach(m => {
      doc.rect(mx, b2Y + 26, 100, 36).fillAndStroke('#FFFFFF', '#CBD5E1');
      doc.rect(mx, b2Y + 26, 100, 3).fill(m.c);
      doc.font('Helvetica-Bold').fontSize(6).fillColor('#64748B').text(m.l, mx + 4, b2Y + 32, { width: 92, align: 'center' });
      doc.font('Helvetica-Bold').fontSize(9).fillColor(m.c).text(m.v, mx + 4, b2Y + 44, { width: 92, align: 'center' });
      mx += 115;
    });

    // Currently Borrowed List inside Dashboard
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#0F172A').text('Currently Borrowed Books & Due Date Countdowns:', 70, b2Y + 70);
    const loans = [
      { t: 'The Pragmatic Programmer (20th Anniv. Ed.)', iss: '10-OCT-2026', due: '24-OCT-2026', badge: '12 Days Left', bc: '#DCFCE7', tc: '#166534' },
      { t: 'Computer Networks (5th Ed.) – Tanenbaum', iss: '01-OCT-2026', due: '15-OCT-2026', badge: '3 Days Left', bc: '#FEF3C7', tc: '#B45309' }
    ];

    let ly = b2Y + 84;
    loans.forEach(l => {
      doc.rect(70, ly, 455, 26).fillAndStroke('#FFFFFF', '#CBD5E1');
      doc.font('Helvetica-Bold').fontSize(7.2).fillColor('#0F172A').text(l.t, 78, ly + 5);
      doc.font('Helvetica').fontSize(6.5).fillColor('#475569').text(`Issued: ${l.iss} | Due: ${l.due}`, 78, ly + 15);
      doc.rect(435, ly + 6, 80, 14).fill(l.bc);
      doc.font('Helvetica-Bold').fontSize(6.5).fillColor(l.tc).text(`⏰ ${l.badge}`, 435, ly + 9, { width: 80, align: 'center' });
      ly += 30;
    });

    // Approved Reservation Box
    doc.rect(70, ly + 4, 455, 28).fillAndStroke('#F0FDF4', '#86EFAC');
    doc.font('Helvetica-Bold').fontSize(7.2).fillColor('#166534')
       .text('✓ Approved Reservation: "Operating System Concepts" | Ready for Pickup at Desk A-1 (Slot: 14:00 - 16:00)', 78, ly + 11);
    doc.font('Helvetica').fontSize(6.2).fillColor('#15803D')
       .text('Reservation ID: RES-2026-9042 | Hold expires in 22 hours.', 78, ly + 21);

    doc.font('Times-Italic').fontSize(8.5).fillColor(BLACK)
       .text('Figure 2.12: Personal student dashboard showing loans, reservations, fines, and borrowing quota', 45, b2Y + 209, { width: 505, align: 'center' });
  };

  // ----------------------------------------------------
  // BODY PAGE 16 (PDF Page 21): UI: ADMIN CIRCULATION & EXCEL
  // ----------------------------------------------------
  app.buildBodyPage16 = function() {
    addPageWithBorder('16');

    doc.font('Times-Bold').fontSize(10.5).fillColor(BLUE_HEADER)
       .text('UI/UX DESIGN: LIBRARIAN ADMIN PORTAL & BULK OPERATIONS', 45, 60);

    // Figure 2.14 Admin Overview Dashboard
    const b1Y = 78;
    doc.rect(55, b1Y, 485, 210).fillAndStroke(LIGHT_BG, TABLE_BORDER);
    doc.rect(55, b1Y, 485, 18).fill('#0F172A');
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF')
       .text('FIGURE 2.14: LIBRARIAN CIRCULATION DESK – QR SCANNER & CHECKOUT INTERFACE', 60, b1Y + 5, { width: 475, align: 'center' });

    // Circulation Desk Terminal UI simulation
    const cx = 75;
    const cy = b1Y + 28;
    doc.rect(cx, cy, 445, 170).fillAndStroke('#FFFFFF', '#CBD5E1');

    // Action buttons bar
    doc.rect(cx + 10, cy + 10, 130, 22).fillAndStroke('#2563EB', '#1D4ED8');
    doc.font('Helvetica-Bold').fontSize(7).fillColor('#FFFFFF').text('📷 SCAN STUDENT QR CARD', cx + 10, cy + 16, { width: 130, align: 'center' });

    doc.rect(cx + 150, cy + 10, 130, 22).fillAndStroke('#059669', '#047857');
    doc.font('Helvetica-Bold').fontSize(7).fillColor('#FFFFFF').text('📖 ISSUE NEW BOOK LOAN', cx + 150, cy + 16, { width: 130, align: 'center' });

    doc.rect(cx + 290, cy + 10, 140, 22).fillAndStroke('#D97706', '#B45309');
    doc.font('Helvetica-Bold').fontSize(7).fillColor('#FFFFFF').text('🔄 PROCESS BOOK RETURN', cx + 290, cy + 16, { width: 140, align: 'center' });

    // Active Checkout Session Display
    doc.rect(cx + 10, cy + 40, 425, 115).fillAndStroke('#F8FAFC', '#E2E8F0');
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#0F172A').text('Active Desk Verification: Mattawada Tanish (24054-CPS-062)', cx + 20, cy + 50);
    doc.font('Helvetica').fontSize(7).fillColor('#475569')
       .text('Department: Cyber Physical Systems & Security | Card Status: VALID | Active Borrowed: 2/5 Books', cx + 20, cy + 62);

    // Book to issue row
    doc.rect(cx + 20, cy + 76, 405, 30).fillAndStroke('#FFFFFF', '#CBD5E1');
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#1E3A8A').text('Scanning Book: "Artificial Intelligence: A Modern Approach" (ISBN: 9780136042594)', cx + 28, cy + 83);
    doc.font('Helvetica').fontSize(6.8).fillColor('#059669').text('Inventory Status: In Stock (Available: 5) | Loan Period: 14 Days | Due Date: 26-OCT-2026', cx + 28, cy + 93);

    doc.rect(cx + 20, cy + 114, 180, 22).fillAndStroke('#16A34A', '#15803D');
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF').text('✓ CONFIRM ISSUE TO STUDENT', cx + 20, cy + 120, { width: 180, align: 'center' });

    doc.font('Times-Italic').fontSize(8.5).fillColor(BLACK)
       .text('Figure 2.14: Librarian circulation desk interface executing dynamic QR student verification', 45, b1Y + 214, { width: 505, align: 'center' });

    // Figure 2.16 Excel Upload & Open Library Explorer
    const b2Y = b1Y + 230;
    doc.rect(55, b2Y, 485, 230).fillAndStroke(LIGHT_BG, TABLE_BORDER);
    doc.rect(55, b2Y, 485, 18).fill('#0F172A');
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF')
       .text('FIGURE 2.16: BULK STUDENT EXCEL ONBOARDING & OPEN LIBRARY IMPORT MODALS', 60, b2Y + 5, { width: 475, align: 'center' });

    // Left Modal: Excel Upload
    doc.rect(70, b2Y + 28, 220, 185).fillAndStroke('#FFFFFF', '#CBD5E1');
    doc.rect(70, b2Y + 28, 220, 18).fill('#1E40AF');
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF').text('📤 BATCH STUDENT EXCEL UPLOAD', 75, b2Y + 33);

    // Dropzone
    doc.rect(80, b2Y + 54, 200, 65).fillAndStroke('#F8FAFC', '#94A3B8');
    doc.font('Helvetica-Bold').fontSize(7).fillColor('#2563EB').text('Drag and Drop .xlsx / .csv Roster File', 80, b2Y + 74, { width: 200, align: 'center' });
    doc.font('Helvetica').fontSize(6).fillColor('#64748B').text('Supported formats: Microsoft Excel (.xlsx, .xls) and CSV', 80, b2Y + 86, { width: 200, align: 'center' });

    doc.rect(80, b2Y + 128, 200, 18).fillAndStroke('#059669', '#047857');
    doc.font('Helvetica-Bold').fontSize(6.5).fillColor('#FFFFFF').text('📥 DOWNLOAD OFFICIAL EXCEL TEMPLATE', 80, b2Y + 133, { width: 200, align: 'center' });

    doc.font('Helvetica').fontSize(6.5).fillColor(DARK_SLATE).text('Automatic duplicate check & salted password hashing.', 80, b2Y + 154, { width: 200, align: 'center' });

    // Right Modal: Open Library Import
    doc.rect(305, b2Y + 28, 220, 185).fillAndStroke('#FFFFFF', '#CBD5E1');
    doc.rect(305, b2Y + 28, 220, 18).fill('#065F46');
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF').text('🌐 OPEN LIBRARY LIVE EXPLORER', 310, b2Y + 33);

    doc.rect(315, b2Y + 52, 200, 18).fillAndStroke('#F1F5F9', '#CBD5E1');
    doc.font('Helvetica').fontSize(6.5).fillColor('#334155').text('Search: "Operating Systems" (Live API)', 320, b2Y + 57);

    // Search Result Row
    doc.rect(315, b2Y + 76, 200, 75).fillAndStroke('#F8FAFC', '#E2E8F0');
    doc.font('Helvetica-Bold').fontSize(6.8).fillColor('#0F172A').text('Operating System Concepts', 320, b2Y + 82);
    doc.font('Helvetica').fontSize(6).fillColor('#475569').text('Author: Silberschatz, Galvin, Gagne\nPublished: 2012 | High-Res Cover Available\nISBN: 9781118063330', 320, b2Y + 92, { lineGap: 1.5 });

    doc.rect(320, b2Y + 124, 90, 16).fillAndStroke('#2563EB', '#1D4ED8');
    doc.font('Helvetica-Bold').fontSize(6).fillColor('#FFFFFF').text('📥 1-CLICK IMPORT', 320, b2Y + 128, { width: 90, align: 'center' });

    doc.font('Helvetica').fontSize(6).fillColor('#059669').text('⚡ Auto-Fill metadata into PostgreSQL', 315, b2Y + 162, { width: 200, align: 'center' });

    doc.font('Times-Italic').fontSize(8.5).fillColor(BLACK)
       .text('Figure 2.16: Excel student batch onboarding modal and Open Library real-time catalog importer', 45, b2Y + 234, { width: 505, align: 'center' });
  };

  // ----------------------------------------------------
  // BODY PAGE 17 (PDF Page 22): 2.7 APPLICATION WORKFLOW
  // ----------------------------------------------------
  app.buildBodyPage17 = function() {
    addPageWithBorder('17');

    doc.font('Times-Bold').fontSize(11).fillColor(BLUE_HEADER)
       .text('2.7 APPLICATION WORKFLOW (END-TO-END USER JOURNEY)', 45, 60);

    const wfIntro = 'The application workflow models the sequential operational journey of students and library administrators through the platform. The interaction begins at identity onboarding and catalog discovery, progresses through physical shelf navigation, and culminates in contactless circulation checkouts and return reconciliations.';

    doc.font('Times-Roman').fontSize(9.5).fillColor(BLACK)
       .text(wfIntro, 55, 78, { width: 485, align: 'justify', lineGap: 2.2 });

    // Figure 2.17 Workflow Diagram
    const figY = 120;
    doc.rect(55, figY, 485, 340).fillAndStroke(LIGHT_BG, TABLE_BORDER);
    doc.rect(55, figY, 485, 20).fill('#0F172A');
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#FFFFFF')
       .text('FIGURE 2.17: COMPREHENSIVE USER WORKFLOW OF SMART CAMPUS LIBRARY SYSTEM', 60, figY + 6, { width: 475, align: 'center' });

    doc.font('Courier').fontSize(6.8).fillColor(DARK_SLATE).text(
      '                 +-----------------------------------------+\n' +
      '                 |  START: Launch Mobile App / Web Portal  |\n' +
      '                 +-----------------------------------------+\n' +
      '                                      |\n' +
      '                                      v\n' +
      '                 +-----------------------------------------+\n' +
      '                 | Login with College Registration Number  |\n' +
      '                 | Verify Password via Salted bcryptjs     |\n' +
      '                 +-----------------------------------------+\n' +
      '                                      |\n' +
      '                   +------------------+------------------+\n' +
      '                   |                                     |\n' +
      '       [STUDENT ROLE AUTHENTICATED]            [LIBRARIAN ROLE AUTHENTICATED]\n' +
      '                   |                                     |\n' +
      '                   v                                     v\n' +
      '        +---------------------+               +---------------------+\n' +
      '        | Search Book Catalog |               | Access Circulation  |\n' +
      '        +---------------------+               | Desk & Admin Ops    |\n' +
      '                   |                          +---------------------+\n' +
      '                   v                                     |\n' +
      '        +---------------------+                          v\n' +
      '        | Exact Shelf Locator |               +---------------------+\n' +
      '        | (Block/Floor/Rack)  |               | Scan Student QR     |\n' +
      '        +---------------------+               | Membership Card     |\n' +
      '                   |                          +---------------------+\n' +
      '                   v                                     |\n' +
      '          Is Book Available?                             v\n' +
      '            /            \\                    +---------------------+\n' +
      '       (YES)              (NO)                | Confirm Issue Loan  |\n' +
      '         /                  \\                 | or Record Return    |\n' +
      '        v                    v                +---------------------+\n' +
      '  +--------------+    +-------------------+              |\n' +
      '  | Online Book  |    | Join Smart        |              v\n' +
      '  | Reservation  |    | Waiting List      |   +---------------------+\n' +
      '  +--------------+    +-------------------+   | Auto Fine Math &    |\n' +
      '        |                      |              | Notification Alerts |\n' +
      '        +----------+-----------+              +---------------------+\n' +
      '                   |                                     |\n' +
      '                   v                                     v\n' +
      '  +-------------------------------------------------------------+\n' +
      '  | Receive In-App Alert -> Present Digital Card QR at Desk     |\n' +
      '  +-------------------------------------------------------------+',
      60, figY + 26, { lineGap: 1.1 }
    );

    doc.font('Times-Italic').fontSize(8.5).fillColor(BLACK)
       .text('Figure 2.17: Comprehensive multi-actor workflow diagram across student and librarian tiers', 45, figY + 345, { width: 505, align: 'center' });

    doc.font('Times-Bold').fontSize(9.5).fillColor(BLACK).text('1. Student Operational Workflow Steps', 55, 485);
    const stepsStudent = [
      '• Step 1 (Authentication): Student launches Kotlin mobile client, enters Registration Number (e.g. 24054-CPS-062), and receives validated JWT session.',
      '• Step 2 (Catalog & Shelf Locator): Student searches for course titles. Book detail highlights exact shelf position: Block A, Floor 2, Section CS, Rack 08, Shelf 03.',
      '• Step 3 (Reservation / Waiting List): If in stock, student reserves copy with pickup timeslot. If stock is zero, student enters the Smart Waiting List queue.',
      '• Step 4 (Desk Checkout): Student walks to library desk, presents in-app Digital Membership Card, and librarian scans QR code to finalize checkout.'
    ];

    let wsy = 500;
    stepsStudent.forEach(s => {
      doc.font('Times-Roman').fontSize(8.5).fillColor(BLACK).text(s, 65, wsy, { width: 475, align: 'justify', lineGap: 1.5 });
      wsy += doc.heightOfString(s, { width: 475, lineGap: 1.5 }) + 4;
    });
  };

  // ----------------------------------------------------
  // BODY PAGE 18 (PDF Page 23): 2.7 SEQUENCE & USE CASE DIAGRAMS
  // ----------------------------------------------------
  app.buildBodyPage18 = function() {
    addPageWithBorder('18');

    doc.font('Times-Bold').fontSize(10.5).fillColor(BLUE_HEADER)
       .text('2.7 SEQUENCE AND USE-CASE ARCHITECTURAL SPECIFICATIONS', 45, 60);

    // Box 1: Sequence Diagram (Figure 2.18)
    const b1Y = 78;
    doc.rect(55, b1Y, 485, 230).fillAndStroke(LIGHT_BG, TABLE_BORDER);
    doc.rect(55, b1Y, 485, 18).fill('#0F172A');
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF')
       .text('FIGURE 2.18: UML SEQUENCE DIAGRAM – ONLINE RESERVATION & DESK CHECKOUT', 60, b1Y + 5, { width: 475, align: 'center' });

    doc.font('Courier').fontSize(6.8).fillColor(DARK_SLATE).text(
      ' Student Mobile App         Node.js REST API            PostgreSQL DB        Librarian Web Portal\n' +
      '      |                            |                          |                       |\n' +
      '      |-- POST /reservations ----->|                          |                       |\n' +
      '      |   (book_id, timeslot)      |-- SELECT ... FOR UPDATE->|                       |\n' +
      '      |                            |   (Verify Available > 0) |                       |\n' +
      '      |                            |<-- Available Confirmed --|                       |\n' +
      '      |                            |                          |                       |\n' +
      '      |                            |-- INSERT reservation --->|                       |\n' +
      '      |<-- 201 Created (Res ID) ---|                          |                       |\n' +
      '      |                            |                          |                       |\n' +
      '      |==== Student Arrives at Circulation Desk ======================================|\n' +
      '      |                            |                          |                       |\n' +
      '      |-- Presents Digital Card ---------------------------------------------------->|\n' +
      '      |   (Dynamic Signed QR)      |                          |   Scans QR via Camera |\n' +
      '      |                            |<-- POST /borrow/issue ---------------------------|\n' +
      '      |                            |    (student_id, book_id) |                       |\n' +
      '      |                            |-- UPDATE borrow_records->|                       |\n' +
      '      |                            |-- UPDATE available - 1 ->|                       |\n' +
      '      |<-- In-App Alert Ready -----|<-- 200 OK Loan Issued ---------------------------|\n' +
      '      |    ("Book Checked Out")    |                          |                       |',
      60, b1Y + 28, { lineGap: 1.2 }
    );

    doc.font('Times-Italic').fontSize(8.5).fillColor(BLACK)
       .text('Figure 2.18: UML sequence diagram modeling atomic reservation and contactless desk checkout', 45, b1Y + 234, { width: 505, align: 'center' });

    // Box 2: Use-Case Diagram (Figure 2.19)
    const b2Y = b1Y + 250;
    doc.rect(55, b2Y, 485, 205).fillAndStroke(LIGHT_BG, TABLE_BORDER);
    doc.rect(55, b2Y, 485, 18).fill('#0F172A');
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF')
       .text('FIGURE 2.19: SYSTEM USE-CASE ACTOR SPECIFICATION DIAGRAM', 60, b2Y + 5, { width: 475, align: 'center' });

    doc.font('Courier').fontSize(6.8).fillColor(DARK_SLATE).text(
      '       [STUDENT ACTOR]                                    [LIBRARIAN ACTOR]\n' +
      '             |                                                    |\n' +
      '             +---> (UC-1: Authenticate via Reg No / Email) <------+ \n' +
      '             |                                                    |\n' +
      '             +---> (UC-2: Search Catalog & Exact Shelf Locator)   +---> (UC-8: Manage Full Catalog Inventory)\n' +
      '             |                                                    |\n' +
      '             +---> (UC-3: Reserve Physical Book & Slot)           +---> (UC-9: Ingest Open Library Titles)\n' +
      '             |                                                    |\n' +
      '             +---> (UC-4: Join Smart FIFO Waiting List)           +---> (UC-10: Batch Onboard Students via Excel)\n' +
      '             |                                                    |\n' +
      '             +---> (UC-5: Display Digital QR Membership Card) ----+---> (UC-11: Scan QR & Issue Book Loan)\n' +
      '             |                                                    |\n' +
      '             +---> (UC-6: Track My Account Dashboard & Fines)    +---> (UC-12: Process Returns & Collect Fines)\n' +
      '             |                                                    |\n' +
      '             +---> (UC-7: Receive In-App & Email Notifications)   +---> (UC-13: Broadcast Announcements)',
      60, b2Y + 28, { lineGap: 1.2 }
    );

    doc.font('Times-Italic').fontSize(8.5).fillColor(BLACK)
       .text('Figure 2.19: Complete functional use-case mapping for Student and Administrator actors', 45, b2Y + 209, { width: 505, align: 'center' });
  };
}

module.exports = registerChapter2;
