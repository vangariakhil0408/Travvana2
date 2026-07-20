/* ============================================
   TRAVVANA — Render States Grid
   Interactive discovery page with region,
   category, and search filtering
   ============================================ */

import { unifiedSearchBar } from '../components/searchBar.js';
import { CONFIG } from '../../../core/config.js';
import { setHTML, escapeHTML } from '../../../utils/dom.js';
import { STATE_IMAGES, STATE_ATTRACTIONS } from '../../../data/sharedStateData.js';

/* ── State display names ── */
const STATE_DISPLAY_NAMES = {
  'andhra-pradesh': 'Andhra Pradesh',
  'arunachal-pradesh': 'Arunachal Pradesh',
  'assam': 'Assam',
  'bihar': 'Bihar',
  'chhattisgarh': 'Chhattisgarh',
  'goa': 'Goa',
  'gujarat': 'Gujarat',
  'haryana': 'Haryana',
  'himachal-pradesh': 'Himachal Pradesh',
  'jharkhand': 'Jharkhand',
  'karnataka': 'Karnataka',
  'kerala': 'Kerala',
  'madhya-pradesh': 'Madhya Pradesh',
  'maharashtra': 'Maharashtra',
  'manipur': 'Manipur',
  'meghalaya': 'Meghalaya',
  'mizoram': 'Mizoram',
  'nagaland': 'Nagaland',
  'odisha': 'Odisha',
  'punjab': 'Punjab',
  'rajasthan': 'Rajasthan',
  'sikkim': 'Sikkim',
  'tamil-nadu': 'Tamil Nadu',
  'telangana': 'Telangana',
  'tripura': 'Tripura',
  'uttar-pradesh': 'Uttar Pradesh',
  'uttarakhand': 'Uttarakhand',
  'west-bengal': 'West Bengal',
  'andaman-and-nicobar-islands': 'Andaman & Nicobar',
  'chandigarh': 'Chandigarh',
  'dadra-nagar-haveli-daman-diu': 'Dadra & Nagar Haveli',
  'delhi': 'Delhi',
  'jammu-and-kashmir': 'Jammu & Kashmir',
  'ladakh': 'Ladakh',
  'lakshadweep': 'Lakshadweep',
  'puducherry': 'Puducherry',
};



/* ══════════════════════════════════════════
   REGION MAPPING — which region each state belongs to
   ══════════════════════════════════════════ */
const STATE_REGIONS = {
  // North
  'haryana': 'north',
  'himachal-pradesh': 'north',
  'punjab': 'north',
  'uttar-pradesh': 'north',
  'uttarakhand': 'north',
  'chandigarh': 'north',
  'delhi': 'north',
  'jammu-and-kashmir': 'north',
  'ladakh': 'north',
  // South
  'andhra-pradesh': 'south',
  'karnataka': 'south',
  'kerala': 'south',
  'tamil-nadu': 'south',
  'telangana': 'south',
  'puducherry': 'south',
  'lakshadweep': 'south',
  'andaman-and-nicobar-islands': 'south',
  // East
  'bihar': 'east',
  'jharkhand': 'east',
  'odisha': 'east',
  'west-bengal': 'east',
  // West
  'goa': 'west',
  'gujarat': 'west',
  'maharashtra': 'west',
  'rajasthan': 'west',
  'dadra-nagar-haveli-daman-diu': 'west',
  // Central
  'chhattisgarh': 'central',
  'madhya-pradesh': 'central',
  // Northeast
  'arunachal-pradesh': 'northeast',
  'assam': 'northeast',
  'manipur': 'northeast',
  'meghalaya': 'northeast',
  'mizoram': 'northeast',
  'nagaland': 'northeast',
  'sikkim': 'northeast',
  'tripura': 'northeast',
};

/* ══════════════════════════════════════════
   CATEGORY MAPPING — what each state is known for
   ══════════════════════════════════════════ */
