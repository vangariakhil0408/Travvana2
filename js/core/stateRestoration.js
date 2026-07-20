/* ============================================
   TRAVVANA — Global State & Scroll Restoration
   ============================================ */

/**
 * Manages the state and scroll position of listing pages to ensure 
 * users return to the exact same spot with the same filters applied.
 */
export const stateRestoration = {
  /**
   * Generates a unique key based on the current URL and hash
   */
  getPageKey() {
    const path = window.location.pathname;
    const search = window.location.search;
    const hash = window.location.hash;
    return `pageState:${path}${search}${hash}`;
  },

  /**
   * Save the current state of the page (filters, categories, search queries).
   * Merges with any existing saved state for this page.
   * @param {Object} stateData
   */
  saveState(stateData) {
    const key = this.getPageKey();
    const existing = this.getState() || {};
    
    const merged = {
      ...existing,
      ...stateData,
      timestamp: Date.now()
    };
    
    try {
      sessionStorage.setItem(key, JSON.stringify(merged));
    } catch (e) {
      console.warn('Failed to save state to sessionStorage', e);
    }
  },

  /**
   * Retrieve the saved state for the current page
   * @returns {Object|null}
   */
  getState() {
    const key = this.getPageKey();
    try {
      const data = sessionStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Explicitly save the current scroll position for the current page
   */
  saveScrollPosition() {
    this.saveState({ scrollPosition: window.scrollY });
  },

  /**
   * Restores the scroll position safely.
   * Call this AFTER all data is loaded and DOM elements are rendered.
   */
  restoreScroll() {
    const state = this.getState();
    if (state && typeof state.scrollPosition === 'number') {
      // Use requestAnimationFrame to ensure browser has processed layout changes
      requestAnimationFrame(() => {
        window.scrollTo({
          top: state.scrollPosition,
          behavior: 'instant'
        });
      });
    }
  }
};
