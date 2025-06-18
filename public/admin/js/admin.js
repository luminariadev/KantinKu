document.addEventListener('DOMContentLoaded', function() {
  console.log('Admin dashboard loaded');
  // Check if admin is logged in and token is valid
  const token = localStorage.getItem('adminToken');
  const tokenIssuedAt = localStorage.getItem('adminTokenIssuedAt');
  
  if (!token || !tokenIssuedAt || (Date.now() - parseInt(tokenIssuedAt)) > 3600000) {
    console.log('Invalid or expired token, logging out');
    logout();
    return;
  }

  // Set admin name
  try {
    const admin = JSON.parse(localStorage.getItem('admin'));
    const adminNameElements = document.querySelectorAll('#admin-name');
    adminNameElements.forEach(el => {
      el.textContent = admin.nama || admin.username;
    });
    console.log('Admin name set:', admin.nama || admin.username);
  } catch (e) {
    console.error('Error parsing admin data:', e);
  }

  // Setup logout buttons
  const logoutSidebar = document.getElementById('btn-logout-sidebar');
  if (logoutSidebar) {
    logoutSidebar.addEventListener('click', logout);
    console.log('Logout sidebar button initialized');
  } else {
    console.warn('Logout sidebar button not found');
  }

  // Setup navigation
  setupNavigation();

  // Load initial data
  loadDashboardDataWithActivity();
  loadMenuData();
  loadWarungData();
  loadCategories();

  // Setup modal events
  setupMenuModal();
  setupWarungModal();
  
  // Apply responsive behavior
  handleResponsiveLayout();
  
  // Setup table sorting
  setupTableSorting();
  
  // Debug form values
  debugFormValues();

  // Intercept fetch requests to handle 401 responses
  const originalFetch = window.fetch;
  window.fetch = function(url, options = {}) {
    console.log('Fetching:', url);
    return originalFetch(url, options).then(response => {
      if (response.status === 401) {
        console.log('Received 401, session expired');
        showAlert('global-alert', 'Sesi telah kedaluwarsa. Silakan login kembali.', 'danger');
        logout();
        throw new Error('Unauthorized');
      }
      return response;
    }).catch(error => {
      console.error('Fetch error:', error);
      throw error;
    });
  };
});

// Logout function
function logout() {
  console.log('Logging out');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('admin');
  localStorage.removeItem('adminLoggedIn');
  localStorage.removeItem('adminTokenIssuedAt');
  window.location.href = 'login.html';
}

// Setup navigation
function setupNavigation() {
  const menuLinks = document.querySelectorAll('.menu a[data-section]');
  const sections = document.querySelectorAll('.section');

  console.log('Found menu links:', menuLinks.length);
  menuLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Navigating to section:', this.getAttribute('data-section'));
      
      // Remove active class from all links
      menuLinks.forEach(item => item.classList.remove('active'));
      
      // Add active class to clicked link
      this.classList.add('active');
      
      // Hide all sections
      sections.forEach(section => section.classList.add('hidden'));
      
      // Show selected section
      const sectionId = this.getAttribute('data-section');
      const section = document.getElementById(sectionId);
      if (section) {
        section.classList.remove('hidden');
      } else {
        console.error('Section not found:', sectionId);
      }
    });
  });
}

