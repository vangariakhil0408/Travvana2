/* ============================================
   TRAVVANA — Render Home Feed (Premium Redesign)
   Netflix-style content browsing with cinematic imagery
   4 cards per row, 2 rows, paginated "More" button
   ============================================ */

import { CONFIG } from '../../../core/config.js';
import { setHTML, skeletonCards, escapeHTML } from '../../../utils/dom.js';
import { STATE_IMAGES, STATE_ATTRACTIONS } from '../../../data/sharedStateData.js';
import { unifiedSearchBar } from '../components/searchBar.js';

//* ── All Popular Destinations (linked to assets/images/popular/) ── */
export const ALL_DESTINATIONS = [
  { id: 'taj-mahal', name: 'Taj Mahal', location: 'Uttar Pradesh', image: 'assets/images/popular/taj-mahal.webp', slug: 'taj-mahal', stateId: 'uttar-pradesh' },
  { id: 'golden-temple', name: 'Golden Temple', location: 'Punjab', image: 'assets/images/popular/golden-temple.webp', slug: 'golden-temple', stateId: 'punjab' },
  { id: 'tirumala-venkateswara-temple', name: 'Tirumala Venkateswara Temple', location: 'Andhra Pradesh', image: 'assets/images/popular/tirupati-balaji.webp', slug: 'tirumala-venkateswara-temple', stateId: 'andhra-pradesh' },
  { id: 'kashi-vishwanath-temple', name: 'Kashi Vishwanath Temple', location: 'Uttar Pradesh', image: 'assets/images/states/uttar-pradesh/kashi-vishwanath-temple.webp', slug: 'kashi-vishwanath-temple', stateId: 'uttar-pradesh' },
  { id: 'hawa-mahal', name: 'Hawa Mahal', location: 'Rajasthan', image: 'assets/images/popular/hawa-mahal.webp', slug: 'hawa-mahal', stateId: 'rajasthan' },
  { id: 'amber-fort', name: 'Amber Fort', location: 'Rajasthan', image: 'assets/images/popular/amber-fort.webp', slug: 'amber-fort', stateId: 'rajasthan' },
  { id: 'mysore-palace', name: 'Mysore Palace', location: 'Karnataka', image: 'assets/images/popular/mysore-palace.webp', slug: 'mysore-palace', stateId: 'karnataka' },
  { id: 'gateway-of-india', name: 'Gateway of India', location: 'Maharashtra', image: 'assets/images/popular/gateway-of-india.webp', slug: 'gateway-of-india', stateId: 'maharashtra' },
  { id: 'charminar', name: 'Charminar', location: 'Telangana', image: 'assets/images/popular/charminar.webp', slug: 'charminar', stateId: 'telangana' },
  { id: 'konark-sun-temple', name: 'Konark Sun Temple', location: 'Odisha', image: 'assets/images/popular/konark-sun-temple.webp', slug: 'konark-sun-temple', stateId: 'odisha' },
  { id: 'hampi', name: 'Hampi', location: 'Karnataka', image: 'assets/images/popular/hampi.webp', slug: 'hampi', stateId: 'karnataka' },
  { id: 'ajanta-caves', name: 'Ajanta Caves', location: 'Maharashtra', image: 'assets/images/popular/ajanta-caves.webp', slug: 'ajanta-caves', stateId: 'maharashtra' },
  { id: 'ellora-caves', name: 'Ellora Caves', location: 'Maharashtra', image: 'assets/images/popular/ellora-caves.webp', slug: 'ellora-caves', stateId: 'maharashtra' },
  { id: 'khajuraho-group-of-monuments', name: 'Khajuraho Group of Monuments', location: 'Madhya Pradesh', image: 'assets/images/states/madhya-pradesh/khajuraho-group-of-monuments.webp', slug: 'khajuraho-group-of-monuments', stateId: 'madhya-pradesh' },
  { id: 'meenakshi-amman-temple', name: 'Meenakshi Amman Temple', location: 'Tamil Nadu', image: 'assets/images/popular/meenakshi-amman-temple.webp', slug: 'meenakshi-amman-temple', stateId: 'tamil-nadu' },
  { id: 'mahabalipuram-monuments', name: 'Mahabalipuram Monuments', location: 'Tamil Nadu', image: 'assets/images/popular/mahabalipuram-monuments.webp', slug: 'mahabalipuram-monuments', stateId: 'tamil-nadu' },
  { id: 'ramanathaswamy-temple', name: 'Ramanathaswamy Temple', location: 'Tamil Nadu', image: 'assets/images/popular/ramanathaswamy-temple.webp', slug: 'ramanathaswamy-temple', stateId: 'tamil-nadu' },
  { id: 'jagannath-temple', name: 'Jagannath Temple', location: 'Odisha', image: 'assets/images/popular/jagannath-temple.webp', slug: 'jagannath-temple', stateId: 'odisha' },
  { id: 'mahabodhi-temple', name: 'Mahabodhi Temple', location: 'Bihar', image: 'assets/images/popular/mahabodhi-temple.webp', slug: 'mahabodhi-temple', stateId: 'bihar' },
  { id: 'dal-lake', name: 'Dal Lake', location: 'Jammu and Kashmir', image: 'assets/images/popular/dal-lake.webp', slug: 'dal-lake', stateId: 'jammu-and-kashmir' },
  { id: 'pangong-lake', name: 'Pangong Lake', location: 'Ladakh', image: 'assets/images/popular/pangong-lake.webp', slug: 'pangong-lake', stateId: 'ladakh' },
  { id: 'valley-of-flowers-national-park', name: 'Valley of Flowers National Park', location: 'Uttarakhand', image: 'assets/images/popular/valley-of-flowers.webp', slug: 'valley-of-flowers-national-park', stateId: 'uttarakhand' },
  { id: 'kaziranga-national-park', name: 'Kaziranga National Park', location: 'Assam', image: "assets/images/popular/kaziranga-national-park.webp", slug: 'kaziranga-national-park', stateId: 'assam' },
  { id: 'alleppey-backwaters', name: 'Alleppey Backwaters', location: 'Kerala', image: 'assets/images/popular/kerala-backwaters.webp', slug: 'alleppey-backwaters', stateId: 'kerala' },
  { id: 'radhanagar-beach', name: 'Radhanagar Beach', location: 'Andaman and Nicobar Islands', image: 'assets/images/states/andaman-and-nicobar-islands/radhanagar-beach.webp', slug: 'radhanagar-beach', stateId: 'andaman-and-nicobar-islands' },
  { id: 'statue-of-unity', name: 'Statue of Unity', location: 'Gujarat', image: 'assets/images/popular/statue-of-unity.webp', slug: 'statue-of-unity', stateId: 'gujarat' },
  { id: 'agra-fort', name: 'Agra Fort', location: 'Uttar Pradesh', image: 'assets/images/popular/agra-fort.webp', slug: 'agra-fort', stateId: 'uttar-pradesh' },
  { id: 'fatehpur-sikri', name: 'Fatehpur Sikri', location: 'Uttar Pradesh', image: 'assets/images/popular/fatehpur-sikri.webp', slug: 'fatehpur-sikri', stateId: 'uttar-pradesh' },
  { id: 'mehrangarh-fort', name: 'Mehrangarh Fort', location: 'Rajasthan', image: 'assets/images/popular/mehrangarh-fort.webp', slug: 'mehrangarh-fort', stateId: 'rajasthan' },
  { id: 'jaisalmer-fort', name: 'Jaisalmer Fort', location: 'Rajasthan', image: 'assets/images/popular/jaisalmer-fort.webp', slug: 'jaisalmer-fort', stateId: 'rajasthan' },
  { id: 'city-palace-udaipur', name: 'City Palace Udaipur', location: 'Rajasthan', image: 'assets/images/states/rajasthan/city-palace-udaipur.webp', slug: 'city-palace-udaipur', stateId: 'rajasthan' },
  { id: 'lake-pichola', name: 'Lake Pichola', location: 'Rajasthan', image: 'assets/images/states/rajasthan/lake-pichola.webp', slug: 'lake-pichola', stateId: 'rajasthan' },
  { id: 'chittorgarh-fort', name: 'Chittorgarh Fort', location: 'Rajasthan', image: 'assets/images/popular/chittorgarh-fort.webp', slug: 'chittorgarh-fort', stateId: 'rajasthan' },
  { id: 'somnath-temple', name: 'Somnath Temple', location: 'Gujarat', image: 'assets/images/popular/somnath-temple.webp', slug: 'somnath-temple', stateId: 'gujarat' },
  { id: 'dwarkadhish-temple', name: 'Dwarkadhish Temple', location: 'Gujarat', image: 'assets/images/states/gujarat/dwarkadhish-temple.webp', slug: 'dwarkadhish-temple', stateId: 'gujarat' },
  { id: 'kedarnath-temple', name: 'Kedarnath Temple', location: 'Uttarakhand', image: 'assets/images/popular/kedarnath-temple.webp', slug: 'kedarnath-temple', stateId: 'uttarakhand' },
  { id: 'badrinath-temple', name: 'Badrinath Temple', location: 'Uttarakhand', image: 'assets/images/popular/badrinath-temple.webp', slug: 'badrinath-temple', stateId: 'uttarakhand' },
  { id: 'sarnath', name: 'Sarnath', location: 'Uttar Pradesh', image: 'assets/images/popular/sarnath.webp', slug: 'sarnath', stateId: 'uttar-pradesh' },
  { id: 'ramappa-temple', name: 'Ramappa Temple', location: 'Telangana', image: 'assets/images/states/telangana/ramappa-temple.webp', slug: 'ramappa-temple', stateId: 'telangana' },
  { id: 'brihadeeswarar-temple', name: 'Brihadeeswarar Temple', location: 'Tamil Nadu', image: 'assets/images/popular/brihadeeswarar-temple.webp', slug: 'brihadeeswarar-temple', stateId: 'tamil-nadu' },
  { id: 'jog-falls', name: 'Jog Falls', location: 'Karnataka', image: 'assets/images/popular/jog-falls.webp', slug: 'jog-falls', stateId: 'karnataka' },
  { id: 'coorg', name: 'Coorg', location: 'Karnataka', image: 'assets/images/popular/coorg.webp', slug: 'coorg', stateId: 'karnataka' },
  { id: 'ooty-lake', name: 'Ooty Lake', location: 'Tamil Nadu', image: 'assets/images/popular/ooty-lake.webp', slug: 'ooty-lake', stateId: 'tamil-nadu' },
  { id: 'doddabetta-peak', name: 'Doddabetta Peak', location: 'Tamil Nadu', image: 'assets/images/popular/doddabetta-peak.webp', slug: 'doddabetta-peak', stateId: 'tamil-nadu' },
  { id: 'kodaikanal-lake', name: 'Kodaikanal Lake', location: 'Tamil Nadu', image: 'assets/images/popular/kodaikanal.webp', slug: 'kodaikanal-lake', stateId: 'tamil-nadu' },
  { id: 'munnar-tea-gardens', name: 'Munnar Tea Gardens', location: 'Kerala', image: 'assets/images/states/kerala/munnar-tea-gardens.webp', slug: 'munnar-tea-gardens', stateId: 'kerala' },
  { id: 'periyar-national-park', name: 'Periyar National Park', location: 'Kerala', image: 'assets/images/popular/periyar-national-park.webp', slug: 'periyar-national-park', stateId: 'kerala' },
  { id: 'gulmarg-gondola', name: 'Gulmarg Gondola', location: 'Jammu and Kashmir', image: 'assets/images/states/jammu-and-kashmir/gulmarg-gondola.webp', slug: 'gulmarg-gondola', stateId: 'jammu-and-kashmir' },
  { id: 'nubra-valley', name: 'Nubra Valley', location: 'Ladakh', image: 'assets/images/popular/nubra-valley.webp', slug: 'nubra-valley', stateId: 'ladakh' },
  { id: 'living-root-bridges', name: 'Living Root Bridges', location: 'Meghalaya', image: 'assets/images/popular/living-root-bridges.webp', slug: 'living-root-bridges', stateId: 'meghalaya' },
  { id: 'nohkalikai-falls', name: 'Nohkalikai Falls', location: 'Meghalaya', image: 'assets/images/states/meghalaya/nohkalikai-falls.webp', slug: 'nohkalikai-falls', stateId: 'meghalaya' },
  { id: 'tawang-monastery', name: 'Tawang Monastery', location: 'Arunachal Pradesh', image: "assets/images/popular/tawang-monastery.webp", slug: 'tawang-monastery', stateId: 'arunachal-pradesh' },
  { id: 'sanchi-stupa', name: 'Sanchi Stupa', location: 'Madhya Pradesh', image: 'assets/images/popular/sanchi-stupa.webp', slug: 'sanchi-stupa', stateId: 'madhya-pradesh' },
  { id: 'bhimbetka-rock-shelters', name: 'Bhimbetka Rock Shelters', location: 'Madhya Pradesh', image: 'assets/images/states/madhya-pradesh/bhimbetka-rock-shelters.webp', slug: 'bhimbetka-rock-shelters', stateId: 'madhya-pradesh' },
  { id: 'kanha-national-park', name: 'Kanha National Park', location: 'Madhya Pradesh', image: 'assets/images/popular/kanha-national-park.webp', slug: 'kanha-national-park', stateId: 'madhya-pradesh' },
  { id: 'bandhavgarh-national-park', name: 'Bandhavgarh National Park', location: 'Madhya Pradesh', image: 'assets/images/popular/bandhavgarh-national-park.webp', slug: 'bandhavgarh-national-park', stateId: 'madhya-pradesh' },
  { id: 'araku-valley', name: 'Araku Valley', location: 'Andhra Pradesh', image: 'assets/images/popular/araku-valley.webp', slug: 'araku-valley', stateId: 'andhra-pradesh' },
  { id: 'borra-caves', name: 'Borra Caves', location: 'Andhra Pradesh', image: 'assets/images/states/andhra-pradesh/borra-caves.webp', slug: 'borra-caves', stateId: 'andhra-pradesh' },
  { id: 'srisailam-temple', name: 'Srisailam Temple', location: 'Andhra Pradesh', image: 'assets/images/states/andhra-pradesh/srisailam-temple.webp', slug: 'srisailam-temple', stateId: 'andhra-pradesh' },
  { id: 'rushikonda-beach', name: 'Rushikonda Beach', location: 'Andhra Pradesh', image: 'assets/images/popular/rushikonda-beach.webp', slug: 'rushikonda-beach', stateId: 'andhra-pradesh' },
  { id: 'golconda-fort', name: 'Golconda Fort', location: 'Telangana', image: 'assets/images/popular/golconda-fort.webp', slug: 'golconda-fort', stateId: 'telangana' },
  { id: 'bhadrachalam-temple', name: 'Bhadrachalam Temple', location: 'Telangana', image: 'assets/images/states/telangana/bhadrachalam.webp', slug: 'bhadrachalam-temple', stateId: 'telangana' },
  { id: 'chilika-lake', name: 'Chilika Lake', location: 'Odisha', image: 'assets/images/popular/chilika-lake.webp', slug: 'chilika-lake', stateId: 'odisha' },
  { id: 'lingaraja-temple', name: 'Lingaraja Temple', location: 'Odisha', image: 'assets/images/popular/lingaraja-temple.webp', slug: 'lingaraja-temple', stateId: 'odisha' },
  { id: 'puri-beach', name: 'Puri Beach', location: 'Odisha', image: 'assets/images/popular/puri-beach.webp', slug: 'puri-beach', stateId: 'odisha' },
  { id: 'nalanda-mahavihara', name: 'Nalanda Mahavihara', location: 'Bihar', image: 'assets/images/states/bihar/nalanda-university-ruins.webp', slug: 'nalanda-mahavihara', stateId: 'bihar' },
  { id: 'rajgir-ropeway', name: 'Rajgir Ropeway', location: 'Bihar', image: 'assets/images/states/bihar/rajgir.webp', slug: 'rajgir-ropeway', stateId: 'bihar' },
  { id: 'sundarbans-national-park', name: 'Sundarbans National Park', location: 'West Bengal', image: 'assets/images/states/west-bengal/sundarbans-national-park.webp', slug: 'sundarbans-national-park', stateId: 'west-bengal' },
  { id: 'darjeeling-himalayan-railway', name: 'Darjeeling Himalayan Railway', location: 'West Bengal', image: 'assets/images/states/west-bengal/darjeeling-himalayan-railway.webp', slug: 'darjeeling-himalayan-railway', stateId: 'west-bengal' },
  { id: 'tiger-hill', name: 'Tiger Hill', location: 'West Bengal', image: 'assets/images/popular/tiger-hill.webp', slug: 'tiger-hill', stateId: 'west-bengal' },
  { id: 'kalimpong-monasteries', name: 'Kalimpong Monasteries', location: 'West Bengal', image: 'assets/images/popular/kalimpong.webp', slug: 'kalimpong-monasteries', stateId: 'west-bengal' },
  { id: 'majuli-river-island', name: 'Majuli River Island', location: 'Assam', image: 'assets/images/popular/majuli-island.webp', slug: 'majuli-river-island', stateId: 'assam' },
  { id: 'kamakhya-temple', name: 'Kamakhya Temple', location: 'Assam', image: "assets/images/states/assam/kamakhya-temple.webp", slug: 'kamakhya-temple', stateId: 'assam' },
  { id: 'dawki-river', name: 'Dawki River', location: 'Meghalaya', image: 'assets/images/popular/dawki-river.webp', slug: 'dawki-river', stateId: 'meghalaya' },
  { id: 'ziro-valley', name: 'Ziro Valley', location: 'Arunachal Pradesh', image: "assets/images/popular/ziro-valley.webp", slug: 'ziro-valley', stateId: 'arunachal-pradesh' },
  { id: 'tsomgo-lake', name: 'Tsomgo Lake', location: 'Sikkim', image: 'assets/images/popular/tsomgo-lake.webp', slug: 'tsomgo-lake', stateId: 'sikkim' },
  { id: 'nathula-pass', name: 'Nathula Pass', location: 'Sikkim', image: 'assets/images/popular/nathula-pass.webp', slug: 'nathula-pass', stateId: 'sikkim' },
  { id: 'gurudongmar-lake', name: 'Gurudongmar Lake', location: 'Sikkim', image: 'assets/images/states/sikkim/gurudongmar-lake.webp', slug: 'gurudongmar-lake', stateId: 'sikkim' },
  { id: 'auli-ski-resort', name: 'Auli Ski Resort', location: 'Uttarakhand', image: 'assets/images/states/uttarakhand/auli.webp', slug: 'auli-ski-resort', stateId: 'uttarakhand' },
  { id: 'naini-lake', name: 'Naini Lake', location: 'Uttarakhand', image: 'assets/images/states/uttarakhand/naini-lake.webp', slug: 'naini-lake', stateId: 'uttarakhand' },
  { id: 'rohtang-pass', name: 'Rohtang Pass', location: 'Himachal Pradesh', image: 'assets/images/popular/rohtang-pass.webp', slug: 'rohtang-pass', stateId: 'himachal-pradesh' },
  { id: 'solang-valley', name: 'Solang Valley', location: 'Himachal Pradesh', image: 'assets/images/states/himachal-pradesh/solang-valley.webp', slug: 'solang-valley', stateId: 'himachal-pradesh' },
  { id: 'khajjiar', name: 'Khajjiar', location: 'Himachal Pradesh', image: 'assets/images/states/himachal-pradesh/khajjiar.webp', slug: 'khajjiar', stateId: 'himachal-pradesh' },
  { id: 'pahalgam-valley', name: 'Pahalgam Valley', location: 'Jammu and Kashmir', image: 'assets/images/popular/pahalgam-valley.webp', slug: 'pahalgam-valley', stateId: 'jammu-and-kashmir' },
  { id: 'sonamarg', name: 'Sonamarg', location: 'Jammu and Kashmir', image: 'assets/images/popular/sonamarg.webp', slug: 'sonamarg', stateId: 'jammu-and-kashmir' },
  { id: 'magnetic-hill', name: 'Magnetic Hill', location: 'Ladakh', image: 'assets/images/states/ladakh/magnetic-hill.webp', slug: 'magnetic-hill', stateId: 'ladakh' },
  { id: 'sam-sand-dunes', name: 'Sam Sand Dunes', location: 'Rajasthan', image: 'assets/images/states/rajasthan/sam-sand-dunes.webp', slug: 'sam-sand-dunes', stateId: 'rajasthan' },
  { id: 'pushkar-lake', name: 'Pushkar Lake', location: 'Rajasthan', image: 'assets/images/popular/pushkar-lake.webp', slug: 'pushkar-lake', stateId: 'rajasthan' },
  { id: 'shirdi-sai-baba-temple', name: 'Shirdi Sai Baba Temple', location: 'Maharashtra', image: 'assets/images/popular/shirdi-sai-baba-temple.webp', slug: 'shirdi-sai-baba-temple', stateId: 'maharashtra' },
  { id: 'elephanta-caves', name: 'Elephanta Caves', location: 'Maharashtra', image: 'assets/images/popular/elephanta-caves.webp', slug: 'elephanta-caves', stateId: 'maharashtra' },
  { id: 'mahabaleshwar-viewpoints', name: 'Mahabaleshwar Viewpoints', location: 'Maharashtra', image: 'assets/images/states/maharashtra/mahabaleshwar.webp', slug: 'mahabaleshwar-viewpoints', stateId: 'maharashtra' },
  { id: 'belur-chennakeshava-temple', name: 'Belur Chennakeshava Temple', location: 'Karnataka', image: 'assets/images/states/karnataka/chennakeshava-temple-belur.webp', slug: 'belur-chennakeshava-temple', stateId: 'karnataka' },
  { id: 'halebidu-hoysaleswara-temple', name: 'Halebidu Hoysaleswara Temple', location: 'Karnataka', image: 'assets/images/states/karnataka/hoysaleswara-temple-halebidu.webp', slug: 'halebidu-hoysaleswara-temple', stateId: 'karnataka' },
  { id: 'badami-cave-temples', name: 'Badami Cave Temples', location: 'Karnataka', image: 'assets/images/popular/badami-cave-temples.webp', slug: 'badami-cave-temples', stateId: 'karnataka' },
  { id: 'kanyakumari-beach', name: 'Kanyakumari Beach', location: 'Tamil Nadu', image: 'assets/images/popular/kanyakumari-beach.webp', slug: 'kanyakumari-beach', stateId: 'tamil-nadu' },
  { id: 'marina-beach', name: 'Marina Beach', location: 'Tamil Nadu', image: 'assets/images/popular/marina-beach.webp', slug: 'marina-beach', stateId: 'tamil-nadu' },
  { id: 'varkala-beach', name: 'Varkala Beach', location: 'Kerala', image: 'assets/images/popular/varkala-cliff.webp', slug: 'varkala-beach', stateId: 'kerala' },
  { id: 'havelock-island', name: 'Havelock Island', location: 'Andaman and Nicobar Islands', image: 'assets/images/states/andaman-and-nicobar-islands/swaraj-dweep.webp', slug: 'havelock-island', stateId: 'andaman-and-nicobar-islands' },
  { id: 'cellular-jail', name: 'Cellular Jail', location: 'Andaman and Nicobar Islands', image: 'assets/images/states/andaman-and-nicobar-islands/cellular-jail.webp', slug: 'cellular-jail', stateId: 'andaman-and-nicobar-islands' },
  { id: 'dholavira', name: 'Dholavira', location: 'Gujarat', image: 'assets/images/popular/dholavira.webp', slug: 'dholavira', stateId: 'gujarat' },
];

