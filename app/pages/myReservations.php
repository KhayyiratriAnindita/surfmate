<?php
// My Reservations page for logged-in surfers
?>
<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Reservasi Saya - SurfMate</title>
  <link rel="stylesheet" href="../style/styles.css">
</head>
<body>

  <main class="container" style="padding:80px 0;">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
      <h1 style="text-align:center; color:var(--primary-blue); margin-bottom:2rem; flex:1;">Reservasi Saya</h1>
      <div style="margin-left:12px;">
        <button class="btn-primary" id="btnBack">Kembali</button>
        <a href="/index.html" id="btnHomeFallback" style="display:none;">Beranda</a>
      </div>
    </div>

    <section id="my-reservations">
      <div id="reservations-list"></div>
    </section>
  </main>

  <script>
  function fmtCurrency(v){ return 'Rp ' + Number(v).toLocaleString('id-ID'); }
  function escapeHtml(s){ return String(s||'').replace(/[&<>"'\/]/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;",'/':'&#x2F;'}[c]; }); }

  let RES_API_BASE = null; // will hold full path to backend directory

  async function probeGetMyReservationsEndpoint() {
    const candidates = [
      '../backend/get_my_reservasi.php',
      './backend/get_my_reservasi.php',
      '/app/backend/get_my_reservasi.php',
      '/backend/get_my_reservasi.php',
      '/surfmate/app/backend/get_my_reservasi.php',
      '/surfmate/backend/get_my_reservasi.php'
    ];

    for (const p of candidates) {
      try {
        const url = new URL(p, window.location.href).toString();
        const r = await fetch(url, { method: 'GET', credentials: 'same-origin', cache: 'no-store' });
        // If server responds (200 or 403 unauthorized), we accept this candidate
        if (r && (r.status === 200 || r.status === 403 || r.status === 401)) {
          // base is the directory of this url
          const u = new URL(url);
          u.pathname = u.pathname.replace(/get_my_reservasi\.php$/, '');
          RES_API_BASE = u.toString();
          return { status: r.status, response: r };
        }
      } catch (err) {
        // ignore
      }
    }
    return null;
  }

  async function loadMyReservations(){
    try{
      const probe = await probeGetMyReservationsEndpoint();
      if (!probe) throw new Error('No backend endpoint found');

      const res = probe.response;
      if (res.status === 403) {
        // not authorized
        document.getElementById('reservations-list').innerHTML = '<p>Anda belum login. Silakan login terlebih dahulu.</p>';
        return;
      }

      const json = await res.json();
      if (!json.success) throw new Error(json.error||'Server error');
      const rows = json.rows || [];
      if (!rows.length) {
        document.getElementById('reservations-list').innerHTML = '<p>Tidak ada reservasi.</p>';
        return;
      }
      const out = rows.map(r => `
        <article class="reservation-card">
          <h4>${escapeHtml(r.paket || r.nama_paket || 'Paket')}</h4>
          <p><strong>Nama:</strong> ${escapeHtml(r.nama_lengkap)}</p>
          <p><strong>Tanggal:</strong> ${new Date(r.tanggal_reservasi+'T00:00:00').toLocaleDateString('id-ID')}</p>
          <p><strong>Harga:</strong> ${fmtCurrency(r.harga)}</p>
          <p><strong>Status:</strong> ${escapeHtml(r.status)}</p>
          <div style="margin-top:8px">
            ${r.status === 'pending' ? `<button data-id="${r.id_reservasi}" data-action="cancel" class="btn-primary">Batalkan</button>` : (r.status === 'cancelled' ? `<button data-id="${r.id_reservasi}" data-action="undo" class="btn-primary">Urungkan</button>` : ``)}
          </div>
        </article>
      `).join('\n');
      document.getElementById('reservations-list').innerHTML = out;
    }catch(e){
      console.error(e);
      document.getElementById('reservations-list').innerHTML = '<p>Gagal memuat reservasi. Pastikan Anda sudah login dan coba refresh.</p>';
    }
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');
    if (!action || !id) return;
    if (action === 'cancel') {
      if (!confirm('Batalkan reservasi ini?')) return;
      const endpoint = RES_API_BASE ? (RES_API_BASE + 'update_my_reservasi.php') : '/surfmate/app/backend/update_my_reservasi.php';
      fetch(endpoint, {
        method: 'POST', credentials: 'same-origin', headers: {'Content-Type':'application/x-www-form-urlencoded'},
        body: new URLSearchParams({ id: id, status: 'cancelled' }).toString()
      }).then(r=>r.json()).then(j=>{ if (j && j.success) { loadMyReservations(); } else alert('Gagal membatalkan'); }).catch(()=>alert('Gagal'));
    } else if (action === 'undo') {
      const endpoint = RES_API_BASE ? (RES_API_BASE + 'update_my_reservasi.php') : '/surfmate/app/backend/update_my_reservasi.php';
      fetch(endpoint, {
        method: 'POST', credentials: 'same-origin', headers: {'Content-Type':'application/x-www-form-urlencoded'},
        body: new URLSearchParams({ id: id, status: 'pending' }).toString()
      }).then(r=>r.json()).then(j=>{ if (j && j.success) { loadMyReservations(); } else alert('Gagal mengembalikan'); }).catch(()=>alert('Gagal'));
    }
  });

  loadMyReservations();

  // Back button handler: prefer history.back(), fallback to homepage
  document.getElementById('btnBack').addEventListener('click', function(){
    if (history.length > 1) {
      history.back();
    } else {
      window.location.href = '/index.html';
    }
  });
  </script>
</body>
</html>
