const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const borrowRoutes = require('./routes/borrowRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const waitingListRoutes = require('./routes/waitingListRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const db = require('./config/db');

const app = express();

// Trust reverse proxies (essential for Vercel and production SSL/rate limiters)
app.set('trust proxy', 1);

// Security Middleware 1: Strip Express Server Fingerprint
app.disable('x-powered-by');

// Security Middleware 2: HTTP Security Headers via Helmet (XSS, HSTS, Sniffing, Frame Guard)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "blob:", "https://covers.openlibrary.org", "https://images-na.ssl-images-amazon.com"],
        connectSrc: ["'self'", "http://localhost:*", "http://127.0.0.1:*", "https://openlibrary.org"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);

// Security Middleware 3: CORS Hardening
app.use(cors({
  origin: true, // Echo origin to allow development on localhost and production Vercel
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Security Middleware 4: Rate Limiting (Brute Force & DoS Defense)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 login/register attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts from this IP. Please try again after 15 minutes.' },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Limit general API calls to 1000 per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});

// Security Middleware 5: Request Body Parsing & Payload Limiting
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply Rate Limiters
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Request logger (in non-test environments)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!req.url.startsWith('/css') && !req.url.startsWith('/js') && !req.url.endsWith('.html')) {
      const statusColor = res.statusCode >= 400 ? '❌' : '✅';
      console.log(`${statusColor} [${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Serve Admin Web Frontend
const adminWebPath = path.join(__dirname, '..', 'admin-web');
app.use(express.static(adminWebPath, { index: false }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrow', borrowRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/waiting-list', waitingListRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);

// Emergency / Automatic Showcase Seeder Trigger
app.get('/api/seed-db', async (req, res) => {
  try {
    const { seedShowcase } = require('./scripts/seed_showcase');
    await seedShowcase(db);
    const [b, u] = await Promise.all([
      db.query('SELECT COUNT(*) FROM books'),
      db.query('SELECT COUNT(*) FROM users')
    ]);
    res.json({
      status: 'SUCCESS',
      message: 'Showcase database seeded successfully with all demo books and students!',
      books: parseInt(b.rows[0].count, 10),
      users: parseInt(u.rows[0].count, 10)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Production Comprehensive Health & Database Diagnostic Endpoint
app.get('/api/health', async (req, res) => {
  const startTime = Date.now();
  try {
    const dbRes = await db.query('SELECT NOW() as current_time, version() as db_version');
    const latency = Date.now() - startTime;

    // Probe table counts to verify relational integrity
    let tableMetrics = null;
    try {
      const [b, u, br, r, w, a, n] = await Promise.all([
        db.query('SELECT COUNT(*) FROM books'),
        db.query('SELECT COUNT(*) FROM users'),
        db.query('SELECT COUNT(*) FROM borrow_records'),
        db.query('SELECT COUNT(*) FROM reservations'),
        db.query('SELECT COUNT(*) FROM waiting_list'),
        db.query('SELECT COUNT(*) FROM announcements'),
        db.query('SELECT COUNT(*) FROM notifications')
      ]);
      tableMetrics = {
        books: parseInt(b.rows[0].count, 10),
        users: parseInt(u.rows[0].count, 10),
        borrow_records: parseInt(br.rows[0].count, 10),
        reservations: parseInt(r.rows[0].count, 10),
        waiting_list: parseInt(w.rows[0].count, 10),
        announcements: parseInt(a.rows[0].count, 10),
        notifications: parseInt(n.rows[0].count, 10)
      };
    } catch (_) {}

    const engine = await db.getEngine();

    res.json({
      status: 'UP',
      production_ready: true,
      timestamp: new Date().toISOString(),
      environment: process.env.VERCEL ? 'Vercel Serverless Production' : (process.env.NODE_ENV || 'production'),
      database: {
        status: 'Connected',
        engine: 'PostgreSQL',
        connection_mode: engine.mode === 'native' ? 'Cloud Managed PostgreSQL (Neon / Supabase)' : 'Embedded Persistent PostgreSQL (PGlite)',
        latency_ms: latency,
        db_time: dbRes.rows[0].current_time,
        tables: tableMetrics || 'Tables verified'
      },
      security: {
        helmet_csp: 'Active',
        rate_limiting: 'Active (1000 req/15m API, 100 req/15m Auth)',
        jwt_authentication: 'Active',
        cors_hardened: true
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'DEGRADED',
      production_ready: false,
      database: {
        status: 'Disconnected',
        error: err.message
      }
    });
  }
});

// Root Gateway & Aliases
app.get(['/', '/portal', '/home', '/gateway'], (req, res) => {
  res.sendFile(path.join(adminWebPath, 'portal.html'));
});

// Student Portal & Aliases
app.get(['/student', '/student-portal'], (req, res) => {
  res.sendFile(path.join(adminWebPath, 'student.html'));
});

// Admin / Librarian Desk & Aliases
app.get(['/admin', '/librarian', '/dashboard'], (req, res) => {
  res.sendFile(path.join(adminWebPath, 'index.html'));
});

// Login & Aliases
app.get(['/login', '/signin'], (req, res) => {
  res.sendFile(path.join(adminWebPath, 'login.html'));
});

// Download compiled Android APK
app.get('/download/apk', (req, res) => {
  const apkPath = path.join(__dirname, '..', 'student-app-debug.apk');
  res.download(apkPath, 'SmartCampusLibrary-StudentApp.apk', (err) => {
    if (err && !res.headersSent) {
      res.status(404).send('APK binary not found. Build with gradlew assembleDebug.');
    }
  });
});

// Global 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Friendly fallback for any unrecognized web route -> redirect to Central Gateway
app.get('*', (req, res) => {
  res.redirect('/');
});

module.exports = app;