let currentCategory = sessionStorage.getItem('home-current-category') || 'all';

// Auto-assign categories based on names/locations
ALL_DESTINATIONS.forEach(d => {
  const n = d.name.toLowerCase();
  const c = d.categories = ['all'];
  if (n.match(/fort|palace|mahal|gate|minar|tomb|memorial|caves|haveli|sikri|vav/)) c.push('heritage');
  if (n.match(/temple|ghat|balaji|stupa|devi|cave/)) c.push('temples');
  if (n.match(/park|sundarbans/)) c.push('wildlife', 'national-parks');
  if (n.match(/beach|cliff|marine/)) c.push('beaches');
  if (n.match(/hill|valley|pass|trek|marg|leh|shimla|manali|ooty|abu|darjeeling/)) c.push('hills');
  if (n.match(/fall/)) c.push('waterfalls');
  if (n.match(/lake|backwater/)) c.push('lakes');
  if (d.location === 'Rajasthan' || d.location === 'Gujarat') c.push('deserts');
  if (c.length === 1) c.push('nature'); // Base fallback
});

// Ensure min 4 items for tricky categories manually
const addCat = (id, cat) => { const d = ALL_DESTINATIONS.find(x => x.id === id); if(d && !d.categories.includes(cat)) d.categories.push(cat); };
addCat('goa-beaches', 'beaches'); addCat('varkala-cliff', 'beaches'); addCat('marine-drive', 'beaches'); addCat('kanyakumari-sunset', 'beaches');
addCat('jog-falls', 'waterfalls'); addCat('athirappilly-waterfalls', 'waterfalls'); addCat('dudhsagar-falls', 'waterfalls'); addCat('kerala-backwaters', 'waterfalls');
addCat('dal-lake', 'lakes'); addCat('pangong-lake', 'lakes'); addCat('chilika-lake', 'lakes'); addCat('loktak-lake', 'lakes');
addCat('jim-corbett-national-park', 'wildlife'); addCat('kaziranga-national-park', 'wildlife'); addCat('ranthambore-national-park', 'wildlife'); addCat('gir-national-park', 'wildlife');
addCat('jaisalmer-fort', 'deserts'); addCat('patwon-ki-haveli', 'deserts'); addCat('mount-abu', 'deserts'); addCat('rani-ki-vav', 'deserts');