// Load dashboard data with activity log
function loadDashboardDataWithActivity() {
  const summaryData = document.getElementById('summary-data');
  const activityData = document.getElementById('activity-data');
  
  const token = localStorage.getItem('adminToken');
  const headers = {
    'x-auth-token': token
  };
  
  console.log('Loading dashboard data');
  Promise.all([
    fetch('/api/menu').then(res => res.json()).catch(e => { console.error('Menu fetch error:', e); return []; }),
    fetch('/api/warung').then(res => res.json()).catch(e => { console.error('Warung fetch error:', e); return []; }),
    fetch('/api/kategori').then(res => res.json()).catch(e => { console.error('Kategori fetch error:', e); return []; }),
    fetch('/api/admin/activities?limit=5', { headers }).then(res => res.json()).catch(e => { console.error('Activities fetch error:', e); return []; })
  ])
  .then(([menus, warungs, categories, activities]) => {
    console.log('Dashboard data loaded:', { menus: menus.length, warungs: warungs.length, categories: categories.length, activities: activities.length });
    
    // Update summary cards
    summaryData.innerHTML = `
      <div class="summary-card summary-menu">
        <h3>${menus.length}</h3>
        <p>Total Menu</p>
      </div>
      <div class="summary-card summary-warung">
        <h3>${warungs.length}</h3>
        <p>Total Warung</p>
      </div>
      <div class="summary-card summary-kategori">
        <h3>${categories.length}</h3>
        <p>Total Kategori</p>
      </div>
    `;
    
    // Update activity list
    if (activities && activities.length > 0) {
      let activityHtml = '<ul class="activity-list">';
      
      activities.forEach(activity => {
        const date = new Date(activity.timestamp);
        const formattedDate = date.toLocaleDateString('id-ID', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        let iconClass = 'create';
        let icon = 'plus';
        
        if (activity.action === 'update') {
          iconClass = 'update';
          icon = 'edit';
        } else if (activity.action === 'delete') {
          iconClass = 'delete';
          icon = 'trash';
        }
        
        activityHtml += `
          <li class="activity-item">
            <div class="activity-icon ${iconClass}">
              <i class="fas fa-${icon}"></i>
            </div>
            <div class="activity-content">
              <div class="activity-title">${activity.details}</div>
              <div class="activity-meta">
                <span>${activity.admin_username || 'Admin'}</span> • 
                <span>${formattedDate}</span>
              </div>
            </div>
          </li>
        `;
      });
      
      activityHtml += '</ul>';
      activityData.innerHTML = activityHtml;
    } else {
      activityData.innerHTML = '<p>Belum ada aktivitas</p>';
    }
  })
  .catch(error => {
    console.error('Error loading dashboard data:', error);
    summaryData.innerHTML = '<p>Error loading data. Please try again later.</p>';
    if (activityData) {
      activityData.innerHTML = '<p>Error loading activity data.</p>';
    }
  });
}

// Load menu data
function loadMenuData() {
  const menuTable = document.getElementById('menu-table').querySelector('tbody');
  
  console.log('Loading menu data');
  fetch('/api/menu')
    .then(response => response.json())
    .then(data => {
      console.log('Menu data loaded:', data.length);
      if (data.length === 0) {
        menuTable.innerHTML = '<tr><td colspan="6">Tidak ada data menu</td></tr>';
        return;
      }
      
      let tableContent = '';
      data.forEach(menu => {
        tableContent += `
          <tr>
            <td>${menu.id_menu}</td>
            <td>${menu.nama_menu}</td>
            <td>Rp ${menu.harga.toLocaleString('id-ID')}</td>
            <td>${menu.id_kategori}</td>
            <td>${menu.nama_warung}</td>
            <td class="action-buttons">
              <button class="btn-edit" data-id="${menu.id_menu}">Edit</button>
              <button class="btn-delete" data-id="${menu.id_menu}" data-name="${menu.nama_menu}">Hapus</button>
            </td>
          </tr>
        `;
      });
      
      menuTable.innerHTML = tableContent;
      
      // Add event listeners to buttons
      menuTable.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', () => editMenu(button.getAttribute('data-id')));
      });
      
      menuTable.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', () => deleteMenu(button.getAttribute('data-id'), button.getAttribute('data-name')));
      });
    })
    .catch(error => {
      console.error('Error loading menu data:', error);
      menuTable.innerHTML = '<tr><td colspan="6">Error loading data</td></tr>';
    });
}

// Load warung data
function loadWarungData() {
  const warungTable = document.getElementById('warung-table').querySelector('tbody');
  
  console.log('Loading warung data');
  fetch('/api/warung')
    .then(response => response.json())
    .then(data => {
      console.log('Warung data loaded:', data.length);
      if (data.length === 0) {
        warungTable.innerHTML = '<tr><td colspan="5">Tidak ada data warung</td></tr>';
        return;
      }
      
      let tableContent = '';
      data.forEach(warung => {
        tableContent += `
          <tr>
            <td>${warung.id_warung}</td>
            <td>${warung.nama_warung}</td>
            <td>${warung.lokasi || '-'}</td>
            <td>${warung.kontak || '-'}</td>
            <td class="action-buttons">
              <button class="btn-edit" data-id="${warung.id_warung}">Edit</button>
              <button class="btn-delete" data-id="${warung.id_warung}" data-name="${warung.nama_warung}">Hapus</button>
            </td>
          </tr>
        `;
      });
      
      warungTable.innerHTML = tableContent;
      
      // Add event listeners to buttons
      warungTable.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', () => editWarung(button.getAttribute('data-id')));
      });
      
      warungTable.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', () => deleteWarung(button.getAttribute('data-id'), button.getAttribute('data-name')));
      });
    })
    .catch(error => {
      console.error('Error loading warung data:', error);
      warungTable.innerHTML = '<tr><td colspan="5">Error loading data</td></tr>';
    });
}

