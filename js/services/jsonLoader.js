/* ============================================
   TRAVVANA — JSON Loader Service
   Fetch wrapper with caching, retries, and loading states
   ============================================ */

import { cache } from './cacheService.js';
import { eventBus, EVENTS } from '../core/eventBus.js';

class JSONLoader {
  constructor() {
    this._inflight = new Map(); // Deduplicate concurrent requests
  }

  /**
   * Load a JSON file with caching
   * @param {string} path - Relative path to JSON file
   * @param {Object} [options]
   * @param {boolean} [options.useCache=true] - Whether to use cache
   * @param {number} [options.retries=2] - Number of retry attempts
   * @param {number} [options.timeout=8000] - Request timeout in ms
   * @returns {Promise<Object>}
   */
  async load(path, options = {}) {
    const { useCache = true, retries = 2, timeout = 8000 } = options;

    // Check cache first
    if (useCache) {
      const cached = cache.get(path);
      if (cached) {
        return cached;
      }
    }

    // Deduplicate: if the same path is already being fetched, wait for it
    if (this._inflight.has(path)) {
      return this._inflight.get(path);
    }

    const fetchPromise = this._fetchWithRetry(path, retries, timeout);
    this._inflight.set(path, fetchPromise);

    try {
      const data = await fetchPromise;

      // Cache the result
      if (useCache) {
        cache.set(path, data);
      }

      return data;
    } finally {
      this._inflight.delete(path);
    }
  }

  /**
   * Load multiple JSON files in parallel
   * @param {string[]} paths
   * @param {Object} [options]
   * @returns {Promise<Object[]>}
   */
  async loadAll(paths, options = {}) {
    eventBus.emit(EVENTS.DATA_LOADING, { paths });
    
    try {
      const results = await Promise.all(
        paths.map(path => this.load(path, options))
      );
      eventBus.emit(EVENTS.DATA_LOADED, { paths, results });
      return results;
    } catch (err) {
      eventBus.emit(EVENTS.DATA_ERROR, { paths, error: err });
      throw err;
    }
  }

  /**
   * Fetch with retry logic
   * @private
   */
  async _fetchWithRetry(path, retries, timeout) {
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(path, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (err) {
        lastError = err;
        if (attempt < retries) {
          // Exponential backoff: 500ms, 1000ms, ...
          await this._delay(500 * Math.pow(2, attempt));
        }
      }
    }

    console.error(`[JSONLoader] Failed to load "${path}" after ${retries + 1} attempts:`, lastError);
    throw lastError;
  }

  /**
   * Delay utility
   * @private
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Preload JSON files (fire and forget)
   * @param {string[]} paths
   */
  preload(paths) {
    paths.forEach(path => {
      if (!cache.get(path)) {
        this.load(path).catch(() => {}); // Silently fail preloads
      }
    });
  }
}

export const jsonLoader = new JSONLoader();