function getFilteredDestinations() {
  return currentCategory === 'all' 
    ? ALL_DESTINATIONS 
    : ALL_DESTINATIONS.filter(d => d.categories && d.categories.includes(currentCategory));
}

const DESTINATIONS_PER_PAGE = 4;



/**
 * Build a premium destination card (full-image overlay)
 */
export function destinationCard(dest, from = 'home') {
  const safeImage = escapeHTML(dest.images?.main || dest.image || '');
  const safeName = escapeHTML(dest.name);
  const safeLocation = escapeHTML(dest.location);
  const safeId = encodeURIComponent(dest.slug || dest.id);
  const imageHTML = safeImage 
    ? `<img class="card__image" src="${safeImage}" alt="${safeName}" loading="lazy">`
    : `<div class="state-card__gradient" style="background: linear-gradient(135deg, #1a2332 0%, #0f2847 100%); width: 100%; height: 100%;"></div>`;

  return `
    <a class="card destination-card" href="place-detail.html?place=${safeId}" id="dest-card-${safeId}">
      <div class="card__image-wrap">
        ${imageHTML}
        <div class="card__image-overlay"></div>
        <div class="card__overlay-content">
          <h3 class="card__title">${safeName}</h3>
          <div class="destination-card__location">${safeLocation}</div>
          <span class="destination-card__cta">Explore <span>→</span></span>
        </div>
      </div>
    </a>
  `;
}


