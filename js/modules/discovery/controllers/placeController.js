/* ============================================
   TRAVVANA — Place Controller
   Orchestrates the place detail page
   ============================================ */

import { jsonLoader } from '../../../services/jsonLoader.js';
import { setState } from '../../../state/appState.js';
import { renderPlaceDetail, renderPlaceDetailSkeleton } from '../render/renderPlaceDetail.js?v=16';
import { nearbyCard } from '../components/nearbyCard.js';
import { DATA_PATHS } from '../../../utils/constants.js';
import { qs, setHTML, escapeHTML } from '../../../utils/dom.js';
import { unslugify } from '../helpers/slugify.js';
import { destinationRegistry } from '../../../services/destinationRegistry.js';
import { seoService } from '../../../services/seoService.js';

/**
 * Filter helper to extract number from distance string (e.g. "12 km" -> 12)
 */
function getDistanceNum(distanceStr) {
  if (!distanceStr) return Infinity; // Unknown distance should not auto-pass the filter
  const match = distanceStr.match(/(\d+(\.\d+)?)/);
  if (!match) return Infinity;
  let num = parseFloat(match[1]);
  // Check for meters: "500 m" or "500m" but NOT "500 km"
  const lower = distanceStr.toLowerCase();
  if ((lower.includes(' m') || lower.endsWith('m')) && !lower.includes('km')) {
    num = num / 1000;
  }
  return num;
}

/**
 * Initialize the place detail page
 * @param {string} placeSlug
 * @param {string} stateSlug
 */
export async function initPlaceController(placeSlug, stateSlug) {
  const container = qs('#page-content');
  if (!container || !placeSlug) return;

  setState({ currentPage: 'place', 'loading.places': true });

  // Skeleton
  renderPlaceDetailSkeleton(container);

  try {
    let place = await destinationRegistry.resolveDestination(placeSlug, stateSlug);

    if (!place || !Object.keys(place).length) {
      throw new Error('Place not found in registry or JSON files.');
    }

    // Auto-redirect if alias was used (id doesn't match the slug perfectly)
    const canonicalId = place.slug || place.id;
    if (canonicalId && canonicalId !== placeSlug && window.location.search.includes(placeSlug)) {
       const newSearch = window.location.search.replace(`place=${placeSlug}`, `place=${canonicalId}`);
       window.history.replaceState(null, '', `${window.location.pathname}${newSearch}`);
    }

    setState({
      currentPlace: place,
      'loading.places': false,
    });

    // ── SEO: Update page meta, structured data, breadcrumbs ──
    const stateLabel = place.state || (stateSlug ? unslugify(stateSlug) : 'India');
    const seoTitle = `${place.name} — ${stateLabel} Tourism & Travel Guide`;
    const seoDesc = (place.history || place.description || `${place.name} in ${place.city || stateLabel}, India`);
    const seoDescTruncated = seoDesc.length > 155 ? seoDesc.substring(0, 152) + '...' : seoDesc;
    const canonicalUrl = `https://www.travvana.com/place-detail.html?place=${encodeURIComponent(canonicalId)}`;

    seoService.clearDynamicSchemas();
    seoService.updatePage({
      title: seoTitle,
      description: seoDescTruncated,
      canonical: canonicalUrl,
      image: place.images?.main || place.heroImage || place.image,
    });
    seoService.injectBreadcrumbSchema([
      { name: 'Home', url: 'https://www.travvana.com/' },
      { name: 'Explore', url: 'https://www.travvana.com/discovery.html' },
      { name: stateLabel, url: `https://www.travvana.com/state-detail.html?state=${encodeURIComponent(stateSlug || '')}` },
      { name: place.name, url: canonicalUrl },
    ]);
    seoService.injectTouristAttractionSchema(place, stateSlug);
    const faqs = seoService.injectFAQSchema(place);

    // Render full detail (pass FAQs for visual rendering)
    renderPlaceDetail(place, container, faqs);

    // Load nearby places asynchronously
    const nearbyArray = place.nearbyAttractions || place.nearby;
    if (nearbyArray && Array.isArray(nearbyArray)) {
      renderStaticNearby(nearbyArray, stateSlug);
    } else if (place.nearbyPlaces?.length) {
      loadNearbyPlaces(place.nearbyPlaces, stateSlug);
    }

  } catch (err) {
    console.error('[PlaceController] Failed:', err);
    setState({ 'loading.places': false, 'errors.place': err.message });
    container.innerHTML = `
      <div class="empty-state" style="margin-top:var(--sp-16);">
        <div class="empty-state__icon">⚠️</div>
        <div class="empty-state__title">Place not found</div>
        <p style="color:var(--clr-text-muted);">${escapeHTML(unslugify(placeSlug))} data unavailable</p>
        <a class="btn btn--primary" href="discovery.html" onclick="if(window.history.length > 1 && document.referrer.includes(window.location.host)) { window.history.back(); return false; }" style="margin-top:var(--sp-4);">← Back</a>
      </div>
    `;
  }
}

