/* ============================================
   TRAVVANA — District Card Component
   ============================================ */

/**
 * Render a district card
 * @param {Object} district
 * @param {string} stateSlug
 * @returns {string}
 */
export function districtCard(district, stateSlug) {
  const thumbnail = district.thumbnail || '';
  
  const imageHTML = thumbnail
    ? `<img class="card__image" src="${thumbnail}" alt="${district.name}" loading="lazy">`
    : `<div style="width:100%;height:100%;background:var(--clr-bg-tertiary);display:flex;align-items:center;justify-content:center;font-size:2rem;">🏙️</div>`;

  return `
    <a class="card district-card" href="#" onclick="event.preventDefault();" data-district-id="${district.slug}" id="district-card-${district.slug}">
      <div class="card__image-wrap">
        ${imageHTML}
        <div class="card__image-overlay"></div>
        <div class="card__overlay-content">
          <h3 class="card__title" style="color:white;">${district.name}</h3>
          <span class="card__subtitle" style="color:rgba(255,255,255,0.7);">
            📍 ${district.totalPlaces || 0} places
          </span>
        </div>
      </div>
      <div class="card__body">
        <p class="card__subtitle text-truncate">${district.tagline || ''}</p>
        ${district.categories ? `
          <div style="display:flex;gap:var(--sp-1);margin-top:var(--sp-2);flex-wrap:wrap;">
            ${district.categories.slice(0, 3).map(c => `<span class="tag tag--${c}" style="font-size:10px;">${c}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    </a>
  `;
}
