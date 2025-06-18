const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

// User Authentication
const registerUser = async (req, res) => {
  try {
    console.log('Register request received:', req.body);
    const { username, email, password, nama } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, dan password harus diisi' });
    }
    
    // Check if username already exists
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ error: 'Username sudah digunakan' });
    }
    
    // Check if email already exists
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: 'Email sudah digunakan' });
    }
    
    // Create user
    const userId = await User.create({ username, email, password, nama });
    console.log('User created with ID:', userId);
    
    // Generate token
    const token = jwt.sign(
      { id: userId, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: userId,
        username,
        email,
        nama,
        role: 'user'
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password harus diisi' });
    }
    
    // Find user
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(400).json({ error: 'Username tidak ditemukan' });
    }
    
    console.log('User found:', user);
    
    // Verify password
    const isValid = await User.verifyPassword(user, password);
    if (!isValid) {
      return res.status(400).json({ error: 'Password salah' });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user.id_user, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id_user,
        username: user.username,
        email: user.email,
        nama: user.nama,
        role: 'user'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

// Admin Authentication
const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password harus diisi' });
    }
    
    // Find admin
    const admin = await Admin.findByUsername(username);
    if (!admin) {
      return res.status(400).json({ error: 'Username admin tidak ditemukan' });
    }
    
    // Verify password
    const isValid = await Admin.verifyPassword(admin, password);
    if (!isValid) {
      return res.status(400).json({ error: 'Password salah' });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: admin.id_admin, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({
      success: true,
      token,
      admin: {
        id: admin.id_admin,
        username: admin.username,
        nama: admin.nama_admin,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  loginAdmin
};