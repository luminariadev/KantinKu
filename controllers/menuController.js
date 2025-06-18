const Menu = require('../models/Menu');
const FavoriteMenu = require('../models/FavoriteMenu');

// Get all menu
const getAllMenu = async (req, res) => {
  try {
    const menuList = await Menu.findAll();
    res.json(menuList);
  } catch (error) {
    console.error('Error getting menu list:', error);
    res.status(500).json({ error: 'Gagal mengambil data menu' });
  }
};

// Get all menu with reviews and favorite status for logged-in user
const getAllMenuWithReviewsAndFavorites = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;

    // Get all menus
    const menuList = await Menu.findAll();

    // For each menu, get reviews and favorite status
    const menuWithDetails = await Promise.all(menuList.map(async (menu) => {
      // Get reviews for menu
      const reviews = await require('../models/ReviewMenu').findByMenu(menu.id_menu);

      // Check if favorite for logged-in user
      let isFavorite = false;
      if (userId) {
        isFavorite = await FavoriteMenu.isFavorite(userId, menu.id_menu);
      }

      // Calculate average rating
      let avgRating = 0;
      if (reviews.length > 0) {
        const total = reviews.reduce((sum, r) => sum + r.rating, 0);
        avgRating = (total / reviews.length).toFixed(2);
      }

      return {
        ...menu, 
        reviews,
        isFavorite,
        avgRating
      };
    }));

    res.json(menuWithDetails);
  } catch (error) {
    console.error('Error getting menus with reviews and favorites:', error);
    res.status(500).json({ error: 'Gagal mengambil data menu dengan ulasan dan favorit' });
  }
};

// Get all menu with user reviews
const getAllMenuWithUserReviews = async (req, res) => {
  try {
    const menuList = await Menu.findAllWithUserReviews();
    res.json(menuList);
  } catch (error) {
    console.error('Error getting menu list with user reviews:', error);
    res.status(500).json({ error: 'Gagal mengambil data menu dengan ulasan pengguna' });
  }
};

// Get menu by ID
const getMenuById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const menu = await Menu.findById(id);
    if (!menu) {
      return res.status(404).json({ error: 'Menu tidak ditemukan' });
    }
    
    // Check if menu is in user's favorites (if user is logged in)
    let isFavorite = false;
    if (req.user) {
      isFavorite = await FavoriteMenu.isFavorite(req.user.id, id);
    }
    
    // Format response
    let menuData;
    if (typeof menu.toJSON === 'function') {
      menuData = menu.toJSON();
    } else {
      menuData = JSON.parse(JSON.stringify(menu));
    }
    const response = {
      ...menuData,
      isFavorite
    };
    
    res.json(response);
  } catch (error) {
    console.error(`Error getting menu ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Gagal mengambil detail menu' });
  }
};

// Get menu by warung ID
const getMenuByWarung = async (req, res) => {
  try {
    const { id } = req.params;
    
    const menuList = await Menu.findByWarung(id);
    res.json(menuList);
  } catch (error) {
    console.error(`Error getting menu for warung ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Gagal mengambil data menu warung' });
  }
};