// Load categories for menu form
function loadCategories() {
  const categorySelect = document.getElementById('menu-category');
  const warungSelect = document.getElementById('menu-warung');
  
  console.log('Loading categories');
  fetch('/api/kategori')
    .then(response => response.json())
    .then(data => {
      console.log('Categories loaded:', data.length);
      let options = '<option value="">Pilih Kategori</option>';
      data.forEach(category => {
        options += `<option value="${category.id_kategori}">${category.nama_kategori}</option>`;
      });
      categorySelect.innerHTML = options;
    })
    .catch(error => {
      console.error('Error loading categories:', error);
    });
  
  console.log('Loading warung for menu form');
  fetch('/api/warung')
    .then(response => response.json())
    .then(data => {
      console.log('Warung for menu form loaded:', data.length);
      let options = '<option value="">Pilih Warung</option>';
      data.forEach(warung => {
        options += `<option value="${warung.id_warung}">${warung.nama_warung}</option>`;
      });
      warungSelect.innerHTML = options;
    })
    .catch(error => {
      console.error('Error loading warung for menu form:', error);
    });
}

// Setup menu modal
function setupMenuModal() {
  const modal = document.getElementById('menu-modal');
  const form = document.getElementById('menu-form');
  const addButton = document.getElementById('btn-add-menu');
  const closeButton = modal.querySelector('.close-modal');
  const cancelButton = modal.querySelector('.btn-cancel');
  
  addButton.addEventListener('click', () => {
    console.log('Opening menu modal');
    document.getElementById('menu-modal-title').textContent = 'Tambah Menu';
    form.reset();
    document.getElementById('menu-id').value = '';
    document.getElementById('menu-image-preview').innerHTML = '';
    modal.style.display = 'flex';
    if (closeButton) {
      closeButton.style.display = 'block'; // Ensure close button is visible
      console.log('Close button visibility set to block');
    }
  });
  
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      console.log('Closing menu modal');
      modal.style.display = 'none';
    });
  } else {
    console.warn('Close button for menu modal not found');
  }
  
  cancelButton.addEventListener('click', () => {
    console.log('Cancel menu modal');
    modal.style.display = 'none';
  });
  
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      console.log('Closing menu modal by clicking outside');
      modal.style.display = 'none';
    }
  });
  
  const menuImageInput = document.getElementById('menu-image');
  const menuImagePreview = document.getElementById('menu-image-preview');
  
  menuImageInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
      const reader = new FileReader();
      reader.onload = function(e) {
        menuImagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
      };
      reader.readAsDataURL(this.files[0]);
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Submitting menu form');
    
    const menuId = document.getElementById('menu-id').value;
    const menuName = document.getElementById('menu-name').value;
    const menuPrice = document.getElementById('menu-price').value;
    const menuCategory = document.getElementById('menu-category').value;
    const menuWarung = document.getElementById('menu-warung').value;
    const menuDescription = document.getElementById('menu-description').value || '';
    const menuImageFile = document.getElementById('menu-image').files[0];
    
    if (!menuName || !menuPrice || !menuCategory || !menuWarung) {
      showAlert('menu-alert', 'Nama menu, harga, kategori, dan warung diperlukan', 'danger');
      return;
    }
    
    const formData = new FormData();
    formData.append('nama_menu', menuName);
    formData.append('harga', menuPrice);
    formData.append('id_kategori', menuCategory);
    formData.append('id_warung', menuWarung);
    formData.append('deskripsi', menuDescription);
    
    if (menuImageFile) {
      formData.append('foto', menuImageFile);
    }
    
    console.log('Menu form values:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }
    
    const token = localStorage.getItem('adminToken');
    const headers = {
      'x-auth-token': token
    };
    
    if (menuId) {
      // Update existing menu
      fetch(`/api/admin/menu/${menuId}`, {
        method: 'PUT',
        headers: headers,
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          showAlert('menu-alert', data.error, 'danger');
        } else {
          showAlert('menu-alert', 'Menu berhasil diupdate', 'success');
          showAlert('global-alert', `Menu "${menuName}" berhasil diedit`, 'success');
          loadMenuData();
          loadDashboardDataWithActivity();
          modal.style.display = 'none';
        }
      })
      .catch(error => {
        console.error('Error updating menu:', error);
        showAlert('menu-alert', 'Terjadi kesalahan saat mengupdate menu', 'danger');
      });
    } else {
      // Add new menu
      fetch('/api/admin/menu', {
        method: 'POST',
        headers: headers,
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          showAlert('menu-alert', data.error, 'danger');
        } else {
          showAlert('menu-alert', 'Menu berhasil ditambahkan', 'success');
          showAlert('global-alert', `Menu "${menuName}" berhasil ditambahkan`, 'success');
          loadMenuData();
          loadDashboardDataWithActivity();
          modal.style.display = 'none';
        }
      })
      .catch(error => {
        console.error('Error adding menu:', error);
        showAlert('menu-alert', 'Terjadi kesalahan saat menambahkan menu', 'danger');
      });
    }
  });
}

