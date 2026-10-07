const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const borrowRoutes = require('./routes/borrowRoutes');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Serve Admin Web Frontend
const adminWebPath = path.join(__dirname, '..', 'admin-web');
app.use(express.static(adminWebPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrow', borrowRoutes);

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

// Admin Web redirect fallback for SPA root
app.get('/', (req, res) => {
  res.sendFile(path.join(adminWebPath, 'index.html'));
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
