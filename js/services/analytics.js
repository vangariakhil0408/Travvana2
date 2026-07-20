/* ============================================
   TRAVVANA — Google Analytics 4 Service
   Production-grade, modular analytics integration
   ============================================ */

import { CONFIG } from '../core/config.js';
import { eventBus, EVENTS } from '../core/eventBus.js';

/**
 * @fileoverview Centralized GA4 analytics service for Travvana.
 * 
 * Features:
 * - Duplicate initialization guard
 * - Development mode console logging
 * - Ad-blocker / offline resilience
 * - Hash-based route change tracking via EventBus
 * - Reusable custom event helpers
 * - Core Web Vitals reporting
 * - Error tracking
 * 
 * Usage:
 *   import { analytics } from '../services/analytics.js';
 *   analytics.init();
 *   analytics.trackEvent('button_click', { button_id: 'cta-hero' });
 */

class AnalyticsService {
  constructor() {
    /** @private */
    this._initialized = false;

    /** @private — true when running locally (enables console logging) */
    this._isDebug = false;

    /** @private — the GA4 Measurement ID */
    this._measurementId = null;

    /** @private — bound handler reference for cleanup */
    this._routeChangeHandler = null;
  }

  // ──────────────────────────────────────────
  // Initialization
  // ──────────────────────────────────────────

  /**
   * Initialize the analytics service.
   * Safe to call multiple times — subsequent calls are no-ops.
   */
  init() {
    if (this._initialized) {
      this._log('Analytics already initialized — skipping.');
      return;
    }

    // Read Measurement ID from config
    this._measurementId = CONFIG.GA_MEASUREMENT_ID;
    if (!this._measurementId || !this._measurementId.startsWith('G-')) {
      console.warn('[Analytics] Invalid or missing GA_MEASUREMENT_ID in config. Analytics disabled.');
      return;
    }

    // Detect debug/dev mode
    this._isDebug = this._detectDebugMode();

    // Subscribe to hash-based route changes
    this._routeChangeHandler = (data) => this._onRouteChange(data);
    eventBus.on(EVENTS.ROUTE_CHANGE, this._routeChangeHandler);

    // Subscribe to search events
    eventBus.on(EVENTS.SEARCH_QUERY, (data) => {
      if (data && data.query && data.query.length >= 2) {
        this.trackSearch(data.query, data.resultsCount);
      }
    });

    // Subscribe to theme changes
    eventBus.on(EVENTS.THEME_CHANGE, (data) => {
      if (data && data.theme) {
        this.trackThemeChange(data.theme);
      }
    });

    // Track outbound link clicks
    this._setupOutboundClickTracking();

    // Track JS errors
    this._setupErrorTracking();

    // Track Core Web Vitals
    this._trackWebVitals();

    this._initialized = true;
    this._log('Analytics initialized', { measurementId: this._measurementId, debug: this._isDebug });
  }

  // ──────────────────────────────────────────
  // Public API — Event Tracking
  // ──────────────────────────────────────────

  /**
   * Track a custom event
   * @param {string} eventName - GA4 event name (snake_case recommended)
   * @param {Object} [params={}] - Event parameters
   */
  trackEvent(eventName, params = {}) {
    this._send('event', eventName, params);
  }

  /**
   * Track a page view (virtual or real)
   * @param {string} [pagePath] - Override path (defaults to current location)
   * @param {string} [pageTitle] - Override title (defaults to document.title)
   */
  trackPageView(pagePath, pageTitle) {
    const path = pagePath || this._getFullPath();
    const title = pageTitle || document.title;

    this._send('event', 'page_view', {
      page_path: path,
      page_title: title,
      page_location: window.location.href,
    });
  }

  /**
   * Track a search query
   * @param {string} searchTerm 
   * @param {number} [resultsCount]
   */
  trackSearch(searchTerm, resultsCount) {
    this._send('event', 'search', {
      search_term: searchTerm,
      ...(typeof resultsCount === 'number' && { results_count: resultsCount }),
    });
  }

