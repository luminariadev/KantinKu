// Global variables
const modal = document.getElementById("modal");
let currentMenuId = null;
let currentWarungId = null;
let selectedRating = 0;

// Close modal function
function closeModal() {
  console.log('Closing modal');
  const modal = document.getElementById("modal");
  if (modal) {
    modal.style.display = "none";
  } else {
    console.error('Modal element not found');
  }
  
  // Reset current menu and warung IDs
  window.currentMenuId = null;
  window.currentWarungId = null;
  
  // Reset review form if it exists
  if (document.getElementById('review-comment')) {
    document.getElementById('review-comment').value = '';
  }
  if (document.querySelectorAll('.star-rating i')) {
    document.querySelectorAll('.star-rating i').forEach(star => {
      star.classList.remove('selected');
    });
  }
  window.selectedRating = 0;
}

// Function to render menu cards in the menu grid
async function renderMenuGrid() {
  try {
    const response = await fetch('/api/menu/with-reviews');
    if (!response.ok) throw new Error('Failed to fetch menu data');
    const menus = await response.json();

    const menuGrid = document.querySelector('.menu-grid');
    if (!menuGrid) return;

    menuGrid.innerHTML = '';

    menus.forEach(menu => {
      const card = document.createElement('div');
      card.className = 'menu-card';
      card.dataset.menuId = menu.id_menu;
      card.dataset.warungId = menu.id_warung;
      card.innerHTML = `
        <img src="${menu.foto || 'images/food1.jpg'}" alt="${menu.nama_menu}" class="menu-image" />
        <div class="menu-info">
          <h3 class="menu-name">${menu.nama_menu}</h3>
          <p class="menu-price">Rp. ${menu.harga}</p>
          <p class="menu-warung">${menu.nama_warung}</p>
          <div class="menu-rating">Rating: ${menu.avgRating ? menu.avgRating : 'Belum ada ulasan'} ★</div>
        </div>
      `;
      menuGrid.appendChild(card);

      // Add click event to open modal with menu details
      card.addEventListener('click', () => openMenuModal(menu));
    });
  } catch (error) {
    console.error('Error rendering menu grid:', error);
  }
}

