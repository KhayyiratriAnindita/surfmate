// Interaksi halaman pendaftaran surfer
(function() {
  async function ambilGoogleClientId() {
    try {
      const res = await fetch('/backend/public_config.php', { cache: 'no-store' });
      const data = await res.json().catch(() => null);
      return data && data.googleClientId ? data.googleClientId : null;
    } catch (e) {
      return null;
    }
  }

  function pesanGagalPromptGoogle(notification) {
    try {
      if (notification.isNotDisplayed && notification.isNotDisplayed()) {
        const reason = notification.getNotDisplayedReason ? notification.getNotDisplayedReason() : 'unknown_reason';
        if (reason === 'invalid_client') {
          return 'Client ID Google tidak valid / tidak ditemukan. Pastikan Anda memakai OAuth Client ID jenis "Web application" (bukan Desktop/Android/iOS), dan Client ID-nya benar.';
        }
        if (reason === 'unregistered_origin') {
          const origin = (window && window.location && window.location.origin) ? window.location.origin : 'unknown';
          return 'Origin belum terdaftar di Google Cloud Console. Origin terdeteksi: ' + origin + '. Tambahkan origin tersebut ke Authorized JavaScript origins untuk Client ID yang dipakai.';
        }
        if (reason === 'secure_http_required') {
          return 'Google Sign-In butuh HTTPS (kecuali localhost). Pastikan Anda membuka dari http://localhost:8080 atau pakai HTTPS untuk domain lain.';
        }
        if (reason === 'browser_not_supported') {
          return 'Browser tidak mendukung Google Sign-In. Coba pakai Chrome/Edge versi terbaru.';
        }
        if (reason === 'missing_client_id') {
          return 'Client ID Google belum diatur. Isi GOOGLE_CLIENT_ID di docker-compose.yml lalu recreate container web.';
        }
        // Alasan lain seperti opt_out_or_no_session/suppressed_by_user biasanya bukan error konfigurasi.
        return null;
      }

      if (notification.isSkippedMoment && notification.isSkippedMoment()) {
        const reason = notification.getSkippedReason ? notification.getSkippedReason() : 'unknown_reason';
        if (reason === 'issuing_failed') {
          return 'Google Sign-In gagal memproses permintaan. Coba refresh halaman dan ulangi.';
        }
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  function tungguLibraryGoogle(timeoutMs = 8000) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const cek = () => {
        if (window.google && google.accounts && google.accounts.id) return resolve();
        if (Date.now() - start > timeoutMs) return reject(new Error('Library Google belum siap'));
        setTimeout(cek, 50);
      };
      cek();
    });
  }

  async function daftarDenganGoogle(credential) {
    // Backend akan membuat akun jika belum ada, dan login jika sudah ada.
    const res = await fetch('/backend/google_auth_surfer.php', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ credential })
    });

    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch (e) { data = null; }

    if (!res.ok || !data || !data.success) {
      const msg = (data && data.error) ? data.error : (text || 'Gagal daftar dengan Google');
      throw new Error(msg);
    }

    // Pastikan email pendaftaran adalah email Google
    const emailEl = document.getElementById('email');
    if (emailEl) {
      emailEl.value = data.email || '';
      emailEl.readOnly = true;
    }

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', data.name || 'Surfer');
    localStorage.setItem('authRole', 'surfer');
    window.location.href = '/index.html';
  }
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function() {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      this.classList.toggle('fa-eye');
      this.classList.toggle('fa-eye-slash');
    });
  }

  // Pengecek kekuatan password
  const strengthFill = document.getElementById('strengthFill');
  const strengthText = document.getElementById('strengthText');
  if (passwordInput && strengthFill && strengthText) {
    passwordInput.addEventListener('input', function() {
      const password = this.value;
      let strength = 0;
      if (password.length >= 8) strength++;
      if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
      if (password.match(/[0-9]/)) strength++;
      if (password.match(/[^a-zA-Z0-9]/)) strength++;

      strengthFill.className = 'strength-fill';
      if (password.length === 0) {
        strengthText.textContent = '';
        strengthFill.style.width = '0%';
      } else if (strength <= 2) {
        strengthFill.classList.add('strength-weak');
        strengthText.textContent = 'Lemah';
        strengthText.style.color = '#ff4444';
      } else if (strength === 3) {
        strengthFill.classList.add('strength-medium');
        strengthText.textContent = 'Sedang';
        strengthText.style.color = '#ffaa00';
      } else {
        strengthFill.classList.add('strength-strong');
        strengthText.textContent = 'Kuat';
        strengthText.style.color = '#00cc66';
      }
    });
  }

  // Tangani submit form
  const signupForm = document.getElementById('signupForm');
  const submitBtn = document.getElementById('submitBtn');
  if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const terms = document.getElementById('terms').checked;

  if (!terms) {
    alert('Anda harus menyetujui Syarat & Ketentuan');
    return;
  }
  if (password.length < 8) {
    alert('Password harus minimal 8 karakter');
    return;
  }

  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('password', password);

  try {
    const res = await fetch('/backend/create_surfer.php', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (data.status === 'success') {
      alert(data.message);

      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userName', name);
      localStorage.setItem('authRole', 'surfer');

      window.location.href = 'loginSurfer.html';
    } else {
      alert(data.message);
    }

  } catch (err) {
    alert('Gagal terhubung ke server');
    console.error(err);
  }
});

  }

  // Inisialisasi Google Sign-In saat halaman dimuat
  (async () => {
    const googleSignupBtn = document.getElementById('googleSignupBtn');
    if (!googleSignupBtn) return;

    try {
      const clientId = await ambilGoogleClientId();
      if (!clientId) {
        console.warn('Google Client ID tidak ditemukan');
        googleSignupBtn.addEventListener('click', () => {
          alert('Konfigurasi Google belum diatur. Isi GOOGLE_CLIENT_ID di docker-compose.yml lalu restart.');
        });
        return;
      }

      await tungguLibraryGoogle();

      // Inisialisasi Google Sign-In
      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (resp) => {
          try {
            await daftarDenganGoogle(resp.credential);
          } catch (err) {
            alert(err.message || 'Gagal daftar dengan Google');
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: false
      });

      // Ganti tombol biasa dengan tombol Google resmi
      googleSignupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        google.accounts.id.prompt((notification) => {
          const msg = pesanGagalPromptGoogle(notification);
          if (msg) {
            alert(msg);
          }
        });
      });

    } catch (err) {
      console.error('Error inisialisasi Google Sign-In:', err);
      googleSignupBtn.addEventListener('click', () => {
        alert('Gagal memuat Google Sign-In. Refresh halaman dan coba lagi.');
      });
    }
  })();
})();