// Setup warung modal
function setupWarungModal() {
  const modal = document.getElementById('warung-modal');
  const form = document.getElementById('warung-form');
  const addButton = document.getElementById('btn-add-warung');
  const closeButton = modal.querySelector('.close-modal');
  const cancelButton = modal.querySelector('.btn-cancel');
  
  addButton.addEventListener('click', () => {
    console.log('Opening warung modal');
    document.getElementById('warung-modal-title').textContent = 'Tambah Warung';
    form.reset();
    document.getElementById('warung-id').value = '';
    document.getElementById('warung-image-preview').innerHTML = '';
    modal.style.display = 'flex';
    if (closeButton) {
      closeButton.style.display = 'block'; // Ensure close button is visible
      console.log('Close button visibility set to block');
    }
  });
  
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      console.log('Closing warung modal');
      modal.style.display = 'none';
    });
  } else {
    console.warn('Close button for warung modal not found');
  }
  
  cancelButton.addEventListener('click', () => {
    console.log('Cancel warung modal');
    modal.style.display = 'none';
  });
  
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      console.log('Closing warung modal by clicking outside');
      modal.style.display = 'none';
    }
  });
  
  const warungImageInput = document.getElementById('warung-image');
  const warungImagePreview = document.getElementById('warung-image-preview');
  
  warungImageInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
      const reader = new FileReader();
      reader.onload = function(e) {
        warungImagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
      };
      reader.readAsDataURL(this.files[0]);
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Submitting warung form');
    
    const warungId = document.getElementById('warung-id').value;
    const warungName = document.getElementById('warung-name').value;
    const warungLocation = document.getElementById('warung-location').value;
    const warungContact = document.getElementById('warung-contact').value || '';
    const warungDescription = document.getElementById('warung-description').value || '';
    const warungImageFile = document.getElementById('warung-image').files[0];
    
    if (!warungName || !warungLocation) {
      showAlert('warung-alert', 'Nama warung dan lokasi diperlukan', 'danger');
      return;
    }
    
    const formData = new FormData();
    formData.append('nama_warung', warungName);
    formData.append('lokasi', warungLocation);
    formData.append('kontak', warungContact);
    formData.append('deskripsi', warungDescription);
    
    if (warungImageFile) {
      formData.append('foto', warungImageFile);
    }
    
    console.log('Warung form values:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }
    
    const token = localStorage.getItem('adminToken');
    const headers = {
      'x-auth-token': token
    };
    
    if (warungId) {
      // Update existing warung
      fetch(`/api/admin/warung/${warungId}`, {
        method: 'PUT',
        headers: headers,
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          showAlert('warung-alert', data.error, 'danger');
        } else {
          showAlert('warung-alert', 'Warung berhasil diupdate', 'success');
          showAlert('global-alert', `Warung "${warungName}" berhasil diedit`, 'success');
          loadWarungData();
          loadDashboardDataWithActivity();
          modal.style.display = 'none';
        }
      })
      .catch(error => {
        console.error('Error updating warung:', error);
        showAlert('warung-alert', 'Terjadi kesalahan saat mengupdate warung', 'danger');
      });
    } else {
      // Add new warung
      fetch('/api/admin/warung', {
        method: 'POST',
        headers: headers,
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          showAlert('warung-alert', data.error, 'danger');
        } else {
          showAlert('warung-alert', 'Warung berhasil ditambahkan', 'success');
          showAlert('global-alert', `Warung "${warungName}" berhasil ditambahkan`, 'success');
          loadWarungData();
          loadDashboardDataWithActivity();
          modal.style.display = 'none';
        }
      })
      .catch(error => {
        console.error('Error adding warung:', error);
        showAlert('warung-alert', 'Terjadi kesalahan saat menambahkan warung', 'danger');
      });
    }
  });
}