const STATE_CATEGORIES = {
  'andhra-pradesh': ['temples', 'heritage', 'beaches'],
  'arunachal-pradesh': ['nature', 'hills'],
  'assam': ['wildlife', 'nature', 'national-parks'],
  'bihar': ['heritage', 'temples'],
  'chhattisgarh': ['waterfalls', 'nature', 'wildlife'],
  'goa': ['beaches', 'heritage', 'waterfalls'],
  'gujarat': ['wildlife', 'heritage', 'deserts', 'temples', 'national-parks'],
  'haryana': ['heritage'],
  'himachal-pradesh': ['hills', 'nature', 'temples'],
  'jharkhand': ['waterfalls', 'nature'],
  'karnataka': ['heritage', 'temples', 'nature', 'waterfalls', 'beaches'],
  'kerala': ['nature', 'beaches', 'lakes'],
  'madhya-pradesh': ['heritage', 'wildlife', 'national-parks', 'temples'],
  'maharashtra': ['heritage', 'beaches', 'hills'],
  'manipur': ['nature', 'lakes'],
  'meghalaya': ['nature', 'waterfalls', 'hills'],
  'mizoram': ['nature', 'hills'],
  'nagaland': ['heritage', 'nature'],
  'odisha': ['heritage', 'temples', 'beaches', 'lakes'],
  'punjab': ['heritage', 'temples'],
  'rajasthan': ['heritage', 'deserts', 'wildlife', 'lakes', 'national-parks'],
  'sikkim': ['hills', 'nature', 'lakes'],
  'tamil-nadu': ['temples', 'heritage', 'hills', 'beaches'],
  'telangana': ['heritage', 'temples'],
  'tripura': ['heritage', 'nature'],
  'uttar-pradesh': ['heritage', 'temples'],
  'uttarakhand': ['hills', 'nature', 'wildlife', 'national-parks', 'temples'],
  'west-bengal': ['heritage', 'wildlife', 'nature', 'national-parks'],
  'andaman-and-nicobar-islands': ['beaches', 'nature'],
  'chandigarh': ['lakes', 'heritage'],
  'dadra-nagar-haveli-daman-diu': ['beaches', 'heritage'],
  'delhi': ['heritage', 'temples'],
  'jammu-and-kashmir': ['hills', 'nature', 'lakes'],
  'ladakh': ['deserts', 'nature', 'lakes', 'hills'],
  'lakshadweep': ['beaches', 'nature'],
  'puducherry': ['beaches', 'heritage'],
};

/* ── All 28 States (alphabetical) ── */
const ALL_STATES = [
  'andhra-pradesh', 'arunachal-pradesh', 'assam', 'bihar', 'chhattisgarh',
  'goa', 'gujarat', 'haryana', 'himachal-pradesh', 'jharkhand',
  'karnataka', 'kerala', 'madhya-pradesh', 'maharashtra', 'manipur',
  'meghalaya', 'mizoram', 'nagaland', 'odisha', 'punjab',
  'rajasthan', 'sikkim', 'tamil-nadu', 'telangana', 'tripura',
  'uttar-pradesh', 'uttarakhand', 'west-bengal',
];

/* ── All 8 Union Territories (alphabetical) ── */
const ALL_UTS = [
  'andaman-and-nicobar-islands', 'chandigarh', 'dadra-nagar-haveli-daman-diu',
  'delhi', 'jammu-and-kashmir', 'ladakh', 'lakshadweep', 'puducherry',
];

/* ── Categories relevant for state filtering (exclude restaurants/hotels) ── */
const EXPLORE_CATEGORIES = [
  'all', 'heritage', 'temples', 'nature', 'wildlife', 'beaches',
  'hills', 'waterfalls', 'national-parks', 'deserts', 'lakes',
];


/**
 * Build a state card with data attributes for filtering
 */
function stateCard(slug, type) {
  const name = STATE_DISPLAY_NAMES[slug] || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const image = STATE_IMAGES[slug] || '';
  const attractions = STATE_ATTRACTIONS[slug] || '';
  const region = STATE_REGIONS[slug] || '';
  const categories = (STATE_CATEGORIES[slug] || []).join(',');
  const searchText = `${name} ${attractions} ${type === 'ut' ? 'union territory' : 'state'}`.toLowerCase();

  const imageHTML = image
    ? `<img class="card__image" src="${image}" alt="${name}" loading="lazy">`
    : `<div class="state-card__gradient" style="background: linear-gradient(135deg, #1a2332 0%, #0f2847 100%); width:100%; height:100%;"></div>`;

  const typeBadge = type === 'ut'
    ? `<span class="disco-state-card__badge">UT</span>`
    : '';

  return `
    <a class="card destination-card disco-state-card"
       href="state-detail.html?state=${slug}"
       data-state-id="${slug}"
       data-region="${region}"
       data-categories="${categories}"
       data-type="${type}"
       data-search="${searchText}"
       id="disco-state-${slug}">
      <div class="card__image-wrap">
        ${imageHTML}
        <div class="card__image-overlay"></div>
        ${typeBadge}
        <div class="card__overlay-content">
          <h3 class="card__title">${name}</h3>
          <div class="destination-card__location" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${attractions ? attractions.split(' • ').join(' · ') : 'State / UT'}</div>
          <span class="destination-card__cta">Explore <span>→</span></span>
        </div>
      </div>
    </a>
  `;
}


