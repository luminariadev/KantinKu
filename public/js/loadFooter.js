document.addEventListener("DOMContentLoaded", () => {
  console.log("Mencoba memuat footer dari: /footer.html");

  const footerElement = document.getElementById('footer');
  if (!footerElement) {
    console.error('Elemen dengan ID "footer" tidak ditemukan');
    return;
  }

  // Cegah pemuatan ganda
  if (footerElement.querySelector('footer')) {
    console.warn('Footer sudah ada, membatalkan pemuatan ulang');
    return;
  }

  fetch('/footer.html')
    .then(res => {
      console.log("Status respons:", res.status, res.statusText);
      if (!res.ok) throw new Error(`Gagal memuat footer.html: ${res.status}`);
      return res.text();
    })
    .then(data => {
      footerElement.innerHTML = data;
      console.log('Footer berhasil dimuat');
    })
    .catch(err => {
      console.error('Error memuat footer:', err);
      footerElement.innerHTML = `<footer class="footer"><p>Error loading footer. Please try again later.</p></footer>`;
    });
});