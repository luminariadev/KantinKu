const ITEMS_PER_PAGE = 8;
let currentPage = 1;
let allFavoriteMenus = [];

async function loadFavoriteMenus() {
  try {
    if (!isLoggedIn()) {
      document.getElementById('favorites-grid').innerHTML = `
        <div class="no-favorites">
          <p>Silakan login untuk melihat menu favorit Anda</p>
        </div>
      `;
      return;
    }

    const token = getToken();
    const userId = getCurrentUser().id;
    console.log('Loading favorites for user:', userId);
    
    const response = await fetch('/api/menu/favorites', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error('API error:', response.status, response.statusText);
      throw new Error('Network response was not ok');
    }
    
    const favorites = await response.json();
    console.log('Favorites loaded:', favorites);

    if (favorites.length === 0) {
      document.getElementById('favorites-grid').innerHTML = `
        <div class="no-favorites">
          <p>Belum ada menu favorit</p>
          <p>Tambahkan menu favorit dengan menekan ikon ❤️ pada detail menu</p>
        </div>
      `;
      return;
    }

    allFavoriteMenus = favorites;
    currentPage = 1;
    const firstPageItems = favorites.slice(0, ITEMS_PER_PAGE);
    displayFavoriteMenus(firstPageItems, true);
  } catch (error) {
    console.error('Error loading favorite menus:', error);
    document.getElementById('favorites-grid').innerHTML = `
      <div class="no-favorites">
        <p>Gagal memuat menu favorit</p>
      </div>
    `;
  }
}

function displayFavoriteMenus(menus, replace = true) {
  const menuGrid = document.getElementById('favorites-grid');
  
  if (replace) {
    menuGrid.innerHTML = '';
  }

  menus.forEach(menu => {
    const imagePath = menu.foto ? (menu.foto.startsWith('http') || menu.foto.startsWith('/') ? menu.foto : `/${menu.foto}`) : 'images/food2.jpg';
    const formattedPrice = formatPrice(menu.harga);
    
    const menuCard = document.createElement('div');
    menuCard.className = 'menu-card';
    menuCard.dataset.menuId = menu.id_menu;
    menuCard.innerHTML = `
      <img src="${imagePath}" alt="${menu.nama_menu}" class="menu-image" onerror="this.src='images/food2.jpg'" />
      <div class="menu-info">
        <h3 class="menu-name">${menu.nama_menu}</h3>
        <p class="menu-price">${formattedPrice}</p>
        <p class="menu-warung"><i class="fas fa-store"></i> ${menu.nama_warung || 'Tidak diketahui'}</p>
        <div class="menu-rating"><i class="fas fa-star"></i> ${menu.avgRating || 'N/A'}</div>
        <div class="favorite-icon active" title="Hapus dari favorit"><i class="fas fa-heart"></i></div>
      </div>
    `;
    
    menuGrid.appendChild(menuCard);
    
    menuCard.addEventListener('click', () => {
      showMenuDetail(menu.id_menu);
    });
    
    const favoriteIcon = menuCard.querySelector('.favorite-icon');
    favoriteIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(favoriteIcon, menu.id_menu);
    });
  });

  updateLoadMoreButton();
}

function updateLoadMoreButton() {
  const paginationContainer = document.querySelector('.pagination-container');
  
  paginationContainer.innerHTML = '';

  if (currentPage * ITEMS_PER_PAGE < allFavoriteMenus.length) {
    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.className = 'load-more-btn';
    loadMoreBtn.textContent = 'Lihat lebih banyak';
    loadMoreBtn.addEventListener('click', loadMoreFavorites);
    paginationContainer.appendChild(loadMoreBtn);
  }
}

function loadMoreFavorites() {
  currentPage++;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = currentPage * ITEMS_PER_PAGE;
  const nextItems = allFavoriteMenus.slice(startIndex, endIndex);
  
  displayFavoriteMenus(nextItems, false);
}

