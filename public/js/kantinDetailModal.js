document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("kantin-modal");
    const closeBtn = modal.querySelector(".close-btn");

    const fallbackCanteens = [
        {
            id: "teh-poci",
            name: "Teh Poci",
            description: "Minuman panas dan dingin, capcin",
            location: "Kantin merah",
            hours: "07.00-16.00",
            contact: "#",
            image: "images/kantin1.jpg"
        },
        {
            id: "teh-teke",
            name: "Kantin Teh Teke",
            description: "Spesialis ayam krispi",
            location: "Kantin merah",
            hours: "08.00-17.00",
            contact: "https://wa.me/6282125356692",
            image: "images/kantin1.jpg"
        },
        {
            id: "patuanan",
            name: "Patuanan",
            description: "Spesialis Nasi goreng Otokowok",
            location: "Kantin merah",
            hours: "08.00-20.00",
            contact: "https://wa.me/628994133177",
            image: "images/kantin1.jpg"
        },
        {
            id: "mbak-annisa",
            name: "Mbak Annisa",
            description: "Makanan berat dan sambal juara",
            location: "Kantin merah",
            hours: "07.00-16.00",
            contact: "https://wa.me/628989548348",
            image: "images/kantin1.jpg"
        },
        {
            id: "ice-cube",
            name: "Ice Cube",
            description: "Spesialis es krim dan minuman segar",
            location: "Kantin merah",
            hours: "10.00-18.00",
            contact: "https://wa.me/628989548348",
            image: "images/kantin1.jpg"
        },
        {
            id: "bunda-gorowok",
            name: "Bunda Gorowok",
            description: "Spesialis gorengan murah meriah",
            location: "Kantin merah",
            hours: "06.00-17.00",
            contact: "https://wa.me/628989548348",
            image: "images/kantin1.jpg"
        },
        {
            id: "barokah",
            name: "Barokah",
            description: "Menyediakan makanan berat dan ringan",
            location: "Kantin merah",
            hours: "07.00-16.00",
            contact: "https://wa.me/628989548348",
            image: "images/kantin1.jpg"
        },
        {
            id: "gera-ice-cream",
            name: "Gera Ice Cream",
            description: "Spesialis ice cream berbagai rasa",
            location: "Kantin merah",
            hours: "10.00-18.00",
            contact: "#",
            image: "images/kantin1.jpg"
        },
        {
            id: "jajanan-kekinian",
            name: "Kantin Jajanan Kekinian",
            description: "Menyediakan jajanan modern dan minuman segar",
            location: "Kantin Merah",
            hours: "08.00-17.00",
            contact: "https://wa.me/6281234567892",
            image: "images/kantin1.jpg"
        },
        {
            id: "mah-ica-2",
            name: "Kantin Mah Ica 2",
            description: "Makanan tradisional dan modern dengan cita rasa khas",
            location: "Kantin Merah",
            hours: "07.00-16.00",
            contact: "https://wa.me/6281234567893",
            image: "images/kantin1.jpg"
        },
        {
            id: "warmindo",
            name: "Warmindo",
            description: "Menyediakan makanan cepat saji seperti mie dan nasi goreng",
            location: "Kantin Merah",
            hours: "08.00-20.00",
            contact: "https://wa.me/6281234567894",
            image: "images/kantin1.jpg"
        },
        {
            id: "mbak-shopie",
            name: "Kantin Mbak Shopie",
            description: "Makanan tradisional dengan cita rasa rumahan",
            location: "Kantin Merah",
            hours: "07.00-16.00",
            contact: "https://wa.me/6281234567895",
            image: "images/kantin1.jpg"
        }
    ];

    function openModal() {
        modal.style.display = "flex";
    }

    function closeModal() {
        modal.style.display = "none";
    }

    function fillModal(canteenId) {
        const canteen = fallbackCanteens.find(c => c.id === canteenId) || {
            name: "Kantin Tidak Dikenal",
            description: "Informasi detail belum tersedia",
            location: "Tidak diketahui",
            hours: "Tidak diketahui",
            contact: "#",
            image: "images/kantin1.jpg"
        };

        document.getElementById('modal-image').src = canteen.image;
        document.getElementById('modal-name').textContent = canteen.name;
        document.getElementById('modal-description').textContent = canteen.description;
        document.getElementById('modal-location').textContent = canteen.location;
        document.getElementById('modal-hours').textContent = canteen.hours;
        document.getElementById('modal-whatsapp').href = canteen.contact;

        openModal();
    }

    closeBtn.addEventListener("click", closeModal);

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    window.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.style.display === "flex") {
            closeModal();
        }
    });

    window.showKantinModal = fillModal;
});