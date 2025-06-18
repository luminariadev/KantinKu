// user.js - Handles user page functionality

// DOM Elements
const userSection = document.getElementById('user-section');
const usernameElement = document.getElementById('username');
const userAvatar = document.getElementById('user-avatar');
const logoutBtn = document.getElementById('logout-btn');
const foodContainer = document.getElementById('food-container');
const favoritesBtn = document.getElementById('favorites-btn');

// Variables
let currentUser = null;
let userFavorites = [];
let menuData = [];
let currentFoodId = null;

// Initialize page
async function initPage() {
  // Check if user is logged in
  if (!isLoggedIn()) {
    window.location.href = '/login.html';
    return;
  }
  
  // Get current user
  currentUser = getCurrentUser();
  
  // Update UI for logged in user
  updateUIForLoggedInUser();
  
  // Load menu data
  await loadMenuData();
  
  // Load user favorites
  await loadUserFavorites();
  
  // Add event listeners
  setupEventListeners();
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
  userSection.classList.remove('hidden');
  favoritesBtn.classList.remove('hidden');
  
  usernameElement.textContent = currentUser.nama || currentUser.username;
  userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.nama || currentUser.username)}&background=3b82f6&color=fff`;
}

// Load menu data from API
async function loadMenuData() {
  try {
    const response = await fetch('/api/menu');
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Gagal memuat data menu');
    }
    
    menuData = data;
    renderMenuItems(menuData);
  } catch (error) {
    console.error('Error loading menu data:', error);
    // Fallback to sample data if API fails
    renderMenuItems(sampleMenuData);
  }
}

// Load user favorites from API
async function loadUserFavorites() {
  try {
    const token = getToken();
    const response = await fetch('/api/menu/favorites', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Gagal memuat favorit');
    }
    
    userFavorites = data.map(item => item.id_menu);
    updateFavoriteButtons();
  } catch (error) {
    console.error('Error loading favorites:', error);
    // Fallback to empty favorites
    userFavorites = [];
  }
}

// Toggle favorite status
async function toggleFavorite(menuId, buttonElement) {
  try {
    const token = getToken();
    const isFavorite = userFavorites.includes(parseInt(menuId));
    
    const response = await fetch(`/api/menu/favorites/${menuId}`, {
      method: isFavorite ? 'DELETE' : 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Gagal mengubah status favorit');
    }
    
    // Update local favorites list
    if (isFavorite) {
      userFavorites = userFavorites.filter(id => id !== parseInt(menuId));
    } else {
      userFavorites.push(parseInt(menuId));
    }
    
    // Update UI
    updateFavoriteButton(menuId, !isFavorite);
  } catch (error) {
    console.error('Error toggling favorite:', error);
    alert('Gagal mengubah status favorit');
  }
}

// Update all favorite buttons
function updateFavoriteButtons() {
  const favoriteButtons = document.querySelectorAll('.favorite-toggle');
  favoriteButtons.forEach(button => {
    const menuId = button.closest('.food-card').dataset.id;
    const isFavorite = userFavorites.includes(parseInt(menuId));
    updateFavoriteButton(menuId, isFavorite);
  });
}

// Update single favorite button
function updateFavoriteButton(menuId, isFavorite) {
  const foodCard = document.querySelector(`.food-card[data-id="${menuId}"]`);
  if (foodCard) {
    const button = foodCard.querySelector('.favorite-toggle');
    const icon = button.querySelector('i');
    
    if (isFavorite) {
      icon.classList.replace('far', 'fas');
      button.classList.add('text-red-500');
    } else {
      icon.classList.replace('fas', 'far');
      button.classList.remove('text-red-500');
    }
  }
  
  // Update modal favorite button if open
  if (currentFoodId === parseInt(menuId)) {
    const addToFavoritesBtn = document.getElementById('add-to-favorites');
    if (addToFavoritesBtn) {
      addToFavoritesBtn.innerHTML = isFavorite ? 
        '<i class="fas fa-heart text-xl text-red-500"></i>' : 
        '<i class="far fa-heart text-xl"></i>';
      addToFavoritesBtn.classList.toggle('text-red-500', isFavorite);
    }
  }
}

// Render menu items
function renderMenuItems(items) {
  foodContainer.innerHTML = '';
  
  items.forEach(item => {
    const foodItem = document.createElement('div');
    foodItem.className = 'food-card bg-white rounded-xl shadow-md overflow-hidden transition duration-300 cursor-pointer';
    foodItem.dataset.id = item.id_menu;
    
    // Check if item is favorited by current user
    const isFavorited = userFavorites.includes(parseInt(item.id_menu));
    
    foodItem.innerHTML = `
      <div class="relative">
        <img src="${item.foto || 'https://via.placeholder.com/300x200?text=Menu+Image'}" alt="${item.nama_menu}" class="w-full h-48 object-cover">
        <button class="favorite-toggle absolute top-2 left-2 bg-white p-2 rounded-full shadow-md ${isFavorited ? 'text-red-500' : 'text-gray-400'}">
          <i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i>
        </button>
      </div>
      <div class="p-4">
        <div class="flex justify-between items-start mb-2">
          <h3 class="font-bold text-lg text-gray-800">${item.nama_menu}</h3>
          <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">Rp ${parseInt(item.harga).toLocaleString('id-ID')}</span>
        </div>
        <p class="text-gray-600 text-sm mb-3 line-clamp-2">${item.deskripsi || 'Tidak ada deskripsi'}</p>
        <div class="flex justify-between items-center">
          <div class="flex items-center">
            <span class="text-sm font-medium">${item.nama_warung}</span>
          </div>
          <button class="text-blue-500 text-sm font-medium">Lihat Detail</button>
        </div>
      </div>
    `;
    
    foodContainer.appendChild(foodItem);
    
    // Add click event to show food details
    foodItem.addEventListener('click', (e) => {
      if (!e.target.closest('.favorite-toggle')) {
        showFoodDetails(item.id_menu);
      }
    });
    
    // Add favorite toggle event
    const favoriteToggle = foodItem.querySelector('.favorite-toggle');
    if (favoriteToggle) {
      favoriteToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(item.id_menu, favoriteToggle);
      });
    }
  });
}

// Show food details in modal
function showFoodDetails(menuId) {
  const menu = menuData.find(item => item.id_menu === parseInt(menuId));
  if (!menu) return;
  
  currentFoodId = parseInt(menuId);
  
  // Update modal content
  document.getElementById('modal-food-image').src = menu.foto || 'https://via.placeholder.com/600x400?text=Menu+Image';
  document.getElementById('modal-food-name').textContent = menu.nama_menu;
  document.getElementById('modal-food-category').textContent = menu.nama_kategori;
  document.getElementById('modal-food-price').textContent = `Rp ${parseInt(menu.harga).toLocaleString('id-ID')}`;
  document.getElementById('modal-food-description').textContent = menu.deskripsi || 'Tidak ada deskripsi';
  
  // Update favorite button
  const isFavorited = userFavorites.includes(parseInt(menuId));
  const addToFavoritesBtn = document.getElementById('add-to-favorites');
  addToFavoritesBtn.innerHTML = isFavorited ? 
    '<i class="fas fa-heart text-xl text-red-500"></i>' : 
    '<i class="far fa-heart text-xl"></i>';
  addToFavoritesBtn.classList.toggle('text-red-500', isFavorited);
  
  // Show modal
  document.getElementById('food-modal').classList.remove('hidden');
}

// Setup event listeners
function setupEventListeners() {
  // Logout button
  logoutBtn.addEventListener('click', () => {
    logoutUser();
  });
  
  // Favorites button
  favoritesBtn.addEventListener('click', () => {
    if (userFavorites.length === 0) {
      alert('Anda belum menambahkan menu favorit.');
      return;
    }
    
    const favoriteFoods = menuData.filter(menu => userFavorites.includes(parseInt(menu.id_menu)));
    renderMenuItems(favoriteFoods);
  });
  
  // Category buttons
  const categoryButtons = document.querySelectorAll('.category-btn');
  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      categoryButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Filter menu items by category
      const category = button.textContent.trim().replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
      
      if (category === 'Semua' || category.includes('Semua')) {
        renderMenuItems(menuData);
      } else {
        const filteredItems = menuData.filter(item => 
          item.nama_kategori.toLowerCase() === category.toLowerCase()
        );
        renderMenuItems(filteredItems);
      }
    });
  });
  
  // Modal close button
  document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('food-modal').classList.add('hidden');
  });
  
  // Modal outside click
  document.getElementById('food-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('food-modal')) {
      document.getElementById('food-modal').classList.add('hidden');
    }
  });
  
  // Add to favorites button in modal
  document.getElementById('add-to-favorites').addEventListener('click', () => {
    toggleFavorite(currentFoodId, document.getElementById('add-to-favorites'));
  });
}

// Sample menu data for fallback
const sampleMenuData = [
  {
    id_menu: 1,
    nama_menu: "Nasi Goreng Spesial",
    harga: 25000,
    nama_kategori: "Makanan",
    foto: "https://images.unsplash.com/photo-1631898038694-4fbe2676e666?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    deskripsi: "Nasi goreng dengan bumbu spesial dan topping lengkap termasuk ayam suwir, udang, telur mata sapi, dan acar.",
    nama_warung: "Warung Spesial"
  },
  {
    id_menu: 2,
    nama_menu: "Es Teh Manis",
    harga: 5000,
    nama_kategori: "Minuman",
    foto: "https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    deskripsi: "Es teh dengan gula pasir pilihan yang diseduh dengan teh berkualitas.",
    nama_warung: "Teh Poci"
  }
];

// Initialize on page load
document.addEventListener('DOMContentLoaded', initPage);