// Get menu by kategori ID
const getMenuByKategori = async (req, res) => {
  try {
    const { id } = req.params;
    
    const menuList = await Menu.findByKategori(id);
    res.json(menuList);
  } catch (error) {
    console.error(`Error getting menu for kategori ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Gagal mengambil data menu kategori' });
  }
};

// Get user's favorite menu
const getFavoriteMenu = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const favoriteMenus = await FavoriteMenu.findByUser(userId);
    if (!favoriteMenus || favoriteMenus.length === 0) {
      return res.json([]); // Kembalikan array kosong jika tidak ada favorit
    }
    res.json(favoriteMenus);
  } catch (error) {
    console.error(`Error getting favorite menu for user ID ${req.user.id}:`, error);
    res.status(500).json({ error: 'Gagal mengambil data menu favorit' });
  }
};

// Add menu to favorites
const addFavoriteMenu = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    // Validasi input
    if (!Number.isInteger(Number(userId)) || !Number.isInteger(Number(id))) {
      return res.status(400).json({ error: 'ID pengguna atau menu tidak valid' });
    }

    console.log(`Adding menu ID ${id} to favorites for user ID ${userId}`);
    
    // Check if menu exists
    const menu = await Menu.findById(id);
    if (!menu) {
      console.log(`Menu ID ${id} not found`);
      return res.status(404).json({ error: 'Menu tidak ditemukan' });
    }
    
    // Check if already in favorites
    const isAlreadyFavorite = await FavoriteMenu.isFavorite(userId, id);
    if (isAlreadyFavorite) {
      console.log(`Menu ID ${id} already in favorites for user ID ${userId}`);
      return res.status(200).json({ 
        success: true,
        message: 'Menu sudah ada di favorit' 
      });
    }
    
    // Add to favorites
    const favoriteId = await FavoriteMenu.add(userId, id);
    console.log(`Menu ID ${id} added to favorites for user ID ${userId}`);
    
    res.status(201).json({
      success: true,
      id: favoriteId,
      message: 'Menu berhasil ditambahkan ke favorit'
    });
  } catch (error) {
    console.error(`Error adding menu ID ${req.params.id} to favorites:`, error);
    res.status(500).json({ error: 'Gagal menambahkan menu ke favorit' });
  }
};

// Remove menu from favorites
const removeFavoriteMenu = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    // Validasi input
    if (!Number.isInteger(Number(userId)) || !Number.isInteger(Number(id))) {
      return res.status(400).json({ error: 'ID pengguna atau menu tidak valid' });
    }

    console.log(`Removing menu ID ${id} from favorites for user ID ${userId}`);
    
    // Gunakan model untuk konsistensi
    const success = await FavoriteMenu.remove(userId, id);
    if (!success) {
      return res.json({ success: true, message: 'Menu tidak ada di favorit' });
    }
    
    res.json({
      success: true,
      message: 'Menu berhasil dihapus dari favorit'
    });
  } catch (error) {
    console.error(`Error removing menu ID ${req.params.id} from favorites:`, error);
    res.status(500).json({ error: 'Gagal menghapus menu dari favorit' });
  }
};

// Create new menu (admin only)
const createMenu = async (req, res) => {
  try {
    const { id_warung, id_kategori, nama_menu, harga, deskripsi, foto } = req.body;
    
    console.log('Received menu data:', req.body);
    
    // Validate required fields
    if (!id_warung || !id_kategori || !nama_menu || !harga) {
      return res.status(400).json({ error: 'Nama menu, harga, kategori, dan warung diperlukan' });
    }
    
    // Create menu
    const menuId = await Menu.create({
      id_warung,
      id_kategori,
      nama_menu,
      harga,
      deskripsi,
      foto
    });
    
    res.status(201).json({
      success: true,
      id: menuId,
      message: 'Menu berhasil ditambahkan'
    });
  } catch (error) {
    console.error('Error creating menu:', error);
    res.status(500).json({ error: 'Gagal menambahkan menu' });
  }
};

// Update menu (admin only)
const updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_warung, id_kategori, nama_menu, harga, deskripsi, foto } = req.body;
    
    // Check if menu exists
    const menu = await Menu.findById(id);
    if (!menu) {
      return res.status(404).json({ error: 'Menu tidak ditemukan' });
    }
    
    // Update menu
    const success = await Menu.update(id, {
      id_warung: id_warung || menu.id_warung,
      id_kategori: id_kategori || menu.id_kategori,
      nama_menu: nama_menu || menu.nama_menu,
      harga: harga || menu.harga,
      deskripsi: deskripsi !== undefined ? deskripsi : menu.deskripsi,
      foto: foto !== undefined ? foto : menu.foto
    });
    
    if (success) {
      res.json({
        success: true,
        message: 'Menu berhasil diperbarui'
      });
    } else {
      res.status(400).json({ error: 'Gagal memperbarui menu' });
    }
  } catch (error) {
    console.error(`Error updating menu ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Gagal memperbarui menu' });
  }
};

// Delete menu (admin only)
const deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if menu exists
    const menu = await Menu.findById(id);
    if (!menu) {
      return res.status(404).json({ error: 'Menu tidak ditemukan' });
    }
    
    // Delete menu
    const success = await Menu.delete(id);
    
    if (success) {
      res.json({
        success: true,
        message: 'Menu berhasil dihapus'
      });
    } else {
      res.status(400).json({ error: 'Gagal menghapus menu' });
    }
  } catch (error) {
    console.error(`Error deleting menu ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Gagal menghapus menu' });
  }
};

module.exports = {
  getAllMenu,
  getAllMenuWithUserReviews,
  getAllMenuWithReviewsAndFavorites,
  getMenuById,
  getMenuByWarung,
  getMenuByKategori,
  getFavoriteMenu,
  addFavoriteMenu,
  removeFavoriteMenu,
  createMenu,
  updateMenu,
  deleteMenu
};