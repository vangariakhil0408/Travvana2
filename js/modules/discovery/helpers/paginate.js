/* ============================================
   TRAVVANA — Pagination Helper
   ============================================ */

/**
 * Paginate an array
 * @param {Array} items - Full array of items
 * @param {number} page - Current page (1-indexed)
 * @param {number} pageSize - Items per page
 * @returns {{ items: Array, page: number, pageSize: number, totalPages: number, totalItems: number, hasNext: boolean, hasPrev: boolean }}
 */
export function paginate(items, page = 1, pageSize = 12) {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = items.slice(startIndex, startIndex + pageSize);

  return {
    items: paginatedItems,
    page: currentPage,
    pageSize,
    totalPages,
    totalItems,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
    startIndex: startIndex + 1,
    endIndex: Math.min(startIndex + pageSize, totalItems),
  };
}

/**
 * Generate page numbers array for pagination UI
 * @param {number} currentPage
 * @param {number} totalPages
 * @param {number} [maxVisible=5]
 * @returns {Array<number|string>}
 */
export function getPageNumbers(currentPage, totalPages, maxVisible = 5) {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = [];
  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, currentPage - half);
  let end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push('...');
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < totalPages) {
    if (end < totalPages - 1) pages.push('...');
    pages.push(totalPages);
  }

  return pages;
}
