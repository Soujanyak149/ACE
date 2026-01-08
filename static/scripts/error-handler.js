/**
 * Global Error Handler & User Feedback System
 * Provides user-friendly error messages and toast notifications
 */

class ErrorHandler {
    static handle(error, context = 'Unknown') {
        console.error(`❌ Error in ${context}:`, error);
        
        // Determine error type and show appropriate message
        let message = this.getUserFriendlyMessage(error, context);
        this.showToast(message, 'error');
        
        // Log to external monitoring service if available
        if (window.Sentry) {
            Sentry.captureException(error, { tags: { context } });
        }
    }
    
    static getUserFriendlyMessage(error, context) {
        // Network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return 'Unable to connect to server. Please check your internet connection.';
        }
        
        if (error.name === 'AbortError') {
            return 'Request timeout. Please try again.';
        }
        
        // API errors
        if (error.status === 401) {
            return 'Please log in to continue.';
        }
        
        if (error.status === 403) {
            return 'You don\'t have permission to do that.';
        }
        
        if (error.status === 404) {
            return 'Resource not found.';
        }
        
        if (error.status >= 500) {
            return 'Server error. Please try again later.';
        }
        
        // Storage errors
        if (error.name === 'QuotaExceededError') {
            return 'Storage full! Please clear some data or reset your progress.';
        }
        
        // Generic error
        return 'Something went wrong. Please try again.';
    }
    
    static showToast(message, type = 'info', duration = 3000) {
        // Remove existing toasts
        document.querySelectorAll('.ace-toast').forEach(t => t.remove());
        
        const toast = document.createElement('div');
        toast.className = `ace-toast ace-toast-${type}`;
        
        // Icon based on type
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
        `;
        
        // Add styles if not already added
        if (!document.getElementById('ace-toast-styles')) {
            this.addToastStyles();
        }
        
        document.body.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Auto-remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
    
    static showSuccess(message, duration = 3000) {
        this.showToast(message, 'success', duration);
    }
    
    static showError(message, duration = 4000) {
        this.showToast(message, 'error', duration);
    }
    
    static showWarning(message, duration = 3500) {
        this.showToast(message, 'warning', duration);
    }
    
    static showInfo(message, duration = 3000) {
        this.showToast(message, 'info', duration);
    }
    
    static addToastStyles() {
        const style = document.createElement('style');
        style.id = 'ace-toast-styles';
        style.textContent = `
            .ace-toast {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                gap: 12px;
                font-family: 'Roboto', sans-serif;
                font-size: 14px;
                font-weight: 500;
                z-index: 10000;
                transform: translateY(100px);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                max-width: 400px;
                backdrop-filter: blur(10px);
            }
            
            .ace-toast.show {
                transform: translateY(0);
                opacity: 1;
            }
            
            .ace-toast-success {
                background: linear-gradient(135deg, #27ae60, #2ecc71);
                color: white;
            }
            
            .ace-toast-error {
                background: linear-gradient(135deg, #c0392b, #e74c3c);
                color: white;
            }
            
            .ace-toast-warning {
                background: linear-gradient(135deg, #f39c12, #f1c40f);
                color: #333;
            }
            
            .ace-toast-info {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
            }
            
            .toast-icon {
                font-size: 20px;
                font-weight: bold;
            }
            
            .toast-message {
                flex: 1;
            }
            
            @media (max-width: 768px) {
                .ace-toast {
                    bottom: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Wrapper for fetch with automatic error handling
 */
async function fetchWithErrorHandling(url, options = {}, context = 'API Request') {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        if (!response.ok) {
            const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
            error.status = response.status;
            throw error;
        }
        
        return await response.json();
    } catch (error) {
        ErrorHandler.handle(error, context);
        throw error;
    }
}

/**
 * Safe localStorage operations with error handling
 */
class SafeStorage {
    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    }
    
    static set(key, value) {
        try {
            // Check storage size before saving
            const dataStr = JSON.stringify(value);
            const dataSize = dataStr.length;
            const maxSize = 5 * 1024 * 1024; // 5MB
            
            if (dataSize > maxSize * 0.9) {
                ErrorHandler.showWarning('Storage almost full. Consider clearing old data.');
            }
            
            localStorage.setItem(key, dataStr);
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                ErrorHandler.showError('Storage full! Please clear old data or reset progress.');
            } else {
                ErrorHandler.handle(error, 'localStorage.setItem');
            }
            return false;
        }
    }
    
    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }
    
    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
    
    static getStorageUsage() {
        try {
            let total = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length + key.length;
                }
            }
            return {
                used: total,
                usedMB: (total / (1024 * 1024)).toFixed(2),
                percentage: ((total / (5 * 1024 * 1024)) * 100).toFixed(1)
            };
        } catch (error) {
            return { used: 0, usedMB: '0.00', percentage: '0.0' };
        }
    }
}

/**
 * Loading Manager - Shows/hides loading overlays
 */
class LoadingManager {
    constructor() {
        this.overlay = null;
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.createOverlay());
        } else {
            this.createOverlay();
        }
    }
    
    createOverlay() {
        if (this.overlay) return; // Already created
        
        this.overlay = document.createElement('div');
        this.overlay.className = 'loading-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 99999;
            flex-direction: column;
            gap: 20px;
        `;
        this.overlay.innerHTML = `
            <div class="spinner" style="
                border: 4px solid rgba(255,255,255,0.3);
                border-top: 4px solid #667eea;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
            "></div>
            <div class="loading-text" style="
                color: white;
                font-size: 18px;
                font-weight: 600;
            ">Loading...</div>
        `;
        
        // Add spin animation if not exists
        if (!document.getElementById('spinner-style')) {
            const style = document.createElement('style');
            style.id = 'spinner-style';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .loading-overlay.show {
                    display: flex !important;
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(this.overlay);
    }
    
    show(message = 'Loading...') {
        if (!this.overlay) {
            this.createOverlay();
        }
        
        if (this.overlay) {
            const textEl = this.overlay.querySelector('.loading-text');
            if (textEl) textEl.textContent = message;
            this.overlay.classList.add('show');
        }
    }
    
    hide() {
        if (this.overlay) {
            this.overlay.classList.remove('show');
        }
    }
    
    showButtonLoading(button) {
        if (button) {
            button.classList.add('loading');
            button.disabled = true;
        }
    }
    
    hideButtonLoading(button) {
        if (button) {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }
}

// Make available globally
window.ErrorHandler = ErrorHandler;
window.fetchWithErrorHandling = fetchWithErrorHandling;
window.SafeStorage = SafeStorage;
window.LoadingManager = new LoadingManager();

console.log('✅ Error Handler loaded');
console.log('⏳ Loading Manager ready');
