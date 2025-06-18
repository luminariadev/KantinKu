let currentRecommendationsPage = 1;
let allRecommendations = [];

async function loadUserRecommendations() {
    console.log('Memulai pemuatan rekomendasi menu...');
    if (!isLoggedIn()) {
        console.log('Pengguna belum login');
        const container = document.getElementById('recommendations-list');
        if (container) {
            container.innerHTML = `
                <div class="no-recommendations">
                    <p>Belum ada rekomendasi menu</p>
                    <p>Login untuk melihat rekomendasi berdasarkan preferensi Anda</p>
                </div>
            `;
        }
        return;
    }

    const container = document.getElementById('recommendations-list');
    if (!container) {
        console.error('Container #recommendations-list tidak ditemukan');
        return;
    }

    container.innerHTML = '<p>Memuat rekomendasi menu...</p>';

    try {
        // Cek sessionStorage untuk rekomendasi yang sudah ada
        const cachedRecommendations = sessionStorage.getItem('recommendations');
        if (cachedRecommendations) {
            allRecommendations = JSON.parse(cachedRecommendations);
            currentRecommendationsPage = 1;
            const firstPageItems = allRecommendations.slice(0, window.ITEMS_PER_PAGE);
            displayRecommendations(firstPageItems, true);
            return;
        }

        // Ambil data menu
        const menuResponse = await authFetch('/api/menu');
        console.log('Respons API menu:', menuResponse.status);
        if (!menuResponse.ok) {
            throw new Error('Gagal memuat data menu');
        }
        const menus = await menuResponse.json();
        console.log('Data menu diterima:', menus);

        let recommendations = [];
        let favorites = [];

        // Coba ambil data favorit
        try {
            const favoritesResponse = await authFetch('/api/favorites');
            console.log('Respons API favorit:', favoritesResponse.status);
            if (favoritesResponse.ok) {
                favorites = await favoritesResponse.json();
                console.log('Data favorit diterima:', favorites);
            }
        } catch (error) {
            console.warn('Endpoint /api/favorites tidak tersedia:', error);
        }

        // Logika rekomendasi
        if (favorites.length > 0) {
            const favoriteMenuIds = favorites.map(fav => fav.id_menu);
            const favoriteWarungIds = menus
                .filter(menu => favoriteMenuIds.includes(menu.id_menu))
                .map(menu => menu.id_warung);

            // Prioritas 1: Menu favorit pengguna
            recommendations = menus.filter(menu => favoriteMenuIds.includes(menu.id_menu));

            // Prioritas 2: Menu dari warung yang sama dengan favorit
            const warungRecommendations = menus.filter(menu => 
                favoriteWarungIds.includes(menu.id_warung) && !favoriteMenuIds.includes(menu.id_menu)
            );
            recommendations = [...recommendations, ...warungRecommendations];
        }

        // Prioritas 3: Menu populer berdasarkan rating dan jumlah ulasan
        if (recommendations.length < window.ITEMS_PER_PAGE) {
            const remainingMenus = menus.filter(menu => 
                !recommendations.includes(menu)
            );
            const popularMenus = await Promise.all(remainingMenus.map(async menu => {
                try {
                    const reviewResponse = await authFetch(`/api/reviews/menu/${menu.id_menu}`);
                    if (reviewResponse.ok) {
                        const reviews = await reviewResponse.json();
                        const avgRating = reviews.length > 0 
                            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
                            : null;
                        return { ...menu, avgRating, reviewCount: reviews.length };
                    }
                } catch (error) {
                    console.warn(`Gagal memuat ulasan untuk menu ${menu.id_menu}:`, error);
                }
                return { ...menu, avgRating: null, reviewCount: 0 };
            }));
            // Urutkan berdasarkan avgRating (descending), lalu reviewCount (descending)
            popularMenus.sort((a, b) => {
                const ratingA = a.avgRating || 0;
                const ratingB = b.avgRating || 0;
                if (ratingB !== ratingA) return ratingB - ratingA;
                return (b.reviewCount || 0) - (a.reviewCount || 0);
            });
            recommendations = [
                ...recommendations,
                ...popularMenus.slice(0, window.ITEMS_PER_PAGE - recommendations.length)
            ];
        }

        // Tambahkan avgRating untuk tampilan
        recommendations = await Promise.all(recommendations.map(async menu => {
            if (menu.avgRating !== undefined) return menu;
            try {
                const ratingResponse = await authFetch(`/api/reviews/menu/${menu.id_menu}`);
                if (ratingResponse.ok) {
                    const reviews = await ratingResponse.json();
                    const avgRating = reviews.length > 0 
                        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
                        : null;
                    return { ...menu, avgRating };
                }
            } catch (error) {
                console.warn(`Gagal memuat rating untuk menu ${menu.id_menu}:`, error);
            }
            return { ...menu, avgRating: null };
        }));

        if (recommendations.length === 0) {
            container.innerHTML = `
                <div class="no-recommendations">
                    <p>Belum ada rekomendasi menu</p>
                    <p>Tambahkan menu favorit untuk rekomendasi yang lebih baik</p>
                </div>
            `;
            return;
        }

        // Simpan rekomendasi ke sessionStorage
        sessionStorage.setItem('recommendations', JSON.stringify(recommendations));

        allRecommendations = recommendations;
        currentRecommendationsPage = 1;
        const firstPageItems = recommendations.slice(0, window.ITEMS_PER_PAGE);
        displayRecommendations(firstPageItems, true);
    } catch (error) {
        console.error('Error memuat rekomendasi:', error);
        container.innerHTML = `
            <div class="no-recommendations">
                <p>Gagal memuat rekomendasi menu</p>
                <p>Silakan coba lagi nanti</p>
            </div>
        `;
    }
}

