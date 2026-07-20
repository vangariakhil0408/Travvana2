/* ============================================
   TRAVVANA — State Card Component
   ============================================ */

import { STATE_GRADIENTS } from '../../../utils/constants.js';

/**
 * Render a state card
 * @param {Object} state - State data object
 * @param {Object} [options] - { size: 'default'|'compact'|'featured' }
 * @returns {string} HTML string
 */
export function stateCard(state, options = {}) {
  const { size = 'default' } = options;
  const gradient = STATE_GRADIENTS[state.slug] || STATE_GRADIENTS[state.id] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  
  const imageHTML = state.heroImage
    ? `<img class="card__image" src="${state.heroImage}" alt="${state.name}" loading="lazy">`
    : `<div class="state-card__gradient" style="background: ${gradient}"></div>`;

  if (size === 'compact') {
    return `
      <a class="card state-card" href="state-detail.html?state=${state.slug}" data-state-id="${state.slug}" id="state-card-${state.slug}">
        <div class="card__image-wrap">
          ${imageHTML}
          <div class="card__image-overlay--full"></div>
          <div class="card__overlay-content">
            <h3 class="card__title" style="color:white; font-size: var(--fs-base);">${state.name}</h3>
            <span class="card__subtitle" style="color:rgba(255,255,255,0.7);">
              📍 ${state.totalPlaces || 0} places
            </span>
          </div>
        </div>
      </a>
    `;
  }

  return `
    <a class="card state-card" href="state-detail.html?state=${state.slug}" data-state-id="${state.slug}" id="state-card-${state.slug}">
      <div class="card__image-wrap">
        ${imageHTML}
        <div class="card__image-overlay--full"></div>
        <div class="card__overlay-content">
          <h3 class="card__title" style="color:white; font-size: var(--fs-lg);">${state.name}</h3>
          <p class="state-card__tagline">${state.tagline || ''}</p>
          <div class="state-card__stats">
            <span class="state-card__stat">
              <span class="state-card__stat-icon">🏛️</span>
              ${state.totalDistricts || 0} Districts
            </span>
            <span class="state-card__stat">
              <span class="state-card__stat-icon">📍</span>
              ${state.totalPlaces || 0} Places
            </span>
          </div>
        </div>
      </div>
    </a>
  `;
}

/**
 * Render a featured (large) state card
 */
export function stateCardFeatured(state) {
  const gradient = STATE_GRADIENTS[state.slug] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  
  const imageHTML = state.heroImage
    ? `<img class="card__image" src="${state.heroImage}" alt="${state.name}" loading="lazy">`
    : `<div class="state-card__gradient" style="background: ${gradient}"></div>`;

  return `
    <a class="card state-card" href="state-detail.html?state=${state.slug}" data-state-id="${state.slug}" style="grid-column: span 2;" id="state-card-featured-${state.slug}">
      <div class="card__image-wrap card__image-wrap--wide">
        ${imageHTML}
        <div class="card__image-overlay--full"></div>
        <div class="card__overlay-content">
          <span class="tag" style="margin-bottom: var(--sp-2);">🔥 Popular</span>
          <h3 class="card__title" style="color:white; font-size: var(--fs-2xl);">${state.name}</h3>
          <p class="state-card__tagline">${state.tagline || ''}</p>
          <div class="state-card__stats">
            <span class="state-card__stat">
              <span class="state-card__stat-icon">🏛️</span>
              ${state.totalDistricts || 0} Districts
            </span>
            <span class="state-card__stat">
              <span class="state-card__stat-icon">📍</span>
              ${state.totalPlaces || 0} Places
            </span>
            <span class="state-card__stat">
              <span class="state-card__stat-icon">⭐</span>
              ${state.popularityScore || 0}
            </span>
          </div>
        </div>
      </div>
    </a>
  `;
}
