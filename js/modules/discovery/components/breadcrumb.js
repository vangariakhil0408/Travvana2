/* ============================================
   TRAVVANA — Breadcrumb Component
   ============================================ */

/**
 * Render breadcrumb navigation
 * @param {Array<{label: string, href: string}>} items
 * @returns {string}
 */
export function breadcrumb(items) {
  return `
    <nav class="breadcrumb" aria-label="Breadcrumb" id="breadcrumb-nav">
      ${items.map((item, i) => {
        const isLast = i === items.length - 1;
        const separator = !isLast ? '<span class="breadcrumb__separator">›</span>' : '';
        
        if (isLast) {
          return `<span class="breadcrumb__item breadcrumb__item--active">${item.label}</span>`;
        }
        
        return `
          <span class="breadcrumb__item">
            <a href="${item.href}">${item.label}</a>
          </span>
          ${separator}
        `;
      }).join('')}
    </nav>
  `;
}
