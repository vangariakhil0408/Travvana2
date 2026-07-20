/* ============================================
   TRAVVANA — Filter Helpers
   ============================================ */

/**
 * Filter items by category
 * @param {Array} items - Array of items with 'category' or 'categories' field
 * @param {string} category - Category to filter by ('all' for no filter)
 * @returns {Array}
 */
export function filterByCategory(items, category) {
  if (!category || category === 'all') return items;
  
  return items.filter(item => {
    if (item.category === category) return true;
    if (Array.isArray(item.categories) && item.categories.includes(category)) return true;
    return false;
  });
}

/**
 * Filter items by region
 * @param {Array} items - Array of items with 'region' field
 * @param {string} region - Region to filter by ('all' for no filter)
 * @returns {Array}
 */
export function filterByRegion(items, region) {
  if (!region || region === 'all') return items;
  return items.filter(item => item.region === region);
}

/**
 * Filter items by search query
 * @param {Array} items
 * @param {string} query
 * @param {string[]} [fields=['name']] - Fields to search in
 * @returns {Array}
 */
export function filterBySearch(items, query, fields = ['name']) {
  if (!query || query.trim() === '') return items;
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return items.filter(item =>
    fields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(normalizedQuery);
      }
      if (Array.isArray(value)) {
        return value.some(v => v.toLowerCase().includes(normalizedQuery));
      }
      return false;
    })
  );
}

/**
 * Apply multiple filters
 * @param {Array} items
 * @param {Object} filters - { category, region, query }
 * @returns {Array}
 */
export function applyFilters(items, filters = {}) {
  let result = items;
  
  if (filters.category) {
    result = filterByCategory(result, filters.category);
  }
  if (filters.region) {
    result = filterByRegion(result, filters.region);
  }
  if (filters.query) {
    result = filterBySearch(result, filters.query, ['name', 'tagline', 'capital']);
  }
  
  return result;
}
