/* ============================================
   TRAVVANA — Advanced Premium Theme Manager (2-Theme System)
   ============================================ */

import { eventBus, EVENTS } from './eventBus.js';

const STORAGE_KEY = 'tvn_theme';

const THEME_COLORS = {
  light: '#F8FAFC', // Golden Daylight
  dark: '#050816'   // Midnight Explorer
};

class ThemeManager {
  constructor() {
    this._theme = 'dark'; // default
  }

  init() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      this._theme = stored;
    } else if (window.matchMedia?.('(prefers-color-scheme: light)').matches) {
      this._theme = 'light';
    }
    this._apply();

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        this._theme = e.matches ? 'dark' : 'light';
        this._apply();
      }
    });

    // Ensure DOM is ready before binding navbar toggle events
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this._bindToggle());
    } else {
      this._bindToggle();
    }
  }

  toggle() {
    this._theme = this._theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, this._theme);
    this._apply();
  }

  set(theme) {
    if (theme !== 'light' && theme !== 'dark') return;
    this._theme = theme;
    localStorage.setItem(STORAGE_KEY, this._theme);
    this._apply();
  }

  get current() {
    return this._theme;
  }

  _apply() {
    document.documentElement.setAttribute('data-theme', this._theme);
    
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.content = THEME_COLORS[this._theme];
    }

    eventBus.emit(EVENTS.THEME_CHANGE, this._theme);
  }

  _bindToggle() {
    // Listen for clicks on the dynamic single-icon toggle button
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.theme-toggle-btn');
      if (btn) {
        this.toggle();
      }
    });
  }
}

export const theme = new ThemeManager();
