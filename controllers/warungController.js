const Warung = require('../models/Warung');
const Menu = require('../models/Menu');
const Review = require('../models/Review');

// Get all warung
const getAllWarung = async (req, res) => {
  try {
    const warungList = await Warung.findAll();
    
    // Format data
    const formattedWarung = warungList.map(warung => ({
      ...warung,
      avg_rating: Number(warung.avg_rating).toFixed(1)
    }));
    
    res.json(formattedWarung);
  } catch (error) {
    console.error('Error getting warung list:', error);
    res.status(500).json({ error: 'Gagal mengambil data warung' });
  }
};

// Get warung by ID
const getWarungById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get warung details
    const warung = await Warung.findById(id);
    if (!warung) {
      return res.status(404).json({ error: 'Warung tidak ditemukan' });
    }
    
    // Get warung menu
    const menu = await Menu.findByWarung(id);
    
    // Get warung reviews
    const reviews = await Review.findByWarung(id);
    
    // Format response
    const response = {
      ...warung,
      avg_rating: Number(warung.avg_rating).toFixed(1),
      menu,
      reviews
    };
    
    res.json(response);
  } catch (error) {
    console.error(`Error getting warung ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Gagal mengambil detail warung' });
  }
};

// Create new warung (admin only)
const createWarung = async (req, res) => {
  try {
    const { nama_warung, lokasi, deskripsi, kontak, foto } = req.body;
    
    // Validate required fields
    if (!nama_warung || !lokasi) {
      return res.status(400).json({ error: 'Nama warung dan lokasi harus diisi' });
    }
    
    // Create warung
    const warungId = await Warung.create({
      nama_warung,
      lokasi,
      deskripsi,
      kontak,
      foto
    });
    
    res.status(201).json({
      success: true,
      id: warungId,
      message: 'Warung berhasil ditambahkan'
    });
  } catch (error) {
    console.error('Error creating warung:', error);
    res.status(500).json({ error: 'Gagal menambahkan warung' });
  }
};

// Update warung (admin only)
const updateWarung = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_warung, lokasi, deskripsi, kontak, foto } = req.body;
    
    // Check if warung exists
    const warung = await Warung.findById(id);
    if (!warung) {
      return res.status(404).json({ error: 'Warung tidak ditemukan' });
    }
    
    // Update warung
    const success = await Warung.update(id, {
      nama_warung: nama_warung || warung.nama_warung,
      lokasi: lokasi || warung.lokasi,
      deskripsi: deskripsi !== undefined ? deskripsi : warung.deskripsi,
      kontak: kontak !== undefined ? kontak : warung.kontak,
      foto: foto !== undefined ? foto : warung.foto
    });
    
    if (success) {
      res.json({
        success: true,
        message: 'Warung berhasil diperbarui'
      });
    } else {
      res.status(400).json({ error: 'Gagal memperbarui warung' });
    }
  } catch (error) {
    console.error(`Error updating warung ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Gagal memperbarui warung' });
  }
};

// Delete warung (admin only)
const deleteWarung = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if warung exists
    const warung = await Warung.findById(id);
    if (!warung) {
      return res.status(404).json({ error: 'Warung tidak ditemukan' });
    }
    
    // Delete warung
    const success = await Warung.delete(id);
    
    if (success) {
      res.json({
        success: true,
        message: 'Warung berhasil dihapus'
      });
    } else {
      res.status(400).json({ error: 'Gagal menghapus warung' });
    }
  } catch (error) {
    console.error(`Error deleting warung ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Gagal menghapus warung' });
  }
};

module.exports = {
  getAllWarung,
  getWarungById,
  createWarung,
  updateWarung,
  deleteWarung
};