async function toggleFavorite(element, menuId) {
  if (!isLoggedIn()) {
    showNotification('Silakan login terlebih dahulu untuk mengelola menu favorit', 'warning');
    return;
  }

  const isFavorite = element.classList.contains('active');
  const initialState = isFavorite;
  const method = isFavorite ? 'DELETE' : 'POST';
  const numericMenuId = parseInt(menuId);

  try {
    const token = getToken();

    if (isNaN(numericMenuId)) {
      console.error('ID menu tidak valid:', menuId);
      showNotification('ID menu tidak valid', 'error');
      return;
    }

    console.log(`Mengubah status favorit untuk menu ID: ${numericMenuId}, metode: ${method}`);

    if (method === 'POST' && await checkFavoriteStatus(numericMenuId)) {
      showNotification('Menu sudah ada di daftar favorit Anda', 'info');
      return;
    }

    element.classList.toggle('active', !isFavorite);

    const response = await fetch(`/api/menu/favorites/${numericMenuId}`, {
      method: method,
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      element.classList.toggle('active', initialState);
      throw new Error(`Respons jaringan bermasalah: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    if (!result.success) {
      element.classList.toggle('active', initialState);
      showNotification(`Gagal mengubah status favorit: ${result.message || 'Coba lagi'}`, 'error');
      return;
    }

    showNotification(method === 'POST' ? 'Menu ditambahkan ke favorite' : 'Menu dihapus dari favorite', 'success');

    updateFavoritesUI(numericMenuId, method);

    localStorage.setItem('favoritesUpdated', Date.now().toString());
    document.dispatchEvent(new CustomEvent('favoritesUpdated', { detail: { menuId: numericMenuId } }));
  } catch (error) {
    console.error('Error mengubah status favorit:', error);
    element.classList.toggle('active', initialState);
    showNotification('Terjadi kesalahan. Silakan coba lagi.', 'error');
  }
}

function updateFavoritesUI(menuId, method) {
  const isUserPage = window.location.pathname.includes('user.html');
  const containerId = isUserPage ? 'favorites-list' : 'favorites-grid';
  const container = document.getElementById(containerId);
  if (!container) return;

  if (method === 'DELETE') {
    const item = container.querySelector(`[data-menu-id="${menuId}"]`);
    if (item) item.remove();

    if (!container.querySelector('.favorite-item, .menu-card')) {
      container.innerHTML = `
        <div class="no-favorites">
          <p>Belum ada menu favorit</p>
          <p>Tambahkan menu favorit dengan menekan ikon ❤️ pada detail menu</p>
        </div>
      `;
    }
  }
}

async function loadFavorites(containerId, isUserPage = false) {
  if (!isLoggedIn()) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div class="no-favorites">
          <p>Belum ada menu favorit</p>
          <p>Tambahkan menu favorit dengan menekan ikon ❤️ pada detail menu</p>
        </div>
      `;
    }
    return;
  }

  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '<p>Memuat menu favorit...</p>';

  try {
    const token = getToken();
    const response = await fetch('/api/menu/favorites', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error(`Respons jaringan bermasalah: ${response.status} ${response.statusText}`);
    const favorites = await response.json();
    container.innerHTML = '';

    if (!favorites || favorites.length === 0) {
      container.innerHTML = `
        <div class="no-favorites">
          <p>Belum ada menu favorit</p>
          <p>Tambahkan menu favorit dengan menekan ikon ❤️ pada detail menu</p>
        </div>
      `;
      return;
    }

    favorites.forEach(menu => {
      const item = document.createElement('div');
      item.className = isUserPage ? 'favorite-item' : 'menu-card';
      item.dataset.menuId = menu.id_menu;

      let imageUrl = menu.foto;
      if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
        imageUrl = '/' + imageUrl;
      } else if (!imageUrl) {
        imageUrl = isUserPage ? 'images/food2.jpg' : 'images/food1.jpg';
      }

      if (isUserPage) {
        item.innerHTML = `
          <img src="${imageUrl}" alt="${menu.nama_menu}" class="favorite-image" onerror="this.src='images/food2.jpg'" />
          <div class="favorite-info">
            <h4>${menu.nama_menu}</h4>
            <p>${menu.deskripsi || ''}</p>
            <p class="price">Rp ${parseInt(menu.harga).toLocaleString('id-ID')}</p>
          </div>
          <button type="button" class="remove-favorite active" data-id="${menu.id_menu}">Hapus</button>
        `;
      } else {
        item.innerHTML = `
          <img src="${imageUrl}" alt="${menu.nama_menu}" class="menu-image" />
          <div class="menu-info">
            <h3 class="menu-name">${menu.nama_menu}</h3>
            <p class="menu-price">Rp. ${menu.harga}</p>
            <p class="menu-warung">${menu.nama_warung || 'Tidak diketahui'}</p>
            <div class="menu-rating">Rating: ${menu.avgRating || '-'}</div>
            <div class="favorite-icon active" title="Hapus dari favorit">❤️</div>
          </div>
        `;
      }

      container.appendChild(item);

      if (!isUserPage) {
        item.addEventListener('click', (e) => {
          if (e.target.classList.contains('favorite-icon')) return;
          openMenuModal(menu);
        });
      }

      const removeBtn = item.querySelector('.remove-favorite, .favorite-icon');
      if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleFavorite(removeBtn, menu.id_menu);
        });
      }
    });
  } catch (error) {
    console.error('Error memuat favorit:', error);
    container.innerHTML = `
      <div class="no-favorites">
        <p>Gagal memuat menu favorit</p>
        <p>Silakan coba lagi nanti</p>
      </div>
    `;
  }
}

