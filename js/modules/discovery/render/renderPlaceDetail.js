
/* ============================================
   TRAVVANA — Render Place Detail (SEO Enhanced)
   ============================================ */

import { setHTML, escapeHTML } from '../../../utils/dom.js';
import { resolveImage, onErrorHandler } from '../../../services/imageRegistry.js';

/**
 * Render the loading skeleton for place details
 */
export function renderPlaceDetailSkeleton(container) {
  setHTML(container, `
    <div class="detail-back-btn-wrap">
      <div class="skeleton" style="width: 150px; height: 32px; border-radius: var(--chip-radius);"></div>
    </div>
    <div class="detail-card">
      <div class="skeleton" style="width: 60%; height: 48px; margin-bottom: 24px;"></div>
      <div class="detail-hero-wrap">
        <div class="skeleton" style="width: 100%; aspect-ratio: 16/9; max-height: 650px;"></div>
      </div>
      <div class="detail-pills">
        <div class="skeleton" style="width: 100px; height: 36px; border-radius: 20px;"></div>
        <div class="skeleton" style="width: 120px; height: 36px; border-radius: 20px;"></div>
        <div class="skeleton" style="width: 150px; height: 36px; border-radius: 20px;"></div>
      </div>
      <div class="skeleton" style="width: 30%; height: 28px; margin-bottom: 20px;"></div>
      <div class="skeleton" style="width: 100%; height: 80px; margin-bottom: 32px;"></div>
      <div class="detail-info-grid">
        <div class="skeleton detail-info-card" style="height: 80px;"></div>
        <div class="skeleton detail-info-card" style="height: 80px;"></div>
        <div class="skeleton detail-info-card" style="height: 80px;"></div>
        <div class="skeleton detail-info-card" style="height: 80px;"></div>
      </div>
    </div>
  `, false);
}

/**
 * Render the full place detail page
 * @param {Object} place - Place data
 * @param {HTMLElement} container - DOM container
 * @param {Array} [faqs] - FAQ array from seoService for visual rendering
 */
