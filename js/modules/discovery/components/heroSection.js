/* ============================================
   TRAVVANA — Hero Section Component
   ============================================ */

import { STATE_GRADIENTS } from '../../../utils/constants.js';

/**
 * Render a hero banner
 * @param {Object} data
 * @param {Object} [options] - { variant: 'full'|'compact'|'default', showSearch: boolean }
 * @returns {string}
 */
export function heroSection(data, options = {}) {
  const { variant = 'default', showSearch = false } = options;
  const variantClass = variant === 'full' ? 'hero--full' : variant === 'compact' ? 'hero--compact' : '';
  
  const gradient = STATE_GRADIENTS[data.slug] || 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
  
  const bgHTML = data.heroImage
    ? `<img src="${data.heroImage}" alt="${data.title || data.name}" loading="eager">`
    : `<div class="hero__bg-gradient" style="background: ${gradient};"></div>`;

  const searchHTML = showSearch ? `
    <div class="hero__search">
      <div class="search-bar">
        <div class="search-bar__input-wrap">
          <span class="search-bar__icon">🔍</span>
          <input class="search-bar__input" type="text" placeholder="Search states, places, experiences..." id="hero-search-input">
          <button class="search-bar__clear" id="hero-search-clear">✕</button>
        </div>
      </div>
    </div>
  ` : '';

  const statsHTML = data.stats ? `
    <div class="hero__stats">
      ${Object.entries(data.stats).map(([key, val]) => `
        <div class="hero__stat">
          <div class="hero__stat-value">${typeof val === 'number' ? val.toLocaleString() : val}</div>
          <div class="hero__stat-label">${key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</div>
        </div>
      `).join('')}
    </div>
  ` : '';

  return `
    <section class="hero ${variantClass}" id="hero-section">
      <div class="hero__bg">
        ${bgHTML}
        <div class="hero__bg-overlay"></div>
      </div>
      <div class="hero__content">
        ${data.label ? `<span class="hero__label">${data.label}</span>` : ''}
        <h1 class="hero__title">${data.title || data.name}</h1>
        ${data.subtitle ? `<p class="hero__subtitle">${data.subtitle}</p>` : ''}
        ${searchHTML}
        ${statsHTML}
        ${data.actions ? `
          <div class="hero__actions">
            ${data.actions.map(a => `
              <a class="btn ${a.variant || 'btn--primary'}" href="${a.href || '#'}">${a.icon || ''} ${a.label}</a>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </section>
  `;
}