async function showMenuDetail(menuId) {
  try {
    const response = await fetch(`/api/menu/${menuId}`);
    if (!response.ok) throw new Error('Network response was not ok');
    const menu = await response.json();
    
    if (!menu) return;
    
    window.currentMenuId = menu.id_menu;
    window.currentWarungId = menu.id_warung;
    
    console.log(`Showing menu detail for ID: ${menuId}, warung ID: ${menu.id_warung}`);
    
    const modal = document.getElementById('modal');
    const modalImg = modal.querySelector('.modal-images');
    const modalTitle = modal.querySelector('#modal-name');
    const modalDesc = modal.querySelector('#modal-description');
    const modalPrice = modal.querySelector('#modal-price');
    const modalRating = modal.querySelector('#modal-rating');
    const favoriteIcon = modal.querySelector('#favorite-btn');

        const whatsappBtn = document.getElementById('whatsapp-btn');
    if (whatsappBtn && menu.kontak) {
      const message = `Halo, saya tertarik dengan menu *${menu.nama_menu}* dari *${menu.nama_warung}*.`;
      const url = `https://wa.me/${menu.kontak}?text=${encodeURIComponent(message)}`;
      whatsappBtn.href = url;
      whatsappBtn.style.display = 'inline-block';
    } else if (whatsappBtn) {
      whatsappBtn.href = '#';
      whatsappBtn.style.display = 'none';
    }
    
    const imagePath = menu.foto ? (menu.foto.startsWith('http') || menu.foto.startsWith('/') ? menu.foto : `/${menu.foto}`) : 'images/food2.jpg';
    modalImg.src = imagePath;
    modalImg.alt = menu.nama_menu;
    modalImg.onerror = function() { this.src = 'images/food2.jpg'; };
    modalTitle.textContent = menu.nama_menu || 'Nama Tidak Tersedia';
    modalDesc.textContent = menu.deskripsi || `${menu.nama_menu} dari ${menu.nama_warung}`;
    modalPrice.textContent = ` ${formatPrice(menu.harga)}`;
    modalRating.textContent = `${menu.avgRating || '0'}★`;
    
    if (isLoggedIn()) {
      const isFavorite = await checkFavoriteStatus(menuId);
      favoriteIcon.classList.toggle('active', isFavorite);
      document.querySelector('.review-form').style.display = 'block';
      document.getElementById('warning-box').style.display = 'none';
    } else {
      favoriteIcon.classList.remove('active');
      document.querySelector('.review-form').style.display = 'none';
      document.getElementById('warning-box').style.display = 'block';
    }
    
    favoriteIcon.onclick = function(e) {
      e.stopPropagation();
      e.preventDefault();
      toggleFavorite(this, menuId);
    };
    
    loadReviews(menuId);
    
    modal.style.display = 'flex';
  } catch (error) {
    console.error('Error showing menu detail:', error);
    alert('Gagal memuat detail menu. Silakan coba lagi.');
  }
}

