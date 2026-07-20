/* ============================================
   TRAVVANA — Render Popular Places
   ============================================ */

import { placeCard } from '../components/placeCard.js';
import { setHTML } from '../../../utils/dom.js';

/**
 * Render popular places carousel
 * @param {Object} data - { places, stateSlug }
 * @param {Element} container
 */
export function renderPopularPlaces(data, container) {
  const { places, stateSlug } = data;

  if (!places || !places.length) {
    container.innerHTML = '';
    return;
  }

  const html = `
    <div class="scroll-x">
      ${places.map(p => placeCard({ ...p, stateId: stateSlug }, { variant: 'feed' })).join('')}
    </div>
  `;

  setHTML(container, html);
}
