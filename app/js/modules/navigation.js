// Navigation Module, Menangani mobile menu toggle dan smooth scrolling

import { DOM } from '../utils/dom.js';

class Navigation {
    constructor() {
        this.hamburger = DOM.select('.hamburger');
        this.navMenu = DOM.select('.nav-menu');
        this.navLinks = DOM.selectAll('.nav-link');
        this.navbar = DOM.select('.navbar');
        
        this.init();
    }
    
    // Initialize navigation listeners
    init() {
        this.setupMobileMenu();
        this.setupSmoothScroll();
        this.setupNavbarScroll();
        this.setupProfileToggle();
        this.checkLoginState();
    }
    
    // Setup mobile menu toggle
    setupMobileMenu() {
        if (!this.hamburger) return;

        const closeMenu = () => {
            this.hamburger.classList.remove('active');
            this.navMenu?.classList.remove('active');
        };
        
        this.hamburger.addEventListener('click', () => {
            this.hamburger.classList.toggle('active');
            this.navMenu.classList.toggle('active');
        });

        // Auto-close menu when scrolling or clicking outside so it doesn't block page interactions
        window.addEventListener('scroll', closeMenu, { passive: true });
        document.addEventListener('click', (e) => {
            const insideNav = this.navMenu?.contains(e.target);
            const onHamburger = this.hamburger.contains(e.target);
            if (!insideNav && !onHamburger) closeMenu();
        });
    }
    
    // Setup smooth scrolling untuk navigation links
    setupSmoothScroll() {
        this.navLinks.forEach(link => {
            // Close mobile menu saat click
            link.addEventListener('click', () => {
                this.hamburger?.classList.remove('active');
                this.navMenu?.classList.remove('active');
            });
            
            // Smooth scroll
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 70;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    // Setup navbar scroll effect
    setupNavbarScroll() {
        if (!this.navbar) return;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                this.navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                this.navbar.style.boxShadow = '0 5px 30px rgba(0, 0, 0, 0.15)';
            } else {
                this.navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                this.navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            }
        });
    }
    
