/* ============================================
   TRAVVANA — Discovery Controller
   Orchestrates the home/landing page
   ============================================ */

import { jsonLoader } from '../../../services/jsonLoader.js';
import { getState, setState } from '../../../state/appState.js';
import { searchService } from '../../../services/searchService.js';
import { renderHomeFeed, renderHomeSkeletons, ALL_DESTINATIONS } from '../render/renderHomeFeed.js';
import { initUnifiedSearchBar } from '../components/searchBar.js';
import { DATA_PATHS } from '../../../utils/constants.js';
import { qs } from '../../../utils/dom.js';

/**
 * Initialize the home/discovery landing page
 */
export async function initDiscoveryController() {
  const container = qs('#page-content');
  if (!container) return;

  setState({ currentPage: 'home', 'loading.feeds': true });

  // Show skeletons
  renderHomeSkeletons(container);

  try {
    // Load all data in parallel
    const [statesData, territoriesData, trending, popular, hiddenGems, seasonal] = await Promise.all([
      jsonLoader.load(DATA_PATHS.STATES),
      jsonLoader.load(DATA_PATHS.TERRITORIES),
      jsonLoader.load(DATA_PATHS.feed('trending')).catch(() => null),
      jsonLoader.load(DATA_PATHS.feed('india-popular')).catch(() => null),
      jsonLoader.load(DATA_PATHS.feed('hidden-gems')).catch(() => null),
      jsonLoader.load(DATA_PATHS.feed('seasonal')).catch(() => null),
    ]);

    // Merge states + territories for unified display
    const allStates = [
      ...(statesData?.states || []),
      ...(territoriesData?.territories || []),
    ].sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0));

    // Update state
    setState({
      states: { ...statesData, states: allStates },
      territories: territoriesData,
      trendingFeed: trending,
      popularFeed: popular,
      hiddenGemsFeed: hiddenGems,
      seasonalFeed: seasonal,
      'loading.feeds': false,
    });

    // Build search index
    searchService.buildIndex();

    // Index popular places from ALL_DESTINATIONS via public API
    ALL_DESTINATIONS.forEach(item => {
      searchService.addToIndex({
        type: 'place',
        id: item.slug,
        name: item.name,
        keywords: [item.name, item.stateId, item.location, ...(item.categories || [])].join(' ').toLowerCase(),
        data: item,
      });
    });

    // Render
    renderHomeFeed({
      states: { states: allStates },
      trending,
      popular,
      hiddenGems,
      seasonal,
    }, container);

    // Init unified search
    initUnifiedSearchBar('hero-search-input', (catId) => {
      if (container.handleCategoryChange) {
        container.handleCategoryChange(catId);
      }
    }, (query) => {
      // Text search hook for home page (filter destinations by query)
    });

    // Restore scroll after everything is painted
    requestAnimationFrame(() => {
      import('../../../core/stateRestoration.js').then(({ stateRestoration }) => {
        stateRestoration.restoreScroll();
      });
    });

  } catch (err) {
    console.error('[DiscoveryController] Failed to load data:', err);
    setState({ 'loading.feeds': false, 'errors.home': err.message });
    container.innerHTML = `
      <div class="empty-state" style="margin-top:var(--sp-16);">
        <div class="empty-state__icon">⚠️</div>
        <div class="empty-state__title">Failed to load data</div>
        <p style="color:var(--clr-text-muted);">Please check your connection and try again</p>
        <button class="btn btn--primary" id="home-retry-btn" style="margin-top:var(--sp-4);">Retry</button>
      </div>
    `;
    document.getElementById('home-retry-btn')?.addEventListener('click', () => location.reload());
  }
}
