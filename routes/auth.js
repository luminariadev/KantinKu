const express = require('express');
const router = express.Router();
const { registerUser, loginUser, loginAdmin } = require('../controllers/authController');

// User routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Admin routes
router.post('/admin/login', loginAdmin);

module.exports = router;