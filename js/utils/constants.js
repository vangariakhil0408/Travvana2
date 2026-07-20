/* ============================================
   TRAVVANA — Constants
   ============================================ */

export const PAGES = {
  HOME: 'home',
  DISCOVERY: 'discovery',
  STATE: 'state',
  DISTRICT: 'district',
  PLACE: 'place',
};

export const DATA_PATHS = {
  STATES: './data/countries/india/states.json',
  TERRITORIES: './data/countries/india/union-territories.json',
  TOP_100: './data/countries/india/top100.json',
  stateMeta: (slug) => `./data/countries/india/regions/${slug}/meta.json`,
  stateDistricts: (slug) => `./data/countries/india/regions/${slug}/districts.json`,
  statePopular: (slug) => `./data/states/${slug}.json`,
  placeDetail: (stateSlug, placeSlug) => `./data/states/${stateSlug}/places/${placeSlug}.json`,
  feed: (name) => `./data/feeds/${name}.json`,
};

// State gradients for when images aren't available
export const STATE_GRADIENTS = {
  'andhra-pradesh': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'arunachal-pradesh': 'linear-gradient(135deg, #2d5016 0%, #4a7c23 100%)',
  'assam': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'bihar': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'chhattisgarh': 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'goa': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'gujarat': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'haryana': 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  'himachal-pradesh': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'jharkhand': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'karnataka': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'kerala': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'madhya-pradesh': 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
  'maharashtra': 'linear-gradient(135deg, #ff6b2c 0%, #ff9a56 100%)',
  'manipur': 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'meghalaya': 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
  'mizoram': 'linear-gradient(135deg, #c3cfe2 0%, #f5f7fa 100%)',
  'nagaland': 'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)',
  'odisha': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'punjab': 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
  'rajasthan': 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  'sikkim': 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
  'tamil-nadu': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'telangana': 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'tripura': 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
  'uttar-pradesh': 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  'uttarakhand': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'west-bengal': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  // UTs
  'andaman-and-nicobar-islands': 'linear-gradient(135deg, #00b4db 0%, #0083b0 100%)',
  'chandigarh': 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
  'dadra-nagar-haveli-daman-diu': 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
  'delhi': 'linear-gradient(135deg, #ff6b2c 0%, #ee0979 100%)',
  'jammu-and-kashmir': 'linear-gradient(135deg, #2196f3 0%, #f44336 100%)',
  'ladakh': 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
  'lakshadweep': 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
  'puducherry': 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
};
