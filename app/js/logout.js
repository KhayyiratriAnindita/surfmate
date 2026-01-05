// logout.js
(async function() {
  try {
    // Attempt server-side logout to destroy PHP session
    await fetch('../backend/logout.php', { method: 'POST', credentials: 'same-origin' });
  } catch (e) {
    console.warn('Server logout failed', e);
  }

  // Clear client-side state
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userName');
  localStorage.removeItem('authRole');

  // optional: hapus semua storage
  // localStorage.clear();

  window.location.href = 'loginSurfer.html';
})();
