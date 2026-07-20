/* ============================================
   TRAVVANA — Image Registry Service
   Centralised image resolution with fuzzy matching.
   NEVER returns hero_banner.png / Travvana placeholder.
   ============================================ */

/**
 * Build a normalised key from a slug or filename.
 * Strips suffixes like "-delhi", "-cp", state names etc.
 */
function normalise(str) {
  return (str || '')
    .toLowerCase()
    .replace(/\.(png|jpg|jpeg|webp)$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Known slug → actual-image-filename overrides for Delhi.
 * These are the cases where the file on disk has a DIFFERENT name to the slug.
 */
const DELHI_OVERRIDES = {
  'swaminarayan-akshardham': 'swaminarayan-akshardham',
  'lodhi-garden':            'lodhi-garden',
  'hauz-khas-fort':          'hauz-khas-fort',
  'jantar-mantar-delhi':     'jantar-mantar',
  'birla-mandir-delhi':      'birla-mandir-delhi',
  'kalkaji-temple':          'kalkaji-temple',
  'hanuman-mandir-cp':       'hanuman-mandir-cp',
  'gurudwara-sis-ganj':      'gurudwara-sis-ganj',
  'gurudwara-rakab-ganj':    'gurudwara-rakab-ganj',
  'sulabh-toilet-museum':    'sulabh-toilet-museum',
  'adilabad-fort-delhi':     'adilabad-fort-delhi',
  'jamali-kamali':           'jamali-kamali',
  'aravalli-biodiversity-park': 'aravalli-biodiversity-park',
  'nehru-park-delhi':        'nehru-park-delhi',
  'buddha-jayanti-park':     'buddha-jayanti-park',
  'bharat-mandapam':         'bharat-mandapam',
  'parliament-house':        'parliament-house',
  'roshanara-garden':        'roshanara-garden',
  'shahpur-jat':             'shahpur-jat',
  'amrit-udyan':             'amrit-udyan',
  'ngma-delhi':              'ngma-delhi',
};

/**
 * Resolve the correct image path for a given place.
 *
 * @param {Object} place   — place data object (must have slug/id, optionally images/image/heroImage)
 * @param {string} [stateSlug] — e.g. "delhi", "rajasthan"
 * @returns {string} resolved image path or ''
 */
export function resolveImage(place, stateSlug) {
  if (!place) return '';

  const slug = place.slug || place.id || '';

  // 1. Prioritise the curated "image" field from placeDetails (popular/hero image)
  //    This is the main display image we want everywhere — cards AND detail pages.
  const primaryImage = place.image || '';
  if (primaryImage && !primaryImage.includes('hero_banner')) {
    return primaryImage;
  }

  // 2. Fall back to images.main / heroImage / thumbnail
  const explicit = place.images?.main || place.heroImage || place.thumbnail || '';
  if (explicit && !explicit.includes('hero_banner')) {
    return explicit;
  }

  // 3. Try Delhi override lookup
  const state = stateSlug || inferState(place);
  if (state === 'delhi') {
    const override = DELHI_OVERRIDES[slug];
    if (override) {
      return `assets/images/states/delhi/${override}.webp`;
    }
    return `assets/images/states/delhi/${slug}.webp`;
  }

  // 4. Try state-level path
  if (state) {
    return `assets/images/states/${state}/${slug}.webp`;
  }

  // 5. Return empty string — NEVER return hero_banner.png
  return '';
}

/**
 * Try to infer state slug from a place object.
 */
function inferState(place) {
  if (!place) return '';
  const state = (place.state || '').toLowerCase();
  if (state === 'delhi') return 'delhi';
  if (state) {
    return state.replace(/\s+/g, '-');
  }
  // Check stateId
  if (place.stateId) return place.stateId;
  return '';
}

/**
 * "Image Coming Soon" placeholder HTML (no Travvana logo).
 */
export function imagePlaceholderHTML(altText = 'Image') {
  return `<div class="img-placeholder" style="width:100%;height:100%;background:linear-gradient(135deg,#f0f0f0 0%,#e0e0e0 100%);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;color:#999;font-size:0.85rem;border-radius:inherit;">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
    <span>${altText}</span>
  </div>`;
}

/**
 * Create an onerror handler that shows "Image Coming Soon" instead of Travvana logo.
 * Returns a string suitable for use in an onerror attribute.
 */
export function onErrorHandler() {
  return `this.onerror=null;this.style.display='none';var d=document.createElement('div');d.className='img-placeholder';d.style.cssText='width:100%;height:100%;background:linear-gradient(135deg,#f5f5f5,#e8e8e8);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;color:#aaa;font-size:0.8rem;border-radius:inherit;position:absolute;inset:0;';d.innerHTML='<svg width=\\'32\\' height=\\'32\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'1.5\\'><rect x=\\'3\\' y=\\'3\\' width=\\'18\\' height=\\'18\\' rx=\\'3\\'/><circle cx=\\'8.5\\' cy=\\'8.5\\' r=\\'1.5\\'/><path d=\\'M21 15l-5-5L5 21\\'/></svg><span>Image coming soon</span>';this.parentNode.style.position='relative';this.parentNode.appendChild(d);`;
}
