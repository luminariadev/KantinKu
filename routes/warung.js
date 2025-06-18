const express = require('express');
const router = express.Router();
const { 
  getAllWarung, 
  getWarungById, 
  createWarung, 
  updateWarung, 
  deleteWarung 
} = require('../controllers/warungController');
const { adminMiddleware } = require('../middlewares/auth');

// Public routes
router.get('/', getAllWarung);
router.get('/:id', getWarungById);

// Admin routes
router.post('/', adminMiddleware, createWarung);
router.put('/:id', adminMiddleware, updateWarung);
router.delete('/:id', adminMiddleware, deleteWarung);

module.exports = router;