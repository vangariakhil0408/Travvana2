/* ============================================
   TRAVVANA — Configuration
   ============================================ */

export const CONFIG = {
  // App info
  APP_NAME: 'Travvana',
  APP_VERSION: '1.0.0-mvp',
  APP_TAGLINE: 'Discover India, Your Way',

  // Google Analytics 4
  GA_MEASUREMENT_ID: 'G-S8CYVJTCL6',

  // Data paths
  DATA_BASE: './data',
  COUNTRIES_PATH: './data/countries/india',
  REGIONS_PATH: './data/countries/india/regions',
  FEEDS_PATH: './data/feeds',

  // Pagination
  DEFAULT_PAGE_SIZE: 4,
  FEED_PAGE_SIZE: 4,

  // Cache
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  CACHE_PREFIX: 'tvn_',

  // Search
  SEARCH_DEBOUNCE_MS: 300,
  SEARCH_MIN_CHARS: 2,
  MAX_SEARCH_RESULTS: 20,

  // UI
  SKELETON_DELAY_MS: 150,    // show skeleton after this delay
  TRANSITION_DURATION: 300,

  // Feature Flags
  FEATURES: {
    DARK_MODE: true,
    SEARCH: true,
    FILTERS: true,
    REELS: false,        // placeholder for now
    AI_PLANNER: true,   // AI Trip Planner is live
    BOOKING: false,      // placeholder
    MAP_VIEW: false,     // placeholder
  },

  // Categories
  CATEGORIES: [
    { id: 'all',       label: 'All',        icon: '✨' },
    { id: 'heritage',  label: 'Heritage',   icon: '🏛️' },
    { id: 'temples',   label: 'Temples',    icon: '🛕' },
    { id: 'nature',    label: 'Nature',     icon: '🌿' },
    { id: 'wildlife',  label: 'Wildlife',   icon: '🐘' },
    { id: 'beaches',   label: 'Beaches',    icon: '🏖️' },
    { id: 'hills',     label: 'Hills',      icon: '⛰️' },
    { id: 'waterfalls',label: 'Waterfalls', icon: '💧' },
    { id: 'national-parks', label: 'National Parks', icon: '🏞️' },
    { id: 'deserts',   label: 'Deserts',    icon: '🏜️' },
    { id: 'lakes',     label: 'Lakes',      icon: '🌊' },
  ],

  // Regions for filtering
  REGIONS: [
    { id: 'all',   label: 'All India' },
    { id: 'north', label: 'North' },
    { id: 'south', label: 'South' },
    { id: 'east',  label: 'East' },
    { id: 'west',  label: 'West' },
    { id: 'central', label: 'Central' },
    { id: 'northeast', label: 'Northeast' },
  ],

  // Sort Options
  SORT_OPTIONS: [
    { id: 'popularity', label: 'Most Popular', icon: '🔥' },
    { id: 'alphabetical', label: 'A → Z', icon: '🔤' },
    { id: 'rating', label: 'Highest Rated', icon: '⭐' },
    { id: 'places', label: 'Most Places', icon: '📍' },
  ],

  // Amenity icons
  AMENITY_ICONS: {
    'parking': '🅿️',
    'food-stalls': '🍜',
    'restrooms': '🚻',
    'guide-available': '🧑‍🏫',
    'wheelchair-accessible': '♿',
    'wifi': '📶',
    'atm': '🏧',
    'medical': '🏥',
    'photography': '📸',
    'camping': '⛺',
  },
};
