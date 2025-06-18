const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/adminController');
const { adminMiddleware } = require('../middlewares/auth');

// Admin dashboard stats
router.get('/dashboard/stats', adminMiddleware, getDashboardStats);

module.exports = router;