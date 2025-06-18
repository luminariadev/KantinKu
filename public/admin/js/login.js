document.addEventListener('DOMContentLoaded', function() {
  // Check if admin is already logged in
  if (localStorage.getItem('adminLoggedIn') === 'true') {
    // Check token expiration
    const tokenIssuedAt = localStorage.getItem('adminTokenIssuedAt');
    if (tokenIssuedAt && (Date.now() - parseInt(tokenIssuedAt)) < 3600000) { // 1 hour in milliseconds
      window.location.href = 'dashboard.html';
      return;
    } else {
      // Clear expired session
      localStorage.removeItem('adminToken');
      localStorage.removeItem('admin');
      localStorage.removeItem('adminLoggedIn');
      localStorage.removeItem('adminTokenIssuedAt');
    }
  }
  
  document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    
    // Hide messages
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Validate input
    if (!username || !password) {
      errorMessage.textContent = 'Username dan password harus diisi';
      errorMessage.style.display = 'block';
      return;
    }
    
    // Show loading message
    successMessage.textContent = 'Sedang login...';
    successMessage.style.display = 'block';
    
    // Send data using fetch API
    fetch('/api/auth/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.token) {
        // Save auth data to localStorage
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('admin', JSON.stringify(data.admin));
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminTokenIssuedAt', Date.now().toString());
        
        // Show success message
        successMessage.textContent = `Login berhasil! Mengalihkan ke dashboard...`;
        successMessage.style.display = 'block';
        
        // Redirect to dashboard
        setTimeout(function() {
          window.location.href = 'dashboard.html';
        }, 1000);
      } else {
        // Show error message
        errorMessage.textContent = data.error || 'Username atau password salah';
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
      }
    })
    .catch(error => {
      errorMessage.textContent = 'Terjadi kesalahan saat login. Coba lagi nanti.';
      errorMessage.style.display = 'block';
      successMessage.style.display = 'none';
      console.error('Error:', error);
    });
  });
});