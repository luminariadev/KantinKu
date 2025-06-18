const express = require('express');
const router = express.Router();
const { 
  getAllMenu, 
  getMenuById, 
  getMenuByWarung, 
  getMenuByKategori,
  getFavoriteMenu,
  addFavoriteMenu,
  removeFavoriteMenu,
  getAllMenuWithReviewsAndFavorites
} = require('../controllers/menuController');
const { authMiddleware } = require('../middlewares/auth');

// Public routes
router.get('/', getAllMenu);
router.get('/with-reviews', authMiddleware, getAllMenuWithReviewsAndFavorites);

// Specific routes must come before parameterized routes
router.get('/warung/:id', getMenuByWarung);
router.get('/kategori/:id', getMenuByKategori);

// Protected routes for favorites
router.get('/favorites', authMiddleware, getFavoriteMenu);
router.post('/favorites/:id', authMiddleware, addFavoriteMenu);
router.delete('/favorites/:id', authMiddleware, removeFavoriteMenu);

// Get menu by ID (must be after specific routes)
router.get('/:id', getMenuById);

     module.exports = router;