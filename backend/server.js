const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const borrowRoutes = require('./routes/borrowRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const waitingListRoutes = require('./routes/waitingListRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

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
  origin: true, // Echo origin to allow development on localhost/different ports
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

// Professional request logger
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

// Serve Admin Web Frontend (without auto-hijacking root / to index.html)
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

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbRes = await db.query('SELECT NOW() as current_time');
    res.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      database: 'Connected',
      db_time: dbRes.rows[0].current_time,
    });
  } catch (err) {
    res.status(500).json({
      status: 'PARTIAL',
      database: 'Disconnected',
      error: err.message,
    });
  }
});

// Root Gateway — Institutional Portal Selector
app.get('/', (req, res) => {
  res.sendFile(path.join(adminWebPath, 'portal.html'));
});

// Friendly aliases
app.get('/student', (req, res) => {
  res.sendFile(path.join(adminWebPath, 'student.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(adminWebPath, 'index.html'));
});

app.get('/login', (req, res) => {
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

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`======================================================`);
  console.log(`Library Management System Backend is running!`);
  console.log(`Local Server:       http://localhost:${PORT}`);
  console.log(`Admin Web Site:     http://localhost:${PORT}`);
  console.log(`API Health Check:   http://localhost:${PORT}/api/health`);
  console.log(`======================================================`);
});
