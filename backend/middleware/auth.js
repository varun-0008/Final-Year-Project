const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <TOKEN>

  if (!token) {
    return res.status(401).json({ error: 'Authentication token is required.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'library_management_secret_key_2026', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
};

const requireLibrarian = (req, res, next) => {
  if (!req.user || req.user.role !== 'librarian') {
    return res.status(403).json({
      error: 'Access denied: only a librarian / admin can perform this action.',
    });
  }
  next();
};

const requireStudent = (req, res, next) => {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({
      error: 'Access denied: student account required.',
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireLibrarian,
  requireStudent,
};
