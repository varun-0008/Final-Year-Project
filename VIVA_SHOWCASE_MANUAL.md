# 🎓 Smart Campus Library Management System — Viva & Review Presentation Manual

**Institution:** Government Institute of Electronics (GIOE), Secunderabad  
**Department:** State Board of Technical Education, Telangana  
**Course:** Diploma in Cyber Physical Systems and Security  
**Project Lead:** Mattawada Tanish (Registration No: `24054-CPS-062`)  
**Core Technologies:** Native Kotlin (Android Studio), Node.js (Express), PostgreSQL (PGlite Engine), HTML5/CSS3/Vanilla JS  

---

## 📌 Executive Summary & Architecture
The **Smart Campus Library Management System** is an end-to-end institutional digital library ecosystem designed to eliminate congestion at circulation desks, eradicate shelf search friction, prevent manual book reservation bottlenecks, and enforce equitable borrowing through an automated FIFO waiting queue.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CENTRAL ACCESS GATEWAY                          │
│                        http://localhost:5000/                          │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
       ┌─────────────────────────┐      ┌─────────────────────────┐
       │   STUDENT WEB PORTAL    │      │  LIBRARIAN ADMIN DESK   │
       │   /student.html         │      │  /login.html            │
       └────────────┬────────────┘      └────────────┬────────────┘
                    │                                │
                    ▼                                ▼
       ┌──────────────────────────────────────────────────────────┐
       │           HARDENED NODE.JS REST API & POSTGRESQL         │
       │  (Helmet Security, Rate Limiter, JWT Auth, Audit Logs)   │
       └────────────────────────────┬─────────────────────────────┘
                                    │
                                    ▼
       ┌──────────────────────────────────────────────────────────┐
       │           NATIVE ANDROID APP (Kotlin / Jetpack)          │
       │  (Shelf Locator, Offline QR Card, Retrofit 2, Coroutines)│
       └──────────────────────────────────────────────────────────┘
```

---

## 🎯 Live Viva Demonstration Script (10-Minute Walkthrough)

Follow this step-by-step sequence in front of the examination panel or professor:

### Step 1: Open Central Access Gateway (Root `/`)
- **URL:** `http://localhost:5000/`
- **What to say:**
  > *"Respected Professor, this is our Institutional Central Access Gateway. Rather than dumping users into an unauthenticated internal dashboard, the system separates access into the Student Portal and the Librarian Admin Desk, and provides a direct 1-click download of the Android APK for mobile devices."*

---

### Step 2: Student Login & Module 8 Digital Membership Card
- Click **"Enter Student Portal"** (`/student.html`).
- Log in with Demo Credentials:
  - **Registration Number:** `24054-CPS-062`
  - **Password:** `student123`
- Click the **"🪪 Digital ID Card"** tab.
- **Key Features to Highlight:**
  - Institutional Emblem & Motto: *"Peace through Wisdom"*.
  - Student Registration Number: `24054-CPS-062`.
  - Department: *Cyber Physical Systems and Security*.
  - Dynamic 2D QR Code: Cryptographically linked to the student's membership ID (`LIB-STU-24054062`).
  - Active Borrowing Limit Progress Bar: `1 of 3 books checked out (2 slots remaining)`.
  - **Demonstrate:** Click **"🔄 Refresh Dynamic QR Token"** to showcase client-side cryptographic token rotation.

---

### Step 3: Book Finder & Exact Physical Shelf Locator
- Click the **"📚 Catalog & Shelf Locator"** tab.
- Search for *"Algorithms"* or click the **"Algorithms"** category chip.
- **Key Features to Highlight:**
  - Notice the green badge: `📍 Block A, Floor 2 • Rack 08 • Shelf 03`.
  - **What to say:**
    > *"In traditional libraries, finding a physical book involves wandering through aisles. Our Book Finder maps every single book to 5 discrete physical coordinates: Library Block, Floor Level, Departmental Section, Rack Number, and Shelf Level."*
- Click on the book card to open the **Full Book Specification Modal**:
  - Displays high-resolution book cover from Open Library, total copies (5), available copies (4), and interactive shelf locator diagram.

---

### Step 4: Online Book Reservation (Module 3)
- In the catalog, click on **"Database System Concepts"** (5 available copies).
- In the modal, select a preferred collection date and pick a timeslot (e.g. `10:00 AM - 12:00 PM`).
- Click **"Confirm Online Reservation"**.
- An immediate reservation ticket is issued with unique tracking code: `RES-2026-XXXX`.
- **What to say:**
  > *"The student receives a guaranteed pickup window. The librarian is notified instantly, and the physical book is reserved from general circulation."*

---

