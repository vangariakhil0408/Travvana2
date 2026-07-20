/* ============================================
   TRAVVANA — Event Bus (Pub/Sub)
   Decoupled communication between modules
   ============================================ */

class EventBus {
  constructor() {
    this._listeners = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} event 
   * @param {Function} callback 
   * @returns {Function} unsubscribe function
   */
  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(callback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Subscribe to an event once
   * @param {string} event 
   * @param {Function} callback 
   */
  once(event, callback) {
    const wrapper = (...args) => {
      callback(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event 
   * @param {Function} callback 
   */
  off(event, callback) {
    const listeners = this._listeners.get(event);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this._listeners.delete(event);
      }
    }
  }

  /**
   * Emit an event with data
   * @param {string} event 
   * @param {*} data 
   */
  emit(event, data) {
    const listeners = this._listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (err) {
          console.error(`[EventBus] Error in listener for "${event}":`, err);
        }
      });
    }
  }

  /**
   * Remove all listeners for an event, or all events
   * @param {string} [event]
   */
  clear(event) {
    if (event) {
      this._listeners.delete(event);
    } else {
      this._listeners.clear();
    }
  }
}

// Singleton export
export const eventBus = new EventBus();

// Event name constants
export const EVENTS = {
  // Navigation
  ROUTE_CHANGE: 'route:change',
  PAGE_LOADED: 'page:loaded',

  // Data
  DATA_LOADING: 'data:loading',
  DATA_LOADED: 'data:loaded',
  DATA_ERROR: 'data:error',

  // State
  STATE_CHANGE: 'state:change',

  // UI
  THEME_CHANGE: 'theme:change',
  SEARCH_OPEN: 'search:open',
  SEARCH_CLOSE: 'search:close',
  SEARCH_QUERY: 'search:query',
  SEARCH_SUBMIT: 'search:submit',
  FILTER_CHANGE: 'filter:change',
  SORT_CHANGE: 'sort:change',

  // Analytics
  ANALYTICS_EVENT: 'analytics:event',

  // Discovery
  STATE_SELECT: 'discovery:state-select',
  DISTRICT_SELECT: 'discovery:district-select',
  PLACE_SELECT: 'discovery:place-select',
};