/**
 * Build a premium state card
 */
function stateCardPremium(state) {
  const image = STATE_IMAGES[state.slug] || '';
  const attractions = STATE_ATTRACTIONS[state.slug] || '';

  const imageHTML = image
    ? `<img class="card__image" src="${image}" alt="${state.name}" loading="lazy">`
    : `<div class="state-card__gradient" style="background: linear-gradient(135deg, #1a2332 0%, #0f2847 100%)"></div>`;

  return `
    <a class="card state-card" href="state-detail.html?state=${state.slug}" data-state-id="${state.slug}" id="state-card-${state.slug}">
      <div class="card__image-wrap">
        ${imageHTML}
        <div class="card__image-overlay--full"></div>
        <div class="card__overlay-content">
          <h3 class="card__title" style="color:white; font-size: var(--fs-lg);">${state.name}</h3>
          ${attractions ? `<div class="state-card__attractions">${attractions}</div>` : ''}
          <span class="state-card__cta">Explore <span>→</span></span>
        </div>
      </div>
    </a>
  `;
}


/**
 * Render the Popular Destinations grid with pagination
 */
function renderPopularGrid(page = 0) {
  const filteredDestinations = getFilteredDestinations();

  if (page === 'all') {
    const cardsHTML = filteredDestinations.map(d => destinationCard(d, 'home')).join('');
    return `
      <div class="popular-destinations-wrap" data-current-page="all">
        <div class="cards-grid cards-grid--4" id="popular-cards-grid">
          ${cardsHTML}
        </div>
      </div>
    `;
  }

  const start = page * DESTINATIONS_PER_PAGE;
  const end = start + DESTINATIONS_PER_PAGE;
  const pageItems = filteredDestinations.slice(start, end);
  const totalPages = Math.ceil(filteredDestinations.length / DESTINATIONS_PER_PAGE);

  const cardsHTML = pageItems.map(d => destinationCard(d, 'home')).join('');

  // Page indicator dots
  const dotsHTML = totalPages > 1 ? `
    <div class="popular-pagination__dots">
      ${Array.from({ length: totalPages }, (_, i) => `
        <span class="popular-pagination__dot ${i === page ? 'popular-pagination__dot--active' : ''}" data-page="${i}"></span>
      `).join('')}
    </div>
  ` : '';

  // Navigation buttons
  const prevDisabled = page === 0;
  const nextDisabled = page >= totalPages - 1;

  return `
    <div class="popular-destinations-wrap" data-current-page="${page}">
      <div class="cards-grid cards-grid--4" id="popular-cards-grid">
        ${cardsHTML}
      </div>
      <div class="popular-pagination" id="popular-pagination">
        <div class="popular-pagination__left">
          <span class="result-count">Showing <strong>${filteredDestinations.length === 0 ? 0 : start + 1}–${Math.min(end, filteredDestinations.length)}</strong> of <strong>${filteredDestinations.length}</strong> destinations</span>
        </div>
        <div class="popular-pagination__controls">
          <button class="popular-pagination__btn ${prevDisabled ? 'popular-pagination__btn--disabled' : ''}" 
                  id="popular-prev" ${prevDisabled ? 'disabled' : ''} aria-label="Previous page">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button class="popular-pagination__btn popular-pagination__btn--primary ${nextDisabled ? 'popular-pagination__btn--disabled' : ''}"
                  id="popular-next" ${nextDisabled ? 'disabled' : ''} aria-label="Next page">
            More
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>
    </div>
  `;
}


