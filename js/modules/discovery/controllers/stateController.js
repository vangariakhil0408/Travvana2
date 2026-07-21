/* ============================================
   TRAVVANA — State Controller (Redesigned)
   Full state exploration page with search,
   category filters, and places grid.
   ============================================ */


import { qs, setHTML, escapeHTML } from '../../../utils/dom.js';
import { unslugify } from '../helpers/slugify.js';
import { STATE_GRADIENTS } from '../../../utils/constants.js';
import { jsonLoader } from '../../../services/jsonLoader.js';
import { unifiedSearchBar, initUnifiedSearchBar } from '../components/searchBar.js';
import { stateRestoration } from '../../../core/stateRestoration.js';
import { resolveImage, onErrorHandler } from '../../../services/imageRegistry.js';
import { seoService } from '../../../services/seoService.js';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '✨' },
  { id: 'heritage', label: 'Heritage', icon: '🏛️' },
  { id: 'temples', label: 'Temples', icon: '🛕' },
  { id: 'nature', label: 'Nature', icon: '🌿' },
  { id: 'wildlife', label: 'Wildlife', icon: '🐘' },
  { id: 'beaches', label: 'Beaches', icon: '🏖️' },
  { id: 'hills', label: 'Hills', icon: '⛰️' },
  { id: 'waterfalls', label: 'Waterfalls', icon: '💧' },
  { id: 'lakes', label: 'Lakes', icon: '🌊' },
];

let currentCategory = 'all';
let currentSearch = '';
let stateSlugGlobal = '';

/**
 * Initialize the state detail page
 */
export async function initStateController(stateSlug) {
  const container = qs('#page-content');
  if (!container || !stateSlug) return;

  // Restore state if returning to this page
  const savedState = stateRestoration.getState();
  if (savedState) {
    currentCategory = savedState.category || 'all';
    currentSearch = savedState.search || '';
  } else {
    currentCategory = 'all';
    currentSearch = '';
  }
  stateSlugGlobal = stateSlug;
  
  let stateData = null;
  try {
    stateData = await jsonLoader.load(`data/states/${stateSlug}.json`);
  } catch (err) {
    console.warn(`[StateController] Failed to load state JSON for "${stateSlug}":`, err);
  }

  if (!stateData) {
    container.innerHTML = `
      <div class="container" style="padding-top:40px;">
        <a href="discovery.html" class="btn btn--primary" style="display:inline-flex; align-items:center; gap:8px; margin-bottom: var(--sp-6); font-size: var(--fs-sm); font-weight: var(--fw-semibold);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Back to Explore
        </a>
        <div class="state-empty">
          <div class="state-empty__icon">🗺️</div>
          <div class="state-empty__title">${escapeHTML(unslugify(stateSlug))}</div>
          <p>Destinations for this state are coming soon!</p>
          <a href="discovery.html" style="color:#FFB366;margin-top:12px;display:inline-block;">← Explore other states</a>
        </div>
      </div>
    `;
    return;
  }

  // ── SEO: Update page meta, structured data, breadcrumbs ──
  const stateName = stateData.name || stateData.state || unslugify(stateSlug);
  const seoTitle = `${stateName} Tourism — Top Places to Visit & Travel Guide`;
  const seoDesc = stateData.tagline || stateData.description || `Explore ${stateName}, India — discover top attractions, hidden gems, history, and travel tips.`;
  const seoDescTruncated = seoDesc.length > 155 ? seoDesc.substring(0, 152) + '...' : seoDesc;
  const canonicalUrl = `https://www.travvana.com/state-detail.html?state=${encodeURIComponent(stateSlug)}`;

  seoService.clearDynamicSchemas();
  seoService.updatePage({
    title: seoTitle,
    description: seoDescTruncated,
    canonical: canonicalUrl,
    image: stateData.heroImage,
  });
  seoService.injectBreadcrumbSchema([
    { name: 'Home', url: 'https://www.travvana.com/' },
    { name: 'Explore States', url: 'https://www.travvana.com/discovery.html' },
    { name: stateName, url: canonicalUrl },
  ]);
  seoService.injectStateSchema(stateData, stateSlug);

  renderStatePage(container, stateData, stateSlug);
}

