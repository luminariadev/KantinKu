const express = require('express');
const router = express.Router();
const { 
  getMenuReviews,
  addReview,
  getUserReviews
} = require('../controllers/reviewController');
const { authMiddleware } = require('../middlewares/auth');

// Public routes
router.get('/menu/:id', getMenuReviews);

// Protected routes
router.post('/', authMiddleware, addReview);
router.get('/user', authMiddleware, getUserReviews);

module.exports = router;