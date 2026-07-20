/* ============================================
   TRAVVANA — Place Card Component
   ============================================ */

import { starRating, priceLevel } from '../../../utils/dom.js';
import { resolveImage, onErrorHandler } from '../../../services/imageRegistry.js';

/**
 * Render a place card
 * @param {Object} place
 * @param {Object} [options] - { showState: boolean, variant: 'default'|'feed'|'compact' }
 * @returns {string}
 */
export function placeCard(place, options = {}) {
  const { showState = false, variant = 'default' } = options;
  
  const thumbnail = resolveImage(place) || place.thumbnail || place.images?.main || place.image || place.heroImage || '';
  const categoryClass = place.category ? `tag--${place.category}` : '';
  
  const imageHTML = thumbnail
    ? `<img class="card__image" src="${thumbnail}" alt="${place.name}" loading="lazy" onerror="${onErrorHandler()}">`
    : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#f5f5f5,#e8e8e8);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px;color:#aaa;font-size:0.75rem;"><svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5'><rect x='3' y='3' width='18' height='18' rx='3'/><circle cx='8.5' cy='8.5' r='1.5'/><path d='M21 15l-5-5L5 21'/></svg><span>Image coming soon</span></div>`;

  const stateLabel = showState && place.stateId
    ? `<span style="color:var(--clr-text-muted);">· ${place.stateId.replace(/-/g, ' ')}</span>`
    : '';

  const cardClass = variant === 'feed' ? 'card place-card feed-card' : 'card place-card';

  return `
    <a class="${cardClass}" href="place-detail.html?place=${place.slug || place.id}" data-place-id="${place.slug || place.id}" id="place-card-${place.slug || place.id}">
      <div class="card__image-wrap">
        ${imageHTML}
        <div class="card__image-overlay"></div>
        ${place.category ? `<span class="place-card__category tag ${categoryClass}">${place.category}</span>` : ''}
        <button class="place-card__wishlist" aria-label="Save place" onclick="event.preventDefault();">♡</button>
      </div>
      <div class="card__body">
        <h3 class="card__title">${place.name}</h3>
        <p class="card__subtitle">
          📍 ${place.district ? place.district.replace(/-/g, ' ') : ''} ${stateLabel}
        </p>
        <div class="card__meta">
          <div class="card__rating">
            <span class="card__rating-star">★</span>
            <span class="card__rating-value">${place.rating || '—'}</span>
            ${place.reviewCount > 0 ? `<span class="card__rating-count">(${place.reviewCount.toLocaleString()})</span>` : ''}
          </div>
          ${place.priceLevel ? `<div class="card__price">${priceLevel(place.priceLevel)}</div>` : ''}
        </div>
      </div>
    </a>
  `;
}

/**
 * Render a horizontal place card (for feeds)
 */
export function placeCardHorizontal(place) {
  return `
    <a class="nearby-card" href="place-detail.html?place=${place.slug || place.id}" data-place-id="${place.slug || place.id}" id="horizontal-card-${place.slug || place.id}">
      ${(resolveImage(place) || place.images?.main || place.thumbnail || place.image) ? `<img class="nearby-card__image" src="${resolveImage(place) || place.images?.main || place.thumbnail || place.image}" alt="${place.name}" loading="lazy" onerror="${onErrorHandler()}">` : `<div class="nearby-card__image" style="background:linear-gradient(135deg,#f5f5f5,#e8e8e8);display:flex;align-items:center;justify-content:center;color:#aaa;"><svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5'><rect x='3' y='3' width='18' height='18' rx='3'/></svg></div>`}
      <div class="nearby-card__info">
        <h4 class="nearby-card__title">${place.name}</h4>
        <span class="nearby-card__distance">${place.category || ''}</span>
        <div class="nearby-card__rating">
          <span style="color:var(--clr-star);">★</span>
          <span>${place.rating || '—'}</span>
        </div>
      </div>
    </a>
  `;
}
