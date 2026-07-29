const express = require('express');
const {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  googleLogin
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);

module.exports = router;
