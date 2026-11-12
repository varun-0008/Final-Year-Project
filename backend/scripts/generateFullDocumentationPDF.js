const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const sbtetLogoPath = path.join(__dirname, '..', '..', 'docs', 'assets', 'sbtet_telangana_logo.jpg');
const gioeLogoPath = path.join(__dirname, '..', '..', 'docs', 'assets', 'gioe_college_logo.jpg');
const outputPath = path.join(__dirname, '..', '..', 'docs', 'Smart_Campus_Library_System_Project_Report.pdf');

const outDir = path.dirname(outputPath);
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const doc = new PDFDocument({
  size: 'A4',
  autoFirstPage: false,
  bufferPages: true
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Helper to draw double black borders on every page
function addPageWithBorder(pageNumberStr = null) {
  doc.addPage({
    size: 'A4',
    margins: { top: 40, bottom: 40, left: 45, right: 45 }
  });
  doc.page.margins.bottom = 0; // prevent unintended auto-break

  // Outer border (1.5pt)
  doc.save();
  doc.lineWidth(1.5).rect(28, 28, 539, 785).stroke('#000000');
  // Inner border (0.5pt)
  doc.lineWidth(0.5).rect(32, 32, 531, 777).stroke('#000000');
  doc.restore();

  if (pageNumberStr) {
    doc.save();
    doc.font('Times-Roman').fontSize(10).fillColor('#000000')
       .text(pageNumberStr, 45, 792, { width: 505, align: 'center', lineBreak: false });
    doc.restore();
  }
}

// Colors matching reference PDF
const RED = '#DC2626';
const BLUE_HEADER = '#0284C7';
const GREEN = '#059669';
const DARK_SLATE = '#0F172A';
const BLACK = '#000000';
const TABLE_HEADER_BG = '#F1F5F9';
const TABLE_BORDER = '#94A3B8';
const LIGHT_BG = '#F8FAFC';
const MUTED_COLOR = '#64748B';

// ==========================================
// PAGE 1: TITLE / COVER PAGE
// ==========================================
function buildPage1() {
  addPageWithBorder(null);

  doc.font('Times-Bold').fontSize(18).fillColor(GREEN)
     .text('A PROJECT REPORT', 45, 65, { width: 505, align: 'center' });

  doc.font('Times-Bold').fontSize(13).fillColor(BLACK)
     .text('ON', 45, 95, { width: 505, align: 'center' });

  doc.font('Times-Bold').fontSize(20).fillColor(RED)
     .text('“SMART CAMPUS LIBRARY SYSTEM”', 45, 120, { width: 505, align: 'center' });

  doc.font('Times-Italic').fontSize(10.5).fillColor(BLACK)
     .text('An Integrated Dual-Client Library Automation Platform with Digital Membership ID,\nSmart Waiting List, Online Reservation & Exact Shelf Locator', 45, 150, { width: 505, align: 'center' });

  doc.font('Times-Bold').fontSize(9).fillColor(BLACK)
     .text('SUBMITTED IN PARTIAL FULFILLMENT OF THE REQUIREMENTS\nFOR THE AWARD OF', 45, 185, { width: 505, align: 'center' });

  doc.font('Times-Bold').fontSize(14).fillColor('#7C3AED')
     .text('DIPLOMA', 45, 218, { width: 505, align: 'center' });

  doc.font('Times-Bold').fontSize(9.5).fillColor(BLACK)
     .text('IN', 45, 238, { width: 505, align: 'center' });

  doc.font('Times-Bold').fontSize(13.5).fillColor(RED)
     .text('CYBER PHYSICAL SYSTEMS AND SECURITY', 45, 255, { width: 505, align: 'center' });

  // State Board Emblem
  if (fs.existsSync(sbtetLogoPath)) {
    doc.image(sbtetLogoPath, 255, 285, { width: 85, height: 85 });
  }

  doc.font('Times-Roman').fontSize(10).fillColor(BLACK)
     .text('Submitted To', 45, 385, { width: 505, align: 'center' });

  doc.font('Times-Bold').fontSize(11).fillColor(BLUE_HEADER)
     .text('STATE BOARD OF TECHNICAL EDUCATION, TELANGANA', 45, 402, { width: 505, align: 'center' });

  doc.font('Times-Bold').fontSize(10).fillColor(RED)
     .text('SUBMITTED BY', 45, 430, { width: 505, align: 'center' });

  const team = [
    ['1.  MUNIGANTI RISHITH REDDY', '24054-CPS-011'],
    ['2.  KADINGULA EASHWAR', '24054-CPS-020'],
    ['3.  PANTANGI NEELIMA', '24054-CPS-050'],
    ['4.  MATTAWADA TANISH (Team Leader)', '24054-CPS-062'],
    ['5.  POLURU REBCA RANI', '24054-CPS-071']
  ];

  let ty = 450;
  team.forEach(m => {
    doc.font('Times-Bold').fontSize(9.5).fillColor(BLACK).text(m[0], 120, ty);
    doc.font('Times-Bold').fontSize(9.5).fillColor(BLACK).text(m[1], 370, ty);
    ty += 16;
  });

  doc.font('Times-Bold').fontSize(10).fillColor(GREEN)
     .text('GUIDED BY', 45, ty + 10, { width: 505, align: 'center' });

  doc.font('Times-Bold').fontSize(10).fillColor(BLACK)
     .text('Ms. T. BHARGAVI, B.Tech.', 45, ty + 28, { width: 505, align: 'center' });

  doc.font('Times-Roman').fontSize(9).fillColor(BLACK)
     .text('Lecturer In Computer Engineering (CME)', 45, ty + 42, { width: 505, align: 'center' });

  doc.font('Times-Bold').fontSize(11).fillColor(RED)
     .text('GOVERNMENT INSTITUTE OF ELECTRONICS, SECUNDERABAD', 45, ty + 58, { width: 505, align: 'center' });

  doc.font('Times-Bold').fontSize(9.5).fillColor(BLACK)
     .text('EAST MAREDPALLY, SECUNDERABAD – 500026', 45, ty + 74, { width: 505, align: 'center' });

  doc.font('Times-Bold').fontSize(10.5).fillColor(BLACK)
     .text('2024 - 2027', 45, ty + 90, { width: 505, align: 'center' });
}

// ==========================================
// PAGE 2: CERTIFICATE (I. Certificate)
// ==========================================
function buildPage2() {
  addPageWithBorder(null);

  doc.font('Times-Bold').fontSize(13.5).fillColor(RED)
     .text('GOVERNMENT INSTITUTE OF ELECTRONICS,', 45, 60, { width: 505, align: 'center' });
  doc.font('Times-Bold').fontSize(13.5).fillColor(RED)
     .text('SECUNDERABAD', 45, 78, { width: 505, align: 'center' });

  doc.font('Times-Bold').fontSize(9.5).fillColor(GREEN)
     .text('East Marredpally, Secunderabad - 500026', 45, 98, { width: 505, align: 'center' });

  doc.font('Times-Bold').fontSize(10).fillColor(BLACK)
     .text('2024 – 2027', 45, 114, { width: 505, align: 'center' });

  if (fs.existsSync(gioeLogoPath)) {
    doc.image(gioeLogoPath, 255, 134, { width: 85, height: 85 });
  }

  doc.font('Times-Bold').fontSize(18).fillColor(BLACK)
     .text('CERTIFICATE', 45, 235, { width: 505, align: 'center', underline: true });

  const certText = 'This is to certify that the project report titled “Smart Campus Library Management System” is successfully completed by the students of final year Diploma in Cyber Physical Systems and Security and has not been submitted to any other institute or organization for the award of diploma or degree.';

  doc.font('Times-Roman').fontSize(10.5).fillColor(BLACK)
     .text(certText, 60, 275, { width: 475, align: 'justify', lineGap: 3.5 });

  const team = [
    ['1.  MUNIGANTI RISHITH REDDY', '24054-CPS-011'],
    ['2.  KADINGULA EASHWAR', '24054-CPS-020'],
    ['3.  PANTANGI NEELIMA', '24054-CPS-050'],
    ['4.  MATTAWADA TANISH (Team Leader)', '24054-CPS-062'],
    ['5.  POLURU REBCA RANI', '24054-CPS-071']
  ];

  let cy = 350;
  team.forEach(m => {
    doc.font('Times-Bold').fontSize(9.5).fillColor(BLACK).text(m[0], 120, cy);
    doc.font('Times-Bold').fontSize(9.5).fillColor(BLACK).text(m[1], 370, cy);
    cy += 16;
  });

  const fulfillText = 'In partial fulfillment of the requirements for the award of diploma in Cyber Physical Systems and Security, GIOE (TS-SBTET, HYD) during the Academic Year 2026-2027.';

  doc.font('Times-Roman').fontSize(10).fillColor(BLACK)
     .text('In partial fulfillment of the requirements for the award of diploma in ', 60, cy + 20, { continued: true });
  doc.font('Times-Bold').fillColor(RED).text('Cyber Physical Systems and Security, GIOE', { continued: true });
  doc.font('Times-Roman').fillColor(BLACK).text(' (TS-SBTET, HYD) during the Academic Year 2026-2027.', { width: 475, align: 'justify' });

  const sigY = 560;
  // Guide
  doc.font('Times-Bold').fontSize(9.5).fillColor(GREEN).text('GUIDE', 60, sigY, { width: 200, align: 'left' });
  doc.font('Times-Bold').fontSize(9.5).fillColor(BLACK).text('Ms. T. BHARGAVI, B.Tech.', 60, sigY + 14, { width: 200, align: 'left' });
  doc.font('Times-Roman').fontSize(8.5).fillColor(BLACK).text('Lecturer in CME', 60, sigY + 28, { width: 200, align: 'left' });

  // HOD
  doc.font('Times-Bold').fontSize(9.5).fillColor(GREEN).text('HOD', 320, sigY, { width: 215, align: 'right' });
  doc.font('Times-Bold').fontSize(9.5).fillColor(BLACK).text('Mr. K.M. SATEESH KUMAR, M.E.', 320, sigY + 14, { width: 215, align: 'right' });
  doc.font('Times-Roman').fontSize(8.5).fillColor(BLACK).text('Senior Lecturer in EC', 320, sigY + 28, { width: 215, align: 'right' });

  // External Examiner
  const sigY2 = 665;
  doc.font('Times-Bold').fontSize(9.5).fillColor(BLUE_HEADER).text('EXTERNAL EXAMINER', 60, sigY2, { width: 200, align: 'left' });

  // Principal
  doc.font('Times-Bold').fontSize(9.5).fillColor(GREEN).text('PRINCIPAL', 320, sigY2, { width: 215, align: 'right' });
  doc.font('Times-Bold').fontSize(9.5).fillColor(BLACK).text('Mr. M.V. SATISH KUMAR, M.Tech.', 320, sigY2 + 14, { width: 215, align: 'right' });
}

// ==========================================
// PAGE 3: ACKNOWLEDGEMENT (II. Acknowledgement)
// ==========================================
function buildPage3() {
  addPageWithBorder(null);

  doc.font('Times-Bold').fontSize(16).fillColor(BLACK)
     .text('ACKNOWLEDGEMENT', 45, 80, { width: 505, align: 'center' });

  const p1 = 'We owe our gratitude to Mr. M.V. SATISH KUMAR, M.Tech, Principal of Government Institute of Electronics, Secunderabad, for extending the college facilities for the successful pursuit of our project and for his kind patronage.';
  const p2 = 'We wish to record our profound gratitude to Mr. K.M. SATEESH KUMAR, M.E, Senior Lecturer in Electronics and Communication Engineering and Head of the Department of Cyber Physical Systems and Security, Government Institute of Electronics, Secunderabad, for his love, motivation and encouragement.';
  const p3 = 'In the pursuit of this project, we are indebted to our project guide Ms. T. BHARGAVI, B.Tech, Lecturer in Computer Engineering (CME), Government Institute of Electronics, Secunderabad. It is an immense pleasure to be indebted to our guide for her valuable support, advice and encouragement. We thank her for the superb and dedicated continuous guidance given toward this project.';
  const p4 = 'We acknowledge our deep sense of gratitude to our loving parents for being a constant source of inspiration, patience, and motivation throughout our academic journey.';
  const p5 = 'Finally, we express our heartfelt thanks to all the faculty members of the Department of Cyber Physical Systems and Security, the library administrative staff, and our fellow students who extended their cooperation and constructive feedback during the testing and demonstration of the Smart Campus Library Management System.';

  let ay = 130;
  [p1, p2, p3, p4, p5].forEach(text => {
    doc.font('Times-Roman').fontSize(10.5).fillColor(BLACK)
       .text(text, 65, ay, { width: 465, align: 'justify', lineGap: 3.5, indent: 24 });
    ay += doc.heightOfString(text, { width: 465, lineGap: 3.5, indent: 24 }) + 22;
  });
}

// ==========================================
// PAGE 4: ABSTRACT (III. Abstract)
// ==========================================
function buildPage4() {
  addPageWithBorder(null);

  doc.font('Times-Bold').fontSize(16).fillColor(RED)
     .text('ABSTRACT', 45, 70, { width: 505, align: 'center' });

  const a1 = '“Smart Campus Library Management System” is a comprehensive, production-grade enterprise application engineered to resolve the operational bottlenecks of traditional paper-bound and legacy desktop library management. Built strictly with Node.js, JavaScript, HTML5, CSS3, Kotlin, and PostgreSQL—avoiding heavy third-party framework dependencies—the system unifies a Native Android Mobile Client for university students with a high-performance Vanilla Web Management Portal for librarians.';

  const a2 = 'The system introduces eight novel functional pillars tailored to modern institutional libraries: (1) a tamper-resistant Digital Library Membership Card bearing the collegiate motto “Peace through Wisdom”, student portrait, registration number, and an encrypted QR code for instant scan-and-go circulation; (2) a Book Finder Exact Shelf Locator that translates database metadata into precise physical navigation coordinates (e.g., Library Block: A, Floor: 2, Section: Computer Science, Rack: 08, Shelf: 03); (3) an Online Book Reservation Engine with preferred collection timeslot selection; (4) a deterministic Smart Waiting List that automatically queues students when inventory is zero and promotes reservation requests upon book check-in; (5) a personal “My Library Account” dashboard displaying active loans, approved reservations, historical logs, and calculated fines; (6) an automated Multi-Channel Notification Dispatcher prioritizing in-app alerts with supplementary email channels; (7) dynamic bibliographic ingestion via Open Library by Internet Archive; and (8) bulk student onboarding via validated Microsoft Excel (.xlsx/.csv) spreadsheets.';

  const a3 = 'Role-Based Access Control (RBAC) strictly guarantees that circulation modification (issuing loans, recording returns, and assessing overdue fines) remains exclusive to accredited library staff via cryptographic JWT authorization, rendering student tampering impossible. The resulting platform delivers unprecedented circulation speed, zero paper consumption, and transparent physical inventory tracking across the campus.';

  doc.font('Times-Roman').fontSize(9.5).fillColor(BLACK)
     .text(a1, 55, 105, { width: 485, align: 'justify', lineGap: 2.5, indent: 20 });
  doc.font('Times-Roman').fontSize(9.5).fillColor(BLACK)
     .text(a2, 55, 175, { width: 485, align: 'justify', lineGap: 2.5, indent: 20 });
  doc.font('Times-Roman').fontSize(9.5).fillColor(BLACK)
     .text(a3, 55, 305, { width: 485, align: 'justify', lineGap: 2.5, indent: 20 });

  // High-Level Architecture Diagram Box
  const diagY = 410;
  doc.rect(55, diagY, 485, 290).fillAndStroke(LIGHT_BG, TABLE_BORDER);
  doc.rect(55, diagY, 485, 20).fill('#0F172A');
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#FFFFFF')
     .text('FIGURE A: HIGH-LEVEL ARCHITECTURE OF SMART CAMPUS LIBRARY SYSTEM', 60, diagY + 6, { width: 475, align: 'center' });

  // Layer 1: Client Layer
  const l1Y = diagY + 30;
  doc.rect(70, l1Y, 215, 65).fillAndStroke('#EFF6FF', '#BFDBFE');
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#1E3A8A').text('STUDENT MOBILE CLIENT (KOTLIN)', 75, l1Y + 6);
  doc.font('Helvetica').fontSize(6.8).fillColor(DARK_SLATE)
     .text('• Digital ID Card with QR & “Peace through Wisdom”\n• Book Finder – Exact Shelf Locator (Block/Floor/Rack)\n• Online Reservation & Preferred Timeslot\n• My Library Account & Real-time In-App Notifications', 75, l1Y + 18, { lineGap: 1.5 });

  doc.rect(305, l1Y, 215, 65).fillAndStroke('#EFF6FF', '#BFDBFE');
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#1E3A8A').text('LIBRARIAN ADMIN PORTAL (VANILLA WEB)', 310, l1Y + 6);
  doc.font('Helvetica').fontSize(6.8).fillColor(DARK_SLATE)
     .text('• Circulation Desk with QR Barcode Scanner\n• Smart Waiting List & Reservation Approvals\n• Excel Student Roster Batch Onboarding (.xlsx)\n• Open Library Live Search & 1-Click Catalog Import', 310, l1Y + 18, { lineGap: 1.5 });

  // Arrow
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(MUTED_COLOR)
     .text('▼  RESTful JSON API / JWT Bearer Authentication (Role-Based Access Control)  ▼', 55, l1Y + 70, { width: 485, align: 'center' });

  // Layer 2: Node.js Backend API
  const l2Y = l1Y + 85;
  doc.rect(70, l2Y, 450, 70).fillAndStroke('#FEF3C7', '#FDE68A');
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#92400E').text('APPLICATION & BUSINESS LOGIC LAYER (NODE.JS & EXPRESS)', 75, l2Y + 6);
  doc.font('Helvetica').fontSize(6.8).fillColor(DARK_SLATE)
     .text('• Controllers: authController | bookController | borrowController | reservationController | notificationController\n• Security Guards: authenticateToken (JWT Signature) & requireLibrarian (403 Forbidden on Student Circulation Attempts)\n• Specialized Engines: SheetJS (.xlsx Binary Parser/Builder) | Shelf Coordinate Mapper | Waiting List FIFO Queue', 75, l2Y + 18, { lineGap: 1.8 });

  // Arrow
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(MUTED_COLOR)
     .text('▼  Relational SQL Queries (Pool)  ▼                                                 ▼  HTTPS / REST Calls  ▼', 55, l2Y + 75, { width: 485, align: 'center' });

  // Layer 3: Persistence & External Gateways
  const l3Y = l2Y + 90;
  doc.rect(70, l3Y, 215, 45).fillAndStroke('#DCFCE7', '#BBF7D0');
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#166534').text('POSTGRESQL RELATIONAL DATABASE', 75, l3Y + 5);
  doc.font('Helvetica').fontSize(6.8).fillColor(DARK_SLATE)
     .text('Dual-Engine: Native Port 5432 & PGlite Persistent Storage.\nTables: users, books, borrow_records, reservations, waiting_list, notifications, announcements.', 75, l3Y + 16, { lineGap: 1.2 });

  doc.rect(305, l3Y, 215, 45).fillAndStroke('#F3E8FF', '#E9D5FF');
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#6B21A8').text('EXTERNAL SERVICES & GATEWAYS', 310, l3Y + 5);
  doc.font('Helvetica').fontSize(6.8).fillColor(DARK_SLATE)
     .text('• Open Library (Internet Archive) API: Live Cover Artwork\n• SMTP Email Notification Dispatcher (Secondary Channel)\n• Client-Side QR Scanner & Camera Video Stream API', 310, l3Y + 16, { lineGap: 1.2 });

  doc.font('Times-Italic').fontSize(9).fillColor(BLACK)
     .text('Figure A: High-level architecture of Smart Campus Library System', 45, diagY + 295, { width: 505, align: 'center' });
}

// ==========================================
// PAGE 5: LIST OF CONTENTS
// ==========================================
function buildPage5() {
  addPageWithBorder(null);

  doc.font('Times-Bold').fontSize(16).fillColor(BLACK)
     .text('LIST OF CONTENTS', 45, 60, { width: 505, align: 'center' });

  const tocItems = [
    { title: 'I. Certificate', page: '' },
    { title: 'II. Acknowledgement', page: '' },
    { title: 'III. Abstract', page: '' },
    { title: 'Chapter 1: Introduction and Project Vision', page: '1', bold: true },
    { title: '  1.1 Introduction', page: '1' },
    { title: '  1.2 Problem Statement', page: '2' },
    { title: '  1.3 Project Goals', page: '3' },
    { title: '  1.4 Unique Selling Proposition', page: '4' },
    { title: '  1.5 Scope of the Project', page: '5' },
    { title: 'Chapter 2: Technical Foundations and Design', page: '6', bold: true },
    { title: '  2.1 Technology Stack', page: '6' },
    { title: '  2.2 System Architecture', page: '7' },
    { title: '  2.3 Module Description and Project Structure', page: '8' },
    { title: '  2.4 Data Flow and Database Design', page: '9' },
    { title: '  2.5 Core Algorithms and Logic', page: '11' },
    { title: '  2.6 UI/UX Design', page: '13' },
    { title: '  2.7 Application Workflow', page: '17' },
    { title: 'Chapter 3: Core Features and Security', page: '19', bold: true },
    { title: '  3.1 Features of the Smart Campus Library App', page: '19' },
    { title: '  3.2 Security Measures', page: '22' },
    { title: '  3.3 Testing and Quality Assurance', page: '23' },
    { title: 'Chapter 4: Development Phases and Project Management', page: '25', bold: true },
    { title: '  4.1 Development Methodology', page: '25' },
    { title: '  4.2 Phases of Development', page: '25' },
    { title: '  4.3 Version History and Milestones', page: '27' },
    { title: '  4.4 Challenges and Solutions', page: '27' },
    { title: '  4.5 Current Limitations', page: '28' },
    { title: 'Chapter 5: Market Positioning and Impact', page: '29', bold: true },
    { title: '  5.1 Market and Industry Context', page: '29' },
    { title: '  5.2 Competitive Landscape', page: '29' },
    { title: '  5.3 SWOT Analysis', page: '30' },
    { title: '  5.4 Social, Environmental and Industry Impact', page: '30' },
    { title: '  5.5 Partnerships and Target Institutions', page: '31' },
    { title: 'Chapter 6: Future Prospects and Final Insights', page: '32', bold: true },
    { title: '  6.1 Future Enhancements', page: '32' },
    { title: '  6.2 Ideal End-State Architecture', page: '32' },
    { title: '  6.3 Development Roadmap', page: '33' },
    { title: 'Chapter 7: Conclusion', page: '34', bold: true },
    { title: 'Appendices', page: '35', bold: true },
    { title: 'References', page: '36', bold: true }
  ];

  let tocy = 95;
  tocItems.forEach(item => {
    const isBold = item.bold || false;
    doc.font(isBold ? 'Times-Bold' : 'Times-Roman').fontSize(isBold ? 9.5 : 9).fillColor(BLACK);
    doc.text(item.title, 55, tocy);

    if (item.page) {
      doc.text(item.page, 510, tocy, { width: 30, align: 'right' });
      // dotted leader
      const dotsW = 440 - doc.widthOfString(item.title);
      const dotX = 58 + doc.widthOfString(item.title);
      doc.font('Times-Roman').fontSize(8).fillColor('#64748B')
         .text('.'.repeat(Math.floor(dotsW / 3.8)), dotX, tocy);
    }
    tocy += 16.5;
  });
}

// ==========================================
// ASSEMBLE ALL CHAPTERS AND GENERATE PDF
// ==========================================

const registerChapter1 = require('./doc_pages_ch1');
const registerChapter2 = require('./doc_pages_ch2');
const registerChapter3 = require('./doc_pages_ch3');
const registerChapter4to7 = require('./doc_pages_ch4_to_7');

const app = {
  doc,
  writeStream,
  outputPath,
  addPageWithBorder,
  buildPage1,
  buildPage2,
  buildPage3,
  buildPage4,
  buildPage5,
  RED,
  BLUE_HEADER,
  GREEN,
  DARK_SLATE,
  BLACK,
  TABLE_HEADER_BG,
  TABLE_BORDER,
  LIGHT_BG,
  MUTED_COLOR
};

// Register all modular chapter builders
registerChapter1(app);
registerChapter2(app);
registerChapter3(app);
registerChapter4to7(app);

function buildEntireReport() {
  console.log('Generating Smart Campus Library System Comprehensive Report...');

  // Preliminaries (Pages 1-5)
  console.log('Rendering Preliminary Pages (1-5)...');
  app.buildPage1(); // PDF Page 1: Cover
  app.buildPage2(); // PDF Page 2: Certificate
  app.buildPage3(); // PDF Page 3: Acknowledgement
  app.buildPage4(); // PDF Page 4: Abstract
  app.buildPage5(); // PDF Page 5: Table of Contents

  // Chapter 1: Pages 6-10 (Body Pages 1-5)
  console.log('Rendering Chapter 1 (Pages 6-10)...');
  app.buildBodyPage1();
  app.buildBodyPage2();
  app.buildBodyPage3();
  app.buildBodyPage4();
  app.buildBodyPage5();

  // Chapter 2: Pages 11-23 (Body Pages 6-18)
  console.log('Rendering Chapter 2 (Pages 11-23)...');
  app.buildBodyPage6();
  app.buildBodyPage7();
  app.buildBodyPage8();
  app.buildBodyPage9();
  app.buildBodyPage10();
  app.buildBodyPage11();
  app.buildBodyPage12();
  app.buildBodyPage13();
  app.buildBodyPage14();
  app.buildBodyPage15();
  app.buildBodyPage16();
  app.buildBodyPage17();
  app.buildBodyPage18();

  // Chapter 3: Pages 24-29 (Body Pages 19-24)
  console.log('Rendering Chapter 3 (Pages 24-29)...');
  app.buildBodyPage19();
  app.buildBodyPage20();
  app.buildBodyPage21();
  app.buildBodyPage22();
  app.buildBodyPage23();
  app.buildBodyPage24();

  // Chapters 4 to 7 & Appendices/References: Pages 30-41 (Body Pages 25-36)
  console.log('Rendering Chapters 4 to 7, Appendices & References (Pages 30-41)...');
  app.buildBodyPage25();
  app.buildBodyPage26();
  app.buildBodyPage27();
  app.buildBodyPage28();
  app.buildBodyPage29();
  app.buildBodyPage30();
  app.buildBodyPage31();
  app.buildBodyPage32();
  app.buildBodyPage33();
  app.buildBodyPage34();
  app.buildBodyPage35();
  app.buildBodyPage36();

  const totalPages = doc.bufferedPageRange().count;
  console.log(`Document assembly completed. Total pages buffered: ${totalPages}`);

  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => {
      const stats = fs.statSync(outputPath);
      console.log(`SUCCESS: PDF written to ${outputPath} (${(stats.size / 1024).toFixed(1)} KB, ${totalPages} Pages)`);
      resolve({ path: outputPath, size: stats.size, pages: totalPages });
    });
    writeStream.on('error', reject);
  });
}

if (require.main === module) {
  buildEntireReport()
    .then(res => {
      console.log('PDF generation finished cleanly:', res);
      process.exit(0);
    })
    .catch(err => {
      console.error('ERROR during PDF generation:', err);
      process.exit(1);
    });
}

module.exports = {
  ...app,
  buildEntireReport
};
