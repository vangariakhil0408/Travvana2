/* ============================================
   TRAVVANA — Explore Controller
   Orchestrates the discovery/explore page
   with interactive filtering
   ============================================ */

import { jsonLoader } from '../../../services/jsonLoader.js';
import { getState, setState } from '../../../state/appState.js';
import { searchService } from '../../../services/searchService.js';
import { renderStatesGrid, renderStatesGridSkeleton, filterDiscoveryCards } from '../render/renderStatesGrid.js';
import { DATA_PATHS } from '../../../utils/constants.js';
import { qs, delegate } from '../../../utils/dom.js';
import { router } from '../../../core/router.js';
import { CONFIG } from '../../../core/config.js';
import { initUnifiedSearchBar } from '../components/searchBar.js';
import { stateRestoration } from '../../../core/stateRestoration.js';

/* ── Local filter state (avoids re-render) ── */
let activeRegion   = 'all';
let activeCategory = 'all';
let activeQuery    = '';

/**
 * Initialize the explore/discovery page
 */
export async function initExploreController() {
  const container = qs('#page-content');
  if (!container) return;

  // Reset module-level state to prevent stale filters from previous navigation
  activeRegion   = 'all';
  activeCategory = 'all';
  activeQuery    = '';

  setState({ currentPage: 'discovery', 'loading.states': true });

  // Show skeleton
  renderStatesGridSkeleton(container);

  try {
    // Load top 100 destinations (still needed for future features)
    const top100Data = await jsonLoader.load(DATA_PATHS.TOP_100);
    const allItems = top100Data?.destinations || [];

    setState({
      destinations: allItems,
      'loading.states': false,
    });

    // Build search index
    searchService.buildIndex();

    // Parse initial filters from URL OR from saved state
    const params = router.getParams();
    const savedState = stateRestoration.getState();
    
    if (savedState) {
      activeRegion   = savedState.region || 'all';
      activeCategory = savedState.category || 'all';
      activeQuery    = savedState.query || '';
    } else {
      activeRegion   = params.region   || 'all';
      activeCategory = params.category || 'all';
      activeQuery    = params.search   || '';
    }

    setState({
      activeFilters: { category: activeCategory, region: activeRegion, query: activeQuery },
      activeSort: 'popularity',
    });

    // Render the page ONCE
    renderStatesGrid({
      filters: { category: activeCategory, region: activeRegion },
    }, container);

    // Apply initial filters if set via URL
    if (activeRegion !== 'all' || activeCategory !== 'all' || activeQuery) {
      filterDiscoveryCards({ region: activeRegion, category: activeCategory, query: activeQuery });
    }

    // Set up all interactive event listeners (after setHTML's rAF populates DOM)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setupExploreListeners(container);
        
        // Restore input value visually
        const searchInput = document.getElementById('discovery-search-input');
        if (searchInput && activeQuery) {
          searchInput.value = activeQuery;
        }

        // Restore category pill visuals
        container.querySelectorAll('.unified-cat-pill').forEach(p => p.classList.remove('unified-cat-pill--active'));
        const activePill = container.querySelector(`.unified-cat-pill[data-cat="${activeCategory}"]`);
        if (activePill) activePill.classList.add('unified-cat-pill--active');
        
        // Set region dropdown visually if it exists
        const regionSelect = document.getElementById('region-filter');
        if (regionSelect && activeRegion !== 'all') {
          regionSelect.value = activeRegion;
        }
        
        // Ensure initial filtered state matches visually
        if (activeRegion !== 'all' || activeCategory !== 'all' || activeQuery) {
          filterDiscoveryCards({ region: activeRegion, category: activeCategory, query: activeQuery });
        }
        
        // Restore scroll after everything is painted
        requestAnimationFrame(() => {
          stateRestoration.restoreScroll();
        });
      });
    });

  } catch (err) {
    console.error('[ExploreController] Failed:', err);
    setState({ 'loading.states': false });
    container.innerHTML = `
      <div class="empty-state" style="margin-top:var(--sp-16);">
        <div class="empty-state__icon">⚠️</div>
        <div class="empty-state__title">Failed to load data</div>
        <button class="btn btn--primary" id="explore-retry-btn" style="margin-top:var(--sp-4);">Retry</button>
      </div>
    `;
    document.getElementById('explore-retry-btn')?.addEventListener('click', () => location.reload());
  }
}


/**
 * Apply current filters and update state
 */
function applyCurrentFilters() {
  filterDiscoveryCards({
    region: activeRegion,
    category: activeCategory,
    query: activeQuery,
  });

  setState({
    activeFilters: { category: activeCategory, region: activeRegion, query: activeQuery },
  });
  
  stateRestoration.saveState({
    region: activeRegion,
    category: activeCategory,
    query: activeQuery
  });
}


/**
 * Reset all filters to defaults
 */
function resetAllFilters(container) {
  activeRegion   = 'all';
  activeCategory = 'all';
  activeQuery    = '';

  // Reset category pill visuals
  container.querySelectorAll('.unified-cat-pill').forEach(p => p.classList.remove('unified-cat-pill--active'));
  const allPill = container.querySelector('.unified-cat-pill[data-cat="all"]');
  if (allPill) allPill.classList.add('unified-cat-pill--active');

  // Reset search input
  const input = document.getElementById('discovery-search-input');
  if (input) input.value = '';

  applyCurrentFilters();
}


/**
 * Set up all event listeners for the explore page
 */
function setupExploreListeners(container) {

  // ── Unified Search input & categories ──
  initUnifiedSearchBar('discovery-search-input', (catId) => {
    activeCategory = catId;
    applyCurrentFilters();
  }, (query) => {
    activeQuery = query;
    applyCurrentFilters();
  });

  // ── Reset all filters (from empty state or active filters bar) ──
  delegate(container, 'click', '#disco-reset-filters', () => {
    resetAllFilters(container);
  });

  delegate(container, 'click', '#disco-empty-reset', () => {
    resetAllFilters(container);
  });

  // ── Active filter tag removal ──
  delegate(container, 'click', '.disco-active-tag', (e, target) => {
    const clearType = target.dataset.clear;

    if (clearType === 'category') {
      activeCategory = 'all';
      container.querySelectorAll('.unified-cat-pill').forEach(p => p.classList.remove('unified-cat-pill--active'));
      const allPill = container.querySelector('.unified-cat-pill[data-cat="all"]');
      if (allPill) allPill.classList.add('unified-cat-pill--active');
    } else if (clearType === 'search') {
      activeQuery = '';
      const input = document.getElementById('discovery-search-input');
      if (input) input.value = '';
    }

    applyCurrentFilters();
  });
}
