// Admin Dashboard interactions for managing reservations (COD payments)
(function() {
  // Logout handler
  const logoutBtn = document.getElementById('logoutBtn');

  function clearAuth() {
    try {
      localStorage.removeItem('authRole');
      localStorage.removeItem('isAdminLoggedIn');
    } catch (e) {}
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearAuth();
      // Redirect to role selection as part of logout
      window.location.href = '/app/components/chooseRole.html';
    });
  }

  const surfLessonTableBody = document.getElementById('surfLessonTableBody');

  // Render helper for surf lesson
  function renderSurfLessonRow(item) {
    const tr = document.createElement('tr');
    const price = item.price || 'Rp 0';
    const phone = item.phone || '-';
    const paket = item.package || item.paket || '-';
    tr.innerHTML = `
      <td style="padding:8px; border-bottom:1px solid #e6eef7">${item.id}</td>
      <td style="padding:8px; border-bottom:1px solid #e6eef7">${item.customer || item.name || '-'}</td>
      <td style="padding:8px; border-bottom:1px solid #e6eef7">${paket}</td>
      <td style="padding:8px; border-bottom:1px solid #e6eef7">${item.date}</td>
      <td style="padding:8px; border-bottom:1px solid #e6eef7">${phone}</td>
      <td style="padding:8px; border-bottom:1px solid #e6eef7; font-weight:600; color:#0066cc">${price}</td>
      <td style="padding:8px; border-bottom:1px solid #e6eef7">
        <button class="role-btn primary" data-action="complete" data-type="surf" data-id="${item.id}"><i class="fas fa-flag-checkered"></i> Complete</button>
      </td>
    `;
    return tr;
  }

  // Fetch reservations from backend (pending by default)
  const API_PREFIX = '../backend';
  function loadReservations() {
    console.log('Loading reservations from', `${API_PREFIX}/get_reservasi.php?status=pending`);
    fetch(`${API_PREFIX}/get_reservasi.php?status=pending`, { credentials: 'same-origin', cache: 'no-store' })
      .then(r => r.json())
      .then(json => {
        console.log('get_reservasi response', json);
        if (!json || !json.success) {
          throw new Error(json && json.error ? json.error : 'Invalid response');
        }
        const rows = json.rows || [];
        surfLessonTableBody.innerHTML = '';
        rows.forEach(row => {
          // normalize fields for renderer
          const item = {
            id: row.id_reservasi,
            customer: row.nama_lengkap,
            paket: row.paket || row.nama_paket || '-',
            date: row.tanggal_reservasi,
            phone: row.no_hp,
            price: row.harga
          };
          surfLessonTableBody.appendChild(renderSurfLessonRow(item));
        });
      }).catch(err => {
        console.error('Failed to load reservations', err);
        surfLessonTableBody.innerHTML = '<tr><td colspan="7" style="padding:12px;">Gagal memuat data reservasi surf lesson.</td></tr>';
      });
  }

  // handle action by calling backend
  function handleAction(action, id) {
    if (action !== 'complete') return;
    if (!confirm('Tandai reservasi ini SELESAI?')) return;
    fetch(`${API_PREFIX}/update_reservasi_status.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      credentials: 'same-origin',
      body: new URLSearchParams({ id: id, status: 'complete' }).toString()
    }).then(r => r.json()).then(resp => {
      if (resp && resp.success) {
        alert('Reservasi ditandai selesai.');
        loadReservations();
      } else {
        alert('Gagal memperbarui status: ' + (resp && resp.error ? resp.error : 'Unknown'));
      }
    }).catch(err => {
      console.error('Update failed', err);
      alert('Terjadi kesalahan saat memperbarui status.');
    });
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');
    if (action && id) handleAction(action, id);
  });

  // initial load
  loadReservations();
})();
