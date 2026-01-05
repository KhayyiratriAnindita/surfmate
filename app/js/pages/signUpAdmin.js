// Admin Signup page interactions
(function() {
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

  // Password strength checker
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

  // Handle form submission
  const signupForm = document.getElementById('signupForm');
  const submitBtn = document.getElementById('submitBtn');
  if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
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

      console.log('Admin signup attempt:', { name, email, password });
      alert('Pendaftaran admin berhasil!');
      // After signup, send to admin login
      window.location.href = 'loginAdmin.html';
    });
  }

  const googleSignupBtn = document.getElementById('googleSignupBtn');
  if (googleSignupBtn) {
    googleSignupBtn.addEventListener('click', function() {
      alert('Fitur daftar admin dengan Google akan segera tersedia!');
      console.log('Admin Google signup clicked');
    });
  }
})();
