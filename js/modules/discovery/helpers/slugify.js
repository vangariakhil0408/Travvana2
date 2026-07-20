/* ============================================
   TRAVVANA — Slugify Helper
   ============================================ */

/**
 * Convert a string to a URL-safe slug
 * @param {string} str
 * @returns {string}
 */
export function slugify(str) {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')       // spaces/underscores → hyphens
    .replace(/[^\w-]+/g, '')       // remove non-word chars
    .replace(/--+/g, '-')          // collapse multiple hyphens
    .replace(/^-+|-+$/g, '');      // trim hyphens
}

/**
 * Convert a slug back to a readable name
 * @param {string} slug
 * @returns {string}
 */
export function unslugify(slug) {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}
