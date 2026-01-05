// Admin Login page interactions
(function() {

  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');

  // Toggle password visibility
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function() {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      this.classList.toggle('fa-eye');
      this.classList.toggle('fa-eye-slash');
    });
  }

  // Login form submit
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const response = await fetch('/backend/get_admin.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          credentials: 'same-origin',
          body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        });

        const result = await response.text();

        if (result.trim() === 'success') {
          localStorage.setItem('isAdminLoggedIn', 'true');
          localStorage.setItem('authRole', 'admin');
          window.location.href = 'adminDashboard.html';
        } else {
          alert(result); // tampilkan pesan error
        }
      } catch (err) {
        console.error(err);
        alert('Terjadi kesalahan saat login.');
      }
    });
  }

  // Google login placeholder
})();
