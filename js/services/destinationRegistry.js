import { idToStateMap } from '../data/idToStateMap.js';

class DestinationRegistry {
  constructor() {
    this.registry = new Map();
    this.aliasMap = new Map();
    this.initialized = false;
    this._placeDetailsLoaded = false;
  }

  async _loadPlaceDetails() {
    // Legacy method — no longer loads the full monolithic placeDetails.js.
    // Instead, place data is loaded per-state on demand via _loadStatePlaces().
    // This method is kept as a no-op for backward compatibility.
    this._placeDetailsLoaded = true;
  }

  /**
   * Load all places for a specific state from its JSON file.
   * Results are cached in the registry for subsequent lookups.
   * @param {string} stateSlug
   * @private
   */
  async _loadStatePlaces(stateSlug) {
    if (!stateSlug || this._loadedStates?.has(stateSlug)) return;
    if (!this._loadedStates) this._loadedStates = new Set();

    try {
      const { jsonLoader } = await import('./jsonLoader.js');
      const stateData = await jsonLoader.load(`data/states/${stateSlug}.json`, { retries: 1, timeout: 5000 });

      if (stateData?.places) {
        stateData.places.forEach(place => {
          const key = place.slug || place.id;
          if (key) this.registry.set(key, place);
        });
      }
      this._loadedStates.add(stateSlug);
    } catch (e) {
      console.warn(`[DestinationRegistry] Failed to load state places for "${stateSlug}":`, e);
    }
  }


  init() {
    if (this.initialized) return;

    // Delhi renamings
    this.addAlias('rajpath', 'kartavya-path');
    this.addAlias('raj-path', 'kartavya-path');
    this.addAlias('mughal-gardens', 'amrit-udyan');
    this.addAlias('mughal-garden', 'amrit-udyan');
    this.addAlias('lodi-gardens', 'lodhi-garden');
    this.addAlias('lodi-garden', 'lodhi-garden');
    this.addAlias('lodhi-gardens', 'lodhi-garden');

    // Spelling variations
    this.addAlias('qutb-minar', 'qutub-minar');
    this.addAlias('kutub-minar', 'qutub-minar');
    this.addAlias('old-fort', 'purana-qila');
    this.addAlias('purana-quila', 'purana-qila');
    this.addAlias('bahai-temple', 'lotus-temple');
    this.addAlias('bahai-temple-delhi', 'lotus-temple');
    this.addAlias('akshardham-temple', 'swaminarayan-akshardham');
    this.addAlias('akshardham', 'swaminarayan-akshardham');
    this.addAlias('hauz-khas-village', 'hauz-khas-fort');
    this.addAlias('hauz-khas-complex', 'hauz-khas-fort');

    // Other aliases
    this.addAlias('ajanta-ellora', 'ajanta-and-ellora-caves');
    this.addAlias('kanyakumari-sunset', 'kanyakumari-sunset-point');
    this.addAlias('manali', 'manali-hill-station');
    this.addAlias('bombay', 'mumbai');
    this.addAlias('bangalore', 'bengaluru');
    this.addAlias('calcutta', 'kolkata');
    this.addAlias('madras', 'chennai');
    // Lakshadweep aliases
    this.addAlias('kavarathi', 'kavaratti-island');
    this.addAlias('kavarathi-island', 'kavaratti-island');
    this.addAlias('kavaratti', 'kavaratti-island');
    this.addAlias('agatti-airport', 'agatti-island');
    this.addAlias('agatti-airstrip', 'agatti-island');
    this.addAlias('south-lighthouse-minicoy', 'minicoy-lighthouse');
    this.addAlias('minicoy', 'minicoy-island');
    this.addAlias('bangaram', 'bangaram-island');
    this.addAlias('kadmat', 'kadmat-island');
    this.addAlias('kalpeni', 'kalpeni-island');
    this.addAlias('thinnakara', 'thinnakara-island');
    this.addAlias('andrott', 'andrott-island');
    this.addAlias('amini', 'amini-island');
    this.addAlias('bitra', 'bitra-island');
    this.addAlias('chetlat', 'chetlat-island');
    this.addAlias('kiltan', 'kiltan-island');
    // Chandigarh aliases
    this.addAlias('rock-garden-chandigarh', 'rock-garden');
    this.addAlias('nek-chand-rock-garden', 'rock-garden');
    this.addAlias('zakir-hussain-rose-garden', 'rose-garden');
    this.addAlias('capitol-complex-chandigarh', 'capitol-complex');
    this.addAlias('le-corbusier-capitol-complex', 'capitol-complex');

    // Legacy aliases for previously broken "undefined" slugs
    this.addAlias('jantar-mantar-undefined', 'jantar-mantar-jaipur');
    this.addAlias('pulicat-lake-undefined', 'pulicat-lake');
    this.addAlias('jagannath-temple-undefined', 'jagannath-temple-puri');
    this.addAlias('chitrakoot-undefined-madhya-pradesh', 'chitrakoot-madhya-pradesh');
    this.addAlias('ramnagar-fort-undefined-madhya-pradesh', 'ramnagar-fort-madhya-pradesh');
    this.addAlias('chitrakoot-undefined-uttar-pradesh', 'chitrakoot-uttar-pradesh');
    this.addAlias('ramnagar-fort-undefined-uttar-pradesh', 'ramnagar-fort-uttar-pradesh');

    // Popular destinations missing aliases
    this.addAlias('tirumala-venkateswara-temple', 'tirupati-balaji');
    this.addAlias('kashi-vishwanath-temple', 'kashi-vishwanath');
    this.addAlias('hampi', 'hampi-ruins');
    this.addAlias('khajuraho-group-of-monuments', 'khajuraho-temples');
    this.addAlias('mahabalipuram-monuments', 'mahabalipuram');
    this.addAlias('ramanathaswamy-temple', 'rameswaram-temple');
    this.addAlias('jagannath-temple', 'jagannath-temple-puri');
    this.addAlias('pangong-lake', 'pangong-tso');
    this.addAlias('alleppey-backwaters', 'alappuzha-backwaters');
    this.addAlias('kedarnath-temple', 'kedarnath');
    this.addAlias('badrinath-temple', 'badrinath');
    this.addAlias('kodaikanal-lake', 'kodaikanal');
    this.addAlias('nalanda-mahavihara', 'nalanda-university-ruins');
    this.addAlias('rajgir-ropeway', 'rajgir');
    this.addAlias('sundarbans-national-park', 'sundarbans');
    this.addAlias('darjeeling-himalayan-railway', 'toy-train-darjeeling');
    this.addAlias('kalimpong-monasteries', 'kalimpong');
    this.addAlias('dawki-river', 'umngot-river');
    this.addAlias('auli-ski-resort', 'auli');
    // removed pahalgam-valley alias
    this.addAlias('sonamarg', 'sonamarg-town');
    this.addAlias('elephanta-caves', 'elephanta-caves-island');
    this.addAlias('mahabaleshwar-viewpoints', 'mahabaleshwar-hill-station');
    this.addAlias('belur-chennakeshava-temple', 'chennakeshava-temple-belur');
    this.addAlias('halebidu-hoysaleswara-temple', 'belur-halebidu-halebid');
    this.addAlias('badami-cave-temples', 'badami-caves');
    this.addAlias('kanyakumari-beach', 'kanyakumari');

    // Phase 2: Additional aliases for not-found popular destinations
    this.addAlias('periyar-national-park', 'periyar-wildlife-sanctuary');
    this.addAlias('living-root-bridges', 'double-decker-living-root-bridge');
    this.addAlias('lingaraja-temple', 'lingaraj-temple');
    this.addAlias('majuli-river-island', 'majuli-island');
    this.addAlias('nathula-pass', 'nathu-la-pass');
    this.addAlias('varkala-beach', 'varkala-cliff');
    this.addAlias('havelock-island', 'swaraj-dweep');
    // removed coorg alias

    this.initialized = true;
  }