/**
 * Bind pagination click events
 */
function bindPaginationEvents() {
  const nextBtn = document.getElementById('popular-next');
  const prevBtn = document.getElementById('popular-prev');
  const dots = document.querySelectorAll('.popular-pagination__dot');
  const exploreBtn = document.getElementById('popular-explore-btn');

  function goToPage(page) {
    const section = document.getElementById('popular-section');
    const container = section?.querySelector('.popular-destinations-wrap')?.parentElement;
    if (!container) return;

    sessionStorage.setItem('home-popular-page', page);
    container.innerHTML = renderPopularGrid(page);

    // Fade in instantly
    const newWrap = container.querySelector('.popular-destinations-wrap');
    if (newWrap) {
      newWrap.style.animation = 'fadeIn 0.3s ease';
    }

    // Scroll to section
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Re-bind events
    bindPaginationEvents();
  }

  if (exploreBtn) {
    exploreBtn.addEventListener('click', () => {
      window.location.href = 'destinations.html';
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const wrap = document.querySelector('.popular-destinations-wrap');
      const currentPage = parseInt(wrap?.dataset.currentPage || '0');
      const totalPages = Math.ceil(getFilteredDestinations().length / DESTINATIONS_PER_PAGE);
      if (currentPage < totalPages - 1) {
        goToPage(currentPage + 1);
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const wrap = document.querySelector('.popular-destinations-wrap');
      const currentPage = parseInt(wrap?.dataset.currentPage || '0');
      if (currentPage > 0) {
        goToPage(currentPage - 1);
      }
    });
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const page = parseInt(dot.dataset.page || '0');
      goToPage(page);
    });
  });
}


