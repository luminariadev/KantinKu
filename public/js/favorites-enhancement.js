/**
 * Enhanced favorites functionality for KantinKu
 * This file extends the favorites.js functionality with additional features
 */

// Enhanced toggle favorite with visual feedback
async function toggleFavoriteEnhanced(element, menuId) {
  if (!isLoggedIn()) {
    showNotification('Silakan login terlebih dahulu untuk menambahkan menu ke favorit', 'warning');
    return;
  }
  
  try {
    const token = getToken();
    const isFavorite = element.classList.contains('active');
    const method = isFavorite ? 'DELETE' : 'POST';
    
    // Ensure menuId is a number
    const numericMenuId = parseInt(menuId);
    if (isNaN(numericMenuId)) {
      console.error('Invalid menu ID:', menuId);
      return;
    }
    
    // Visual feedback - show loading state
    element.classList.add('loading');
    
    // Update UI immediately for responsiveness
    if (method === 'POST') {
      element.classList.add('active');
    } else {
      element.classList.remove('active');
    }
    
    // Send request to server
    const response = await fetch(`/api/menu/favorites/${numericMenuId}`, {
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.status === 401) {
      alert('Sesi login sudah habis, silakan login kembali.');
      logout();
    return;
   }
    
    // Remove loading state
    element.classList.remove('loading');
    
    if (!response.ok) {
      // Revert to original state if failed
      if (isFavorite) {
        element.classList.add('active');
      } else {
        element.classList.remove('active');
      }
      
      const errorData = await response.json();
      throw new Error(errorData.error || 'Network response was not ok');
    }
    
    const result = await response.json();
    
    if (result.success) {
      // Show success notification
      if (method === 'POST') {
        showNotification('Menu berhasil ditambahkan ke favorit', 'success');
        
        // Notify other components about the change
        localStorage.setItem('favoritesUpdated', Date.now().toString());
        
        // Dispatch custom event
        const event = new CustomEvent('favoritesUpdated', {
          detail: { menuId: numericMenuId, action: 'add' }
        });
        document.dispatchEvent(event);
      } else {
        showNotification('Menu berhasil dihapus dari favorit', 'success');
        
        // Handle removal from favorites page
        if (window.location.pathname.includes('favorites.html')) {
          const menuCard = document.querySelector(`.menu-card[data-menu-id="${numericMenuId}"]`);
          if (menuCard) {
            // Animate removal
            menuCard.classList.add('removing');
            setTimeout(() => {
              menuCard.remove();
              
              // Check if there are no more favorites
              if (document.querySelectorAll('.menu-card').length === 0) {
                const menuGrid = document.getElementById('favorites-grid');
                if (menuGrid) {
                  menuGrid.innerHTML = `
                    <div class="no-favorites">
                      <p>Belum ada menu favorit</p>
                      <p>Tambahkan menu favorit dengan menekan ikon ❤️ pada detail menu</p>
                    </div>
                  `;
                }
              }
            }, 300); // Match this with CSS transition time
          }
        }
        
        // Notify other components
        localStorage.setItem('favoritesUpdated', Date.now().toString());
        
        // Dispatch custom event
        const event = new CustomEvent('favoritesUpdated', {
          detail: { menuId: numericMenuId, action: 'remove' }
        });
        document.dispatchEvent(event);
      }
    }
  } catch (error) {
    console.error('Error toggling favorite status:', error);
    showNotification('Gagal mengubah status favorit: ' + (error.message || 'Terjadi kesalahan'), 'error');
  }
}

// Show notification
function showNotification(message, type = 'info') {
  // Create notification element if it doesn't exist
  let notification = document.getElementById('notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    document.body.appendChild(notification);
  }
  
  // Set notification content and type
  notification.textContent = message;
  notification.className = `notification ${type}`;
  
  // Show notification
  notification.classList.add('show');
  
  // Hide after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// Get favorite count
async function getFavoriteCount() {
  if (!isLoggedIn()) {
    return 0;
  }
  
  try {
    const token = getToken();
    const response = await fetch('/api/menu/favorites', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.status === 401) {
      alert('Sesi login sudah habis, silakan login kembali.');
      logout();
    return;
   }
    
    if (!response.ok) throw new Error('Network response was not ok');
    const favorites = await response.json();
    
    return favorites.length;
  } catch (error) {
    console.error('Error getting favorite count:', error);
    return 0;
  }
}

// Update favorite count badge
async function updateFavoriteBadge() {
  const badge = document.getElementById('favorite-count');
  if (!badge) return;
  
  const count = await getFavoriteCount();
  
  if (count > 0) {
    badge.textContent = count;
    badge.classList.add('show');
  } else {
    badge.classList.remove('show');
  }
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Replace standard toggleFavorite with enhanced version
  window.toggleFavorite = toggleFavoriteEnhanced;
  
  // Update favorite badge on load
  updateFavoriteBadge();
  
  // Listen for favorites updated event
  document.addEventListener('favoritesUpdated', function() {
    updateFavoriteBadge();
  });
  
  // Add CSS for notifications and animations
  const style = document.createElement('style');
  style.textContent = `
    .notification {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 10px 20px;
      border-radius: 4px;
      color: white;
      font-weight: bold;
      z-index: 1000;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.3s, transform 0.3s;
    }
    
    .notification.show {
      opacity: 1;
      transform: translateY(0);
    }
    
    .notification.success {
      background-color: #4CAF50;
    }
    
    .notification.error {
      background-color: #F44336;
    }
    
    .notification.warning {
      background-color: #FF9800;
    }
    
    .notification.info {
      background-color: #2196F3;
    }
    
    .favorite-icon.loading {
      animation: pulse 1s infinite;
    }
    
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }
    
    .menu-card.removing {
      opacity: 0;
      transform: scale(0.8);
      transition: opacity 0.3s, transform 0.3s;
    }
    
    #favorite-count {
      position: absolute;
      top: -8px;
      right: -8px;
      background-color: #F44336;
      color: white;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: scale(0);
      transition: opacity 0.3s, transform 0.3s;
    }
    
    #favorite-count.show {
      opacity: 1;
      transform: scale(1);
    }
  `;
  document.head.appendChild(style);
});

function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch (e) {
    return true;
  }
}

function checkSession() {
  const token = getToken();
  if (!token || isTokenExpired(token)) {
    alert('Sesi login sudah habis, silakan login kembali.');
    logout();
    return false;
  }
  return true;
}

// Panggil checkSession() di setiap halaman setelah updateAuthUI
document.addEventListener('DOMContentLoaded', function() {
  updateAuthUI();
  checkSession();
});