async function toggleFavorite(element, menuId) {
  if (!isLoggedIn()) {
    alert('Silakan login terlebih dahulu untuk menambahkan menu ke favorit');
    return;
  }
  try {
    const token = getToken();
    const isFavorite = element.classList.contains('active');
    const method = isFavorite ? 'DELETE' : 'POST';
    const numericMenuId = parseInt(menuId);
    if (isNaN(numericMenuId)) {
      console.error('Invalid menu ID:', menuId);
      alert('ID menu tidak valid');
      return;
    }
    console.log(`Toggling favorite for menu ID: ${numericMenuId}, method: ${method}`);
    const initialState = isFavorite;
    element.classList.toggle('active', !isFavorite);
    const response = await fetch(`/api/menu/favorites/${numericMenuId}`, {
      method: method,
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      element.classList.toggle('active', initialState);
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    if (result.success) {
      if (method === 'POST') {
        alert('Menu berhasil ditambahkan ke favorit');
      } else {
        alert('Menu berhasil dihapus dari favorit');
        const menuCard = document.querySelector(`.menu-card[data-menu-id="${numericMenuId}"]`);
        if (menuCard) menuCard.remove();
        if (document.querySelectorAll('.menu-card').length === 0) {
          document.getElementById('favorites-grid').innerHTML = `
            <div class="no-favorites">
              <p>Belum ada menu favorit</p>
              <p>Tambahkan menu favorit dengan menekan ikon ❤️ pada detail menu</p>
            </div>
          `;
        }
        document.getElementById('modal').style.display = 'none';
      }
      localStorage.setItem('favoritesUpdated', Date.now().toString());
      document.dispatchEvent(new CustomEvent('favoritesUpdated', { detail: { menuId: numericMenuId } }));
    } else {
      element.classList.toggle('active', initialState);
      if (result.message && result.message.includes('already')) {
        alert('Menu sudah ada di daftar favorit Anda');
      } else {
        alert('Gagal mengubah status favorit. Coba lagi.');
      }
    }
  } catch (error) {
    console.error('Error toggling favorite status:', error);
    element.classList.toggle('active', initialState);
    alert('Terjadi kesalahan. Silakan coba lagi.');
  }
}

async function loadReviews(menuId) {
  try {
    const response = await fetch(`/api/reviews/menu/${menuId}`);
    if (!response.ok) throw new Error('Network response was not ok');
    const reviews = await response.json();
    
    const reviewsContainer = document.getElementById('reviews-container');
    reviewsContainer.innerHTML = '';
    
    if (reviews.length === 0) {
      reviewsContainer.innerHTML = '<p>Belum ada ulasan</p>';
      return;
    }
    
    reviews.forEach(review => {
      const reviewElement = document.createElement('div');
      reviewElement.className = 'review-item';
      reviewElement.innerHTML = `
        <p><strong>${review.nama || review.username}:</strong> ${review.komentar || ''} ⭐ ${review.rating}/5</p>
      `;
      reviewsContainer.appendChild(reviewElement);
    });
  } catch (error) {
    console.error('Error loading reviews:', error);
    document.getElementById('reviews-container').innerHTML = '<p>Gagal memuat ulasan</p>';
  }
}

async function submitReview() {
  if (!isLoggedIn()) {
    alert('Silakan login terlebih dahulu untuk memberikan ulasan');
    return;
  }
  
  if (!window.selectedRating) {
    alert('Silakan pilih rating terlebih dahulu');
    return;
  }
  
  const menuId = window.currentMenuId;
  const warungId = window.currentWarungId;
  
  if (!warungId || !menuId) {
    console.error('Missing IDs:', { menuId, warungId });
    alert('Terjadi kesalahan: ID warung atau menu tidak ditemukan');
    return;
  }
  
  try {
    const token = getToken();
    const komentar = document.getElementById('review-comment').value;
    
    console.log(`Submitting review for menu ID: ${menuId}, warung ID: ${warungId}, rating: ${window.selectedRating}`);
    
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        id_warung: warungId,
        id_menu: menuId,
        rating: window.selectedRating,
        komentar: komentar
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Network response was not ok');
    }
    
    const result = await response.json();
    
    if (result.success) {
      document.getElementById('review-comment').value = '';
      window.selectedRating = 0;
      document.querySelectorAll('.star-rating i').forEach(star => {
        star.classList.remove('selected');
      });
      
      loadReviews(menuId);
      
      alert('Ulasan berhasil ditambahkan');
    }
  } catch (error) {
    console.error('Error submitting review:', error);
    alert('Gagal menambahkan ulasan: ' + (error.message || 'Terjadi kesalahan'));
  }
}

async function checkFavoriteStatus(menuId) {
  if (!isLoggedIn()) return false;
  try {
    const token = getToken();
    const response = await fetch('/api/menu/favorites', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    const favorites = await response.json();
    return favorites.some(fav => fav.id_menu == menuId);
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const stars = document.querySelectorAll('.star-rating i');
  
  stars.forEach(star => {
    star.addEventListener('click', function() {
      const rating = parseInt(this.getAttribute('data-rating'));
      window.selectedRating = rating;
      
      console.log(`Star rating selected: ${rating}`);
      
      stars.forEach(s => {
        const starRating = parseInt(s.getAttribute('data-rating'));
        if (starRating <= rating) {
          s.classList.add('selected');
        } else {
          s.classList.remove('selected');
        }
      });
    });
  });
  
  const submitBtn = document.getElementById('submit-review');
  if (submitBtn) {
    submitBtn.addEventListener('click', submitReview);
  }
  
  const closeBtn = document.getElementById('close-modal-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.getElementById('modal').style.display = 'none';
    });
  }
  
  const modal = document.getElementById('modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
  
  document.addEventListener('favoritesUpdated', function(e) {
    console.log('Favorites updated event received', e.detail);
    loadFavoriteMenus();
  });
  
  window.addEventListener('storage', function(e) {
    if (e.key === 'favoritesUpdated') {
      loadFavoriteMenus();
    }
  });
});