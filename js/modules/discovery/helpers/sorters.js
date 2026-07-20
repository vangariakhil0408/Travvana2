/* ============================================
   TRAVVANA — Sort Helpers
   ============================================ */

/**
 * Sort items by popularity (descending)
 * @param {Array} items
 * @returns {Array}
 */
export function sortByPopularity(items) {
  return [...items].sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0));
}

/**
 * Sort items alphabetically by name
 * @param {Array} items
 * @returns {Array}
 */
export function sortAlphabetically(items) {
  return [...items].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
}

/**
 * Sort items by rating (descending)
 * @param {Array} items
 * @returns {Array}
 */
export function sortByRating(items) {
  return [...items].sort((a, b) => (b.rating || b.avgRating || 0) - (a.rating || a.avgRating || 0));
}

/**
 * Sort items by total places (descending)
 * @param {Array} items
 * @returns {Array}
 */
export function sortByPlacesCount(items) {
  return [...items].sort((a, b) => (b.totalPlaces || 0) - (a.totalPlaces || 0));
}

/**
 * Apply sort by option ID
 * @param {Array} items
 * @param {string} sortId - 'popularity' | 'alphabetical' | 'rating' | 'places'
 * @returns {Array}
 */
export function applySort(items, sortId = 'popularity') {
  switch (sortId) {
    case 'alphabetical': return sortAlphabetically(items);
    case 'rating':       return sortByRating(items);
    case 'places':       return sortByPlacesCount(items);
    case 'popularity':
    default:             return sortByPopularity(items);
  }
}
