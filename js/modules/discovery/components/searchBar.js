/* ============================================
   TRAVVANA — Search Bar Component
   ============================================ */

import { searchService } from '../../../services/searchService.js';
import { eventBus, EVENTS } from '../../../core/eventBus.js';
import { CONFIG } from '../../../core/config.js';
import { STATE_IMAGES } from '../../../data/sharedStateData.js';
import { resolveImage, onErrorHandler } from '../../../services/imageRegistry.js';

/**
 * Render search bar HTML
 * @param {Object} [options]
 * @returns {string}
 */
export function searchBar(options = {}) {
  const { placeholder = 'Search destinations...', id = 'search' } = options;

  return `
    <style>
      .search-results-dropdown {
        display: none;
        position: absolute;
        top: calc(100% + 12px);
        left: 0;
        right: 0;
        background: rgba(18, 18, 28, 0.95);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 0, 0, 0.5);
        z-index: 99999;
        max-height: 420px;
        overflow-y: auto;
        overflow-x: hidden;
      }
      .search-results-dropdown::-webkit-scrollbar {
        width: 6px;
      }
      .search-results-dropdown::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 10px;
      }
      .search-result-item {
        display: flex;
        align-items: center;
        padding: 14px 16px;
        text-decoration: none;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        gap: 14px;
        transition: all 0.2s ease;
        background: transparent;
      }
      .search-result-item:last-child {
        border-bottom: none;
      }
      .search-result-item:hover {
        background: rgba(255, 179, 102, 0.1);
      }
      .search-result-item img {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        object-fit: cover;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      }
      .search-result-item .item-title {
        font-weight: 600;
        color: #ffffff;
        font-size: 0.95rem;
        margin-bottom: 4px;
      }
      .search-result-item .item-subtitle {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.6);
        text-transform: capitalize;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .search-result-item .item-icon {
        color: #FFB366;
        font-size: 1rem;
      }
      .search-recents-header {
        padding: 14px 16px 8px 16px;
        font-size: 0.75rem;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.5);
        text-transform: uppercase;
        letter-spacing: 1px;
      }
    </style>
    <div class="search-component-wrapper" style="position: relative; z-index: 900; width: 100%; display: flex; gap: 12px; align-items: center;">
      <div class="search-bar" id="${id}-bar" style="flex: 1;">
        <div class="search-bar__input-wrap">
          <span class="search-bar__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <input class="search-bar__input" type="text" placeholder="${placeholder}" id="${id}-input" autocomplete="off">
          <button class="search-bar__clear" id="${id}-clear">✕</button>
        </div>
      </div>
      <button class="search-bar__mic" id="${id}-mic" title="Search by voice" style="flex-shrink: 0; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--clr-accent); cursor: pointer; background: var(--clr-bg-surface); border: 1px solid var(--clr-accent); transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
      </button>
      <div class="search-results-dropdown" id="${id}-results"></div>
    </div>
  `;
}

/**
 * Initialize search bar event listeners, dropdown, and voice search
 * @param {string} inputId - ID of the search input
 * @param {Function} [onFilter] - Optional callback for inline filtering (like in explore page)
 */
