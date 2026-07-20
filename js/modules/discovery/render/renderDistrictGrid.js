/* ============================================
   TRAVVANA — Render District Grid
   ============================================ */

import { districtCard } from '../components/districtCard.js';
import { setHTML, skeletonCards } from '../../../utils/dom.js';

/**
 * Render districts grid within a state detail or district page
 * @param {Object} data - { districts, stateSlug, stateName }
 * @param {Element} container
 */
export function renderDistrictGrid(data, container) {
  const { districts, stateSlug, stateName } = data;

  if (!districts || !districts.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">🏙️</div>
        <div class="empty-state__title">No districts available</div>
        <p>District data for ${stateName || 'this state'} coming soon</p>
      </div>
    `;
    return;
  }

  const gridHTML = `
    <div class="grid grid--2 stagger-children" id="districts-grid-items">
      ${districts.map(d => districtCard(d, stateSlug)).join('')}
    </div>
  `;

  setHTML(container, gridHTML);
}

/**
 * Render districts skeleton
 */
export function renderDistrictGridSkeleton(container) {
  container.innerHTML = `
    <div class="skeleton-grid">
      ${skeletonCards(6)}
    </div>
  `;
}
