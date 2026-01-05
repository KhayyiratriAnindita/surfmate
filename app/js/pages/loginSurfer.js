// Interaksi halaman login surfer
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

  async function loginDenganGoogle(credential) {
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
      const msg = (data && data.error) ? data.error : (text || 'Gagal login dengan Google');
      throw new Error(msg);
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

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  fetch('/backend/get_surfer.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    credentials: 'same-origin',
    body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
  })
  .then(async res => {
    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch(e) { data = null; }
    console.log('Server response:', text);

    if (data && data.success) {
      localStorage.setItem('isLoggedIn', 'true');
      // use server-provided name; fallback to email prefix if missing
      const derivedName = data.name && data.name.trim() ? data.name : (email.split('@')[0]);
      localStorage.setItem('userName', derivedName);
      localStorage.setItem('authRole', 'surfer');
      window.location.href = '/index.html';
    } else {
      const msg = data && data.error ? data.error : text || 'Login gagal';
      alert(msg);
    }
  })
  .catch(err => {
    console.error(err);
    alert('Gagal konek ke server');
  });
});

  }

  const googleLoginBtn = document.getElementById('googleLoginBtn');
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async function() {
      try {
        const clientId = await ambilGoogleClientId();
        if (!clientId) {
          alert('Konfigurasi Google belum diatur. Isi GOOGLE_CLIENT_ID di docker-compose.yml lalu restart.');
          return;
        }

        await tungguLibraryGoogle();

        google.accounts.id.initialize({
          client_id: clientId,
          callback: async (resp) => {
            try {
              await loginDenganGoogle(resp.credential);
            } catch (err) {
              alert(err.message || 'Gagal login dengan Google');
            }
          }
        });

        // Tampilkan prompt Google (One Tap / dialog)
        google.accounts.id.prompt((notification) => {
          const msg = pesanGagalPromptGoogle(notification);
          if (msg) alert(msg);
        });
      } catch (err) {
        console.error(err);
        alert('Gagal memuat login Google');
      }
    });
  }
})();
