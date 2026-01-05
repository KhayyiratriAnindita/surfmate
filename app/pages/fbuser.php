<?php
// Halaman daftar ulasan
?>
<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Ulasan Pengunjung - Pantai Wediombo</title>
  <link rel="stylesheet" href="../style/styles.css">
</head>
<body>

  <main class="container" style="padding:80px 0;">
    <h1 style="text-align:center; color:var(--primary-blue); margin-bottom:2rem;">Ulasan Pengunjung</h1>

    <section id="reviews" class="reviews-list">
      <p id="reviews-empty">Memuat ulasan...</p>
    </section>
  </main>

  <script>
  function escapeHtml(s){
    return String(s).replace(/[&<>"'\/]/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;",'/':'&#x2F;'}[c]; });
  }

  async function loadReviews(){
    try{
      const res = await fetch('/backend/getFeedback.php');
      if(!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      const out = data.length ? data.map(r => `\n      <article class="review-card">\n        <h4>Ulasan #${escapeHtml(r.id_ulasan)}</h4>\n        <time>${new Date(r.tgl_ulasan).toLocaleString()}</time>\n        <p>${escapeHtml(r.isi_ulasan)}</p>\n      </article>`).join('') : '<p>Tidak ada ulasan.</p>';
      document.getElementById('reviews').innerHTML = out;
    }catch(e){
      document.getElementById('reviews').innerHTML = '<p>Gagal memuat ulasan.</p>';
      console.error(e);
    }
  }
  loadReviews();
  </script>
</body>
</html>

  <script>
  function escapeHtml(s){ return String(s).replace(/[&<>\