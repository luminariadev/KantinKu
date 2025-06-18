async function fetchMenus() {
  try {
    const response = await fetch('/api/menu');
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching menus:', error);
    return [];
  }
}

async function fetchMenusByCategory(categoryId) {
  try {
    const response = await fetch(`/api/menu/kategori/${categoryId}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching menus by category:', error);
    return [];
  }
}

async function fetchMenuDetail(menuId) {
  try {
    const response = await fetch(`/api/menu/${menuId}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching menu detail:', error);
    return null;
  }
}

async function fetchMenuRating(menuId) {
  try {
    const response = await fetch(`/api/reviews/menu/${menuId}`);
    if (!response.ok) throw new Error('Network response was not ok');
    const reviews = await response.json();
    if (reviews.length === 0) return { avgRating: null, displayText: 'Belum ada rating' };
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = (totalRating / reviews.length).toFixed(2);
    return { avgRating, displayText: `${avgRating}★` };
  } catch (error) {
    console.error(`Error fetching rating for menu ${menuId}:`, error);
    return { avgRating: null, displayText: 'Gagal memuat rating' };
  }
}

const ITEMS_PER_PAGE = 8;
let currentPage = 1;
let allMenuItems = [];

async function displayMenus(menus, replace = true) {
  const menuGrid = document.querySelector('.menu-grid');
  
  if (replace) {
    menuGrid.innerHTML = '';
  }
  
  for (const menu of menus) {
    const imagePath = menu.foto || 'images/food2.jpg';
    const formattedPrice = `Rp. ${menu.harga.toLocaleString('id-ID')}`;
    const ratingData = await fetchMenuRating(menu.id_menu);
    
    const menuCard = document.createElement('div');
    menuCard.className = 'menu-card';
    menuCard.dataset.menuId = menu.id_menu;
    menuCard.innerHTML = `
      <img src="${imagePath}" alt="${menu.nama_menu}" />
      <div class="menu-info">
        <div class="menu-top">
          <span>${menu.nama_menu}</span>
          <span class="rating">${ratingData.displayText}</span>
        </div>
        <p><i class="fas fa-store"></i> ${menu.nama_warung}</p> <!-- Ikon toko di sebelah kiri -->
        <p class="price">${formattedPrice}</p>
        <button class="detail-btn" data-id="${menu.id_menu}">Detail Menu</button>
      </div>
    `;
    
    menuGrid.appendChild(menuCard);
    
    // Tambahkan event listener pada kartu menu
    menuCard.addEventListener('click', (e) => {
      // Cegah duplikasi jika klik pada tombol detail
      if (e.target.classList.contains('detail-btn')) return;
      console.log('Menu card clicked:', menu.id_menu);
      showMenuDetail(menu.id_menu);
    });
    
    // Tambahkan event listener pada tombol detail
    const detailBtn = menuCard.querySelector('.detail-btn');
    detailBtn.addEventListener('click', () => {
      console.log('Detail button clicked:', menu.id_menu);
      showMenuDetail(menu.id_menu);
    });
  }
  
  updateLoadMoreButton();
}

async function showMenuDetail(menuId) {
  console.log('Attempting to show menu detail for ID:', menuId);
  
  const modal = document.getElementById('modal');
  if (!modal) {
    console.error('Modal element not found');
    return;
  }
  
  
  try {
    const menu = await fetchMenuDetail(menuId);
    if (!menu) {
      console.error('No menu data returned for ID:', menuId);
      alert('Gagal memuat detail menu. Silakan coba lagi.');
      return;
    }
    
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

    console.log('Menu data fetched:', menu);
    
    window.currentMenuId = menuId;
    window.currentWarungId = menu.id_warung;
    
    const modalImg = modal.querySelector('.modal-images');
    const modalTitle = modal.querySelector('.modal-header h3');
    const modalDesc = modal.querySelector('.description');
    const modalPrice = modal.querySelector('.price');
    const favoriteIcon = modal.querySelector('.favorite-icon');
    
    modalImg.src = menu.foto || 'images/food2.jpg';
    modalImg.alt = menu.nama_menu;
    modalImg.style.width = '100%';
    modalImg.style.height = '250px';
    modalImg.style.objectFit = 'cover';
    modalTitle.textContent = menu.nama_menu;
    modalDesc.textContent = menu.deskripsi || `${menu.nama_menu} dari ${menu.nama_warung}`;
    modalPrice.textContent = `Rp. ${menu.harga.toLocaleString('id-ID')}`;
    
    if (isLoggedIn()) {
      try {
        const isFavorite = await checkFavoriteStatus(menuId);
        console.log(`Menu is favorite: ${isFavorite}`);
        
        if (isFavorite) {
          favoriteIcon.classList.add('active');
        } else {
          favoriteIcon.classList.remove('active');
        }
        
        favoriteIcon.onclick = function(e) {
          e.stopPropagation();
          e.preventDefault();
          console.log('Favorite icon clicked for menu ID:', menuId);
          toggleFavorite(this, menuId);
        };
      } catch (error) {
        console.error('Error handling favorite status:', error);
        favoriteIcon.classList.remove('active');
      }
      
      if (document.querySelector('.review-form')) {
        document.querySelector('.review-form').style.display = 'block';
      }
      if (document.querySelector('.warning-box')) {
        document.querySelector('.warning-box').style.display = 'none';
      }
    } else {
      if (document.querySelector('.review-form')) {
        document.querySelector('.review-form').style.display = 'none';
      }
      if (document.querySelector('.warning-box')) {
        document.querySelector('.warning-box').style.display = 'block';
      }
      
      favoriteIcon.classList.remove('active');
    }
    
    await loadReviews(menuId);
    
    console.log('Showing modal for menu ID:', menuId);
    modal.style.display = 'flex';
  } catch (error) {
    console.error('Error in showMenuDetail:', error);
    alert('Terjadi kesalahan saat memuat detail menu. Silakan coba lagi.');
  }
}

async function loadReviews(menuId) {
  try {
    const response = await fetch(`/api/reviews/menu/${menuId}`);
    if (!response.ok) throw new Error('Network response was not ok');
    const reviews = await response.json();
    
    const reviewsContainer = document.querySelector('.reviews');
    
    const heading = reviewsContainer.querySelector('h4');
    reviewsContainer.innerHTML = '';
    reviewsContainer.appendChild(heading);
    
    if (reviews.length === 0) {
      const noReviews = document.createElement('p');
      noReviews.textContent = 'Belum ada ulasan';
      reviewsContainer.appendChild(noReviews);
      
      const ratingElement = document.getElementById('menu-rating') || document.querySelector('.modal-header .rating');
      if (ratingElement) {
        ratingElement.textContent = 'Belum ada rating';
      }
      return;
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = (totalRating / reviews.length).toFixed(2);
    
    const ratingElement = document.getElementById('menu-rating') || document.querySelector('.modal-header .rating');
    if (ratingElement) {
      ratingElement.textContent = `${avgRating}★`;
    } else {
      console.warn('Rating element not found in modal header');
    }
    
    reviews.forEach(review => {
      const reviewElement = document.createElement('p');
      reviewElement.innerHTML = `<strong>${review.nama || review.username}:</strong> ${review.komentar || ''} ⭐ ${review.rating}/5`;
      reviewsContainer.appendChild(reviewElement);
    });
  } catch (error) {
    console.error('Error loading reviews:', error);
    const reviewsContainer = document.querySelector('.reviews');
    const heading = reviewsContainer.querySelector('h4');
    reviewsContainer.innerHTML = '';
    reviewsContainer.appendChild(heading);
    
    const errorMsg = document.createElement('p');
    errorMsg.textContent = 'Gagal memuat ulasan';
    reviewsContainer.appendChild(errorMsg);
    
    const ratingElement = document.getElementById('menu-rating') || document.querySelector('.modal-header .rating');
    if (ratingElement) {
      ratingElement.textContent = 'Gagal memuat rating';
    }
  }
}

function updateLoadMoreButton() {
  const paginationContainer = document.querySelector('.pagination-container');
  
  paginationContainer.innerHTML = '';
  
  if (currentPage * ITEMS_PER_PAGE < allMenuItems.length) {
    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.className = 'load-more-btn';
    loadMoreBtn.textContent = 'Lihat lebih banyak';
    loadMoreBtn.addEventListener('click', loadMoreItems);
    paginationContainer.appendChild(loadMoreBtn);
  }
}

function loadMoreItems() {
  currentPage++;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = currentPage * ITEMS_PER_PAGE;
  const nextItems = allMenuItems.slice(startIndex, endIndex);
  
  displayMenus(nextItems, false);
}

async function displayMenusWithPagination(menus) {
  currentPage = 1;
  allMenuItems = menus;
  
  const firstPageItems = menus.slice(0, ITEMS_PER_PAGE);
  await displayMenus(firstPageItems);
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', async () => {
  const menus = await fetchMenus();
  await displayMenusWithPagination(menus);
  
  const filterButtons = document.querySelectorAll('.filter-buttons button');
  filterButtons.forEach((button, index) => {
    button.addEventListener('click', async () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      const categoryId = index + 1;
      const filteredMenus = menus.filter(menu => menu.id_kategori === categoryId);
      await displayMenusWithPagination(filteredMenus);
    });
  });
  
  const searchInput = document.querySelector('.search-input');
  searchInput.addEventListener('input', async () => {
    const searchTerm = searchInput.value.toLowerCase();
    const allMenus = await fetchMenus();
    
    if (searchTerm === '') {
      await displayMenusWithPagination(allMenus);
      return;
    }
    
    const filteredMenus = allMenus.filter(menu => 
      menu.nama_menu.toLowerCase().includes(searchTerm) || 
      menu.nama_warung.toLowerCase().includes(searchTerm)
    );
    
    await displayMenusWithPagination(filteredMenus);
  });
  
  const closeBtn = document.getElementById('close-modal-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      closeModal();
    });
    console.log('Close button event listener added');
  }

  document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal')) {
      closeModal();
    }
  });
});