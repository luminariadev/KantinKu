document.addEventListener("DOMContentLoaded", () => {
    console.log("nav.js mulai dijalankan");

    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");

    if (!hamburger || !navMenu) {
        console.error("Hamburger atau nav-menu tidak ditemukan");
        return;
    }

    hamburger.addEventListener("click", () => {
        console.log("Hamburger diklik");
        navMenu.classList.toggle("active");
        hamburger.querySelector("i").classList.toggle("fa-bars");
        hamburger.querySelector("i").classList.toggle("fa-times");
    });

    navMenu.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", () => {
            console.log("Nav item diklik");
            navMenu.classList.remove("active");
            hamburger.querySelector("i").classList.add("fa-bars");
            hamburger.querySelector("i").classList.remove("fa-times");
        });
    });
});