/**
 * Render the home landing page
 */
export function renderHomeFeed(data, container) {
  const { states } = data;

  // ━━━ HERO BANNER ━━━
  const heroHTML = `
    <section class="hero hero--banner" id="hero-section">
      <div class="hero__bg">
        <img src="assets/images/hero_banner.webp" alt="Discover India with Travvana" loading="eager" decoding="async">
        <div class="hero__bg-overlay"></div>
      </div>
      <div class="hero__content container">
        <div class="hero__label" style="color: var(--clr-accent);">EXPLORE THE INCREDIBLE</div>
        <h1 class="hero__title">Discover India</h1>
        <p class="hero__subtitle">Curated places for your next adventure</p>
      </div>
    </section>
  `;

  // ━━━ UNIFIED SEARCH & CATEGORIES ━━━
  const searchHTML = `
    <div class="container" style="margin-top: var(--section-gap);">
      <div class="home-search" style="margin-bottom: var(--sp-6);">
        ${unifiedSearchBar({ 
          placeholder: 'Search by city, place or state', 
          id: 'hero-search',
          activeCategory: currentCategory
        })}
      </div>
    </div>
  `;

  // ━━━ POPULAR DESTINATIONS (4 per row × 2 rows = 8, paginated) ━━━
  const popularHTML = `
    <section class="section" id="popular-section">
      <div class="container">
        <div class="section-title-row">
          <div class="section-title-row__left">
            <h2>Popular Destinations</h2>
            <p class="section-subtitle">Top must visit places across India</p>
          </div>
          <button class="section-title-row__more" id="popular-explore-btn">Explore</button>
        </div>
        <div id="popular-grid-container">
          ${renderPopularGrid(parseInt(sessionStorage.getItem('home-popular-page') || '0', 10))}
        </div>
      </div>
    </section>
  `;

  // ━━━ STATES & UNION TERRITORIES (4 per row × 2 rows, paginated) ━━━
  // All 28 states sorted alphabetically + 8 UTs alphabetically at the end
  const statesList = [
    'andhra-pradesh', 'arunachal-pradesh', 'assam', 'bihar', 'chhattisgarh',
    'goa', 'gujarat', 'haryana', 'himachal-pradesh', 'jharkhand',
    'karnataka', 'kerala', 'madhya-pradesh', 'maharashtra', 'manipur',
    'meghalaya', 'mizoram', 'nagaland', 'odisha', 'punjab',
    'rajasthan', 'sikkim', 'tamil-nadu', 'telangana', 'tripura',
    'uttar-pradesh', 'uttarakhand', 'west-bengal'
  ];
  const utList = [
    'andaman-and-nicobar-islands', 'chandigarh', 'dadra-nagar-haveli-daman-diu',
    'delhi', 'jammu-and-kashmir', 'ladakh', 'lakshadweep', 'puducherry'
  ];
  const ALL_STATES_UTS = [...statesList, ...utList];
  const STATES_PER_PAGE = 4;

  const allStates = states?.states || [];

  function buildStateCard(slug) {
    const stateData = allStates.find(s => s.slug === slug);
    if (!stateData) {
      return stateCardPremium({
        name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        slug
      });
    }
    return stateCardPremium(stateData);
  }

  function renderStatesPage(page = 0) {
    const start = page * STATES_PER_PAGE;
    const end = start + STATES_PER_PAGE;
    const pageItems = ALL_STATES_UTS.slice(start, end);
    const totalPages = Math.ceil(ALL_STATES_UTS.length / STATES_PER_PAGE);

    const cardsHTML = pageItems.map(slug => buildStateCard(slug)).join('');

    // Check if this page crosses from states into UTs
    const statesCount = statesList.length; // 28
    const showingStates = pageItems.some(s => statesList.includes(s));
    const showingUTs = pageItems.some(s => utList.includes(s));
    let label = '';
    if (showingStates && !showingUTs) label = 'States';
    else if (!showingStates && showingUTs) label = 'Union Territories';
    else if (showingStates && showingUTs) label = 'States & Union Territories';

    // Dots
    const dotsHTML = totalPages > 1 ? `
      <div class="popular-pagination__dots">
        ${Array.from({ length: totalPages }, (_, i) => `
          <span class="popular-pagination__dot ${i === page ? 'popular-pagination__dot--active' : ''}" data-spage="${i}"></span>
        `).join('')}
      </div>
    ` : '';

    const prevDisabled = page === 0;
    const nextDisabled = page >= totalPages - 1;

    return `
      <div class="states-destinations-wrap" data-current-page="${page}">
        <div class="cards-grid cards-grid--4" id="states-cards-grid">
          ${cardsHTML}
        </div>
        <div class="popular-pagination" id="states-pagination">
          <div class="popular-pagination__left">
            <span class="result-count">Showing <strong>${start + 1}–${Math.min(end, ALL_STATES_UTS.length)}</strong> of <strong>${ALL_STATES_UTS.length}</strong> ${label}</span>
          </div>
          <div class="popular-pagination__controls">
            <button class="popular-pagination__btn ${prevDisabled ? 'popular-pagination__btn--disabled' : ''}"
                    id="states-prev" ${prevDisabled ? 'disabled' : ''} aria-label="Previous page">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button class="popular-pagination__btn popular-pagination__btn--primary ${nextDisabled ? 'popular-pagination__btn--disabled' : ''}"
                    id="states-next" ${nextDisabled ? 'disabled' : ''} aria-label="Next page">
              More
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  const stateWiseHTML = `
    <section class="section" id="statewise-section">
      <div class="container">
        <div class="section-title-row">
          <div class="section-title-row__left">
            <h2>States & Union Territories</h2>
            <p class="section-subtitle">Explore all 28 states and 8 union territories of India</p>
          </div>
          <a href="discovery.html" class="section-title-row__more">Explore</a>
        </div>
        <div id="states-grid-container">
          ${renderStatesPage(parseInt(sessionStorage.getItem('home-states-page') || '0', 10))}
        </div>
      </div>
    </section>
  `;

  // ━━━ NEW BOOKING BANNER ━━━
  const bannerHTML = `
    <section class="section booking-banner-wrapper">
      <div class="container">
        <div class="booking-banner">
          <!-- Background decorative elements -->
          <div class="booking-banner__bg-text">
            ....<br>....<br>....<br>....
          </div>
          
          <!-- Curved lines in bottom right -->
          <svg class="booking-banner__bg-svg" viewBox="0 0 100 100">
            <circle cx="100" cy="100" r="80" fill="none" stroke="white" stroke-width="1"/>
            <circle cx="100" cy="100" r="60" fill="none" stroke="white" stroke-width="1"/>
            <circle cx="100" cy="100" r="40" fill="none" stroke="white" stroke-width="1"/>
          </svg>
          
          <div class="booking-banner__left">
            <div class="booking-banner__subtitle">Plan Ahead</div>
            
            <h2 class="booking-banner__title">Book Your Trip <br><span>Coming Soon!</span></h2>
            
            <div class="booking-banner__divider">
              <div class="booking-banner__divider-line"></div>
              <svg class="booking-banner__divider-icon" viewBox="0 0 24 24"><path d="M21,16v-2l-8-5V3.5C13,2.67,12.33,2,11.5,2S10,2.67,10,3.5V9l-8,5v2l8-2.5V19l-2,1.5V22l3.5-1l3.5,1v-1.5L13,19v-5.5L21,16z"/></svg>
            </div>
            
            <p class="booking-banner__desc">Amazing destinations, unforgettable experiences.<br>Bookings open soon, stay tuned!</p>
            
            <div class="booking-banner__features">
              <div class="booking-banner__feature">
                <div class="booking-banner__feature-icon">
                  <!-- Calendar icon -->
                  <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
                </div>
                <span class="booking-banner__feature-text">Plan Early</span>
              </div>
              <div class="booking-banner__feature">
                <div class="booking-banner__feature-icon">
                  <!-- Tag/Deal icon -->
                  <svg viewBox="0 0 24 24"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.41l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.41zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7zm11.77 8.27L13 19.54l-4.27-4.27 5.27-5.27 3.27 3.27z"/></svg>
                </div>
                <span class="booking-banner__feature-text">Best Deals</span>
              </div>
              <div class="booking-banner__feature">
                <div class="booking-banner__feature-icon">
                  <!-- Shield/Secure icon -->
                  <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                </div>
                <span class="booking-banner__feature-text">Secure Booking</span>
              </div>
            </div>
            
            <button class="booking-banner__btn">
              <!-- Bell icon -->
              <svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
              WE WILL NOTIFY
            </button>
          </div>
          
          <div class="booking-banner__right">
            <!-- decorative flight path -->
            <svg class="booking-banner__flight-path" viewBox="0 0 400 400">
              <!-- dashed line connecting images -->
              <path d="M350,150 C400,250 350,350 200,350 C100,350 50,250 150,150" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" stroke-dasharray="5,5" fill="none"/>
            </svg>
            
            <!-- Mountain Image (Main, left-tilted) -->
            <div class="booking-banner__img-main">
              <img src="assets/images/banner_assets/mountains.png" alt="Mountains">
            </div>
            
            <!-- Sunset Image (Top right, slight right tilt) -->
            <div class="booking-banner__img-secondary">
              <img src="assets/images/banner_assets/sunset.png" alt="Sunset">
            </div>
            
            <!-- Beach Image (Bottom right, slight right tilt) -->
            <div class="booking-banner__img-tertiary">
              <img src="assets/images/banner_assets/beach.png" alt="Beach">
            </div>
            
            <!-- Map Pin at bottom middle -->
            <div class="booking-banner__map-pin">
              <div></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  // ━━━ ASSEMBLE ━━━
  const fullHTML = `
    ${heroHTML}
    ${searchHTML}
    ${popularHTML}
    ${stateWiseHTML}
    ${bannerHTML}
  `;

  setHTML(container, fullHTML, false);

  // Bind pagination after render
  requestAnimationFrame(() => {
    bindPaginationEvents();
    bindStatesPagination();
  });

  function handleCategoryChange(catId) {
    if (currentCategory === catId) return;

    currentCategory = catId || 'all';
    sessionStorage.setItem('home-current-category', currentCategory);
    sessionStorage.setItem('home-popular-page', '0');
    
    const gridContainer = document.getElementById('popular-grid-container');
    if (gridContainer) {
      gridContainer.innerHTML = renderPopularGrid(0);
      const newWrap = gridContainer.querySelector('.popular-destinations-wrap');
      if (newWrap) {
        newWrap.style.animation = 'fadeIn 0.3s ease';
      }
      bindPaginationEvents();
    }
  }

  // Export handleCategoryChange so discoveryController can use it with initUnifiedSearchBar
  container.handleCategoryChange = handleCategoryChange;



  // States/UT pagination handler
  function bindStatesPagination() {
    const nextBtn = document.getElementById('states-next');
    const prevBtn = document.getElementById('states-prev');
    const dots = document.querySelectorAll('[data-spage]');

    function goToStatePage(page) {
      const section = document.getElementById('statewise-section');
      const container = document.getElementById('states-grid-container');
      if (!container) return;

      sessionStorage.setItem('home-states-page', page);
      container.innerHTML = renderStatesPage(page);

      const newWrap = container.querySelector('.states-destinations-wrap');
      if (newWrap) {
        newWrap.style.animation = 'fadeIn 0.3s ease';
      }

      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      bindStatesPagination();
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const wrap = document.querySelector('.states-destinations-wrap');
        const currentPage = parseInt(wrap?.dataset.currentPage || '0');
        const totalPages = Math.ceil(ALL_STATES_UTS.length / STATES_PER_PAGE);
        if (currentPage < totalPages - 1) goToStatePage(currentPage + 1);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const wrap = document.querySelector('.states-destinations-wrap');
        const currentPage = parseInt(wrap?.dataset.currentPage || '0');
        if (currentPage > 0) goToStatePage(currentPage - 1);
      });
    }

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const page = parseInt(dot.dataset.spage || '0');
        goToStatePage(page);
      });
    });
  }
}