/**
 * Render the full discovery/explore page (called once)
 */
export function renderStatesGrid(data, container) {
  const { filters = {} } = data;

  // ── Unified Search Component ──
  const unifiedSearchHTML = unifiedSearchBar({
    placeholder: 'Search by city, place or state',
    id: 'discovery-search',
    activeCategory: filters.category || 'all'
  });

  // ── Active filters indicator (hidden by default) ──
  const activeFiltersHTML = `
    <div class="disco-active-filters" id="disco-active-filters" style="display:none;">
      <div class="disco-active-filters__tags" id="disco-active-tags"></div>
      <button class="disco-active-filters__clear" id="disco-reset-filters">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        Clear All
      </button>
    </div>
  `;

  // ── Single unified grid ──
  const allCards = [
    ...ALL_STATES.map(slug => stateCard(slug, 'state')),
    ...ALL_UTS.map(slug => stateCard(slug, 'ut')),
  ].join('');

  const gridHTML = `
    <div class="disco-section" id="disco-all-section">
      <div class="disco-section__header">
        <h2 class="disco-section__title" id="disco-grid-title">All States & Union Territories</h2>
        <span class="disco-section__subtitle" id="disco-grid-count">36 regions</span>
      </div>
      <div class="disco-state-grid" id="disco-main-grid">
        ${allCards}
      </div>
      <div class="disco-empty-state" id="disco-empty" style="display:none;">
        <div class="disco-empty-state__icon">🗺️</div>
        <h3 class="disco-empty-state__title">No regions found</h3>
        <p class="disco-empty-state__text">Try adjusting your filters or search query</p>
        <button class="disco-empty-state__reset" id="disco-empty-reset">
          Reset All Filters
        </button>
      </div>
    </div>
  `;

  const fullHTML = `
    <div class="discovery-page">
      <div class="container">
        <!-- Back to Home Button -->
        <a href="index.html" class="btn btn--primary" style="display:inline-flex; align-items:center; gap:8px; margin-bottom: var(--sp-6); font-size: var(--fs-sm); font-weight: var(--fw-semibold);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Back to Home
        </a>
        
        <div class="discovery-header">
          <h1 class="discovery-header__title">Explore India</h1>
          <p class="discovery-header__subtitle">28 States · 8 Union Territories · Endless Adventures</p>
        </div>
        <div class="discovery-search" style="margin: 24px 0;">
          ${unifiedSearchHTML}
        </div>
        ${activeFiltersHTML}
        ${gridHTML}
      </div>
    </div>
  `;

  setHTML(container, fullHTML);
}


/**
 * Filter state cards in-place without re-rendering the page.
 * Shows/hides cards based on region, category, and search query.
 * Returns the count of visible cards.
 */