/**
 * Render the full state page
 */
function renderStatePage(container, stateData, stateSlug) {
  const gradient = STATE_GRADIENTS[stateSlug] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  const heroImageStyle = stateData.heroImage 
    ? `<img class="state-hero__img" src="${stateData.heroImage}" alt="${stateData.name}" onerror="this.style.display='none'; this.parentElement.style.background='${gradient}';" />`
    : '';

  const fullHTML = `
    <div class="container" style="padding-top:24px;">
      <!-- Back Button -->
      <a href="discovery.html" class="btn btn--primary" style="display:inline-flex; align-items:center; gap:8px; margin-bottom: var(--sp-6); font-size: var(--fs-sm); font-weight: var(--fw-semibold);">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        Back to Explore
      </a>

      <!-- Hero Banner -->
      <div class="state-hero" style="background:${gradient};">
        ${heroImageStyle}
        <div class="state-hero__overlay"></div>
        <div class="state-hero__content">
          <span class="state-hero__label">STATE</span>
          <h1 class="state-hero__title">${escapeHTML(stateData.name || stateData.state || unslugify(stateSlug))}</h1>
          <p class="state-hero__tagline">${escapeHTML(stateData.tagline || 'Explore the beauty and culture of India')}</p>
          <div class="state-hero__stats">
            <div class="state-hero__stat">📍 ${(stateData.places || []).length} Places</div>
          </div>
        </div>
      </div>

      <!-- Quick Info -->
      <div class="state-info-pills">
        <div class="state-info-pill">
          <span class="state-info-pill__icon">🏙️</span>
          <div>
            <div class="state-info-pill__label">Capital</div>
            <div class="state-info-pill__value">${stateData.capital}</div>
          </div>
        </div>
        <div class="state-info-pill">
          <span class="state-info-pill__icon">🗓️</span>
          <div>
            <div class="state-info-pill__label">Best Time</div>
            <div class="state-info-pill__value">${stateData.bestTime}</div>
          </div>
        </div>
        <div class="state-info-pill">
          <span class="state-info-pill__icon">🗣️</span>
          <div>
            <div class="state-info-pill__label">Language</div>
            <div class="state-info-pill__value">${stateData.language}</div>
          </div>
        </div>
      </div>

      <!-- Unified Search & Filter -->
      <div style="margin: 24px 0;">
        ${unifiedSearchBar({ placeholder: 'Search by city, place or state', id: 'state-search' })}
      </div>

      <!-- Results Count -->
      <div class="state-results-bar">
        <span class="state-results-count" id="state-results-count">${(stateData.places || []).length} places found</span>
        <button id="mobile-grid-toggle" class="mobile-grid-toggle" title="Toggle Layout">
          <!-- Icon injected by JS -->
        </button>
      </div>

      <!-- Places Grid -->
      <div class="state-places-grid ${localStorage.getItem('layoutMode') === 'list' ? '' : 'state-places-grid--2col'}" id="state-places-grid">
        ${renderPlaceCards(stateData.places || [], stateSlug)}
      </div>
    </div>
  `;

  setHTML(container, fullHTML, false);

  // Wire up interactivity
  setupSearch(stateData, stateSlug);

  const toggleBtn = qs('#mobile-grid-toggle');
  const placesGrid = qs('#state-places-grid');

  function updateLayoutMode(mode) {
    if (mode === 'grid') {
      placesGrid.classList.add('state-places-grid--2col');
      if (toggleBtn) {
        toggleBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="6" width="18" height="4" rx="1"></rect>
            <rect x="3" y="14" width="18" height="4" rx="1"></rect>
          </svg>
        `;
      }
    } else {
      placesGrid.classList.remove('state-places-grid--2col');
      if (toggleBtn) {
        toggleBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"></rect>
            <rect x="14" y="3" width="7" height="7" rx="1"></rect>
            <rect x="14" y="14" width="7" height="7" rx="1"></rect>
            <rect x="3" y="14" width="7" height="7" rx="1"></rect>
          </svg>
        `;
      }
    }
    localStorage.setItem('layoutMode', mode);
  }

  if (toggleBtn && placesGrid) {
    const currentMode = localStorage.getItem('layoutMode') || 'grid';
    updateLayoutMode(currentMode);

    toggleBtn.addEventListener('click', () => {
      const isGrid = placesGrid.classList.contains('state-places-grid--2col');
      updateLayoutMode(isGrid ? 'list' : 'grid');
    });
  }
}

