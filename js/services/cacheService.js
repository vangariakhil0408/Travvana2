/* ============================================
   TRAVVANA — Cache Service
   In-memory + sessionStorage for fast data access
   ============================================ */

import { CONFIG } from '../core/config.js';

class CacheService {
  constructor() {
    this._memCache = new Map();
    this._prefix = CONFIG.CACHE_PREFIX;
  }

  /**
   * Get cached data
   * @param {string} key
   * @returns {*|null}
   */
  get(key) {
    // Check in-memory first
    const memEntry = this._memCache.get(key);
    if (memEntry && !this._isExpired(memEntry)) {
      return memEntry.data;
    }

    // Check sessionStorage
    try {
      const stored = sessionStorage.getItem(this._prefix + key);
      if (stored) {
        const entry = JSON.parse(stored);
        if (!this._isExpired(entry)) {
          // Promote to memory cache
          this._memCache.set(key, entry);
          return entry.data;
        }
        // Clean up expired
        sessionStorage.removeItem(this._prefix + key);
      }
    } catch (e) {
      // sessionStorage might be unavailable
    }

    return null;
  }

  /**
   * Set cached data
   * @param {string} key
   * @param {*} data
   * @param {number} [ttl] - Time to live in ms (default from CONFIG)
   */
  set(key, data, ttl = CONFIG.CACHE_TTL) {
    const entry = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    // Always store in memory
    this._memCache.set(key, entry);

    // Try sessionStorage for persistence across page navigations
    try {
      sessionStorage.setItem(this._prefix + key, JSON.stringify(entry));
    } catch (e) {
      // Quota exceeded or unavailable — memory-only is fine
    }
  }

  /**
   * Remove a specific cache entry
   * @param {string} key
   */
  remove(key) {
    this._memCache.delete(key);
    try {
      sessionStorage.removeItem(this._prefix + key);
    } catch (e) {}
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this._memCache.clear();
    try {
      const keysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k?.startsWith(this._prefix)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => sessionStorage.removeItem(k));
    } catch (e) {}
  }

  /**
   * Check if entry is expired
   * @private
   */
  _isExpired(entry) {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Get cache stats (for debugging)
   */
  getStats() {
    return {
      memoryEntries: this._memCache.size,
      memoryKeys: [...this._memCache.keys()],
    };
  }
}

export const cache = new CacheService();