### Step 5: Smart Waiting List (Module 2)
- In the catalog, locate **"Artificial Intelligence: A Modern Approach"**.
- Notice the red indicator: `🔴 Out of Stock (2 Waiting in Queue)`.
- Click on the book card.
- The system automatically replaces the "Reserve" button with **"⏳ Join Smart Waiting List"**.
- **What to say:**
  > *"When physical copies hit zero, the system prevents deadlocks by establishing an automated FIFO (First-In, First-Out) queue. Mattawada Tanish is currently #1 in line. The moment any student returns this volume at the desk, the backend automatically promotes the top waiting student and triggers a priority notification."*

---

### Step 6: My Library Account Dashboard (Module 6)
- Click the **"📊 My Library Account"** tab.
- Show the 4 organized sections:
  1. **Currently Borrowed Volumes:** *Clean Code* (Due in 10 days, $0.00 fine).
  2. **Active Reservations:** *Operating System Concepts* (Status: `approved`, ready for collection) and *Database System Concepts* (Status: `pending`).
  3. **Waiting List Position:** *Artificial Intelligence: A Modern Approach* (Queue Position: `#1`).
  4. **Borrowing History:** *The Pragmatic Programmer* (Returned on time).

---

### Step 7: Real-Time In-App Notifications (Module 7)
- Click the **🔔 Bell Icon** in the top navigation bar.
- Notice the unread badge (`5`).
- The dropdown displays real-time push alerts:
  - 📋 *Reservation Approved (Code: RES-2026-9481)*
  - ⏳ *Waiting List Priority Alert (Position #1)*
  - ⏰ *Return Deadline Reminder (Clean Code due in 10 days)*
  - 📚 *New Book Arrival in Block B*
  - 🪪 *Digital Membership Card Activation Confirmation*

---

### Step 8: Librarian Desk Scan & Go (Module 8 & Admin Circulation)
- Click **"👨‍💼 Librarian Desk"** or open `http://localhost:5000/login.html`.
- Log in with Admin Credentials:
  - **Email:** `admin@library.com`
  - **Password:** `admin123`
- Click the **"🔄 Issue & Returns"** tab.
- In the **Desk Scan & Go Console**:
  - Enter the student QR code / Registration number: `24054-CPS-062`.
  - Press Enter.
- **Watch the instant retrieval:**
  - Instantly renders Mattawada Tanish's photo, borrowing limit, active loans, and ready reservations.
  - Demonstrates 1-tap **"Fulfill & Issue"** and **"Return Book"** with automated fine calculation!

---

### Step 9: Native Kotlin Android Mobile App
- Open the compiled APK on the Android Emulator or physical phone:
  - Path: `student-app-debug.apk` (6.35 MB)
- Log in as `24054-CPS-062` / `student123`.
- Show:
  1. **Catalog Tab:** Real-time search, category chips, shelf location badges.
  2. **My Loans Tab:** Active loans with due date counters.
  3. **Profile Tab:** Real-time Digital Library Membership Card with dynamic QR code!

---

## 💡 Typical Viva Questions & Model Answers

### Q1: Why did you choose PostgreSQL / PGlite instead of MongoDB or SQLite?
> **Answer:** Library management is inherently relational with strict ACID transaction requirements. Relationships between users, physical book copies, reservations, and borrow records demand referential integrity (`FOREIGN KEY ... ON DELETE CASCADE`). If a book copy is issued or returned, inventory decrement and loan creation must occur atomically within a transaction block. PGlite gives us true PostgreSQL relational power with zero external server dependencies.

### Q2: How does the Smart Waiting List guarantee fair allocation?
> **Answer:** The waiting list operates as a strict FIFO queue partitioned by `book_id`. When a copy is returned, the backend transaction triggers `promoteNextWaitingStudent()`, querying `WHERE book_id = $1 AND status = 'waiting' ORDER BY queue_position ASC LIMIT 1`. The promoted student is transitioned to `notified` status and reserved a 48-hour pickup window before the slot cascades to position #2.

### Q3: How is application security enforced?
> **Answer:** We implemented a 5-layer defense-in-depth architecture:
> 1. **Helmet.js:** Enforces Content Security Policy (CSP), frame-guarding (`X-Frame-Options: SAMEORIGIN` against clickjacking), and MIME-sniffing prevention.
> 2. **Express Rate Limiting:** Limits authentication endpoints to 100 requests / 15 minutes to defeat credential-stuffing and brute-force attacks.
> 3. **Password Security:** Salted hashes generated using `bcrypt` (10 rounds).
> 4. **Session Management:** Cryptographically signed JWT tokens with expiration and automated client-side invalidation.
> 5. **SQL Injection Defense:** 100% of queries use parameterized prepared statements (`$1, $2`).

### Q4: How does the Shelf Locator coordinate system function?
> **Answer:** We created a 5-tier spatial schema in the `books` table: `block` (Wing A/B), `floor` (1-3), `section` (Subject domain), `rack` (Numbered book rack), and `shelf` (Vertical tier). This allows students to navigate directly to the physical shelf without librarian assistance.
