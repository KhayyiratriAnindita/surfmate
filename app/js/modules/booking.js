// Booking Module, Modal booking dan form handling

import { DOM } from '../utils/dom.js';

class Booking {
    constructor() {
        this.pakets = {};
        this.init();
    }
    
    // Inisialisasi tombol booking
    init() {
        // Muat daftar paket lebih awal agar modal bisa terisi
        this.API_PREFIX = '/app/backend';
        this.loadPaket();
        this.setupBookingButtons();
        this.setupContactButton();
    }

    async loadPaket() {
        try {
            const res = await fetch(this.API_PREFIX + '/getPaket.php', { cache: 'no-store', credentials: 'same-origin' });
            if (!res.ok) return;
            const text = await res.text();
            try {
                const data = JSON.parse(text);
                this.pakets = {};
                data.forEach(p => { this.pakets[String(p.id_paket)] = p; });
            } catch (parseErr) {
                console.error('Failed to parse paket JSON:', text);
            }
        } catch (e) {
            console.error('Failed to load paket list', e);
        }
    }
    
    // Setup booking buttons untuk facilities
    setupBookingButtons() {
        const buttons = DOM.selectAll('.facility-card .btn-primary');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const card = button.closest('.facility-card');
                const title = card.querySelector('h3').textContent;
                
                if (title.includes('Reservasi')) {
                    e.preventDefault();
                    this.showBookingModal(title);
                }
            });
        });
    }
    
    // Show booking modal dengan form surf lesson
    async showBookingModal(title) {
        const modal = DOM.createElement('div', 'booking-modal');
        
        // Ambil nama surfer dari database
        let surferName = '';
        try {
            const res = await fetch(this.API_PREFIX + '/get_surfer.php', {
                method: 'GET',
                credentials: 'same-origin'
            });
            if (res.ok) {
                const data = await res.json();
                surferName = data.name || localStorage.getItem('userName') || '';
            }
        } catch (e) {
            console.error('Failed to get surfer data:', e);
            surferName = localStorage.getItem('userName') || '';
        }
        
        const formHTML = `
            <div class="form-group">
                <label for="package">Pilih Paket</label>
                <select id="package" required>
                    <option value="">Pilih Paket</option>
                </select>
            </div>
            <div class="form-group">
                <label for="date">Tanggal Reservasi</label>
                <input type="date" id="date" required>
            </div>
            <div class="form-group">
                <label for="phone">Nomor HP</label>
                <input type="tel" id="phone" placeholder="Contoh: 081234567890" required>
            </div>
            <div class="form-group">
                <label>Harga Paket: <span id="priceDisplay">Rp 0</span></label>
            </div>
            <div class="payment-info" style="background: #e7f3ff; border-left: 4px solid #0066cc; padding: 12px; margin: 16px 0; border-radius: 8px;">
                <p style="margin: 0; color: #003366; font-weight: 600; font-size: 0.9rem;">
                    <i class="fas fa-info-circle" style="color: #0066cc;"></i> 
                    Metode Pembayaran: <strong>COD (Bayar di Tempat)</strong>
                </p>
                <p style="margin: 8px 0 0 0; color: #555; font-size: 0.85rem;">
                    Pembayaran dilakukan langsung saat Anda tiba di Pantai Wediombo
                </p>
            </div>
        `;
        
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <div>
                            <h3>${title}</h3>
                            <div class="modal-subtitle"><small id="selectedDateDisplay"></small></div>
                        </div>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="bookingForm">
                            ${formHTML}
                            <button type="submit" class="btn-primary">Kirim Pesanan</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.addModalStyles();
        
        this.setupModalListeners(modal, surferName);
    }

    // Setup modal listeners dan hitung harga paket
    setupModalListeners(modal, surferName) {
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        const form = modal.querySelector('#bookingForm');
        const priceDisplay = modal.querySelector('#priceDisplay');
        const packageSelect = modal.querySelector('#package');
        const dateInput = modal.querySelector('#date');
        const selectedDateDisplay = modal.querySelector('#selectedDateDisplay');
        
        const updatePrice = () => {
            const packageVal = packageSelect.value;
            const paket = this.pakets[String(packageVal)];
            const price = paket ? Number(paket.harga) : 0;

            if (price > 0) {
                priceDisplay.textContent = new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0
                }).format(price);
            } else {
                priceDisplay.textContent = 'Rp 0';
            }
        };
        
        if (packageSelect) {
            packageSelect.addEventListener('change', updatePrice);
            // Isi pilihan paket dari data server
            this.populatePackages(packageSelect);
        }

        // Set tanggal default ke hari ini agar langsung terlihat
        if (dateInput) {
            const today = new Date();
            dateInput.value = today.toISOString().split('T')[0];
        }

        // Pastikan teks tanggal terlihat (paksa warna) dan tampilkan format di header
        if (dateInput) {
            dateInput.style.color = 'var(--black)';
            const updateDateDisplay = () => {
                const d = dateInput.value;
                if (!selectedDateDisplay) return;
                if (d) {
                    selectedDateDisplay.textContent = new Date(d + 'T00:00:00').toLocaleDateString('id-ID', {
                        day: '2-digit', month: 'long', year: 'numeric'
                    });
                } else {
                    selectedDateDisplay.textContent = '';
                }
            };
            updateDateDisplay();
            dateInput.addEventListener('change', updateDateDisplay);
        }
        
        closeBtn.addEventListener('click', () => {
            DOM.remove(modal);
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                DOM.remove(modal);
            }
        });
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            // Wajib login
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            if (!isLoggedIn) {
                if (confirm('Anda harus login terlebih dahulu untuk melakukan reservasi. Login sekarang?')) {
                    window.location.href = '/surfmate/app/components/loginSurfer.html';
                }
                return;
            }
            // Ambil nama dari data surfer (dikirim dari showBookingModal)
            const name = surferName;
            const packageVal = form.querySelector('#package').value;
            const phone = form.querySelector('#phone').value.trim();
            const date = form.querySelector('#date').value;

            // Validasi sisi klien (dasar)
            const clientErrors = [];
            if (!packageVal) clientErrors.push('Silakan pilih paket.');
            if (!date) clientErrors.push('Tanggal reservasi wajib diisi.');
            if (!phone) clientErrors.push('Nomor HP wajib diisi.');
            if (clientErrors.length) {
                alert('Perbaiki form:\n' + clientErrors.join('\n'));
                return;
            }

            // Kirim ke backend
            const payload = new URLSearchParams();
            payload.append('nama_lengkap', name);
            payload.append('id_paket', packageVal);
            payload.append('tanggal_reservasi', date);
            payload.append('no_hp', phone);

            fetch(this.API_PREFIX + '/create_reservasi.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: payload.toString(),
                credentials: 'same-origin'
            }).then(r => r.json()).then(data => {
                if (data && data.success) {
                    const paketName = (this.pakets && this.pakets[packageVal]) ? this.pakets[packageVal].nama_paket : (data.paket || (packageSelect.options[packageSelect.selectedIndex].text.split(' - ')[0] || 'Paket'));
                    alert(`Terima kasih, ${name}! Reservasi Anda berhasil.\nPaket: ${paketName}\nTanggal: ${new Date(date + 'T00:00:00').toLocaleDateString('id-ID')}\nHarga: Rp ${Number(data.harga).toLocaleString('id-ID')}`);
                    // Opsional simpan ke localStorage untuk pengguna yang sudah login
                    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
                    if (isLoggedIn) {
                        const reservations = JSON.parse(localStorage.getItem('userReservations') || '[]');
                        reservations.push({
                            package: paketName,
                            name: name,
                            phone: phone,
                            price: `Rp ${Number(data.harga).toLocaleString('id-ID')}`,
                            date: new Date(date + 'T00:00:00').toLocaleDateString('id-ID')
                        });
                        localStorage.setItem('userReservations', JSON.stringify(reservations));
                    }
                    DOM.remove(modal);
                } else {
                    const errMsg = data && (data.error || (data.errors && data.errors.join('\n'))) ? (data.error || data.errors.join('\n')) : 'Gagal menyimpan reservasi.';
                    alert('Error: ' + errMsg);
                }
            }).catch(err => {
                console.error('Reservasi error', err);
                alert('Terjadi kesalahan saat mengirim reservasi. Coba lagi.');
            });
        });
    }

    showReservationConfirmation(info) {
        const modal = DOM.createElement('div', 'booking-modal confirmation-modal');
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <div>
                            <h3>Reservasi Berhasil</h3>
                            <div class="modal-subtitle"><small>ID: ${info.id}</small></div>
                        </div>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p><strong>Nama:</strong> ${info.nama}</p>
                        <p><strong>Paket:</strong> ${info.paket}</p>
                        <p><strong>Tanggal:</strong> ${new Date(info.tanggal+'T00:00:00').toLocaleDateString('id-ID')}</p>
                        <p><strong>Harga:</strong> Rp ${Number(info.harga).toLocaleString('id-ID')}</p>
                        <p><strong>No HP:</strong> ${info.no_hp || ''}</p>
                        <div style="display:flex; gap:12px; margin-top:16px;">
                            <button class="btn-primary btn-confirm">Tutup</button>
                            <button class="btn-primary btn-copy">Salin Detail</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.addModalStyles();

        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        const btnClose = modal.querySelector('.btn-confirm');
        const btnCopy = modal.querySelector('.btn-copy');

        const remove = () => DOM.remove(modal);
        closeBtn.addEventListener('click', remove);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) remove(); });
        btnClose.addEventListener('click', remove);
        btnCopy.addEventListener('click', () => {
            const text = `ID: ${info.id}\nNama: ${info.nama}\nPaket: ${info.paket}\nTanggal: ${info.tanggal}\nHarga: Rp ${Number(info.harga).toLocaleString('id-ID')}`;
            navigator.clipboard?.writeText(text).then(() => alert('Detail disalin ke clipboard')).catch(() => alert('Gagal menyalin'));
        });
    }
    
    // Pasang handler tombol kontak
    setupContactButton() {
        const contactButtons = DOM.selectAll('.facility-card .btn-primary');
        
        contactButtons.forEach(button => {
            if (button.textContent.includes('Kontak')) {
                button.addEventListener('click', () => {
                    alert('Hubungi kami di:\n📞 +62 812-3456-7890\n📧 info@wediombo-surf.com\n📍 Pantai Wediombo, Gunungkidul');
                });
            }
        });
    }

    async populatePackages(selectElement) {
        if (!selectElement) return;
        if (!this.pakets || Object.keys(this.pakets).length === 0) {
            await this.loadPaket();
        }

        // Biarkan opsi placeholder pertama
        selectElement.innerHTML = '<option value="">Pilih Paket</option>';
        Object.values(this.pakets).forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id_paket;
            opt.textContent = `${p.nama_paket} - Rp ${Number(p.harga).toLocaleString('id-ID')}`;
            selectElement.appendChild(opt);
        });
        selectElement.dispatchEvent(new Event('change'));
    }
    
    // Tambahkan gaya untuk modal
    addModalStyles() {
        const styles = `
            .booking-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 3000;
            }
            .modal-overlay {
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease;
            }
            .modal-content {
                background: white;
                border-radius: 15px;
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                animation: slideUp 0.3s ease;
            }
            .modal-header {
                padding: 1.5rem;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .modal-header h3 {
                color: var(--primary-blue);
                margin: 0;
            }
            .modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #666;
                transition: color 0.3s ease;
            }
            .modal-close:hover {
                color: var(--danger);
            }
            .modal-body {
                padding: 1.5rem;
            }
            .form-group {
                margin-bottom: 1rem;
            }
            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                color: var(--primary-blue);
                font-weight: 500;
            }
            /* Bikin input/select satu baris berbentuk pil */
            .form-group input[type="text"],
            .form-group input[type="tel"],
            .form-group input[type="date"],
            .form-group select {
                width: 100%;
                padding: 0.75rem 1.25rem;
                border: 2px solid #eee;
                border-radius: 999px; /* pill */
                font-family: inherit;
                transition: border-color 0.3s ease;
                box-sizing: border-box;
            }
            /* Textarea tetap sedikit membulat tapi tidak full pil */
            .form-group textarea {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid #eee;
                border-radius: 12px;
                font-family: inherit;
                transition: border-color 0.3s ease;
                box-sizing: border-box;
            }
            .form-group input:focus,
            .form-group textarea:focus,
            .form-group select:focus {
                outline: none;
                border-color: var(--primary-blue);
            }
            /* Spesifikkan gaya tombol modal agar tidak menimpa tombol global */
            .booking-modal .btn-primary {
                background: var(--primary-blue);
                color: white;
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: background 0.3s ease;
                width: 100%;
            }
            .booking-modal .btn-primary:hover {
                background: #0056b3;
            }

            /* Pastikan teks input tanggal terlihat di modal */
            .booking-modal .form-group input[type="date"] {
                color: var(--black) !important;
                background: #fff !important;
                -webkit-text-fill-color: var(--black) !important; /* Chromium-based Edge */
                appearance: none !important;
                -webkit-appearance: none !important;
            }
            @keyframes slideUp {
                from {
                    transform: translateY(50px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
        `;
        
        DOM.addStyle(styles);
    }
}

export default Booking;
