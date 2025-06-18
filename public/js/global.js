// Global variables and functions
window.ITEMS_PER_PAGE = 8; // Global constant for pagination

// Check if user is logged in
function isLoggedIn() {
  return localStorage.getItem('token') !== null;
}

// Get token from localStorage
function getToken() {
  return localStorage.getItem('token');
}

// Get current user from localStorage
function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

// Update UI based on auth state
function updateAuthUI() {
  const isLoggedInUser = isLoggedIn();
  const user = getCurrentUser();
  
  // Update navigation links
  const navLinks = document.querySelectorAll('nav a:last-child');
  navLinks.forEach(link => {
    if (isLoggedInUser) {
      link.href = 'user.html';
      link.innerHTML = `<i class="fas fa-user nav-icon"></i> ${user ? (user.nama || 'Profil') : 'Profil'}`;
    } else {
      link.href = 'login.html';
      link.innerHTML = `<i class="fas fa-user nav-icon"></i> Masuk`;
    }
  });
  
  // Update favorite links visibility
  const favoriteLinks = document.querySelectorAll('a.nav-item:nth-child(3)');
  favoriteLinks.forEach(link => {
    if (isLoggedInUser) {
      link.style.display = 'flex';
    } else {
      link.style.display = 'none';
    }
  });
}

// Close modal
function closeModal() {
  console.log('Closing modal');
  const modal = document.getElementById('modal');
  if (modal) {
    modal.style.display = 'none';
    
    // Reset current menu and warung IDs
    window.currentMenuId = null;
    window.currentWarungId = null;
    
    // Reset review form if it exists
    if (document.getElementById('review-comment')) {
      document.getElementById('review-comment').value = '';
    }
    if (document.querySelectorAll('.star-rating i')) {
      document.querySelectorAll('.star-rating i').forEach(star => {
        star.classList.remove('active');
      });
    }
    window.selectedRating = 0;
  }
}

// Format price
function formatPrice(price) {
  return `Rp. ${parseInt(price).toLocaleString('id-ID')}`;
}

// Format date
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', function() {
  updateAuthUI();
});