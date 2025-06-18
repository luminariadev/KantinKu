// Check if user is logged in
function isLoggedIn() {
  return localStorage.getItem('isLoggedIn') === 'true';
}

// Get current user
function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Get auth token
function getToken() {
  return localStorage.getItem('token');
}

// Logout user
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
  window.location.href = 'index.html';
}

// Update UI based on auth state
function updateAuthUI() {
  const userNav = document.getElementById('user-nav');
  const userNameSpan = document.getElementById('user-name');
  const favoriteNav = document.getElementById('favorite-nav');
  const user = getCurrentUser();

  if (isLoggedIn() && user) {
    const displayName = user.nama || user.username || 'User';
    if (userNameSpan) userNameSpan.textContent = displayName;
    if (userNav) userNav.href = 'user.html';
    if (favoriteNav) favoriteNav.style.display = ''; // Show favorite link
    // Hide warning boxes if any
    document.querySelectorAll('.warning-box').forEach(box => {
      box.style.display = 'none';
    });
  } else {
    if (userNameSpan) userNameSpan.textContent = 'Masuk';
    if (userNav) userNav.href = 'login.html';
    if (favoriteNav) favoriteNav.style.display = 'none'; // Hide favorite link
    // Show warning boxes if any
    document.querySelectorAll('.warning-box').forEach(box => {
      box.style.display = '';
    });
  }
}

function authFetch(url, options = {}) {
  const token = getToken();
  if (!options.headers) options.headers = {};
  options.headers['Authorization'] = 'Bearer ' + token;

  return fetch(url, options).then(response => {
    if (response.status === 401) {
      alert('Sesi Login Habis. Silakan login kembali.');
      logout();
      return Promise.reject('Unauthorized');
    }
    return response;
  });
}
