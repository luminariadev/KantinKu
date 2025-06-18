// Konfigurasi pagination
const ITEMS_PER_PAGE = 8;
let currentPage = 1;
let allMenus = [];

// Fungsi untuk menampilkan menu dengan pagination
function displayMenusWithPagination(menus, page = 1) {
  allMenus = menus;
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const menuSlice = menus.slice(startIndex, endIndex);
  
  // Tampilkan menu untuk halaman saat ini
  displayMenus(menuSlice);
  
  // Update pagination controls
  updatePaginationControls(menus.length);
}

// Fungsi untuk memperbarui kontrol pagination
function updatePaginationControls(totalItems) {
  const paginationContainer = document.querySelector('.pagination-container');
  if (!paginationContainer) return;
  
  // Bersihkan kontrol pagination yang ada
  paginationContainer.innerHTML = '';
  
  // Jika semua item sudah ditampilkan, sembunyikan tombol "Lihat lebih banyak"
  if (currentPage * ITEMS_PER_PAGE >= totalItems) {
    paginationContainer.style.display = 'none';
  } else {
    paginationContainer.style.display = 'flex';
    
    // Tambahkan tombol "Lihat lebih banyak"
    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.className = 'load-more-btn';
    loadMoreBtn.textContent = 'Lihat lebih banyak';
    loadMoreBtn.addEventListener('click', () => {
      currentPage++;
      loadMoreMenus();
    });
    
    paginationContainer.appendChild(loadMoreBtn);
  }
}

// Fungsi untuk memuat lebih banyak menu
function loadMoreMenus() {
  const startIndex = 0;
  const endIndex = currentPage * ITEMS_PER_PAGE;
  const menuSlice = allMenus.slice(startIndex, endIndex);
  
  // Tampilkan menu yang diperluas
  displayMenus(menuSlice);
  
  // Update pagination controls
  updatePaginationControls(allMenus.length);
}

// Override fungsi fetchMenus dari data.js
const originalFetchMenus = window.fetchMenus || function(){};
window.fetchMenus = async function() {
  try {
    const menus = await originalFetchMenus();
    displayMenusWithPagination(menus);
    return menus;
  } catch (error) {
    console.error('Error fetching menus:', error);
    return [];
  }
};