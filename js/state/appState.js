/* ============================================
   TRAVVANA — Centralized App State
   Simple reactive state management
   ============================================ */

import { eventBus, EVENTS } from '../core/eventBus.js';

const _state = {
  // Current page context
  currentPage: null,     // 'home' | 'discovery' | 'state' | 'district' | 'place'
  
  // Route params
  routeParams: {},

  // Loaded data
  states: null,
  territories: null,
  currentState: null,    // meta.json of selected state
  currentDistricts: null,
  currentPopular: null,
  currentPlace: null,

  // Feeds
  trendingFeed: null,
  popularFeed: null,
  hiddenGemsFeed: null,
  seasonalFeed: null,

  // UI state
  searchQuery: '',
  activeFilters: {
    category: 'all',
    region: 'all',
  },
  activeSort: 'popularity',
  currentPageNum: 1,

  // Loading states
  loading: {
    states: false,
    state: false,
    districts: false,
    places: false,
    feeds: false,
  },

  // Errors
  errors: {},
};

const _subscribers = new Set();

/**
 * Get a copy of the current state or a specific key
 * @param {string} [key] - Dot-notation path e.g. 'loading.states'
 * @returns {*}
 */
export function getState(key) {
  if (!key) {
    try { return structuredClone(_state); }
    catch { return JSON.parse(JSON.stringify(_state)); }
  }

  return key.split('.').reduce((obj, k) => {
    return obj && obj[k] !== undefined ? obj[k] : null;
  }, _state);
}

/**
 * Update state and notify subscribers
 * @param {Object} updates - Partial state updates
 */
export function setState(updates) {
  // Deep clone prevState so subscribers can reliably diff nested props
  let prevState;
  try { prevState = structuredClone(_state); }
  catch { prevState = JSON.parse(JSON.stringify(_state)); }
  
  Object.entries(updates).forEach(([key, value]) => {
    if (key.includes('.')) {
      // Support dot-notation for nested updates (auto-create missing parents)
      const keys = key.split('.');
      let target = _state;
      for (let i = 0; i < keys.length - 1; i++) {
        if (target[keys[i]] === undefined || target[keys[i]] === null) {
          target[keys[i]] = {};
        }
        target = target[keys[i]];
      }
      target[keys[keys.length - 1]] = value;
    } else {
      _state[key] = value;
    }
  });

  // Notify subscribers
  _subscribers.forEach(fn => {
    try {
      fn(_state, prevState);
    } catch (err) {
      console.error('[AppState] Subscriber error:', err);
    }
  });

  // Emit global event
  eventBus.emit(EVENTS.STATE_CHANGE, { state: _state, prevState, updates });
}

/**
 * Subscribe to state changes
 * @param {Function} callback - (newState, prevState) => void
 * @returns {Function} unsubscribe function
 */
export function subscribe(callback) {
  _subscribers.add(callback);
  return () => _subscribers.delete(callback);
}

/**
 * Reset state to defaults
 */
export function resetState() {
  setState({
    currentState: null,
    currentDistricts: null,
    currentPopular: null,
    currentPlace: null,
    searchQuery: '',
    activeFilters: { category: 'all', region: 'all' },
    activeSort: 'popularity',
    currentPageNum: 1,
    errors: {},
  });
}
