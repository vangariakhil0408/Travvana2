/* ============================================
   TRAVVANA — Pagination Controls Component
   ============================================ */

import { getPageNumbers } from '../helpers/paginate.js';

/**
 * Render pagination controls or load-more button
 * @param {Object} paginationData - From paginate() helper
 * @param {Object} [options] - { type: 'numbered'|'loadmore' }
 * @returns {string}
 */
export function paginationControls(paginationData, options = {}) {
  const { type = 'loadmore' } = options;
  const { page, totalPages, totalItems, hasNext, hasPrev, startIndex, endIndex } = paginationData;

  if (totalPages <= 1) return '';

  if (type === 'loadmore') {
    return `
      <div class="load-more" id="load-more-wrap">
        ${hasNext ? `
          <button class="load-more__btn" id="load-more-btn" data-page="${page + 1}">
            <span class="load-more__text">More</span>
            <div class="load-more__spinner"></div>
          </button>
        ` : ''}
        <div class="results-info">
          Showing 1–${endIndex} of ${totalItems}
        </div>
      </div>
    `;
  }

  // Numbered pagination
  const pageNums = getPageNumbers(page, totalPages);

  return `
    <div class="pagination" id="pagination-controls">
      <button class="pagination__btn" data-page="${page - 1}" ${!hasPrev ? 'disabled' : ''}>‹</button>
      ${pageNums.map(p => {
        if (p === '...') return '<span class="pagination__dots">…</span>';
        return `<button class="pagination__btn ${p === page ? 'pagination__btn--active' : ''}" data-page="${p}">${p}</button>`;
      }).join('')}
      <button class="pagination__btn" data-page="${page + 1}" ${!hasNext ? 'disabled' : ''}>›</button>
    </div>
    <div class="results-info">
      Showing ${startIndex}–${endIndex} of ${totalItems}
    </div>
  `;
}
