let currentReviewsPage = 1;
let allReviews = [];

async function loadUserReviews() {
    console.log('Memulai pemuatan riwayat ulasan...');
    try {
        if (!isLoggedIn()) {
            console.log('Pengguna belum login');
            const reviewsContainer = document.getElementById('user-reviews');
            if (reviewsContainer) {
                reviewsContainer.innerHTML = `
                    <p class="no-reviews">Anda belum memberikan ulasan</p>
                `;
            }
            return;
        }

        const response = await authFetch('/api/reviews/user');
        console.log('Respons API ulasan:', response.status);
        if (!response.ok) throw new Error(`Respons jaringan bermasalah: ${response.status} ${response.statusText}`);
        const reviews = await response.json();

        console.log('Data ulasan diterima:', reviews);
        const reviewsContainer = document.getElementById('user-reviews');
        if (!reviewsContainer) {
            console.error('Container #user-reviews tidak ditemukan');
            return;
        }

        if (!reviews || reviews.length === 0) {
            console.log('Tidak ada ulasan ditemukan');
            reviewsContainer.innerHTML = `
                <p class="no-reviews">Anda belum memberikan ulasan</p>
            `;
            return;
        }

        allReviews = reviews;
        currentReviewsPage = 1;
        const firstPageItems = reviews.slice(0, window.ITEMS_PER_PAGE);
        displayReviews(firstPageItems, true);
    } catch (error) {
        console.error('Error memuat riwayat ulasan:', error);
        const reviewsContainer = document.getElementById('user-reviews');
        if (reviewsContainer) {
            reviewsContainer.innerHTML = `
                <p class="error-message">Gagal memuat ulasan: ${error.message}</p>
            `;
        }
    }
}

function displayReviews(reviews, replace = true) {
    console.log('Menampilkan ulasan:', reviews);
    const reviewsContainer = document.getElementById('user-reviews');
    if (!reviewsContainer) return;

    if (replace) {
        reviewsContainer.innerHTML = '';
    }

    reviews.forEach(review => {
        const reviewElement = document.createElement('div');
        reviewElement.className = 'review-item';
        reviewElement.innerHTML = `
            <div class="review-header">
                <h4>${review.nama_warung} - ${review.nama_menu || 'Menu'}</h4>
                <span class="review-rating">${review.rating}★</span>
            </div>
            <p class="review-comment">${review.komentar || '(Tidak ada komentar)'}</p>
            <p class="review-date">Ditulis pada: ${formatDate(review.tanggal)}</p>
        `;
        reviewsContainer.appendChild(reviewElement);
    });

    updateReviewsLoadMoreButton();
}

function updateReviewsLoadMoreButton() {
    console.log('Memperbarui tombol Lihat Lebih Banyak untuk ulasan. Total ulasan:', allReviews.length);
    const paginationContainer = document.getElementById('reviews-pagination');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';

    if (currentReviewsPage * window.ITEMS_PER_PAGE < allReviews.length) {
        console.log('Menambahkan tombol Lihat Lebih Banyak');
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.className = 'load-more-btn';
        loadMoreBtn.textContent = 'Lihat Lebih Banyak';
        loadMoreBtn.addEventListener('click', loadMoreReviews);
        paginationContainer.appendChild(loadMoreBtn);
    }
}

function loadMoreReviews() {
    console.log('Memuat lebih banyak ulasan, halaman:', currentReviewsPage + 1);
    currentReviewsPage++;
    const startIndex = (currentReviewsPage - 1) * window.ITEMS_PER_PAGE;
    const endIndex = currentReviewsPage * window.ITEMS_PER_PAGE;
    const nextItems = allReviews.slice(startIndex, endIndex);

    displayReviews(nextItems, false);
}

function setupReviewForm() {
    console.log('Mengatur form ulasan...');
    const modal = document.getElementById('modal');
    if (!modal) {
        console.log('Modal tidak ditemukan, melewati pengaturan form ulasan');
        return;
    }

    const stars = modal.querySelectorAll('.star-rating i');
    if (!stars.length) {
        console.log('Tidak ada elemen star-rating ditemukan di modal');
        return;
    }
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            window.selectedRating = rating;
            
            stars.forEach(s => {
                const starRating = parseInt(s.getAttribute('data-rating'));
                if (starRating <= rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });
    
    const submitButton = modal.querySelector('#submit-review');
    if (submitButton) {
        submitButton.addEventListener('click', submitReview);
    } else {
        console.log('Tombol submit-review tidak ditemukan');
    }
}

async function submitReview() {
    console.log('Mengirim ulasan...');
    if (!isLoggedIn()) {
        console.log('Pengguna belum login untuk mengirim ulasan');
        alert('Silakan login terlebih dahulu untuk memberikan ulasan');
        return;
    }
    
    if (!window.selectedRating) {
        console.log('Rating belum dipilih');
        alert('Silakan pilih rating terlebih dahulu');
        return;
    }
    
    const menuId = window.currentMenuId;
    const warungId = window.currentWarungId;
    
    if (!warungId || !menuId) {
        console.error('ID warung atau menu tidak ditemukan:', { menuId, warungId });
        alert('Terjadi kesalahan: ID warung atau menu tidak ditemukan');
        return;
    }
    
    try {
        const komentar = document.getElementById('review-comment')?.value || '';
        
        console.log('Data ulasan yang dikirim:', { id_warung: warungId, id_menu: menuId, rating: window.selectedRating, komentar });
        const response = await authFetch('/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_warung: warungId,
                id_menu: menuId,
                rating: window.selectedRating,
                komentar: komentar
            })
        });
        
        console.log('Respons API submit ulasan:', response.status);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Gagal menambahkan ulasan');
        }
        
        const result = await response.json();
        
        if (result.success) {
            console.log('Ulasan berhasil ditambahkan:', result);
            document.getElementById('review-comment').value = '';
            window.selectedRating = 0;
            document.querySelectorAll('.star-rating i').forEach(star => {
                star.classList.remove('active');
            });
            
            // Muat ulang ulasan di modal
            if (typeof loadReviews === 'function') {
                loadReviews(menuId);
            }
            
            alert('Ulasan berhasil ditambahkan');
            // Muat ulang ulasan di halaman profil
            if (document.getElementById('user-reviews')) {
                loadUserReviews();
            }
        } else {
            console.error('Gagal menambahkan ulasan:', result.message);
            alert(`Gagal menambahkan ulasan: ${result.message || 'Terjadi kesalahan'}`);
        }
    } catch (error) {
        console.error('Error mengirim ulasan:', error);
        alert(`Gagal menambahkan ulasan: ${error.message || 'Terjadi kesalahan'}`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Inisialisasi user-reviews.js');
    setupReviewForm();
    if (document.getElementById('user-reviews')) {
        loadUserReviews();
    }
});