function displayRecommendations(menus, replace = true) {
    console.log('Menampilkan rekomendasi:', menus);
    const container = document.getElementById('recommendations-list');
    if (!container) return;

    if (replace) {
        container.innerHTML = '';
    }

    menus.forEach(menu => {
        let imageUrl = menu.foto;
        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
            imageUrl = '/' + imageUrl;
        } else if (!imageUrl) {
            imageUrl = 'images/food2.jpg';
        }

        // Potong deskripsi menjadi maksimal 100 karakter
        const shortDescription = menu.deskripsi 
            ? menu.deskripsi.length > 100 
                ? menu.deskripsi.substring(0, 97) + '...' 
                : menu.deskripsi 
            : 'Tidak ada deskripsi';

        const item = document.createElement('div');
        item.className = 'menu-card';
        item.dataset.menuId = menu.id_menu;
        item.innerHTML = `
            <img src="${imageUrl}" alt="${menu.nama_menu}" class="menu-image" onerror="this.src='images/food2.jpg'" />
            <div class="menu-info">
                <h3 class="menu-name">${menu.nama_menu}</h3>
                <p class="menu-description">${shortDescription}</p>
                <p class="menu-price">${formatPrice(menu.harga)}</p>
                <p class="menu-warung"><i class="fas fa-store"></i> ${menu.nama_warung || 'Tidak diketahui'}</p>
                <div class="menu-rating"><i class="fas fa-star"></i> ${menu.avgRating ? menu.avgRating.toFixed(1) : 'N/A'}</div>
            </div>
        `;

        container.appendChild(item);

        item.addEventListener('click', () => {
            showMenuDetail(menu.id_menu);
        });
    });

    updateRecommendationsLoadMoreButton();
}

function updateRecommendationsLoadMoreButton() {
    console.log('Memperbarui tombol Lihat Lebih Banyak untuk rekomendasi. Total:', allRecommendations.length);
    const paginationContainer = document.getElementById('recommendations-pagination');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';

    if (currentRecommendationsPage * window.ITEMS_PER_PAGE < allRecommendations.length) {
        console.log('Menambahkan tombol Lihat Lebih Banyak');
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.className = 'load-more-btn';
        loadMoreBtn.textContent = 'Lihat Lebih Banyak';
        loadMoreBtn.addEventListener('click', loadMoreRecommendations);
        paginationContainer.appendChild(loadMoreBtn);
    }
}

function loadMoreRecommendations() {
    console.log('Memuat lebih banyak rekomendasi, halaman:', currentRecommendationsPage + 1);
    currentRecommendationsPage++;
    const startIndex = (currentRecommendationsPage - 1) * window.ITEMS_PER_PAGE;
    const endIndex = currentRecommendationsPage * window.ITEMS_PER_PAGE;
    const nextItems = allRecommendations.slice(startIndex, endIndex);

    displayRecommendations(nextItems, false);
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('recommendations-list')) {
        loadUserRecommendations();
    }
});