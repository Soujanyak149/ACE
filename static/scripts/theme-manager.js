/**
 * Theme Manager - Dark/Light Mode Toggle
 * Manages theme preferences with localStorage persistence
 */

class ThemeManager {
    constructor() {
        this.storageKey = 'ace-theme';
        this.theme = this.getStoredTheme();
        this.init();
    }
    
    getStoredTheme() {
        // Check localStorage first
        const stored = localStorage.getItem(this.storageKey);
        if (stored) return stored;
        
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'light';
    }
    
    init() {
        // Apply theme immediately (before page renders)
        this.applyTheme(false);
        
        // Create toggle button after DOM loads
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.createToggle());
        } else {
            this.createToggle();
        }
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(this.storageKey)) {
                this.theme = e.matches ? 'dark' : 'light';
                this.applyTheme(true);
            }
        });
    }
    
    createToggle() {
        // Check if toggle already exists
        if (document.querySelector('.theme-toggle')) return;
        
        const toggle = document.createElement('button');
        toggle.className = 'theme-toggle';
        toggle.setAttribute('aria-label', `Switch to ${this.theme === 'light' ? 'dark' : 'light'} mode`);
        toggle.setAttribute('title', `Switch to ${this.theme === 'light' ? 'dark' : 'light'} mode`);
        toggle.innerHTML = this.theme === 'dark' ? '☀️' : '🌙';
        
        toggle.addEventListener('click', () => this.toggleTheme());
        
        document.body.appendChild(toggle);
    }
    
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem(this.storageKey, this.theme);
        this.applyTheme(true);
        
        // Update toggle button
        const toggle = document.querySelector('.theme-toggle');
        if (toggle) {
            toggle.innerHTML = this.theme === 'dark' ? '☀️' : '🌙';
            toggle.setAttribute('aria-label', `Switch to ${this.theme === 'light' ? 'dark' : 'light'} mode`);
        }
        
        // Update header scroll effect immediately
        this.updateHeaderForTheme();
        
        // Show notification
        if (window.ErrorHandler) {
            ErrorHandler.showSuccess(
                this.theme === 'dark' 
                    ? '🌙 Dark mode enabled' 
                    : '☀️ Light mode enabled',
                2000
            );
        }
    }
    
    updateHeaderForTheme() {
        // Header styling is now handled by CSS based on data-theme attribute
        // No need to manually update styles - CSS will handle it automatically!
        // Just ensure scrolled class is applied if needed
        const header = document.querySelector('.header');
        if (!header) return;
        
        if (window.scrollY > 100 && !header.classList.contains('scrolled')) {
            header.classList.add('scrolled');
        }
    }
    
    applyTheme(animate = false) {
        const html = document.documentElement;
        
        if (!animate) {
            // Disable transitions for instant theme change
            html.classList.add('no-transition');
        }
        
        html.setAttribute('data-theme', this.theme);
        
        if (!animate) {
            // Re-enable transitions after a frame
            requestAnimationFrame(() => {
                html.classList.remove('no-transition');
            });
        }
    }
    
    getTheme() {
        return this.theme;
    }
}

// CSS for no-transition class
const style = document.createElement('style');
style.textContent = `
    .no-transition,
    .no-transition * {
        transition: none !important;
    }
`;
document.head.appendChild(style);

// Initialize theme manager immediately
window.themeManager = new ThemeManager();

console.log('🎨 Theme Manager loaded - Current theme:', window.themeManager.getTheme());
