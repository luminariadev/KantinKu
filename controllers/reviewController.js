const Review = require('../models/Review');
const Menu = require('../models/Menu');

// Get reviews for a menu
const getMenuReviews = async (req, res) => {
  try {
    const { id } = req.params;

    // Get menu details to find warung_id
    const menu = await Menu.findById(id);
    if (!menu) {
      return res.status(404).json({ error: 'Menu tidak ditemukan' });
    }

    // Get reviews for the menu specifically from the review table
    const reviews = await Review.findByMenu(id);

    res.json(reviews);
  } catch (error) {
    console.error(`Error getting reviews for menu ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Gagal mengambil ulasan menu' });
  }
};

// Add or update a review
const addReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id_warung, id_menu, rating, komentar } = req.body;

    if (!id_menu || !rating) {
      return res.status(400).json({ error: 'ID menu dan rating diperlukan' });
    }

    // Create or update review using the Review model
    const reviewId = await Review.create({
      id_user: userId,
      id_warung,
      id_menu,
      rating,
      komentar
    });

    res.status(201).json({
      success: true,
      id: reviewId,
      message: 'Ulasan berhasil ditambahkan atau diperbarui'
    });
  } catch (error) {
    console.error('Error adding review:', error);
    if (error.message && error.message.includes('Database error')) {
      return res.status(500).json({ error: 'Database error: ' + error.message });
    }
    res.status(500).json({ error: 'Gagal menambahkan ulasan: ' + (error.message || 'Terjadi kesalahan database') });
  }
};

// Get user's reviews
const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get reviews from the review table
    const reviews = await Review.findByUser(userId);
    res.json(reviews);
  } catch (error) {
    console.error(`Error getting reviews for user ID ${req.user.id}:`, error);
    res.status(500).json({ error: 'Gagal mengambil ulasan pengguna' });
  }
};

module.exports = {
  getMenuReviews,
  addReview,
  getUserReviews
};