    // Setup profile toggle dropdown
    setupProfileToggle() {
        const profileToggle = document.getElementById('profileToggle');
        const profileDropdown = document.getElementById('profileDropdown');
        
        if (!profileToggle || !profileDropdown) return;
        
        // Toggle dropdown on click
        profileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('active');
            profileToggle.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!profileToggle.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.remove('active');
                profileToggle.classList.remove('active');
            }
        });
        
        // Close dropdown when clicking on item
        const dropdownItems = profileDropdown.querySelectorAll('.profile-dropdown-item');
        dropdownItems.forEach(item => {
            item.addEventListener('click', () => {
                profileDropdown.classList.remove('active');
                profileToggle.classList.remove('active');
            });
        });
        
        // Close dropdown when scrolling
        window.addEventListener('scroll', () => {
            profileDropdown.classList.remove('active');
            profileToggle.classList.remove('active');
        });
        
        // Update greeting based on time
        this.updateGreeting();
    }
    
    // Check login state dan update UI
    async checkLoginState() {
        const profileToggle = document.getElementById('profileToggle');
        const loggedInProfile = document.getElementById('loggedInProfile');
        const surferNameDisplay = document.getElementById('surferNameDisplay');
        const loggedInProfileToggle = document.getElementById('loggedInProfileToggle');
        const loggedInProfileDropdown = document.getElementById('loggedInProfileDropdown');
        const logoutBtn = document.getElementById('logoutBtn');
        const myReservationsDropdownLink = document.getElementById('myReservationsDropdownLink');
        const deleteAccountBtn = document.getElementById('deleteAccountBtn');

        // Kondisi default
        if (profileToggle) profileToggle.style.display = 'flex';
        if (loggedInProfile) loggedInProfile.style.display = 'none';
        if (myReservationsDropdownLink) myReservationsDropdownLink.style.display = 'none';

        // Cek session di server terlebih dahulu (lebih akurat daripada localStorage).
        try {
            const resp = await fetch('/backend/session_status.php', {
                credentials: 'same-origin',
                cache: 'no-store'
            });

            if (resp) {
                try {
                    const js = await resp.json();
                    if (js && js.success && js.loggedIn) {
                        // Server menganggap user sedang login
                        const name = (js.name && js.name.trim()) ? js.name : (localStorage.getItem('userName') || '');
                        if (profileToggle) profileToggle.style.display = 'none';
                        if (loggedInProfile) loggedInProfile.style.display = 'block';
                        if (surferNameDisplay) surferNameDisplay.textContent = name || (js.isAdmin ? 'Admin' : 'Surfer');

                        // Pasang handler dropdown untuk profil yang sedang login
                        if (loggedInProfileToggle && loggedInProfileDropdown) {
                            loggedInProfileToggle.addEventListener('click', (e) => {
                                e.stopPropagation();
                                loggedInProfileDropdown.classList.toggle('active');
                                loggedInProfileToggle.classList.toggle('active');
                            });
                            document.addEventListener('click', (e) => {
                                if (!loggedInProfileToggle.contains(e.target) && !loggedInProfileDropdown.contains(e.target)) {
                                    loggedInProfileDropdown.classList.remove('active');
                                    loggedInProfileToggle.classList.remove('active');
                                }
                            });
                        }

                        // Tampilkan menu sesuai peran
                        if (js.isAdmin) {
                            if (myReservationsDropdownLink) myReservationsDropdownLink.style.display = 'none';
                            if (deleteAccountBtn) deleteAccountBtn.style.display = 'none';
                        } else {
                            if (myReservationsDropdownLink) myReservationsDropdownLink.style.display = 'flex';
                            if (deleteAccountBtn) deleteAccountBtn.style.display = 'flex';
                        }

                        // Logout: panggil server untuk hapus session, lalu bersihkan state lokal
                        if (logoutBtn) {
                            logoutBtn.addEventListener('click', async (e) => {
                                e.preventDefault();
                                try {
                                    await fetch('/backend/logout.php', { method: 'POST', credentials: 'same-origin' });
                                } catch (err) {
                                    // Abaikan error jaringan
                                }
                                localStorage.removeItem('isLoggedIn');
                                localStorage.removeItem('userName');
                                localStorage.removeItem('authRole');
                                window.location.href = '/app/components/chooseRole.html';
                            });
                        }
                        // delete account (surfer only)
                        if (deleteAccountBtn && !js.isAdmin) {
                            deleteAccountBtn.addEventListener('click', async (e) => {
                                e.preventDefault();
                                if (!confirm('Hapus akun Anda beserta data reservasi dan ulasan? Tindakan ini tidak dapat dibatalkan.')) return;
                                try {
                                    const delResp = await fetch('/backend/delete_surfer.php', { method: 'POST', credentials: 'same-origin' });
                                    const j = await delResp.json().catch(() => null);
                                    if (delResp.ok && j && j.success) {
                                        localStorage.removeItem('isLoggedIn');
                                        localStorage.removeItem('userName');
                                        localStorage.removeItem('authRole');
                                        alert('Akun Anda telah dihapus.');
                                        window.location.href = '/app/components/chooseRole.html';
                                        return;
                                    }
                                } catch (err) {
                                    // Abaikan error jaringan
                                }
                                alert('Gagal menghapus akun. Periksa koneksi atau coba lagi.');
                            });
                        }
                        return;
                    }

                    // Backend bisa diakses dan menyatakan TIDAK login -> bersihkan flag localStorage yang basi
                    if (js && js.success && !js.loggedIn) {
                        localStorage.removeItem('isLoggedIn');
                        localStorage.removeItem('userName');
                        localStorage.removeItem('authRole');
                        localStorage.removeItem('isAdminLoggedIn');
                        return;
                    }
                } catch (parseErr) {
                    console.warn('Gagal parse respons session:', parseErr);
                }
            }
        } catch (e) {
            console.warn('Session check failed', e);
        }

        // Fallback to client-side localStorage check
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userName = localStorage.getItem('userName');
        if (isLoggedIn && userName) {
            if (profileToggle) profileToggle.style.display = 'none';
            if (loggedInProfile) loggedInProfile.style.display = 'block';
            if (surferNameDisplay) surferNameDisplay.textContent = userName;
            if (myReservationsDropdownLink) myReservationsDropdownLink.style.display = 'flex';
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('userName');
                    localStorage.removeItem('authRole');
                    window.location.href = '/app/components/chooseRole.html';
                });
            }

            // Ensure logged-in profile dropdown can be toggled when we only have client-side session
            if (loggedInProfileToggle && loggedInProfileDropdown) {
                loggedInProfileToggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    loggedInProfileDropdown.classList.toggle('active');
                    loggedInProfileToggle.classList.toggle('active');
                });
                document.addEventListener('click', (e) => {
                    if (!loggedInProfileToggle.contains(e.target) && !loggedInProfileDropdown.contains(e.target)) {
                        loggedInProfileDropdown.classList.remove('active');
                        loggedInProfileToggle.classList.remove('active');
                    }
                });
            }

            // Mode fallback localStorage: jangan panggil backend untuk hapus akun karena session belum tervalidasi
            if (deleteAccountBtn) {
                deleteAccountBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    if (!confirm('Hapus akun Anda beserta data reservasi dan ulasan? Tindakan ini tidak dapat dibatalkan.')) return;
                    alert('Sesi Anda sudah habis. Silakan login ulang untuk menghapus akun.');
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('userName');
                    localStorage.removeItem('authRole');
                    localStorage.removeItem('isAdminLoggedIn');
                    window.location.href = '/app/components/chooseRole.html';
                });
            }
        }
    }
    
    // Update greeting based on time
    updateGreeting() {
        const greetingElement = document.getElementById('profileGreeting');
        if (!greetingElement) return;
        
        const hour = new Date().getHours();
        let greeting = 'SELAMAT DATANG';
        
        if (hour >= 5 && hour < 12) {
            greeting = 'SELAMAT PAGI';
        } else if (hour >= 12 && hour < 15) {
            greeting = 'SELAMAT SIANG';
        } else if (hour >= 15 && hour < 18) {
            greeting = 'SELAMAT SORE';
        } else {
            greeting = 'SELAMAT MALAM';
        }
        
        greetingElement.textContent = greeting;
    }
}

export default Navigation;