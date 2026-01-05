// Modul ulasan: pasang handler submit pada kartu ulasan setelah komponen termuat
export default class Feedback {
    constructor() {}

    init() {
        this.attachWhenReady();
    }

    attachWhenReady() {
        const tryAttach = () => {
            const card = document.querySelector('.feedback-card');
            if (card) {
                this.attach(card);
                return true;
            }
            return false;
        };

        if (!tryAttach()) {
            // Pantau perubahan DOM jika komponen baru termuat belakangan
            const mo = new MutationObserver((mutations, observer) => {
                if (tryAttach()) observer.disconnect();
            });
            mo.observe(document.body, { childList: true, subtree: true });
        }
    }

    attach(card) {
        const btn = card.querySelector('button[type="submit"]');
        const textarea = card.querySelector('.feedback-textarea');
        if (!btn || !textarea) return;

        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const komentar = textarea.value.trim();
            if (!komentar) return alert('Tulis ulasan dulu!');

            try {
                // Gunakan path backend yang konsisten (sudah dimapping via .htaccess)
                const res = await fetch('/backend/createFeedback.php', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ comment: komentar })
                });

                // Coba parse JSON; jika gagal, tampilkan respons mentah untuk debug
                const text = await res.text();
                let data = null;
                try {
                    data = JSON.parse(text);
                } catch (parseErr) {
                    console.warn('Ulasan: respons bukan JSON, raw:', text);
                }

                if (res.status === 401) {
                    alert('Silakan login terlebih dahulu untuk mengirim ulasan.');
                    return;
                }

                if (data && data.success) {
                    alert('Ulasan berhasil dikirim!');
                    textarea.value = '';
                } else {
                    const errMsg = data && data.error ? data.error : text || 'Kesalahan tidak diketahui';
                    alert('Gagal mengirim ulasan: ' + errMsg);
                }
            } catch (err) {
                console.error('Feedback submit error:', err);
                alert('Terjadi kesalahan saat mengirim ulasan');
            }
        });
    }
}