export function filterDiscoveryCards(filters = {}) {
  const { region = 'all', category = 'all', query = '' } = filters;
  const grid = document.getElementById('disco-main-grid');
  const emptyEl = document.getElementById('disco-empty');
  const titleEl = document.getElementById('disco-grid-title');
  const countEl = document.getElementById('disco-grid-count');
  const activeFiltersEl = document.getElementById('disco-active-filters');
  const activeTagsEl = document.getElementById('disco-active-tags');

  if (!grid) return 0;

  const cards = grid.querySelectorAll('.disco-state-card');
  let visibleCount = 0;
  let statesCount = 0;
  let utsCount = 0;
  const normalizedQuery = query.toLowerCase().trim();

  cards.forEach((card) => {
    const cardRegion = card.dataset.region;
    const cardCategories = (card.dataset.categories || '').split(',');
    const cardSearch = card.dataset.search || '';
    const cardType = card.dataset.type;

    let show = true;

    // Region filter
    if (region !== 'all' && cardRegion !== region) show = false;

    // Category filter
    if (show && category !== 'all' && !cardCategories.includes(category)) show = false;

    // Search filter
    if (show && normalizedQuery && !cardSearch.includes(normalizedQuery)) show = false;

    if (show) {
      card.classList.remove('disco-state-card--hidden');
      card.style.animationDelay = `${visibleCount * 0.03}s`;
      visibleCount++;
      if (cardType === 'state') statesCount++;
      else utsCount++;
    } else {
      card.classList.add('disco-state-card--hidden');
    }
  });

  // ── Update title ──
  if (titleEl) {
    const regionLabel = region !== 'all'
      ? CONFIG.REGIONS.find(r => r.id === region)?.label || region
      : '';
    const catLabel = category !== 'all'
      ? CONFIG.CATEGORIES.find(c => c.id === category)?.label || category
      : '';

    if (normalizedQuery) {
      titleEl.textContent = `Results for "${query}"`;
    } else if (regionLabel && catLabel) {
      titleEl.textContent = `${catLabel} in ${regionLabel}`;
    } else if (regionLabel) {
      titleEl.textContent = `${regionLabel} India`;
    } else if (catLabel) {
      titleEl.textContent = `${catLabel} Destinations`;
    } else {
      titleEl.textContent = 'All States & Union Territories';
    }
  }

  // ── Update count ──
  if (countEl) {
    const parts = [];
    if (statesCount > 0) parts.push(`${statesCount} State${statesCount > 1 ? 's' : ''}`);
    if (utsCount > 0) parts.push(`${utsCount} UT${utsCount > 1 ? 's' : ''}`);
    countEl.textContent = parts.length > 0 ? parts.join(' · ') : '0 results';
  }

  // ── Show/hide empty state ──
  if (emptyEl) emptyEl.style.display = visibleCount === 0 ? 'flex' : 'none';
  grid.style.display = visibleCount === 0 ? 'none' : '';

  // ── Active filters indicator ──
  const hasActiveFilters = region !== 'all' || category !== 'all' || normalizedQuery;
  if (activeFiltersEl) {
    activeFiltersEl.style.display = hasActiveFilters ? 'flex' : 'none';
  }
  if (activeTagsEl && hasActiveFilters) {
    const tags = [];
    if (region !== 'all') {
      const rl = CONFIG.REGIONS.find(r => r.id === region)?.label || region;
      tags.push(`<span class="disco-active-tag" data-clear="region">📍 ${rl} <span class="disco-active-tag__x">✕</span></span>`);
    }
    if (category !== 'all') {
      const cl = CONFIG.CATEGORIES.find(c => c.id === category);
      tags.push(`<span class="disco-active-tag" data-clear="category">${cl?.icon || ''} ${cl?.label || category} <span class="disco-active-tag__x">✕</span></span>`);
    }
    if (normalizedQuery) {
      tags.push(`<span class="disco-active-tag" data-clear="search">🔍 "${escapeHTML(query)}" <span class="disco-active-tag__x">✕</span></span>`);
    }
    activeTagsEl.innerHTML = tags.join('');
  }

  // ── Re-trigger stagger animation ──
  grid.classList.remove('disco-grid--animate');
  void grid.offsetWidth; // force reflow
  grid.classList.add('disco-grid--animate');

  return visibleCount;
}


/**
 * Render discovery page skeleton
 */
export function renderStatesGridSkeleton(container) {
  setHTML(container, `
    <div class="discovery-page">
      <div class="container" style="padding-top:var(--sp-6);">
        <div class="skeleton skeleton--title" style="width:200px;margin-bottom:var(--sp-2);"></div>
        <div class="skeleton skeleton--text-sm" style="width:280px;margin-bottom:var(--sp-4);"></div>
        <div class="skeleton" style="height:44px;border-radius:var(--radius-xl);margin-bottom:var(--sp-4);"></div>
        <div class="skeleton" style="height:36px;border-radius:var(--radius-lg);margin-bottom:var(--sp-4);"></div>
        <div class="disco-state-grid">
          ${Array(8).fill(`
            <div class="card state-card disco-state-card" style="background:var(--clr-bg-card);overflow:hidden;">
              <div class="skeleton" style="width:100%;height:100%;border-radius:var(--radius-lg);"></div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `, false);
}
