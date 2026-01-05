// Animations Module, Intersection Observer untuk scroll animations

class Animations {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            this.observerOptions
        );
        
        this.imageObserver = new IntersectionObserver(
            (entries) => this.handleImageIntersection(entries),
            { threshold: 0.1 }
        );
    }
    
    // Handle intersection untuk animasi elemen
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                this.observer.unobserve(entry.target);
            }
        });
    }

    // Handle intersection untuk lazy loading images
    handleImageIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                // Jika gambar sudah selesai dimuat (cache), langsung tampilkan
                if (img.complete && img.naturalWidth > 0) {
                    img.style.opacity = '1';
                } else {
                    // Jika belum, sembunyikan lalu tampilkan saat onload
                    img.style.opacity = '0';
                    img.onload = () => {
                        img.style.transition = 'opacity 0.5s ease';
                        img.style.opacity = '1';
                    };
                }
                this.imageObserver.unobserve(img);
            }
        });
    }
    
    // Observe elements untuk animations
    observeElements() {
        const animateElements = document.querySelectorAll(
            '.wave-card, .level-card, .facility-card, .gallery-item, .safety-card'
        );
        
        animateElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            this.observer.observe(el);
        });
    }
    
    // Observe images untuk lazy loading
    observeImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => this.imageObserver.observe(img));
    }

    // Initialize semua animations
    init() {
        this.observeElements();
        this.observeImages();
    }
}

export default Animations;
