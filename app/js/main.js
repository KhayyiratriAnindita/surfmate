// Main Entry Point, mengorganisir dan menginisialisasi semua modules

import Navigation from './modules/navigation.js';
import WaveMonitor from './modules/waveMonitor.js';
import Gallery from './modules/gallery.js';
import Booking from './modules/booking.js';
import Feedback from './modules/feedback.js';
import Animations from './modules/animations.js';
// import Interactions from './modules/interactions.js';
import { initWediomboMap } from './modules/mapInit.js';

// Memuat semua komponen HTML secara dinamis
class ComponentLoader {
    constructor() {
        this.components = [
            { id: 'navigation', path: '/app/components/navigation.html' },
            { id: 'hero', path: '/app/components/hero.html' },
            { id: 'wave-monitoring', path: '/app/components/wave-monitoring.html' },
            { id: 'surfing-activities', path: '/app/components/surfing-activities.html' },
            { id: 'facilities', path: '/app/components/facilities.html' },
            { id: 'gallery', path: '/app/components/gallery.html' },
            { id: 'safety', path: '/app/components/safety.html' },
            { id: 'message', path: '/app/components/message.html' },
            { id: 'feedback', path: '/app/components/feedback.html' },
            { id: 'footer', path: '/app/components/footer.html' }
        ];
    }

    // Load satu komponen
    async loadComponent(component) {
        try {
            const response = await fetch(component.path);
            if (!response.ok) {
                throw new Error(`Failed to load ${component.path}`);
            }
            const html = await response.text();
            
            // Create temporary container untuk parsing
            const temp = document.createElement('div');
            temp.innerHTML = html;
            
            // Insert semua element ke body
            const frag = document.createDocumentFragment();
            Array.from(temp.children).forEach(el => frag.appendChild(el));
            if (frag.childNodes.length === 0) {
                throw new Error(`Component ${component.id} is empty`);
            }
            // Append HTML content
            document.body.appendChild(frag);

            // Execute inline scripts from the loaded component
            const scripts = temp.querySelectorAll('script');
            scripts.forEach(oldScript => {
                const newScript = document.createElement('script');
                // copy attributes (e.g., src, type)
                Array.from(oldScript.attributes || []).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                // copy inline content
                newScript.text = oldScript.textContent;
                // append to body so it executes
                document.body.appendChild(newScript);
            });
            
            console.log(`✅ Loaded: ${component.id}`);
            return true;
        } catch (error) {
            console.error(`❌ Error loading ${component.id}:`, error);
            this.showErrorOverlay(`Gagal memuat komponen: ${component.id}`);
            return false;
        }
    }

    // Load semua komponen secara berurutan
    async loadAllComponents() {
        console.log('🔄 Loading HTML components...');
        
        for (const component of this.components) {
            await this.loadComponent(component);
        }
        
        console.log('✅ All HTML components loaded successfully!');

        // Remove loading fallback if present
        const loading = document.getElementById('app-loading');
        if (loading) loading.remove();
    }

    showErrorOverlay(message) {
        if (document.getElementById('error-overlay')) return;
        const overlay = document.createElement('div');
        overlay.id = 'error-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.padding = '12px';
        overlay.style.background = '#ffefef';
        overlay.style.color = '#b00020';
        overlay.style.fontFamily = 'Poppins, sans-serif';
        overlay.style.zIndex = '2000';
        overlay.textContent = message;
        document.body.appendChild(overlay);
    }
}

class App {
    constructor() {
        this.componentLoader = null;
        this.navigation = null;
        this.waveMonitor = null;
        this.gallery = null;
        this.booking = null;
        this.animations = null;
        // this.interactions = null;
    }
    
    // Initialize application
    init() {
        // Wait untuk DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    // Setup semua modules setelah components loaded
    async setup() {
        console.log('🌊 Initializing Wediombo Surf Application...');
        
        // Load HTML components first
        this.componentLoader = new ComponentLoader();
        await this.componentLoader.loadAllComponents();
        
        // Wait a bit untuk DOM to settle
        await new Promise(resolve => setTimeout(resolve, 100));

        // If the URL contains a hash (anchor), attempt to scroll to it after components loaded
        if (window.location.hash) {
            const hash = window.location.hash;
            const tryScroll = () => {
                const target = document.querySelector(hash);
                if (target) {
                    try { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch(e){ target.scrollIntoView(); }
                    return true;
                }
                return false;
            };
            if (!tryScroll()) {
                // retry once after a short delay in case components rendering delayed
                setTimeout(tryScroll, 300);
            }
        }
        
        // Initialize modules setelah components ready
        this.navigation = new Navigation();
        this.waveMonitor = new WaveMonitor();
        this.gallery = new Gallery();
        this.booking = new Booking();
        this.feedback = new Feedback();
        this.animations = new Animations();
        // this.interactions = new Interactions();
        
        // Setup wave monitoring dengan data dari BMKG API
        try {
            await this.waveMonitor.init();
        } catch (error) {
            console.error('Failed to initialize wave monitor:', error);
        }
        
        // Setup animations
        this.animations.init();
        // Init feedback handler (after components loaded)
        if (this.feedback) this.feedback.init();
        
        // Initialize map setelah Leaflet library loaded
        if (typeof L !== 'undefined') {
            initWediomboMap();
        } else {
            console.warn('Leaflet library not loaded yet, retrying...');
            setTimeout(() => initWediomboMap(), 500);
        }
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        // Global delegated handlers for component links that may be injected
        // Handles `.btn-view-reviews` clicks even if component scripts didn't run
        document.addEventListener('click', function(e){
            const btn = e.target.closest('.btn-view-reviews');
            if (!btn) return;
            e.preventDefault();
            const href = btn.getAttribute('href') || 'components/fbuser.html';
            const target = new URL(href, window.location.href).toString();
            window.location.href = target;
        });
        
        console.log('✅ Application initialized successfully!');
    }
    
    // Cleanup resources
    cleanup() {
        if (this.waveMonitor) {
            this.waveMonitor.stopMonitoring();
        }
    }
}

// Start application
const app = new App();
app.init();