/**
 * Render home page skeleton loading state
 */
export function renderHomeSkeletons(container) {
  const skeletonCard = `
    <div class="card destination-card" style="background: var(--clr-bg-card); overflow: hidden;">
      <div class="skeleton" style="width:100%; height:100%; border-radius: var(--card-radius);"></div>
    </div>
  `;

  setHTML(container, `
    <div style="margin-bottom: var(--sp-8);">
      <div class="skeleton" style="width:100%; aspect-ratio:21/8; margin-bottom:var(--sp-8);"></div>
    </div>
    <div class="container">
      <div class="skeleton" style="height:44px; border-radius:var(--chip-radius); margin-bottom:var(--sp-4); max-width:300px;"></div>
      <div style="display:flex; gap:var(--chip-gap); margin-bottom:var(--sp-6); overflow:hidden;">
        ${Array(8).fill('<div class="skeleton" style="width:100px; height:44px; border-radius:var(--chip-radius); flex-shrink:0;"></div>').join('')}
      </div>
      <div class="skeleton" style="height:48px; border-radius:var(--search-radius); margin-bottom:var(--section-gap);"></div>

      <div class="skeleton" style="width:250px; height:28px; margin-bottom:var(--sp-2);"></div>
      <div class="skeleton" style="width:300px; height:16px; margin-bottom:var(--sp-5);"></div>
      <div class="cards-grid cards-grid--4">
        ${Array(4).fill(skeletonCard).join('')}
      </div>
    </div>
  `, false);
}
