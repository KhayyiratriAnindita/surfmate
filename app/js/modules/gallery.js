// Gallery Module, Lightbox effect dan gallery interactions

import { DOM } from '../utils/dom.js';

class Gallery {
    constructor() {
        this.init();
    }
    
    // Initialize gallery listeners
    init() {
        this.setupLightbox();
    }
    
    // Setup lightbox effect untuk gallery items
    setupLightbox() {
        const galleryItems = DOM.selectAll('.gallery-item');
        
        galleryItems.forEach(item => {
            item.addEventListener('click', (e) => {
                this.openLightbox(item);
            });
        });
    }
    
    // Open lightbox dengan image
    openLightbox(item) {
        const img = item.querySelector('img');
        const overlay = DOM.createElement('div', 'lightbox-overlay');
        overlay.innerHTML = `
            <div class="lightbox-content">
                <img src="${img.src}" alt="${img.alt}">
                <button class="lightbox-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        this.addLightboxStyles();
        
        const closeBtn = overlay.querySelector('.lightbox-close');
        closeBtn.addEventListener('click', () => {
            this.closeLightbox(overlay);
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeLightbox(overlay);
            }
        });
    }
    
    // Close lightbox
    closeLightbox(overlay) {
        overlay.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => {
            DOM.remove(overlay);
        }, 300);
    }
    
    // Add lightbox styles
    addLightboxStyles() {
        const styles = `
            .lightbox-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
                opacity: 0;
                animation: fadeIn 0.3s forwards;
            }
            .lightbox-content {
                position: relative;
                max-width: 90%;
                max-height: 90%;
            }
            .lightbox-content img {
                width: 100%;
                height: auto;
                border-radius: 10px;
            }
            .lightbox-close {
                position: absolute;
                top: -40px;
                right: 0;
                background: none;
                border: none;
                color: white;
                font-size: 2rem;
                cursor: pointer;
                transition: transform 0.3s ease;
            }
            .lightbox-close:hover {
                transform: scale(1.2);
            }
            @keyframes fadeIn {
                to { opacity: 1; }
            }
            @keyframes fadeOut {
                to { opacity: 0; }
            }
        `;
        
        DOM.addStyle(styles);
    }
}

export default Gallery;
