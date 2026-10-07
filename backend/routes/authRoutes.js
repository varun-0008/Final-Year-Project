const express = require('express');
const router = express.Router();
const multer = require('multer');
const authController = require('../controllers/authController');
const { authenticateToken, requireLibrarian } = require('../middleware/auth');

// Setup multer for in-memory file uploads (max 10MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post('/login', authController.login);
router.post('/register', authController.registerStudent);
router.get('/me', authenticateToken, authController.getMe);

// Student endpoints
router.get('/students/template', authController.downloadStudentsTemplate);
router.get('/students', authenticateToken, requireLibrarian, authController.getAllStudents);
router.post(
  '/students/upload',
  authenticateToken,
  requireLibrarian,
  upload.single('file'),
  authController.uploadStudentsExcel
);

module.exports = router;
