/* ============================================
   TRAVVANA — Query-String Router
   SEO-friendly routing using ?param=value
   instead of hash fragments (#param=value).
   Google crawls query strings but ignores hashes.
   ============================================ */

import { eventBus, EVENTS } from './eventBus.js';

class Router {
  constructor() {
    this._routes = new Map();
    this._currentRoute = null;
    this._onPopState = this._onPopState.bind(this);
  }

  /**
   * Initialize the router — start listening to popstate (back/forward)
   */
  init() {
    window.addEventListener('popstate', this._onPopState);
    // Fire initial route
    this._onPopState();
  }

  /**
   * Register a route handler
   * @param {string} name - Route name (e.g. 'state', 'district', 'place')
   * @param {Function} handler - Callback receiving params object
   */
  register(name, handler) {
    this._routes.set(name, handler);
  }

  /**
   * Navigate to a new URL with query params (pushState)
   * @param {Object} params - Key-value pairs for query params
   */
  navigate(params) {
    const search = Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    const url = `${window.location.pathname}?${search}`;
    window.history.pushState(null, '', url);
    this._onPopState();
  }

  /**
   * Get current query params
   * @returns {Object}
   */
  getParams() {
    return this._parseSearch(window.location.search);
  }

  /**
   * Get a specific param value
   * @param {string} key
   * @returns {string|null}
   */
  getParam(key) {
    const params = this.getParams();
    return params[key] || null;
  }

  /**
   * Parse query string into params object.
   * Also checks for legacy hash params and migrates them.
   * @private
   */
  _parseSearch(search) {
    // First try query string
    let params = {};
    const urlParams = new URLSearchParams(search);
    urlParams.forEach((value, key) => {
      params[key] = value;
    });

    // Fallback: check for legacy hash params and migrate
    if (Object.keys(params).length === 0 && window.location.hash) {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash) {
        hash.split('&').forEach(pair => {
          const [key, value] = pair.split('=').map(decodeURIComponent);
          if (key) params[key] = value || '';
        });

        // Migrate: replace hash URL with query-string URL (one-time)
        if (Object.keys(params).length > 0) {
          const newSearch = Object.entries(params)
            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
            .join('&');
          const newUrl = `${window.location.pathname}?${newSearch}`;
          window.history.replaceState(null, '', newUrl);
        }
      }
    }

    return params;
  }

  /**
   * Handle popstate (back/forward) and initial load
   * @private
   */
  _onPopState() {
    const params = this.getParams();
    const prevRoute = this._currentRoute;

    // Determine which route handler to call based on params
    let routeName = 'default';
    if (params.place) routeName = 'place';
    else if (params.district) routeName = 'district';
    else if (params.state) routeName = 'state';
    else if (params.view) routeName = params.view;

    this._currentRoute = { name: routeName, params };

    // Call registered handler
    const handler = this._routes.get(routeName);
    if (handler) {
      handler(params);
    }

    // Emit route change event
    eventBus.emit(EVENTS.ROUTE_CHANGE, {
      route: routeName,
      params,
      previousRoute: prevRoute,
    });
  }

  /**
   * Destroy the router
   */
  destroy() {
    window.removeEventListener('popstate', this._onPopState);
    this._routes.clear();
  }
}

export const router = new Router();
