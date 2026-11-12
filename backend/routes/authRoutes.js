const express = require('express');
const router = express.Router();
const multer = require('multer');
const authController = require('../controllers/authController');
const { authenticateToken, requireLibrarian } = require('../middleware/auth');

// Multer in-memory storage for Excel uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Authentication
router.post('/login', authController.login);
router.post('/register', authController.registerStudent);
router.get('/me', authenticateToken, authController.getMe);
router.put('/profile', authenticateToken, authController.updateProfile);

// Password recovery
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Digital Membership Card & Student Dashboard
router.get('/student-card', authenticateToken, authController.getDigitalCard);
router.get('/my-account', authenticateToken, authController.getMyAccount);

// Librarian Desk Scanner & Management
router.get('/student-by-code/:code', authenticateToken, requireLibrarian, authController.getStudentByCode);
router.get('/students', authenticateToken, requireLibrarian, authController.getAllStudents);
router.get('/students/template', authController.downloadStudentsTemplate);
router.post(
  '/students/upload',
  authenticateToken,
  requireLibrarian,
  upload.single('file'),
  authController.uploadStudentsExcel
);

module.exports = router;
