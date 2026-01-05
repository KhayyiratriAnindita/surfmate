// Component Loader, memuat semua komponen HTML secara dinamis
class ComponentLoader {
    constructor() {
        this.components = [
            { id: 'navigation', path: 'components/navigation.html', insertBefore: 'body' },
            { id: 'hero', path: 'components/hero.html', insertBefore: 'body' },
            { id: 'wave-monitoring', path: 'components/wave-monitoring.html', insertBefore: 'body' },
            { id: 'surfing-activities', path: 'components/surfing-activities.html', insertBefore: 'body' },
            { id: 'facilities', path: 'components/facilities.html', insertBefore: 'body' },
            { id: 'gallery', path: 'components/gallery.html', insertBefore: 'body' },
            { id: 'safety', path: 'components/safety.html', insertBefore: 'body' },
            { id: 'message', path: 'components/message.html', insertBefore: 'body' },
            { id: 'footer', path: 'components/footer.html', insertBefore: 'body' }
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
            
            // Insert di body
            document.body.appendChild(temp.firstElementChild);
            
            console.log(`✅ Loaded: ${component.id}`);
            return true;
        } catch (error) {
            console.error(`❌ Error loading ${component.id}:`, error);
            return false;
        }
    }

    // Load semua komponen secara berurutan
    async loadAllComponents() {
        console.log('🔄 Loading components...');
        
        for (const component of this.components) {
            await this.loadComponent(component);
        }
        
        console.log('✅ All components loaded successfully!');
        
        // Trigger event setelah semua components loaded
        document.dispatchEvent(new CustomEvent('componentsLoaded'));
    }

    // Load komponen spesifik
    async loadSpecific(componentIds) {
        const toLoad = this.components.filter(c => componentIds.includes(c.id));
        
        for (const component of toLoad) {
            await this.loadComponent(component);
        }
    }
}

// Initialize component loader ketika DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const loader = new ComponentLoader();
    loader.loadAllComponents();
});