  addAlias(alias, canonicalId) {
    this.aliasMap.set(alias.toLowerCase(), canonicalId);
  }

  normalizeId(id) {
    if (!id) return '';
    return id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  getDestination(id) {
    if (!id) return null;
    this.init();

    // 1. Exact Match
    if (this.registry.has(id)) {
      return this.registry.get(id);
    }

    // 2. Normalized Match
    const normalized = this.normalizeId(id);
    if (this.registry.has(normalized)) {
      return this.registry.get(normalized);
    }

    // 3. Alias Match
    if (this.aliasMap.has(normalized)) {
      const canonical = this.aliasMap.get(normalized);
      if (this.registry.has(canonical)) {
        return this.registry.get(canonical);
      }
    }

    return null;
  }

  /**
   * Async version that loads only the relevant state's data on demand
   */
  async getDestinationAsync(id) {
    if (!id) return null;
    this.init();

    // Check if already in registry (from a previous state load)
    let dest = this.getDestination(id);
    if (dest) return dest;

    // Determine which state this place belongs to and load just that state
    const normalized = this.normalizeId(id);
    let stateSlug = idToStateMap[normalized] || idToStateMap[id];

    // Resolve alias if direct lookup fails
    if (!stateSlug) {
      const aliasTarget = this.aliasMap.get(normalized);
      if (aliasTarget) {
        stateSlug = idToStateMap[aliasTarget] || idToStateMap[this.normalizeId(aliasTarget)];
      }
    }

    if (stateSlug) {
      await this._loadStatePlaces(stateSlug);
      dest = this.getDestination(id);
      if (dest) return dest;
    }

    return null;
  }


  async resolveDestination(placeId, stateSlugHint = null) {
    if (!placeId) return null;
    this.init();

    // 1. Quick sync lookup (may succeed if state was already loaded)
    let dest = this.getDestination(placeId);
    if (dest) return dest;

    // 2. Identify the state slug using the map, fallback to hint
    const normalized = this.normalizeId(placeId);
    let stateSlug = idToStateMap[normalized] || idToStateMap[placeId] || stateSlugHint;

    // 2b. If not found, resolve alias and check idToStateMap with the canonical ID
    if (!stateSlug) {
      const aliasTarget = this.aliasMap.get(normalized);
      if (aliasTarget) {
        stateSlug = idToStateMap[aliasTarget] || idToStateMap[this.normalizeId(aliasTarget)];
      }
    }

    if (!stateSlug) {
      // Fuzzy search on the map as last resort
      const mapKeys = Object.keys(idToStateMap);
      for (const k of mapKeys) {
        if (k.includes(normalized) || normalized.includes(k)) {
           stateSlug = idToStateMap[k];
           break;
        }
      }
    }

    if (!stateSlug) return null;

    // 3. Load the state's places (cached after first load)
    await this._loadStatePlaces(stateSlug);

    // 4. Try exact match again after loading
    dest = this.getDestination(placeId);
    if (dest) return dest;

    // 5. Fuzzy match within the registry
    for (const [key, place] of this.registry) {
      if (key.includes(normalized) || normalized.includes(key)) {
        return place;
      }
    }

    return null;
  }
}

export const destinationRegistry = new DestinationRegistry();
