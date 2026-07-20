/* ============================================
   TRAVVANA — Itinerary Engine v4.0
   Secure AI itinerary generation via backend proxy
   No API keys in client code
   ============================================ */

import { jsonLoader } from '../../../services/jsonLoader.js';
import { DATA_PATHS } from '../../../utils/constants.js';
import { destinationRegistry } from '../../../services/destinationRegistry.js';

class ItineraryEngine {

  /**
   * Generate itinerary from ALL user inputs
   * @param {Object} params - All wizard selections
   */
  async generateItinerary({
    destination, days, travelers, budget, tripType,
    interests, transport, stay, food, accessibility, extras
  }) {
    // ── 0. Try Backend AI First ──
    try {
      const aiData = await this._generateViaBackend({
        destination, days, travelers, budget, tripType,
        interests, transport, stay, food, accessibility, extras
      });
      if (aiData) {
        console.log('[ItineraryEngine] Successfully generated via AI backend');
        return aiData;
      }
    } catch (err) {
      console.warn('[ItineraryEngine] Backend AI failed. Falling back to heuristic...', err.message);
    }

    // ── Fallback to Local Heuristic ──
    return this._generateHeuristic({
      destination, days, travelers, budget, tripType,
      interests, transport, stay, food, accessibility, extras
    });
  }

  /**
   * Generate via secure backend proxy (no API key in client)
   */
  async _generateViaBackend({
    destination, days, travelers, budget, tripType,
    interests, transport, stay, food, accessibility, extras
  }) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          days: typeof days === 'number' ? days : 5,
          travelers: String(travelers),
          budget,
          tripType,
          interests: interests || [],
          transport: transport || 'mixed',
          stay: stay || 'hotel',
          food: food || 'no-pref',
          accessibility: accessibility || [],
          extras: extras || ''
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

      // Validate response structure
      if (!data.schedule || !Array.isArray(data.schedule) || data.schedule.length === 0) {
        throw new Error('Invalid itinerary structure received');
      }

      // Ensure all items have required fields with defaults
      data.schedule.forEach(day => {
        if (!day.items) day.items = [];
        day.items.forEach(item => {
          item.time = item.time || '';
          item.title = item.title || 'Unnamed Place';
          item.desc = item.desc || '';
          item.type = item.type || 'attraction';
          item.visitDuration = item.visitDuration || '';
          item.entryFee = item.entryFee || '';
          item.timings = item.timings || '';
          item.proTip = item.proTip || '';
          item.photoSpot = item.photoSpot || '';
          item.accessibility = item.accessibility || '';
        });
      });