// Function to open modal and load menu details, reviews, and favorite status
async function openMenuModal(menu) {
  window.currentMenuId = menu.id_menu;
  window.currentWarungId = menu.id_warung;

  const modal = document.getElementById('modal');
  if (!modal) return;

  // Set modal visible
  modal.style.display = 'block';

  // Set modal content
  modal.querySelector('.modal-title').textContent = menu.nama_menu;
  modal.querySelector('.modal-images').src = menu.foto || 'images/food1.jpg';
  modal.querySelector('.modal-header h3').textContent = menu.nama_menu;
  modal.querySelector('.modal-header .rating').textContent = menu.avgRating ? `${menu.avgRating}★` : 'Belum ada ulasan';
  modal.querySelector('.description').textContent = menu.deskripsi || '';
  modal.querySelector('.price').textContent = `Rp. ${menu.harga}`;

  // Load reviews for this menu
  await loadReviews(menu.id_menu);

  // Update favorite icon status
  await updateFavoriteIcon(menu.id_menu);

  // Setup favorite button toggle in modal
  const favoriteBtn = document.getElementById('favorite-btn');
  if (favoriteBtn) {
    favoriteBtn.onclick = async () => {
      if (!isLoggedIn()) {
        alert('Silakan login terlebih dahulu untuk menambahkan favorit');
        return;
      }

      const menuId = window.currentMenuId;
      if (!menuId) return;

      const token = getToken();
      const isActive = favoriteBtn.classList.contains('active');
      try {
        let response;
        if (isActive) {
          // Remove favorite
          response = await fetch(`/api/menu/favorites/${menuId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        } else {
          // Add favorite
          response = await fetch(`/api/menu/favorites/${menuId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        }

        if (!response.ok) throw new Error('Failed to toggle favorite');
        const result = await response.json();

        if (result.success) {
          if (isActive) {
            favoriteBtn.classList.remove('active');
            alert('Menu berhasil dihapus dari favorit');
          } else {
            favoriteBtn.classList.add('active');
            alert('Menu berhasil ditambahkan ke favorit');
          }
          // Notify other tabs/pages to update favorites
          localStorage.setItem('favoritesUpdated', Date.now().toString());

          // Dispatch custom event to notify favorites list page to update
          document.dispatchEvent(new CustomEvent('favoritesUpdated'));

          // Also update favorites list page if open
          if (window.location.pathname.includes('favorites.html')) {
            const event = new Event('favoritesUpdated');
            document.dispatchEvent(event);
          }

        } else {
          alert('Gagal memperbarui favorit');
        }
      } catch (error) {
        console.error('Error toggling favorite:', error);
        alert('Terjadi kesalahan saat memperbarui favorit');
      }
    };
  }

  // Show review form if user logged in
  const reviewForm = modal.querySelector('.review-form');
  if (reviewForm) {
    if (isLoggedIn()) {
      reviewForm.style.display = 'block';
    } else {
      reviewForm.style.display = 'none';
    }
  }
}

// Function to load reviews for a menu and display in modal
async function loadReviews(menuId) {
  try {
    const response = await fetch(`/api/reviews/menu/${menuId}`);
    if (!response.ok) throw new Error('Failed to fetch reviews');
    const reviews = await response.json();

    const reviewsContainer = document.querySelector('.modal-content .reviews');
    if (!reviewsContainer) return;

    // Clear existing reviews except the heading
    reviewsContainer.innerHTML = '<h4>Ulasan</h4>';

    if (reviews.length === 0) {
      reviewsContainer.innerHTML += '<p>Belum ada ulasan untuk menu ini.</p>';
      return;
    }

    reviews.forEach(review => {
      const reviewElement = document.createElement('div');
      reviewElement.className = 'review-item';
      reviewElement.innerHTML = `
        <div class="review-header">
          <h5>${review.nama_user || 'Pengguna'}</h5>
          <span class="review-rating">${review.rating}★</span>
        </div>
        <p class="review-comment">${review.komentar || '(Tidak ada komentar)'}</p>
      `;
      reviewsContainer.appendChild(reviewElement);
    });
  } catch (error) {
    console.error('Error loading reviews:', error);
  }
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', function() {
  renderMenuGrid();

  // Setup close button
  const closeBtn = document.getElementById('close-modal-btn');
  if (closeBtn) {
    closeBtn.onclick = closeModal;
  }
});

// Function to update favorite icon status in modal
async function updateFavoriteIcon(menuId) {
  const favoriteBtn = document.getElementById('favorite-btn');
  if (!favoriteBtn) return;

  if (!isLoggedIn()) {
    favoriteBtn.classList.remove('active');
    return;
  }

  try {
    const token = getToken();
    const response = await fetch(`/api/menu/${menuId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch menu details');
    const menu = await response.json();

    if (menu.isFavorite) {
      favoriteBtn.classList.add('active');
    } else {
      favoriteBtn.classList.remove('active');
    }
  } catch (error) {
    console.error('Error updating favorite icon:', error);
    favoriteBtn.classList.remove('active');
  }
}

// Setup favorite button toggle in modal
document.addEventListener('DOMContentLoaded', function() {
  const favoriteBtn = document.getElementById('favorite-btn');
  if (favoriteBtn) {
    favoriteBtn.addEventListener('click', async () => {
      if (!isLoggedIn()) {
        alert('Silakan login terlebih dahulu untuk menambahkan favorit');
        return;
      }

      const menuId = window.currentMenuId;
      if (!menuId) return;

      const token = getToken();
      const isActive = favoriteBtn.classList.contains('active');
      try {
        let response;
        if (isActive) {
          // Remove favorite
          response = await fetch(`/api/menu/favorites/${menuId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        } else {
          // Add favorite
          response = await fetch(`/api/menu/favorites/${menuId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        }

        if (!response.ok) throw new Error('Failed to toggle favorite');
        const result = await response.json();

        if (result.success) {
          if (isActive) {
            favoriteBtn.classList.remove('active');
            alert('Menu berhasil dihapus dari favorit');
          } else {
            favoriteBtn.classList.add('active');
            alert('Menu berhasil ditambahkan ke favorit');
          }
          // Notify other tabs/pages to update favorites
          localStorage.setItem('favoritesUpdated', Date.now().toString());
        } else {
          alert('Gagal memperbarui favorit');
        }
      } catch (error) {
        console.error('Error toggling favorite:', error);
        alert('Terjadi kesalahan saat memperbarui favorit');
      }
    });
  }
});
