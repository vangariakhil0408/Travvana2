/* ============================================
   TRAVVANA — Destinations Controller
   Renders all 100 destinations vertically
   ============================================ */

import { qs } from '../../../utils/dom.js';
import { ALL_DESTINATIONS, destinationCard } from '../render/renderHomeFeed.js';
import { unifiedSearchBar, initUnifiedSearchBar } from '../components/searchBar.js';
import { stateRestoration } from '../../../core/stateRestoration.js';

export async function initDestinationsController() {
  const container = qs('#page-content');
  if (!container) return;

  const cardsHTML = ALL_DESTINATIONS.map(d => destinationCard(d, 'destinations')).join('');

  container.innerHTML = `
    <div class="container" style="padding-top: var(--sp-6);">
      <!-- Back to Discovery Button -->
      <a href="index.html" class="btn btn--primary" style="display:inline-flex; align-items:center; gap:8px; margin-bottom: var(--sp-6); font-size: var(--fs-sm); font-weight: var(--fw-semibold);">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        Back to Discovery
      </a>

      <!-- Page Header -->
      <div class="section-title-row" style="margin-bottom: var(--sp-6);">
        <div class="section-title-row__left">
          <h1 style="font-size: var(--fs-3xl); font-weight: var(--fw-extrabold); color: var(--clr-text-primary); margin-bottom: var(--sp-2);">Popular Destinations</h1>
          <p class="section-subtitle">Top must visit places across India, in one place.</p>
        </div>
      </div>

      <!-- Unified Search & Filter -->
      <div style="margin: 24px 0;">
        ${unifiedSearchBar({ placeholder: 'Search by city, place or state', id: 'destinations-search' })}
      </div>

      <!-- Vertical Grid -->
      <div class="cards-grid cards-grid--4" id="destinations-grid">
        ${cardsHTML}
      </div>
    </div>
  `;

  // Initialize search logic
  const grid = qs('#destinations-grid');
  // Restore state
  const savedState = stateRestoration.getState();
  let currentSearch = savedState?.search || '';
  let currentCategory = savedState?.category || 'all';

  function refreshGrid() {
    let filtered = ALL_DESTINATIONS;
    if (currentCategory !== 'all') {
      filtered = filtered.filter(p => p.category === currentCategory || (p.categories && p.categories.includes(currentCategory)));
    }
    if (currentSearch.trim()) {
      const q = currentSearch.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.city && p.city.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }
    if (filtered.length === 0) {
      grid.innerHTML = '<div style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--clr-text-muted);">No destinations found</div>';
    } else {
      grid.innerHTML = filtered.map(d => destinationCard(d, 'destinations')).join('');
    }
  }

  initUnifiedSearchBar('destinations-search-input', (catId) => {
    currentCategory = catId;
    stateRestoration.saveState({ category: currentCategory });
    refreshGrid();
  }, (query) => {
    currentSearch = query || '';
    stateRestoration.saveState({ search: currentSearch });
    refreshGrid();
  });

  // Restore input visually
  const searchInput = document.querySelector('#destinations-search-input');
  if (searchInput && currentSearch) {
    searchInput.value = currentSearch;
  }

  // Initial render based on restored state
  refreshGrid();

  // Restore scroll
  stateRestoration.restoreScroll();
}

