console.log('contactForm.js mulai dijalankan');

function initializeForm() {
  console.log('Mencoba menginisialisasi form');

  const forms = document.querySelectorAll("#contact-form");
  if (forms.length > 1) {
    console.warn(`Duplikasi ID 'contact-form' terdeteksi: ${forms.length} form ditemukan`);
  }
  const form = forms[0];
  const messageElement = document.getElementById("form-message");

  if (!form) {
    console.log("Form dengan ID 'contact-form' belum ditemukan, menunggu...");
    return false;
  }

  console.log("Form ditemukan, memasang event listener");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Event submit dipicu");

    const nameInput = document.getElementById("contact-name");
    const emailInput = document.getElementById("contact-email");
    const messageInput = document.getElementById("contact-message");

    if (!nameInput || !emailInput || !messageInput) {
      console.error("Input form tidak ditemukan:", {
        name: !!nameInput,
        email: !!emailInput,
        message: !!messageInput,
      });
      messageElement.textContent = "Terjadi kesalahan pada form.";
      messageElement.style.color = "#e02424";
      return;
    }

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    console.log("Data form sebelum dikirim:", { name, email, message });

    // Validasi sisi klien
    if (!name || !email || !message) {
      messageElement.textContent = "Semua kolom harus diisi!";
      messageElement.style.color = "#e02424";
      console.warn("Validasi gagal: Kolom kosong terdeteksi");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      messageElement.textContent = "Email tidak valid!";
      messageElement.style.color = "#e02424";
      console.warn("Validasi gagal: Email tidak valid");
      return;
    }

    // Kirim data ke backend
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      console.log("Respons server status:", response.status);

      const data = await response.json();
      console.log("Respons server data:", data);

      messageElement.textContent = data.message;
      messageElement.style.color = response.ok ? "#ffd700" : "#e02424";

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengirim pesan");
      }

      form.reset();
      console.log("Form berhasil dikirim, memulai pengalihan ke success.html");

      // Arahkan ke success.html setelah 2 detik
      setTimeout(() => {
        console.log("Mengalihkan ke /success.html");
        window.location.href = "/success.html";
      }, 2000);

    } catch (error) {
      console.error("Error saat mengirim form:", error);
      messageElement.textContent = error.message || "Terjadi kesalahan. Coba lagi.";
      messageElement.style.color = "#e02424";
    }

    // Sembunyikan pesan setelah 5 detik
    setTimeout(() => {
      messageElement.textContent = "";
    }, 5000);
  });

  return true;
}

// Jalankan inisialisasi form
document.addEventListener("DOMContentLoaded", () => {
  console.log('DOMContentLoaded dipicu');

  // Coba inisialisasi langsung
  if (initializeForm()) {
    return;
  }

  // Jika form belum ada, gunakan polling
  const intervalId = setInterval(() => {
    if (initializeForm()) {
      clearInterval(intervalId);
      console.log("Polling selesai, form berhasil diinisialisasi");
    }
  }, 100); // Cek setiap 100ms
});