// Edit menu
function editMenu(id) {
  console.log('Editing menu:', id);
  fetch(`/api/menu/${id}`)
    .then(response => response.json())
    .then(menu => {
      document.getElementById('menu-modal-title').textContent = 'Edit Menu';
      document.getElementById('menu-id').value = menu.id_menu;
      document.getElementById('menu-name').value = menu.nama_menu;
      document.getElementById('menu-price').value = menu.harga;
      document.getElementById('menu-description').value = menu.deskripsi || '';
      document.getElementById('menu-category').value = menu.id_kategori;
      document.getElementById('menu-warung').value = menu.id_warung;
      
      const menuImagePreview = document.getElementById('menu-image-preview');
      if (menu.foto) {
        menuImagePreview.innerHTML = `<img src="${menu.foto}" alt="Preview">`;
      } else {
        menuImagePreview.innerHTML = '';
      }
      
      const modal = document.getElementById('menu-modal');
      modal.style.display = 'flex';
      const closeButton = modal.querySelector('.close-modal');
      if (closeButton) {
        closeButton.style.display = 'block'; // Ensure close button is visible
        console.log('Close button visibility set to block for edit menu');
      }
    })
    .catch(error => {
      console.error('Error fetching menu details:', error);
      showAlert('menu-alert', 'Terjadi kesalahan saat mengambil detail menu', 'danger');
    });
}

// Delete menu
function deleteMenu(id, name) {
  console.log('Deleting menu:', id);
  if (confirm(`Apakah Anda yakin ingin menghapus menu "${name}"?`)) {
    const token = localStorage.getItem('adminToken');
    
    fetch(`/api/admin/menu/${id}`, {
      method: 'DELETE',
      headers: {
        'x-auth-token': token
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        showAlert('menu-alert', data.error, 'danger');
      } else {
        showAlert('menu-alert', 'Menu berhasil dihapus', 'success');
        showAlert('global-alert', `Menu "${name}" berhasil dihapus`, 'success');
        loadMenuData();
        loadDashboardDataWithActivity();
      }
    })
    .catch(error => {
      console.error('Error deleting menu:', error);
      showAlert('menu-alert', 'Terjadi kesalahan saat menghapus menu', 'danger');
    });
  }
}

// Edit warung
function editWarung(id) {
  console.log('Editing warung:', id);
  fetch(`/api/warung`)
    .then(response => response.json())
    .then(warungs => {
      const warung = warungs.find(w => w.id_warung == id);
      if (!warung) {
        throw new Error('Warung not found');
      }
      
      document.getElementById('warung-modal-title').textContent = 'Edit Warung';
      document.getElementById('warung-id').value = warung.id_warung;
      document.getElementById('warung-name').value = warung.nama_warung;
      document.getElementById('warung-location').value = warung.lokasi || '';
      document.getElementById('warung-contact').value = warung.kontak || '';
      document.getElementById('warung-description').value = warung.deskripsi || '';
      
      const warungImagePreview = document.getElementById('warung-image-preview');
      if (warung.foto) {
        warungImagePreview.innerHTML = `<img src="${warung.foto}" alt="Preview">`;
      } else {
        warungImagePreview.innerHTML = '';
      }
      
      const modal = document.getElementById('warung-modal');
      modal.style.display = 'flex';
      const closeButton = modal.querySelector('.close-modal');
      if (closeButton) {
        closeButton.style.display = 'block'; // Ensure close button is visible
        console.log('Close button visibility set to block for edit warung');
      }
    })
    .catch(error => {
      console.error('Error fetching warung details:', error);
      showAlert('warung-alert', 'Terjadi kesalahan saat mengambil detail warung', 'danger');
    });
}

