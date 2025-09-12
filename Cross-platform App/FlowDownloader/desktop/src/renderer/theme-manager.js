// FlowDownloader Desktop Theme Manager

class ThemeManager {
  constructor() {
    this.currentTheme = 'dark'; // Default theme
    this.themeKey = 'flowdownloader-theme';
    this.init();
  }

  init() {
    // Load saved theme or detect system preference
    this.loadTheme();
    this.applyTheme(this.currentTheme);
    this.setupThemeToggle();
    this.setupSystemThemeListener();
  }

  loadTheme() {
    // Try to load from localStorage first
    const savedTheme = localStorage.getItem(this.themeKey);
    
    if (savedTheme) {
      this.currentTheme = savedTheme;
    } else {
      // Detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.currentTheme = prefersDark ? 'dark' : 'light';
    }
  }

  saveTheme(theme) {
    localStorage.setItem(this.themeKey, theme);
    
    // Also save to electron store if available
    if (window.electronAPI) {
      window.electronAPI.setUserData({ theme: theme });
    }
  }

  applyTheme(theme) {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.removeAttribute('data-theme');
    document.body.classList.remove('light', 'dark');
    
    // Apply new theme
    root.setAttribute('data-theme', theme);
    document.body.classList.add(theme);
    
    // Update theme toggle icon
    this.updateThemeToggleIcon(theme);
    
    // Smooth transition
    root.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    setTimeout(() => {
      root.style.transition = '';
    }, 300);
    
    this.currentTheme = theme;
    this.saveTheme(theme);
    
    // Dispatch theme change event
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
  }

  setupThemeToggle() {
    // Create theme toggle button if it doesn't exist
    let toggleButton = document.getElementById('theme-toggle');
    
    if (!toggleButton) {
      toggleButton = document.createElement('button');
      toggleButton.id = 'theme-toggle';
      toggleButton.className = 'theme-toggle';
      toggleButton.setAttribute('aria-label', 'Toggle theme');
      toggleButton.innerHTML = this.getThemeIcon(this.currentTheme);
      document.body.appendChild(toggleButton);
    }
    
    // Add click event listener
    toggleButton.addEventListener('click', () => {
      this.toggleTheme();
    });
  }

  updateThemeToggleIcon(theme) {
    const toggleButton = document.getElementById('theme-toggle');
    if (toggleButton) {
      toggleButton.innerHTML = this.getThemeIcon(theme);
    }
  }

  getThemeIcon(theme) {
    if (theme === 'dark') {
      // Sun icon for switching to light mode
      return `
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
        </svg>
      `;
    } else {
      // Moon icon for switching to dark mode
      return `
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clip-rule="evenodd" />
        </svg>
      `;
    }
  }

  setupSystemThemeListener() {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
      // Only auto-switch if user hasn't manually set a preference
      const savedTheme = localStorage.getItem(this.themeKey);
      if (!savedTheme) {
        const newTheme = e.matches ? 'dark' : 'light';
        this.applyTheme(newTheme);
      }
    });
  }

  // Public methods for external use
  getCurrentTheme() {
    return this.currentTheme;
  }

  setTheme(theme) {
    if (theme === 'dark' || theme === 'light') {
      this.applyTheme(theme);
    }
  }

  // Method to sync theme with main process
  async syncWithMainProcess() {
    if (window.electronAPI) {
      try {
        const userData = await window.electronAPI.getUserData();
        if (userData && userData.theme && userData.theme !== this.currentTheme) {
          this.applyTheme(userData.theme);
        }
      } catch (error) {
        console.warn('Failed to sync theme with main process:', error);
      }
    }
  }

  // Method to apply theme to specific elements
  applyThemeToElement(element, theme = this.currentTheme) {
    element.setAttribute('data-theme', theme);
    element.classList.remove('light', 'dark');
    element.classList.add(theme);
  }

  // Method to get theme-aware colors
  getThemeColors(theme = this.currentTheme) {
    const colors = {
      light: {
        primary: '#ffffff',
        secondary: '#f8fafc',
        tertiary: '#e2e8f0',
        textPrimary: '#1a202c',
        textSecondary: '#4a5568',
        textMuted: '#718096',
        border: '#e2e8f0',
        success: '#22c55e',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
      },
      dark: {
        primary: '#0f0f23',
        secondary: '#1a1a2e',
        tertiary: '#16213e',
        textPrimary: '#ffffff',
        textSecondary: '#e2e8f0',
        textMuted: '#a0aec0',
        border: '#2d3748',
        success: '#10b981',
        error: '#f87171',
        warning: '#fbbf24',
        info: '#60a5fa'
      }
    };
    
    return colors[theme] || colors.dark;
  }
}

// Initialize theme manager when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
  });
} else {
  window.themeManager = new ThemeManager();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
}