  /**
   * Track a state detail view
   * @param {string} stateName 
   * @param {string} stateSlug 
   */
  trackStateView(stateName, stateSlug) {
    this._send('event', 'state_view', {
      state_name: stateName,
      state_slug: stateSlug,
    });
  }

  /**
   * Track a place detail view
   * @param {string} placeName 
   * @param {string} placeSlug 
   * @param {string} [stateName]
   */
  trackPlaceView(placeName, placeSlug, stateName) {
    this._send('event', 'place_view', {
      place_name: placeName,
      place_slug: placeSlug,
      ...(stateName && { state_name: stateName }),
    });
  }

  /**
   * Track outbound link click
   * @param {string} url 
   * @param {string} [linkText]
   */
  trackOutboundClick(url, linkText) {
    this._send('event', 'outbound_click', {
      link_url: url,
      link_text: linkText || '',
    });
  }

  /**
   * Track theme toggle
   * @param {string} theme - 'light' or 'dark'
   */
  trackThemeChange(theme) {
    this._send('event', 'theme_change', {
      theme: theme,
    });
  }

  /**
   * Track a button click
   * @param {string} buttonId 
   * @param {string} [buttonText]
   * @param {string} [section]
   */
  trackButtonClick(buttonId, buttonText, section) {
    this._send('event', 'button_click', {
      button_id: buttonId,
      ...(buttonText && { button_text: buttonText }),
      ...(section && { section: section }),
    });
  }

  /**
   * Track a JavaScript error
   * @param {string} message 
   * @param {string} [source]
   * @param {number} [lineno]
   */
  trackError(message, source, lineno) {
    this._send('event', 'js_error', {
      error_message: String(message).substring(0, 150),
      ...(source && { error_source: source }),
      ...(lineno && { error_line: lineno }),
    });
  }

  // ──────────────────────────────────────────
  // Private — Route Change Handler
  // ──────────────────────────────────────────

  /**
   * Handle hash-based route changes from the EventBus
   * @private
   * @param {Object} data - { route, params, previousRoute }
   */
  _onRouteChange(data) {
    if (!data) return;

    const { route, params } = data;

    // Build a human-readable virtual path from the route and params
    let virtualPath = this._getFullPath();

    // Fire virtual page view
    this.trackPageView(virtualPath);

    // Fire specific content-view events
    if (route === 'state' && params.state) {
      this.trackStateView(params.state, params.state);
    }
    if (route === 'place' && params.place) {
      this.trackPlaceView(params.place, params.place, params.state);
    }
  }

  // ──────────────────────────────────────────
  // Private — Outbound Click Tracking
  // ──────────────────────────────────────────

  /**
   * Listen for clicks on external links
   * @private
   */
  _setupOutboundClickTracking() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.href;
      if (!href) return;

