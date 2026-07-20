/* ============================================
   TRAVVANA — DOM Utilities
   ============================================ */

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} str
 * @returns {string}
 */
export function escapeHTML(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Query selector shorthand
 * @param {string} selector
 * @param {Element} [parent=document]
 * @returns {Element|null}
 */
export const qs = (selector, parent = document) => parent.querySelector(selector);

/**
 * Query selector all shorthand
 * @param {string} selector
 * @param {Element} [parent=document]
 * @returns {NodeList}
 */
export const qsa = (selector, parent = document) => parent.querySelectorAll(selector);

/**
 * Create element with attributes and children
 * @param {string} tag
 * @param {Object} [attrs]
 * @param  {...(string|Element)} children
 * @returns {Element}
 */
export function el(tag, attrs = {}, ...children) {
  const element = document.createElement(tag);
  
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') element.className = value;
    else if (key === 'innerHTML') element.innerHTML = value;
    else if (key.startsWith('on')) element[key.toLowerCase()] = value;
    else if (key === 'dataset') Object.assign(element.dataset, value);
    else if (key === 'style' && typeof value === 'object') Object.assign(element.style, value);
    else element.setAttribute(key, value);
  });

  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof Element) {
      element.appendChild(child);
    }
  });

  return element;
}

/**
 * Safe innerHTML set with fade transition
 * @param {Element} container
 * @param {string} html
 * @param {boolean} [animate=true]
 */
export function setHTML(container, html, animate = true) {
  if (animate) {
    container.style.opacity = '0';
    container.style.transform = 'translateY(8px)';
    
    requestAnimationFrame(() => {
      container.innerHTML = html;
      requestAnimationFrame(() => {
        container.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
        // Clean up inline styles after transition completes
        const cleanup = () => {
          container.style.removeProperty('transition');
          container.style.removeProperty('opacity');
          container.style.removeProperty('transform');
          container.removeEventListener('transitionend', cleanup);
        };
        container.addEventListener('transitionend', cleanup, { once: true });
      });
    });
  } else {
    container.innerHTML = html;
  }
}

/**
 * Delegate event listener
 * @param {Element} parent
 * @param {string} eventType
 * @param {string} selector
 * @param {Function} handler
 */
export function delegate(parent, eventType, selector, handler) {
  parent.addEventListener(eventType, (e) => {
    const target = e.target.closest(selector);
    if (target && parent.contains(target)) {
      handler(e, target);
    }
  });
}

/**
 * Scroll to top smoothly
 */
export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Generate skeleton cards HTML
 * @param {number} count
 * @param {string} [variant=''] - e.g. '--state'
 * @returns {string}
 */
export function skeletonCards(count, variant = '') {
  return Array(count).fill('').map(() => `
    <div class="skeleton-card skeleton-card${variant}">
      <div class="skeleton-card__image"></div>
      <div class="skeleton-card__body">
        <div class="skeleton skeleton--title"></div>
        <div class="skeleton skeleton--text-sm"></div>
      </div>
    </div>
  `).join('');
}

/**
 * Format number with K/M suffix
 * @param {number} num
 * @returns {string}
 */
export function formatNumber(num) {
  if (num >= 1000000) {
    const val = num / 1000000;
    return (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + 'M';
  }
  if (num >= 1000) {
    const val = num / 1000;
    return (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + 'K';
  }
  return num.toString();
}

/**
 * Generate star rating HTML
 * @param {number} rating (0-5)
 * @returns {string}
 */
export function starRating(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

/**
 * Generate price level indicator
 * @param {number} level (1-4)
 * @returns {string}
 */
export function priceLevel(level) {
  return Array(4).fill('').map((_, i) =>
    `<span class="${i < level ? 'card__price--active' : ''}" style="color: ${i < level ? 'var(--clr-accent)' : 'var(--clr-text-muted)'}">₹</span>`
  ).join('');
}