// Delete warung
function deleteWarung(id, name) {
  console.log('Deleting warung:', id);
  if (confirm(`Apakah Anda yakin ingin menghapus warung "${name}"? Semua menu yang terkait juga akan dihapus.`)) {
    const token = localStorage.getItem('adminToken');
    
    fetch(`/api/admin/warung/${id}`, {
      method: 'DELETE',
      headers: {
        'x-auth-token': token
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        showAlert('warung-alert', data.error, 'danger');
      } else {
        showAlert('warung-alert', 'Warung berhasil dihapus', 'success');
        showAlert('global-alert', `Warung "${name}" berhasil dihapus`, 'success');
        loadWarungData();
        loadMenuData();
        loadDashboardDataWithActivity();
      }
    })
    .catch(error => {
      console.error('Error deleting warung:', error);
      showAlert('warung-alert', 'Terjadi kesalahan saat menghapus warung', 'danger');
    });
  }
}

// Show alert
function showAlert(elementId, message, type) {
  console.log('Showing alert:', elementId, message, type);
  const alertElement = document.getElementById(elementId);
  if (alertElement) {
    alertElement.textContent = message;
    alertElement.className = `alert alert-${type}`;
    
    setTimeout(() => {
      alertElement.className = 'alert hidden';
    }, 5000);
  } else {
    console.error('Alert element not found:', elementId);
  }
}

// Handle responsive layout
function handleResponsiveLayout() {
  const sidebar = document.querySelector('.sidebar');
  const content = document.querySelector('.content');
  const menuItems = document.querySelectorAll('.menu a');
  
  console.log('Setting up responsive layout');
  function checkWidth() {
    if (window.innerWidth <= 768) {
      menuItems.forEach(item => {
        const text = item.textContent.trim();
        const icon = item.querySelector('i');
        item.innerHTML = '';
        item.appendChild(icon);
        item.setAttribute('title', text);
      });
    } else {
      menuItems.forEach(item => {
        const text = item.getAttribute('title');
        const icon = item.querySelector('i');
        if (text && icon) {
          item.innerHTML = '';
          item.appendChild(icon);
          item.appendChild(document.createTextNode(' ' + text));
        }
      });
    }
  }
  
  checkWidth();
  window.addEventListener('resize', checkWidth);
}

// Debug function to check form values
function debugFormValues() {
  const menuForm = document.getElementById('menu-form');
  menuForm.addEventListener('submit', function(e) {
    const menuName = document.getElementById('menu-name').value;
    const menuPrice = document.getElementById('menu-price').value;
    const menuCategory = document.getElementById('menu-category').value;
    const menuWarung = document.getElementById('menu-warung').value;
    
    console.log('Form submission values:', {
      name: menuName,
      price: menuPrice,
      category: menuCategory,
      warung: menuWarung
    });
  });
}

// Add sorting functionality to tables
function setupTableSorting() {
  const tables = document.querySelectorAll('table');
  
  console.log('Setting up table sorting');
  tables.forEach(table => {
    const headers = table.querySelectorAll('th');
    
    headers.forEach((header, index) => {
      if (header.textContent.trim().toLowerCase() === 'aksi') {
        return;
      }
      
      header.classList.add('sortable');
      header.addEventListener('click', () => {
        const isAsc = header.classList.contains('asc');
        
        headers.forEach(h => {
          h.classList.remove('asc', 'desc');
        });
        
        header.classList.add(isAsc ? 'desc' : 'asc');
        
        sortTable(table, index, !isAsc);
      });
    });
  });
}

// Sort table function
function sortTable(table, columnIndex, asc) {
  console.log('Sorting table, column:', columnIndex, 'asc:', asc);
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  
  rows.sort((a, b) => {
    const cellA = a.cells[columnIndex].textContent.trim();
    const cellB = b.cells[columnIndex].textContent.trim();
    
    const numA = parseFloat(cellA.replace(/[^\d.-]/g, ''));
    const numB = parseFloat(cellB.replace(/[^\d.-]/g, ''));
    
    if (!isNaN(numA) && !isNaN(numB)) {
      return asc ? numA - numB : numB - numA;
    }
    
    return asc 
      ? cellA.localeCompare(cellB, 'id', { sensitivity: 'base' })
      : cellB.localeCompare(cellA, 'id', { sensitivity: 'base' });
  });
  
  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }
  
  rows.forEach(row => {
    tbody.appendChild(row);
  });
}