/* ============================================
   TRAVVANA — App Entry Point
   Detects page, initializes core modules, boots controller
   ============================================ */

import { theme } from './theme.js?v=16';
import { renderNavbar } from './navbar.js?v=16';
import { renderFooter } from './footer.js?v=16';
import { stateRestoration } from './stateRestoration.js?v=16';
import { analytics } from '../services/analytics.js?v=16';

// ── Global Error Handling (H-03) ──
window.onerror = (message, source, lineno, colno, error) => {
  console.error('[App] Uncaught error:', { message, source, lineno, colno, error });
};

window.addEventListener('unhandledrejection', (event) => {
  console.error('[App] Unhandled promise rejection:', event.reason);
});

/**
 * Initialize the application
 */
async function initApp() {
  // 1. Initialize theme
  theme.init();

  // 2. Initialize analytics (safe — no-ops if already initialized)
  analytics.init();

  // 3. Detect current page
  const page = detectPage();

  // 4. Inject standard components
  renderNavbar(page);

  // 5. Set up common UI (theme toggle, navbar scrolling)
  setupCommonUI();

  // 6. Set up scroll restoration
  setupScrollRestoration();

  // 7. Boot the appropriate controller
  switch (page) {
    case 'home': {
      const { initDiscoveryController } = await import(`../modules/discovery/controllers/discoveryController.js?v=16`);
      await initDiscoveryController();
      break;
    }

    case 'discovery': {
      const { initExploreController } = await import(`../modules/discovery/controllers/exploreController.js?v=16`);
      await initExploreController();
      break;
    }

    case 'state': {
      const { initStateController } = await import(`../modules/discovery/controllers/stateController.js?v=16`);
      const stateSlug = getQueryParam('state');
      if (stateSlug) await initStateController(stateSlug);
      break;
    }

    case 'destinations': {
      const { initDestinationsController } = await import(`../modules/discovery/controllers/destinationsController.js?v=16`);
      await initDestinationsController();
      break;
    }

    case 'place': {
      const { initPlaceController } = await import(`../modules/discovery/controllers/placeController.js?v=16`);
      const placeSlug = getQueryParam('place');
      const placeState = getQueryParam('state');
      if (placeSlug) await initPlaceController(placeSlug, placeState);
      break;
    }

    case 'planner': {
      const { initPlannerController } = await import(`../modules/planner/controllers/plannerController.js?v=21`);
      await initPlannerController();
      break;
    }

    default:
      console.warn('[App] Unknown page:', page);
  }

  // 8. Fire initial page view for analytics
  analytics.trackPageView();

  // 9. Render global footer
  renderFooter();
}

/**
 * Detect which page we're on based on filename
 */
function detectPage() {
  const path = window.location.pathname.toLowerCase();
  
  if (path.includes('discovery'))       return 'discovery';
  if (path.includes('state-detail'))    return 'state';
  if (path.includes('place-detail'))    return 'place';
  if (path.includes('destinations'))    return 'destinations';
  if (path.includes('planner'))         return 'planner';
  if (path.includes('bookings'))        return 'bookings';
  if (path.includes('travvanagram'))    return 'travvanagram';
  
  return 'home';
}

/**
 * Extract a query-string parameter (SEO-friendly).
 * Falls back to legacy hash params for backward compatibility.
 * @param {string} key
 * @returns {string|null}
 */
function getQueryParam(key) {
  // 1. Try query string first (?state=karnataka)
  const urlParams = new URLSearchParams(window.location.search);
  const qValue = urlParams.get(key);
  if (qValue) return qValue;

  // 2. Fallback: legacy hash params (#state=karnataka) — for old bookmarks
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (hash) {
    const params = {};
    hash.split('&').forEach(pair => {
      const [k, v] = pair.split('=').map(decodeURIComponent);
      if (k) params[k] = v;
    });
    const hashValue = params[key] || null;

    // Auto-migrate: replace hash URL with query-string URL
    if (hashValue && Object.keys(params).length > 0) {
      const newSearch = Object.entries(params)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
      const newUrl = `${window.location.pathname}?${newSearch}`;
      window.history.replaceState(null, '', newUrl);
    }

    return hashValue;
  }

  return null;
}

/**
 * Set up common UI elements (auto-hide top bar on scroll)
 */
function setupCommonUI() {
  // Auto-hide top bar on scroll (rAF-throttled)
  let lastScroll = 0;
  let scrollTicking = false;
  const topBar = document.querySelector('.top-bar');
  if (topBar) {
    window.addEventListener('scroll', () => {
      if (!scrollTicking) {
        requestAnimationFrame(() => {
          const currentScroll = window.scrollY;
          if (currentScroll > 100 && currentScroll > lastScroll) {
            topBar.classList.add('top-bar--hidden');
          } else {
            topBar.classList.remove('top-bar--hidden');
          }
          lastScroll = currentScroll;
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    }, { passive: true });
  }
}

/**
 * Global Scroll Restoration
 * Saves the scroll position before navigating away from the page.
 */
function setupScrollRestoration() {
  // Save state before navigating via clicking links
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.href) {
      // If the link points to a different page or place, save state
      if (!link.href.startsWith('javascript:')) {
        stateRestoration.saveScrollPosition();
      }
    }
  });

  // Save state when user uses browser back/forward buttons
  window.addEventListener('beforeunload', () => {
    stateRestoration.saveScrollPosition();
  });
}

// Boot when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