export function initSearchBar(inputId, onFilter) {
  const input = document.getElementById(inputId);
  const clear = document.getElementById(inputId.replace('-input', '-clear'));
  const dropdown = document.getElementById(inputId.replace('-input', '-results'));
  
  if (!input) return;

  function renderDropdown(results, query) {
    if (!dropdown) return;
    
    if (!query || query.length < 2) {
      const recents = JSON.parse(localStorage.getItem('travvana_recent_searches') || '[]');
      if (recents.length > 0) {
        dropdown.style.display = 'block';
        const fallbackImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='1.5'%3E%3Crect width='24' height='24' fill='%23333' stroke='none'/%3E%3Crect x='3' y='3' width='18' height='18' rx='3'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpath d='M21 15l-5-5L5 21'/%3E%3C/svg%3E";
        dropdown.innerHTML = `
          <div class="search-recents">
            <div class="search-recents-header">Recent Searches</div>
            ${recents.map(item => `
              <a href="${item.link}" class="search-result-item" data-search-item="${encodeURIComponent(JSON.stringify(item))}">
                <img src="${item.image}" alt="" onerror="this.onerror=null;this.src='${fallbackImg}';">
                <div style="flex-grow: 1;">
                  <div class="item-title">${item.name}</div>
                  <div class="item-subtitle"><span class="item-icon">🕒</span> ${item.subtitle.replace('-', ' ')}</div>
                </div>
              </a>
            `).join('')}
          </div>
        `;
      } else {
        dropdown.style.display = 'none';
        dropdown.innerHTML = '';
      }
      return;
    }

    dropdown.style.display = 'block';
    
    if (results.length === 0) {
      dropdown.innerHTML = '<div style="padding: 16px; color: var(--clr-text-muted); text-align: center;">No results found</div>';
      return;
    }

    dropdown.innerHTML = results.slice(0, 8).map(item => {
      const isStateOrUT = item.type === 'state' || item.type === 'territory';
      const link = isStateOrUT
        ? `state-detail.html?state=${item.id}`
        : `place-detail.html?place=${item.data?.slug || item.id}`;
      
      let image = 'assets/images/placeholder.webp';
      if (isStateOrUT) {
        image = STATE_IMAGES[item.id] || item.data?.heroImage || image;
      } else {
        image = resolveImage(item.data, item.data?.stateId) || item.data?.images?.main || item.data?.image || image;
      }

      const subtitle = isStateOrUT ? 'State / UT' : item.data.location || item.data.stateId || 'Place';
      
      const fallbackImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='1.5'%3E%3Crect width='24' height='24' fill='%23333' stroke='none'/%3E%3Crect x='3' y='3' width='18' height='18' rx='3'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpath d='M21 15l-5-5L5 21'/%3E%3C/svg%3E";

      return `
        <a href="${link}" class="search-result-item" data-search-item="${encodeURIComponent(JSON.stringify({id: item.data?.slug || item.id, name: item.name, image, link, subtitle}))}">
          <img src="${image}" alt="" onerror="this.onerror=null;this.src='${fallbackImg}';">
          <div style="flex-grow: 1;">
            <div class="item-title">${item.name}</div>
            <div class="item-subtitle"><span class="item-icon">📍</span> ${subtitle.replace('-', ' ')}</div>
          </div>
        </a>
      `;
    }).join('');
  }

  input.addEventListener('input', (e) => {
    const query = e.target.value;
    eventBus.emit(EVENTS.SEARCH_QUERY, query);
    
    if (onFilter) onFilter(query);
    
    searchService.debouncedSearch(query, (results) => {
      renderDropdown(results, query);
    });
  });

  input.addEventListener('focus', (e) => {
    const query = e.target.value;
    if (!query || query.length < 2) {
      renderDropdown([], '');
    } else {
      searchService.debouncedSearch(query, (results) => {
        renderDropdown(results, query);
      });
    }
  });

  if (clear) {
    clear.addEventListener('click', () => {
      input.value = '';
      input.focus();
      eventBus.emit(EVENTS.SEARCH_QUERY, '');
      if (onFilter) onFilter('');
      renderDropdown([], '');
    });
  }

  // Hide dropdown on click outside
  document.addEventListener('click', (e) => {
    const searchBarElement = document.getElementById(inputId.replace('-input', '-bar'))?.parentElement;
    if (searchBarElement && !searchBarElement.contains(e.target) && dropdown) {
      dropdown.style.display = 'none';
    }

    // Save recent search on click
    const linkEl = e.target.closest('.search-result-item');
    if (linkEl && linkEl.dataset.searchItem && searchBarElement && searchBarElement.contains(linkEl)) {
      try {
        const itemData = JSON.parse(decodeURIComponent(linkEl.dataset.searchItem));
        let recents = JSON.parse(localStorage.getItem('travvana_recent_searches') || '[]');
        recents = recents.filter(r => r.id !== itemData.id);
        recents.unshift(itemData);
        if (recents.length > 5) recents.pop();
        localStorage.setItem('travvana_recent_searches', JSON.stringify(recents));
      } catch (err) {}
    }
  });

  initVoiceSearch(inputId);
}

/**
 * Initialize voice search for a search input
 * @param {string} inputId - ID of the search input
 */