      return data;

    } catch (err) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw err;
    }
  }

  /**
   * Local heuristic fallback — uses ALL user preferences
   */
  async _generateHeuristic({
    destination, days, travelers, budget, tripType,
    interests, transport, stay, food, accessibility, extras
  }) {
    const stateSlug = destinationRegistry.normalizeId(destination);
    let stateData;

    try {
      stateData = await jsonLoader.load(DATA_PATHS.statePopular(stateSlug), { retries: 1 });
    } catch (err) {
      throw new Error(`We couldn't find data for "${destination}". Try a state name like Rajasthan, Himachal Pradesh, Kerala, or Goa.`);
    }

    if (!stateData?.places?.length) {
      throw new Error('No places found for this destination.');
    }

    // ── 1. Score Places Using ALL Preferences ──
    const interestSet = new Set((interests || []).map(i => i.toLowerCase()));
    const accessSet = new Set((accessibility || []).map(a => a.toLowerCase()));
    const needsAccessible = accessSet.has('wheelchair') || accessSet.has('senior');

    const scored = stateData.places.map(place => {
      let score = (place.rating || 4) * 3;
      const cat = (place.category || '').toLowerCase();
      const famous = (place.famousFor || '').toLowerCase();
      const desc = (place.description || '').toLowerCase();
      const combined = `${cat} ${famous} ${desc}`;

      // ── Interest-based scoring ──
      const interestMatches = {
        nature: ['nature', 'garden', 'park', 'forest', 'valley', 'hill'],
        adventure: ['adventure', 'trek', 'rafting', 'paragliding', 'camping', 'rock'],
        wildlife: ['wildlife', 'sanctuary', 'national park', 'zoo', 'bird'],
        temple: ['temple', 'mandir', 'shrine', 'gurudwara', 'mosque', 'church', 'spiritual'],
        food: ['food', 'market', 'bazaar', 'cafe', 'street food'],
        history: ['heritage', 'historic', 'museum', 'fort', 'palace', 'ancient', 'ruins'],
        photography: ['view', 'panoramic', 'sunset', 'sunrise', 'scenic', 'photography'],
        roadtrip: ['highway', 'pass', 'route', 'drive'],
        beaches: ['beach', 'coast', 'shore', 'sea', 'ocean'],
        mountains: ['mountain', 'hill', 'peak', 'range', 'altitude'],
        camping: ['camping', 'tent', 'campsite', 'outdoor'],
        nightlife: ['night', 'club', 'bar', 'party'],
        shopping: ['shopping', 'market', 'bazaar', 'mall', 'handicraft'],
        waterfalls: ['waterfall', 'falls', 'cascade'],
        trekking: ['trek', 'hike', 'trail', 'climbing'],
        culture: ['culture', 'art', 'dance', 'music', 'festival', 'tradition'],
        wellness: ['spa', 'ayurveda', 'yoga', 'wellness', 'meditation'],
        'hidden-gems': ['hidden', 'offbeat', 'unexplored', 'secret']
      };

      interestSet.forEach(interest => {
        const keywords = interestMatches[interest] || [interest];
        if (keywords.some(kw => combined.includes(kw))) {
          score += 15;
        }
      });

      // ── Trip-type boosting ──
      if (tripType === 'family') {
        if (['park', 'lake', 'garden', 'zoo', 'museum'].some(k => cat.includes(k))) score += 10;
        if (['trek', 'adventure', 'nightlife'].some(k => cat.includes(k))) score -= 5;
      }
      if (tripType === 'couple') {
        if (['view', 'beach', 'waterfall', 'sunset', 'lake', 'garden'].some(k => combined.includes(k))) score += 10;
      }
      if (tripType === 'solo') {
        if (['trek', 'adventure', 'market', 'offbeat', 'cafe'].some(k => combined.includes(k))) score += 10;
      }
      if (tripType === 'friends') {
        if (['adventure', 'beach', 'fort', 'trek', 'night'].some(k => combined.includes(k))) score += 10;
      }
      if (tripType === 'senior') {
        if (['temple', 'garden', 'museum', 'lake', 'palace'].some(k => combined.includes(k))) score += 10;
        if (['trek', 'adventure', 'climbing'].some(k => combined.includes(k))) score -= 10;
      }

      // ── Accessibility filtering ──
      if (needsAccessible) {
        if (['trek', 'climbing', 'hike', 'cave'].some(k => combined.includes(k))) score -= 20;
      }
      if (accessSet.has('kids')) {
        if (['park', 'zoo', 'garden', 'beach', 'museum'].some(k => combined.includes(k))) score += 8;
        if (['trek', 'nightlife', 'bar'].some(k => combined.includes(k))) score -= 10;
      }

      // ── Tier boosting ──
      if (place.tier === 'TIER_1') score += 8;
      if (place.tier === 'TIER_2') score += 4;

      return { ...place, _score: score };
    });

    // Filter out heavily penalized places
    const filtered = scored.filter(p => p._score > 0);
    filtered.sort((a, b) => b._score - a._score);

    // ── Deduplicate by name similarity ──
    const deduped = [];
    const seenNames = new Set();
    for (const place of filtered) {
      const normName = (place.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (seenNames.has(normName)) continue;
      // Also check for prefix overlap (e.g., "Manali" vs "Manali Hill Station")
      let isDuplicate = false;
      for (const seen of seenNames) {
        if (normName.includes(seen) || seen.includes(normName)) {
          isDuplicate = true;
          break;
        }
      }
      if (isDuplicate) continue;
      seenNames.add(normName);
      deduped.push(place);
    }

    // ── Group by City (Clustering) ──
    const cityMap = {};
    deduped.forEach(p => {
      const city = p.city || stateData.name || destination;
      if (!cityMap[city]) cityMap[city] = { name: city, places: [], totalScore: 0 };
      cityMap[city].places.push(p);
      cityMap[city].totalScore += p._score;
    });

    const sortedCities = Object.values(cityMap).sort((a, b) => b.totalScore - a.totalScore);
    let clusteredPlaces = [];
    sortedCities.forEach(c => clusteredPlaces.push(...c.places));

    // ── 2. Dynamic Activities Per Day ──
    // Adjust based on transport and trip type
    let perDay = 4;
    if (transport === 'walking' || transport === 'bike') perDay = 3;
    if (tripType === 'senior') perDay = 3;
    if (tripType === 'family' && accessSet.has('kids')) perDay = 3;
    if (days <= 2) perDay = 4; // Pack more into short trips

    const total = Math.min(days * perDay, clusteredPlaces.length);
    const selected = clusteredPlaces.slice(0, total);

    // ── 3. Build Schedule ──
    const morningTimes = ['09:00 AM', '10:30 AM'];
    const afternoonTimes = ['01:00 PM', '03:00 PM'];
    const eveningTimes = ['05:00 PM', '07:00 PM'];
    const allTimes = [...morningTimes, ...afternoonTimes, ...eveningTimes];

    const schedule = [];

    for (let d = 1; d <= days; d++) {
      const startIdx = (d - 1) * perDay;
      const dayPlaces = selected.slice(startIdx, startIdx + perDay);
      if (!dayPlaces.length) break;

      const items = [];
      const currentCity = dayPlaces[0]?.city || stateData.name || destination;

      // Day 1: Arrival
      if (d === 1) {
        items.push({
          time: '09:00 AM',
          title: `Arrival in ${currentCity}`,
          desc: `Arrive and settle in. Freshen up and get ready to explore ${currentCity}.`,
          type: 'travel',
          visitDuration: '1-2 hours',
          entryFee: 'N/A',
          timings: '',
          proTip: 'Pre-book your transport from the airport/station to save time.',
          photoSpot: '',
          accessibility: 'Varies by transport mode'
        });
      }

      // Add places
      dayPlaces.forEach((p, idx) => {
        const timeIdx = d === 1 ? idx + 1 : idx;
        const cat = (p.category || '').toLowerCase();

        // Determine type
        let type = 'attraction';
        if (cat.includes('temple') || cat.includes('shrine')) type = 'temple';
        else if (cat.includes('beach')) type = 'beach';
        else if (cat.includes('fort') || cat.includes('palace')) type = 'fort';
        else if (cat.includes('lake')) type = 'lake';
        else if (cat.includes('waterfall')) type = 'waterfall';
        else if (cat.includes('trek') || cat.includes('adventure')) type = 'trek';
        else if (cat.includes('museum')) type = 'museum';
        else if (cat.includes('market') || cat.includes('bazaar')) type = 'market';
        else if (cat.includes('nature') || cat.includes('park') || cat.includes('garden')) type = 'nature';
        else if (cat.includes('view') || cat.includes('point')) type = 'viewpoint';

        items.push({
          time: allTimes[Math.min(timeIdx, allTimes.length - 1)] || '04:00 PM',
          title: p.name,
          desc: p.famousFor || p.description || `Explore ${p.name}`,
          type,
          visitDuration: type === 'trek' ? '2-3 hours' : type === 'museum' ? '1-2 hours' : '1-1.5 hours',
          entryFee: p.entryFee || 'Check locally',
          timings: p.timings || '',
          proTip: p.proTip || `Visit ${p.name} early morning or late afternoon for fewer crowds.`,
          photoSpot: p.photoSpot || '',
          accessibility: needsAccessible ? 'Check accessibility before visiting' : '',
          slug: p.slug || p.id,
          image: p.image
        });
      });

      // Last day: Departure
      if (d === days) {
        items.push({
          time: eveningTimes[1],
          title: `Departure from ${currentCity}`,
          desc: 'Pack up, check out, and head to the airport/station. Safe travels!',
          type: 'travel',
          visitDuration: '',
          entryFee: 'N/A',
          timings: '',
          proTip: 'Keep buffer time for traffic. Reach airport 2 hours early.',
          photoSpot: '',
          accessibility: ''
        });
      }

      const placeCount = dayPlaces.length;
      const isWalking = transport === 'walking' || transport === 'bike';
      const baseDistKm = isWalking ? (placeCount * 1.5) : (placeCount * 6);
      const driveMins = isWalking ? 0 : (placeCount * 12);
      const walkKm = isWalking ? baseDistKm : (placeCount * 0.8);
      const expScore = Math.min(98, 75 + placeCount * 5);

      schedule.push({
        day: d,
        theme: d === 1
          ? `Arrival & ${currentCity} Exploration`
          : d === days
            ? `Final Day in ${currentCity}`
            : `Exploring ${currentCity}`,
        dailyStats: {
          travelDistanceKm: `${Math.round(baseDistKm)} km`,
          drivingTime: isWalking ? 'Mostly walking' : `${driveMins} min`,
          walkingDistance: `${walkKm.toFixed(1)} km`,
          startLocation: currentCity,
          endLocation: currentCity,
          dailyExperienceScore: expScore,
          optimalReason: `${placeCount} places clustered in ${currentCity} area to minimize travel time.`
        },
        items
      });
    }

    // ── 4. Budget Estimation ──
    const baseCost = { budget: 1800, moderate: 4200, premium: 7500, luxury: 14000 };
    const numTravelers = parseInt(travelers, 10) || 2;
    const costPerDay = baseCost[budget] || baseCost.moderate;
    const estimatedBudget = costPerDay * days * numTravelers;

    // ── 5. Highlights ──
    const highlights = filtered.slice(0, 4).map(p => p.name);

    // ── 6. Packing & Tips ──
    const coldStates = ['himachal-pradesh', 'uttarakhand', 'jammu-and-kashmir', 'ladakh', 'sikkim', 'arunachal-pradesh'];
    const beachStates = ['goa', 'kerala', 'andaman-and-nicobar-islands', 'lakshadweep', 'puducherry'];
    const isCold = coldStates.includes(stateSlug);
    const isBeach = beachStates.includes(stateSlug);

    const bestTime = isCold ? 'March to June' : isBeach ? 'October to March' : 'September to March';
    const travelTip = isCold
      ? 'Carry warm layers, medicines for altitude, and cash (ATMs are sparse in remote areas).'
      : isBeach
        ? 'Carry sunscreen SPF 50+, stay hydrated, and avoid swimming in unmarked areas.'
        : 'Wear comfortable walking shoes, carry a reusable water bottle, and start early to beat the heat.';

    return {
      destination: stateData.name || destination,
      days,
      travelers,
      budgetTier: budget,
      estimatedBudget,
      schedule,
      highlights,
      bestTime: stateData.bestTime || bestTime,
      travelTip
    };
  }
}

export const itineraryEngine = new ItineraryEngine();
