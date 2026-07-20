/* ============================================
   TRAVVANA — Search Service
   Client-side fuzzy search across loaded data
   ============================================ */

import { getState } from '../state/appState.js';
import { CONFIG } from '../core/config.js';

class SearchService {
  constructor() {
    this._index = [];
    this._debounceTimer = null;
  }

  /**
   * Calculate Levenshtein distance for fuzzy matching
   */
  _levenshtein(a, b) {
    const matrix = [];
    let i, j;
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    for (i = 0; i <= b.length; i++) { matrix[i] = [i]; }
    for (j = 0; j <= a.length; j++) { matrix[0][j] = j; }
    for (i = 1; i <= b.length; i++) {
      for (j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  /**
   * Build search index from loaded data
   */
  buildIndex() {
    this._index = [];

    // Index states
    const states = getState('states');
    if (states?.states) {
      states.states.forEach(s => {
        this._index.push({
          type: 'state',
          id: s.id,
          name: s.name,
          keywords: [s.name, s.capital, s.tagline, s.region, ...(s.categories || [])].join(' ').toLowerCase(),
          data: s,
        });
      });
    }

    // Index union territories
    const territories = getState('territories');
    if (territories?.territories) {
      territories.territories.forEach(t => {
        this._index.push({
          type: 'territory',
          id: t.id,
          name: t.name,
          keywords: [t.name, t.capital, t.tagline, t.region, ...(t.categories || [])].join(' ').toLowerCase(),
          data: t,
        });
      });
    }

    // Index popular places from feeds
    const seenPlaceIds = new Set(this._index.filter(i => i.type === 'place').map(i => i.id));
    const feeds = ['trendingFeed', 'popularFeed', 'hiddenGemsFeed'];
    feeds.forEach(feedKey => {
      const feed = getState(feedKey);
      if (feed?.items) {
        feed.items.forEach(item => {
          if (item.placeId && !seenPlaceIds.has(item.placeId)) {
            seenPlaceIds.add(item.placeId);
            this._index.push({
              type: 'place',
              id: item.placeId,
              name: item.name,
              keywords: [item.name, item.stateId, item.category].join(' ').toLowerCase(),
              data: item,
            });
          }
        });
      }
    });

    // removed ALL_DESTINATIONS indexing to prevent circular dependency
  }

  /**
   * Add an item to the search index (public API for external callers)
   * @param {Object} item - {type, id, name, keywords, data}
   * @returns {boolean} true if added, false if duplicate
   */
  addToIndex(item) {
    const exists = this._index.some(i => i.id === item.id);
    if (!exists) {
      this._index.push(item);
      return true;
    }
    return false;
  }

  /**
   * Search the index
   * @param {string} query
   * @returns {Array<{type, id, name, data, score}>}
   */
  search(query) {
    if (!query || query.length < CONFIG.SEARCH_MIN_CHARS) return [];

    // Search Aliases (Principle 16)
    const aliases = {
      'nyc': 'new york city',
      'la': 'los angeles',
      'vizag': 'visakhapatnam',
      'hyd': 'hyderabad',
      'blr': 'bengaluru',
      'bangalore': 'bengaluru',
      'hydrabad': 'hyderabad',
      'bombay': 'mumbai',
      'madras': 'chennai',
      'calcutta': 'kolkata'
    };

    let normalizedQuery = query.toLowerCase().trim();
    if (aliases[normalizedQuery]) {
      normalizedQuery = aliases[normalizedQuery];
    }

    const queryWords = normalizedQuery.split(/\s+/);

    const results = this._index
      .map(item => {
        let score = 0;
        const itemName = item.name.toLowerCase();

        // Exact name match
        if (itemName === normalizedQuery) {
          score += 100;
        }
        // Name starts with query
        else if (itemName.startsWith(normalizedQuery)) {
          score += 80;
        }
        // Name contains query
        else if (itemName.includes(normalizedQuery)) {
          score += 60;
        } else {
          // Typo Tolerance (Fuzzy matching with Levenshtein distance)
          // Compare against individual words for better matching
          const nameWords = itemName.split(/\s+/);
          for (const word of nameWords) {
            const distance = this._levenshtein(normalizedQuery, word);
            if (distance <= 2 && normalizedQuery.length >= 3) {
              score += 50;
              break;
            }
          }
          // Also try full-name fuzzy for short names
          if (score === 0) {
            const fullDistance = this._levenshtein(normalizedQuery, itemName);
            if (fullDistance <= 2 && normalizedQuery.length >= 4) {
              score += 45;
            }
          }
        }

        // Keyword matches
        queryWords.forEach(word => {
          if (item.keywords.includes(word)) {
            score += 20;
          }
        });

        // Autocomplete Prioritization (Principle 8)
        if (item.type === 'state' || item.type === 'territory') score += 90;
        if (item.type === 'place') score += 80;

        // Trending Searches Boost (Principle 13)
        const trendingPlaces = ['goa', 'bali', 'dubai', 'maldives', 'paris', 'switzerland', 'kerala'];
        if (trendingPlaces.includes(itemName)) {
          score += 30;
        }

        return { ...item, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    // Duplicate Prevention (Principle 10)
    const uniqueResults = [];
    const seenNames = new Set();
    
    for (const item of results) {
      const locationKey = item.data?.stateId || item.data?.location || '';
      const uniqueKey = `${item.name}-${locationKey}`.toLowerCase();
      
      if (!seenNames.has(uniqueKey)) {
        seenNames.add(uniqueKey);
        uniqueResults.push(item);
      }
      
      if (uniqueResults.length >= CONFIG.MAX_SEARCH_RESULTS) break;
    }

    return uniqueResults;
  }

  /**
   * Debounced search
   * @param {string} query
   * @param {Function} callback
   */
  debouncedSearch(query, callback) {
    clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      const results = this.search(query);
      callback(results);
    }, CONFIG.SEARCH_DEBOUNCE_MS);
  }

  /**
   * Get search suggestions (top 5)
   * @param {string} query
   * @returns {Array}
   */
  getSuggestions(query) {
    return this.search(query).slice(0, 5);
  }
}

export const searchService = new SearchService();