window.addEventListener('storage', (event) => {
  if (event.key === 'favoritesUpdated') {
    const isUserPage = window.location.pathname.includes('user.html');
    loadFavorites(isUserPage ? 'favorites-list' : 'favorites-grid', isUserPage);
  }
});

document.addEventListener('favoritesUpdated', () => {
  console.log('Menerima event favoritesUpdated');
  const isUserPage = window.location.pathname.includes('user.html');
  loadFavorites(isUserPage ? 'favorites-list' : 'favorites-grid', isUserPage);
});

document.addEventListener('DOMContentLoaded', () => {
  const isUserPage = window.location.pathname.includes('user.html');
  loadFavorites(isUserPage ? 'favorites-list' : 'favorites-grid', isUserPage);
});

async function checkFavoriteStatus(menuId) {
  if (!isLoggedIn()) return false;

  try {
    const token = getToken();
    const response = await fetch('/api/menu/favorites', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error(`Respons jaringan bermasalah: ${response.status} ${response.statusText}`);
    const favorites = await response.json();
    return favorites.some(fav => fav.id_menu == menuId);
  } catch (error) {
    console.error('Error memeriksa status favorit:', error);
    return false;
  }
}

async function updateFavoriteIcon(menuId) {
  const favoriteBtn = document.getElementById('favorite-btn');
  if (!favoriteBtn) return;

  if (!isLoggedIn()) {
    favoriteBtn.classList.remove('active');
    return;
  }

  const isFavorite = await checkFavoriteStatus(menuId);
  favoriteBtn.classList.toggle('active', isFavorite);
}

document.addEventListener('click', (e) => {
  const favoriteBtn = e.target.closest('#favorite-btn');
  if (!favoriteBtn) return;

  e.stopPropagation();
  e.preventDefault();

  if (!window.currentMenuId) {
    console.error('Tidak ada ID menu tersedia');
    alert('Tidak ada ID menu yang tersedia. Silakan muat ulang halaman.');
    return;
  }

  console.log('Tombol favorit diklik untuk menu ID:', window.currentMenuId);
  toggleFavorite(favoriteBtn, window.currentMenuId);
});