/**
 * Load and render nearby places
 * @param {string[]} nearbyIds
 * @param {string} stateSlug
 */
async function loadNearbyPlaces(nearbyIds, stateSlug) {
  const listContainer = qs('#nearby-places-list');
  const moreContainer = qs('#nearby-more-container');
  const moreBtn = qs('#nearby-more-btn');
  if (!listContainer) return;

  const nearbyPlaces = [];
  const limit = 4;

  // Load a reasonable batch (up to 20)
  const toFetch = nearbyIds.slice(0, 20);

  // Parallelize fetch with zero retries for instant fallback
  await Promise.all(
    toFetch.map(async (id) => {
      try {
        const place = await destinationRegistry.resolveDestination(id, stateSlug);
        if (place) {
          // Only show places within 20km
          if (getDistanceNum(place.distance) <= 20) {
            nearbyPlaces.push(place);
          }
        }
      } catch {
        // Skip on error
      }
    })
  );

  if (nearbyPlaces.length) {
    const renderBatch = (items) => items.map(p => nearbyCard(p, stateSlug)).join('');
    
    listContainer.innerHTML = renderBatch(nearbyPlaces.slice(0, limit));

    if (nearbyPlaces.length > limit) {
      if (moreContainer) moreContainer.style.display = 'flex';
      if (moreBtn) {
        moreBtn.onclick = () => {
          listContainer.innerHTML += renderBatch(nearbyPlaces.slice(limit));
          moreContainer.style.display = 'none';
        };
      }
    }
  } else {
    // Hide section if no nearby places match criteria
    const section = qs('#nearby-section');
    if (section) section.style.display = 'none';
  }
}

/**
 * Resolve the canonical image for a nearby attraction by looking up
 * the master place entry in the registry. This means if you update
 * a place's main image, all nearby cards auto-update too.
 */
function resolveNearbyImage(nearbyItem, stateSlug) {
  const slug = nearbyItem.slug || nearbyItem.id || (nearbyItem.name ? nearbyItem.name.toLowerCase().replace(/\s+/g, '-') : '');
  if (!slug) return nearbyItem;

  // Try to get the canonical place from the registry
  const canonical = destinationRegistry.getDestination(slug);
  if (canonical) {
    // Use the canonical image, falling back to nearby's own image
    const canonicalImg = canonical.images?.main || canonical.image || canonical.heroImage || canonical.thumbnail;
    if (canonicalImg) {
      return {
        ...nearbyItem,
        images: { ...(nearbyItem.images || {}), main: canonicalImg },
        image: canonicalImg,
      };
    }
  }

  return nearbyItem;
}

/**
 * Render static nearby places from custom JS data
 */
function renderStaticNearby(nearbyArray, stateSlug) {
  const listContainer = qs('#nearby-places-list');
  const moreContainer = qs('#nearby-more-container');
  const moreBtn = qs('#nearby-more-btn');
  if (!listContainer) return;

  const limit = 4;
  
  // Only show places within 20km
  const filtered = nearbyArray.filter(p => getDistanceNum(p.distance) <= 20);

  if (filtered.length) {
    // Resolve canonical images for each nearby item
    const resolved = filtered.map(p => resolveNearbyImage(p, stateSlug));

    const renderBatch = (items) => items.map(p => nearbyCard({...p, slug: p.slug || '', id: p.id || p.slug || ''}, stateSlug)).join('');
    
    listContainer.innerHTML = renderBatch(resolved.slice(0, limit));

    if (resolved.length > limit) {
      if (moreContainer) moreContainer.style.display = 'flex';
      if (moreBtn) {
        moreBtn.onclick = () => {
          listContainer.innerHTML += renderBatch(resolved.slice(limit));
          moreContainer.style.display = 'none';
        };
      }
    }
  } else {
    const section = qs('#nearby-section');
    if (section) section.style.display = 'none';
  }
}