      try {
        const url = new URL(href, window.location.origin);
        // Only track if it's a different hostname (outbound)
        if (url.hostname && url.hostname !== window.location.hostname) {
          this.trackOutboundClick(href, link.textContent?.trim());
        }
      } catch (_) {
        // Invalid URL — ignore
      }
    }, { passive: true, capture: true });
  }

  // ──────────────────────────────────────────
  // Private — Error Tracking
  // ──────────────────────────────────────────

  /**
   * Hook into global error handlers
   * @private
   */
  _setupErrorTracking() {
    // Store existing handlers to chain them
    const existingOnError = window.onerror;
    const existingOnRejection = window.onunhandledrejection;

    window.onerror = (message, source, lineno, colno, error) => {
      this.trackError(message, source, lineno);
      // Chain to existing handler
      if (typeof existingOnError === 'function') {
        existingOnError(message, source, lineno, colno, error);
      }
    };

    // Note: we use addEventListener to not overwrite the existing one in app.js
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(
        event.reason?.message || String(event.reason),
        'unhandled_promise_rejection'
      );
    });
  }

  // ──────────────────────────────────────────
  // Private — Core Web Vitals
  // ──────────────────────────────────────────

  /**
   * Report Core Web Vitals (LCP, FID, CLS) if PerformanceObserver is available
   * @private
   */
  _trackWebVitals() {
    if (typeof PerformanceObserver === 'undefined') return;

    // Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this._send('event', 'web_vitals', {
            metric_name: 'LCP',
            metric_value: Math.round(lastEntry.startTime),
            metric_unit: 'ms',
          });
        }
        lcpObserver.disconnect();
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (_) { /* Observer not supported */ }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstEntry = entries[0];
        if (firstEntry) {
          this._send('event', 'web_vitals', {
            metric_name: 'FID',
            metric_value: Math.round(firstEntry.processingStart - firstEntry.startTime),
            metric_unit: 'ms',
          });
        }
        fidObserver.disconnect();
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (_) { /* Observer not supported */ }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });

      // Report CLS when page is hidden (most accurate timing)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this._send('event', 'web_vitals', {
            metric_name: 'CLS',
            metric_value: Math.round(clsValue * 1000) / 1000,
            metric_unit: 'score',
          });
          clsObserver.disconnect();
        }
      }, { once: true });
    } catch (_) { /* Observer not supported */ }
  }

  // ──────────────────────────────────────────
  // Private — Core Send Method
  // ──────────────────────────────────────────

  /**
   * Send data to GA4 via gtag(). Wrapped in try/catch for resilience.
   * @private
   * @param {string} command - 'event', 'config', 'set', etc.
   * @param {string} target - event name or config target
   * @param {Object} [params={}] - additional parameters
   */
  _send(command, target, params = {}) {
    // Debug logging in development
    if (this._isDebug) {
      console.log(
        `%c[GA4] ${command}: ${target}`,
        'color: #4285F4; font-weight: bold;',
        params
      );
    }

    // Fire to GA4 if gtag is available
    try {
      if (typeof window.gtag === 'function') {
        window.gtag(command, target, params);
      }
    } catch (err) {
      // Silently fail — ad blocker or network issue
      if (this._isDebug) {
        console.warn('[Analytics] Failed to send event:', err);
      }
    }
  }

  // ──────────────────────────────────────────
  // Private — Utilities
  // ──────────────────────────────────────────

  /**
   * Build a full virtual path from pathname + query params
   * e.g., /state-detail.html?state=karnataka → /state-detail.html/state/karnataka
   * @private
   * @returns {string}
   */
  _getFullPath() {
    const pathname = window.location.pathname;
    const search = window.location.search.replace(/^\?/, '');

    if (!search) return pathname;

    // Convert query params to a readable path segment
    // e.g., "state=karnataka&place=mysore-palace" → "/state/karnataka/place/mysore-palace"
    const segments = search.split('&').map(pair => {
      const [key, value] = pair.split('=').map(decodeURIComponent);
      return value ? `/${key}/${value}` : `/${key}`;
    }).join('');

    return pathname + segments;
  }

  /**
   * Detect if running in development/debug mode
   * @private
   * @returns {boolean}
   */
  _detectDebugMode() {
    const hostname = window.location.hostname;
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '' ||  // file:// protocol
      window.location.protocol === 'file:'
    );
  }

  /**
   * Internal debug log
   * @private
   * @param {string} message
   * @param {*} [data]
   */
  _log(message, data) {
    if (this._isDebug) {
      if (data) {
        console.log(`[Analytics] ${message}`, data);
      } else {
        console.log(`[Analytics] ${message}`);
      }
    }
  }

  // ──────────────────────────────────────────
  // Cleanup
  // ──────────────────────────────────────────

  /**
   * Destroy the analytics service — unsubscribe from all events
   */
  destroy() {
    if (this._routeChangeHandler) {
      eventBus.off(EVENTS.ROUTE_CHANGE, this._routeChangeHandler);
      this._routeChangeHandler = null;
    }
    this._initialized = false;
  }
}

// Singleton export
export const analytics = new AnalyticsService();