export function initVoiceSearch(inputId) {
  const micBtn = document.getElementById(inputId.replace('-input', '-mic'));
  const searchInput = document.getElementById(inputId);
  
  if (micBtn && searchInput) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      
      const originalPlaceholder = searchInput.placeholder;
      
      recognition.onstart = () => {
        micBtn.style.color = 'var(--clr-accent)';
        micBtn.style.animation = 'pulse 1.5s infinite';
        searchInput.placeholder = 'Listening... Speak now.';
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        searchInput.value = transcript;
        // Trigger input event to show results / filter
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          alert('Microphone access was denied. Please allow microphone permissions in your browser settings to use voice search.');
        } else if (event.error === 'no-speech') {
          alert('No speech was detected. Please try again.');
        } else {
          alert('Voice search error: ' + event.error);
        }
        micBtn.style.color = 'var(--clr-text-secondary)';
        micBtn.style.animation = 'none';
        searchInput.placeholder = originalPlaceholder;
      };

      recognition.onend = () => {
        micBtn.style.color = 'var(--clr-text-secondary)';
        micBtn.style.animation = 'none';
        searchInput.placeholder = originalPlaceholder;
      };
      
      micBtn.addEventListener('click', () => {
        if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
          alert('Voice search requires a secure connection (HTTPS) or localhost. Since you are viewing the website via a local IP address on your mobile device, your browser has blocked microphone access for security reasons.');
          return;
        }
        try {
          recognition.start();
        } catch (e) {
          console.error("Could not start recognition:", e);
          alert('Could not start voice search. It might already be listening or unsupported.');
        }
      });
    } else {
      micBtn.style.display = 'none'; // Hide if not supported by browser
      micBtn.addEventListener('click', () => {
        alert('Voice search is not supported by your browser (try Chrome or Edge).');
      });
    }
  }
}

/**
 * Render search overlay (full-screen)

 * @returns {string}
 */
export function searchOverlay() {
  return `
    <div class="search-overlay" id="search-overlay">
      <div class="search-overlay__header">
        <button class="search-overlay__back" id="search-overlay-back">←</button>
        <input class="search-overlay__input" type="text" placeholder="Search India..." id="search-overlay-input" autofocus>
      </div>
      <div class="search-overlay__results" id="search-overlay-results">
        <div class="search-recent">
          <h4 class="search-recent__title">Popular Searches</h4>
          <div id="search-popular-items">
            ${['Kerala', 'Rajasthan', 'Goa', 'Manali', 'Varanasi'].map(item => `
              <div class="search-result" data-query="${item}">
                <div class="search-result__icon">🔥</div>
                <div class="search-result__text">
                  <div class="search-result__title">${item}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render unified search bar HTML (Categories + Search + Mic)
 * @param {Object} [options]
 * @returns {string}
 */
export function unifiedSearchBar(options = {}) {
  const { placeholder = 'Search by city, place or state', id = 'unified-search', activeCategory = 'all' } = options;
  
  const categories = CONFIG.CATEGORIES;

  const categoriesHTML = categories.map(cat => `
    <button class="unified-cat-pill ${cat.id === activeCategory ? 'unified-cat-pill--active' : ''}" data-cat="${cat.id}">
      <span class="unified-cat-pill__icon">${cat.icon}</span>
      ${cat.label}
    </button>
  `).join('');

  return `
    <div class="unified-search-wrap" id="${id}-wrapper" style="position: relative; z-index: 900;">
      <div class="unified-categories-scroll" id="${id}-categories">
        ${categoriesHTML}
      </div>
      <div class="unified-search-row">
        <div class="unified-search-input-wrap">
          <span class="unified-search-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <input class="unified-search-input" type="text" placeholder="${placeholder}" id="${id}-input" autocomplete="off">
        </div>
        <button class="unified-mic-btn" id="${id}-mic" title="Search by voice">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
        </button>
      </div>
      <div class="search-results-dropdown" id="${id}-results"></div>
    </div>
  `;
}

/**
 * Initialize unified search bar
 */
export function initUnifiedSearchBar(inputId, onCategoryChange, onSearch) {
  // Use existing initSearchBar for input/dropdown/mic logic
  initSearchBar(inputId, onSearch);
  
  // Initialize voice search logic specifically for unified search bar
  initVoiceSearch(inputId);

  // Category pills logic
  const categoriesContainer = document.getElementById(inputId.replace('-input', '-categories'));
  if (categoriesContainer) {
    categoriesContainer.addEventListener('click', (e) => {
      const pill = e.target.closest('.unified-cat-pill');
      if (!pill) return;
      
      categoriesContainer.querySelectorAll('.unified-cat-pill').forEach(p => p.classList.remove('unified-cat-pill--active'));
      pill.classList.add('unified-cat-pill--active');
      
      if (onCategoryChange) {
        onCategoryChange(pill.dataset.cat);
      }
    });
  }
}

