const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

// Middleware to verify user token
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Akses ditolak',
        message: 'Token tidak ditemukan atau format tidak valid' 
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Optional: Validate user existence in database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        error: 'Akses ditolak',
        message: 'Pengguna tidak ditemukan' 
      });
    }
    
    
    // Add user info to request
    req.user = {
      id: decoded.id,
      role: decoded.role || 'user' // Default to 'user' if role not present
    };
    
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Akses ditolak',
        message: 'Token telah kedaluwarsa' 
      });
    }
    res.status(401).json({ 
      error: 'Akses ditolak',
      message: 'Token tidak valid' 
    });
  }
};

// Middleware to verify admin token
const adminMiddleware = async (req, res, next) => {
  try {
    // Verify token first
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Akses ditolak',
        message: 'Token tidak ditemukan atau format tidak valid' 
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Optional: Validate admin existence in database
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ 
        error: 'Akses ditolak',
        message: 'Admin tidak ditemukan' 
      });
    }
    
    // Check if user has admin role
    if (decoded.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Akses ditolak',
        message: 'Hanya admin yang dapat mengakses fitur ini' 
      });
    }
    
    req.user = {
      id: decoded.id,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    console.error('Admin verification error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Akses ditolak',
        message: 'Token telah kedaluwarsa' 
      });
    }
    res.status(401).json({ 
      error: 'Akses ditolak',
      message: 'Token tidak valid' 
    });
  }
};

// Optional token verification (for endpoints that work with or without auth)
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token, proceed without user info
      return next();
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Optional: Validate user existence
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(); // Proceed without user info if user not found
    }
    
    // Add user info to request
    req.user = {
      id: decoded.id,
      role: decoded.role || 'user'
    };
    
    next();
  } catch (error) {
    // Invalid token, proceed without user info
    console.warn('Optional token verification failed:', error.message);
    next();
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  optionalAuthMiddleware
};