/**
 * Render place cards HTML
 */
function renderPlaceCards(places, stateSlug) {
  if (!places.length) {
    return `
      <div class="state-empty" style="grid-column: 1/-1;">
        <div class="state-empty__icon">🔍</div>
        <div class="state-empty__title">No places found</div>
        <p>Try a different search or category</p>
      </div>
    `;
  }

  return places.map(place => {
    const imgUrl = resolveImage(place, stateSlug);
    return `
    <a class="state-place-card" href="place-detail.html?place=${encodeURIComponent(place.slug || place.id)}">
      <div class="state-place-card__img-wrap">
        <img class="state-place-card__img" src="${escapeHTML(imgUrl)}" alt="${escapeHTML(place.name)}" loading="lazy"
         onerror="${onErrorHandler()}" />
        <span class="state-place-card__badge">${escapeHTML(place.category || 'heritage')}</span>
      </div>
      <div class="state-place-card__content">
        <h3 class="state-place-card__name">${escapeHTML(place.name)}</h3>
        <p class="state-place-card__city">📍 ${escapeHTML(place.city)}</p>
        <div class="state-place-card__meta">
          <span class="state-place-card__distance">${escapeHTML(place.distance || '')}</span>
          <span class="state-place-card__rating">⭐ ${escapeHTML(place.rating || '4.5')}</span>
        </div>
      </div>
    </a>
    `;
  }).join('');
}

/**
 * Filter places by current search + category
 */
function getFilteredPlaces(stateData) {
  let filtered = stateData.places;

  if (currentCategory !== 'all') {
    filtered = filtered.filter(p => p.category === currentCategory);
  }

  if (currentSearch.trim()) {
    const q = currentSearch.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );
  }

  return filtered;
}

/**
 * Refresh the grid with filtered results
 */
function refreshGrid(stateData, stateSlug) {
  const grid = qs('#state-places-grid');
  const countEl = qs('#state-results-count');
  if (!grid) return;

  const filtered = getFilteredPlaces(stateData);
  grid.innerHTML = renderPlaceCards(filtered, stateSlug);

  if (countEl) {
    countEl.textContent = `${filtered.length} place${filtered.length !== 1 ? 's' : ''} found`;
  }
}

/**
 * Set up the search bar and categories
 */
function setupSearch(stateData, stateSlug) {
  // Update the visual selection based on restored or default state
  // updateCategoryPills is no longer needed if we use unifiedSearchBar's built-in state, but we'll leave it if it exists.

  // Initialize unified search bar with state-specific handlers and restored search/category
  initUnifiedSearchBar('state-search-input', (catId) => {
    currentCategory = catId;
    stateRestoration.saveState({ category: currentCategory });
    refreshGrid(stateData, stateSlug);
  }, (query) => {
    currentSearch = query.toLowerCase();
    stateRestoration.saveState({ search: currentSearch });
    refreshGrid(stateData, stateSlug);
  });

  // Ensure the UI reflects the restored state
  const searchInput = document.querySelector('#state-search-input');
  if (searchInput && currentSearch) {
    searchInput.value = currentSearch;
  }
  
  // Actually, unifiedSearchBar sets active states internally, but to trigger the initial filter:
  refreshGrid(stateData, stateSlug);
  
  // Restore scroll position after grid is rendered
  stateRestoration.restoreScroll();
}
