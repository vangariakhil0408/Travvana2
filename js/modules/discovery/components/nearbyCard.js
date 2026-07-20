/* ============================================
   TRAVVANA — Nearby Card Component (Redesign)
   ============================================ */

import { resolveImage, onErrorHandler } from '../../../services/imageRegistry.js';

/**
 * Render a nearby place card (vertical premium grid)
 * @param {Object} place
 * @param {string} stateSlug
 * @returns {string}
 */
export function nearbyCard(place, stateId) {
  const subtitle = place.distance ? `📍 ${place.distance} away` : 'Nearby';
  
  // Resolve image through the registry — NEVER use hero_banner.png
  const imgSrc = resolveImage(place, stateId) || place.images?.main || place.thumbnail || place.heroImage || place.image || '';

  const imageHTML = imgSrc
    ? `<img src="${imgSrc}" 
           alt="${(place.name || '').replace(/"/g, '&quot;')}" 
           loading="lazy" 
           onerror="${onErrorHandler()}" />`
    : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#f5f5f5,#e8e8e8);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px;color:#aaa;font-size:0.75rem;border-radius:inherit;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
        <span>Image coming soon</span>
      </div>`;

  return `
    <a href="place-detail.html?place=${place.slug || place.id}" 
       class="nearby-card-premium" 
       id="nearby-card-${place.slug || place.id || ''}"
       data-place-id="${place.slug || place.id || ''}"
       data-category="${place.category || ''}">
      
      <div class="nearby-card-img-wrap">
        ${imageHTML}
      </div>
      
      <div class="nearby-card-content">
        <h4 class="nearby-card-title">${place.name}</h4>
        <span class="nearby-card-subtitle">${subtitle}</span>
      </div>
      
    </a>
  `;
}