export function renderPlaceDetail(place, container, faqs = []) {
  const backLink = 'discovery.html';
  const backLabel = 'Back';

  const imgSrc = resolveImage(place) || place.images?.main || place.heroImage || place.image || '';
  const stateLabel = place.state || 'India';
  const altText = `${place.name} in ${place.city || ''}, ${stateLabel}`;

  const imageHTML = imgSrc && imgSrc !== 'null'
    ? `<img class="detail-hero-img" src="${imgSrc}" alt="${altText}" width="800" height="450" fetchpriority="high" onerror="${onErrorHandler()}">`
    : `<div class="detail-hero-img" style="background:linear-gradient(135deg,#f5f5f5,#e8e8e8);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;color:#aaa;font-size:1rem;" role="img" aria-label="${altText}"><svg width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5'><rect x='3' y='3' width='18' height='18' rx='3'/><circle cx='8.5' cy='8.5' r='1.5'/><path d='M21 15l-5-5L5 21'/></svg><span>Image coming soon</span></div>`;

  const pills = [];
  if (place.city) pills.push(`📍 ${escapeHTML(place.city)}`);
  if (place.distance) pills.push(`🚗 ${escapeHTML(place.distance)}`);
  if (place.bestTime) pills.push(`🌤️ Best: ${escapeHTML(place.bestTime)}`);

  const infoCards = [];
  if (place.timings) {
    infoCards.push(`
      <div class="detail-info-card">
        <div class="detail-info-label">TIMINGS</div>
        <div class="detail-info-value">${escapeHTML(place.timings)}</div>
      </div>
    `);
  }
  if (place.entryFee) {
    infoCards.push(`
      <div class="detail-info-card">
        <div class="detail-info-label">ENTRY FEE</div>
        <div class="detail-info-value">${escapeHTML(place.entryFee)}</div>
      </div>
    `);
  }
  if (place.famousFor) {
    infoCards.push(`
      <div class="detail-info-card">
        <div class="detail-info-label">FAMOUS FOR</div>
        <div class="detail-info-value">${escapeHTML(place.famousFor)}</div>
      </div>
    `);
  }

  // Build breadcrumb HTML
  const stateSlug = place.state ? place.state.toLowerCase().replace(/\s+/g, '-') : '';
  const breadcrumbHTML = `
    <nav class="breadcrumb" aria-label="Breadcrumb" id="breadcrumb-nav">
      <span class="breadcrumb__item"><a href="index.html">Home</a></span>
      <span class="breadcrumb__separator">›</span>
      <span class="breadcrumb__item"><a href="discovery.html">Explore</a></span>
      <span class="breadcrumb__separator">›</span>
      ${stateSlug ? `<span class="breadcrumb__item"><a href="state-detail.html?state=${stateSlug}">${escapeHTML(stateLabel)}</a></span><span class="breadcrumb__separator">›</span>` : ''}
      <span class="breadcrumb__item breadcrumb__item--active">${escapeHTML(place.name)}</span>
    </nav>
  `;

  // Build FAQ section HTML (visual rendering to match schema)
  let faqHTML = '';
  if (faqs && faqs.length > 0) {
    faqHTML = `
      <div class="detail-faq-section" style="margin-top: 48px;">
        <div class="detail-section-title-wrap" style="margin-bottom: 20px;">
          <div class="detail-section-indicator"></div>
          <h2 class="detail-section-title">Frequently Asked Questions</h2>
        </div>
        <div class="detail-faq-list" itemscope itemtype="https://schema.org/FAQPage">
          ${faqs.map(faq => `
            <details class="detail-faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
              <summary class="detail-faq-question" itemprop="name">${escapeHTML(faq.question)}</summary>
              <div class="detail-faq-answer" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
                <p itemprop="text">${escapeHTML(faq.answer)}</p>
              </div>
            </details>
          `).join('')}
        </div>
      </div>
    `;
  }

  const html = `
    <!-- Breadcrumb Navigation -->
    ${breadcrumbHTML}

    <!-- Back Button -->
    <div class="detail-back-btn-wrap">
      <a href="${backLink}" onclick="if(window.history.length > 1 && document.referrer.includes(window.location.host)) { window.history.back(); return false; }" class="btn btn--primary" style="display:inline-flex; align-items:center; gap:8px; font-size: var(--fs-sm); font-weight: var(--fw-semibold);">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        ${backLabel}
      </a>
    </div>

    <!-- Main Detail Card -->
    <article class="detail-card page-transition-enter page-transition-active" itemscope itemtype="https://schema.org/TouristAttraction">
      <h1 class="detail-title" itemprop="name">${escapeHTML(place.name)}</h1>
      
      <div class="detail-hero-wrap">
        ${imageHTML}
      </div>

      <div class="detail-pills">
        ${pills.map(p => `<div class="detail-pill">${p}</div>`).join('')}
      </div>

      <div class="detail-about-card">
        <div class="detail-section-title-wrap">
          <div class="detail-section-indicator"></div>
          <h2 class="detail-section-title">About</h2>
        </div>
        <p class="detail-text" style="margin-bottom: 0;" itemprop="description">${escapeHTML(place.history || place.description || place.overview || 'Information about this place will be updated soon.')}</p>
      </div>

      <div class="detail-info-grid">
        ${infoCards.join('')}
      </div>

      ${faqHTML}

      <!-- Nearby Section -->
      <div id="nearby-section" style="margin-top: 60px;">
        <div class="detail-section-title-wrap" style="margin-bottom: 24px;">
          <div class="detail-section-indicator"></div>
          <h2 class="detail-section-title">Nearby Places</h2>
        </div>
        
        <div class="nearby-grid" id="nearby-places-list">
          <!-- Loaded by placeController -->
        </div>

        <div id="nearby-more-container" style="display: none; justify-content: flex-end; margin-top: 24px;">
          <button class="btn btn--primary" id="nearby-more-btn">More</button>
        </div>
      </div>
    </article>
  `;

  setHTML(container, html, false);
}
