/* ============================================
   TRAVVANA — Vercel Serverless API
   POST /api/generate-itinerary
   Proxies Gemini API with server-side key
   ============================================ */

// Rate limit store (in-memory, per-instance)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5;            // 5 requests per minute per IP (stricter)

// Global per-instance counter to prevent runaway usage across cold-start cycles
let globalRequestCount = 0;
const GLOBAL_MAX_PER_INSTANCE = 200; // Safety cap per function instance lifetime

function isRateLimited(ip) {
  const now = Date.now();

  // Global safety cap — if one instance is getting hammered, shut it down
  globalRequestCount++;
  if (globalRequestCount > GLOBAL_MAX_PER_INSTANCE) return true;

  // Periodic cleanup: evict stale entries every 50 requests to prevent memory leak
  if (globalRequestCount % 50 === 0) {
    for (const [key, entry] of rateLimitMap) {
      if (now - entry.windowStart > RATE_LIMIT_WINDOW * 5) {
        rateLimitMap.delete(key);
      }
    }
  }

  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return false;
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) return true;
  return false;
}

// Sanitize user input to prevent prompt injection
function sanitize(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/[<>{}]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .slice(0, 500);
}

function validateInput(body) {
  const errors = [];
  if (!body.destination || typeof body.destination !== 'string' || body.destination.trim().length < 2) {
    errors.push('destination is required (min 2 chars)');
  }
  if (!body.days || typeof body.days !== 'number' || body.days < 1 || body.days > 30) {
    errors.push('days must be a number between 1 and 30');
  }
  const validBudgets = ['budget', 'moderate', 'premium', 'luxury'];
  if (!validBudgets.includes(body.budget)) {
    errors.push('budget must be one of: ' + validBudgets.join(', '));
  }
  const validTripTypes = ['solo', 'couple', 'friends', 'family', 'senior', 'group'];
  if (!validTripTypes.includes(body.tripType)) {
    errors.push('tripType must be one of: ' + validTripTypes.join(', '));
  }
  return errors;
}

function buildPrompt(params) {
  const {
    destination, days, travelers, budget, tripType,
    interests, transport, stay, food, accessibility, extras
  } = params;

  const interestsStr = interests?.length ? interests.join(', ') : 'General sightseeing';
  const transportStr = transport || 'mixed';
  const stayStr = stay || 'hotel';
  const foodStr = food || 'no preference';
  const accessStr = accessibility?.length ? accessibility.join(', ') : 'none';
  const extrasStr = extras ? sanitize(extras) : 'none';

  return `MASTER PROMPT — REAL-WORLD TRAVEL ITINERARY OPTIMIZATION ENGINE v4.0

## ROLE
You are the world's leading Travel Intelligence Engine with 25+ years of experience.
Your itineraries are used by premium travel companies.
You NEVER create unrealistic plans. You optimize for the BEST traveler experience.

## GOLDEN RULES
- A traveler should spend MORE time experiencing destinations than sitting in a vehicle.
- NEVER jump across cities illogically. NEVER visit places in opposite directions.
- NEVER add destinations just because they are famous — only add what fits the traveler's interests.
- ALWAYS optimize for: Distance, Road connectivity, Opening hours, Traffic, Weather, Walking convenience, Traveler comfort.
- ONLY recommend REAL places that actually exist. Never invent fictional place names.
- Do NOT include hotels, resorts, or restaurant recommendations. Focus ONLY on attractions, viewpoints, temples, landmarks, nature spots, and experiences.

## CLUSTER DESTINATIONS
Before generating the itinerary, cluster attractions geographically. Ensure places in the same vicinity belong on the same day.

## DISTANCE & TRAVEL RULES
- Prefer attractions within Walking distance -> 5 km -> 10 km -> 15 km -> Max 25 km.
- Avoid exceeding 35 km between consecutive attractions.
- Maximum road travel per day within city: 30 km/day preferred, 50 km acceptable, never exceed 70 km.
- Intercity: One transfer per day max.

## TRANSFER DAYS
When moving to another city, that day focuses on: Check out -> Travel -> 1-2 nearby attractions after arrival -> Evening exploration.

## DAILY FLOW OPTIMIZATION
- Morning: Popular landmarks, sunrise viewpoints, temples, walking tours.
- Afternoon: Museums, indoor attractions, local markets, cafes.
- Evening: Viewpoints, lakes, sunset spots, markets, light shows.
- Night: Night markets, local area exploration, riverside walks.

## PERSONALIZATION RULES
- Interests: ${interestsStr} — PRIORITIZE places matching these interests. If the user loves photography, include golden-hour spots. If they love food, include famous local food streets (as activities, not restaurant recs). If adventure, include trekking/paragliding/rafting spots.
- Transport: ${transportStr} — Plan distances accordingly. If walking/bike, keep things close. If car, can spread out more.
- Accommodation: ${stayStr} — Affects which areas to focus on (budget areas vs premium areas).
- Food Preference: ${foodStr} — Mention relevant food streets/local specialties as activities (e.g., "Street food walk at Sarafa Bazaar").
- Accessibility: ${accessStr} — If wheelchair/senior, avoid steep treks, prefer accessible sites. If kids, add fun/interactive spots.
- Traveler Type: ${tripType} — Solo gets offbeat gems; Couples get scenic/romantic spots; Families get safe/fun activities; Friends get adventure/nightlife areas.
- Extra Notes: ${extrasStr}

## ADDITIONAL FACTORS
- Include 1 famous must-visit, 1 hidden gem, and 1 authentic local experience per day.
- Never exceed 4-5 major attractions per day.
- Insert realistic buffer times (travel, parking, queues, breaks).
- Add free time / buffer blocks.
- Include a "Pro Tip" for each activity.

---
USER PREFERENCES:
Destination: ${sanitize(destination)}
Duration: ${days} days
Travelers: ${travelers} people (${tripType})
Budget Tier: ${budget}
Interests: ${interestsStr}
Transport: ${transportStr}
Stay Type: ${stayStr}
Food Preference: ${foodStr}
Accessibility: ${accessStr}
Extra Notes: ${extrasStr}

---
FINAL OUTPUT FORMAT REQUIREMENT:
Your response MUST BE ONLY valid, raw JSON. No markdown formatting, no backticks, no conversational text.
It MUST exactly match this JSON schema:

{
  "destination": "Name of the destination",
  "days": ${days},
  "estimatedBudget": (Calculate estimated total budget in INR as a Number based on ${days} days, ${travelers} travelers, and ${budget} budget tier. Include transport, entry fees, food, and accommodation costs),
  "highlights": ["Highlight 1", "Highlight 2", "Highlight 3", "Highlight 4"],
  "bestTime": "Best months to visit",
  "travelTip": "One key travel tip for this destination",
  "schedule": [
    {
      "day": 1,
      "theme": "Day title (e.g., Old City Heritage Walk)",
      "dailyStats": {
        "travelDistanceKm": "e.g., 18 km",
        "drivingTime": "e.g., 45 minutes",
        "walkingDistance": "e.g., 3 km",
        "startLocation": "Start location",
        "endLocation": "End location",
        "dailyExperienceScore": 97,
        "optimalReason": "Brief explanation of why this route order is optimal"
      },
      "items": [
        {
          "time": "10:00 AM",
          "title": "Real Place Name",
          "desc": "What to do here and why it's special",
          "type": "attraction",
          "visitDuration": "e.g., 1.5 hours",
          "entryFee": "e.g., ₹50 or Free",
          "timings": "e.g., 6 AM - 6 PM",
          "proTip": "Insider tip for this place",
          "photoSpot": "Best photo spot/time",
          "accessibility": "Accessibility info (steps, ramps, terrain)"
        }
      ]
    }
  ]
}

IMPORTANT RULES FOR OUTPUT:
- The "type" field must be one of: "attraction", "viewpoint", "temple", "nature", "market", "experience", "food-walk", "trek", "beach", "museum", "fort", "lake", "waterfall", "travel" (for transit), "break" (for rest/free time).
- Do NOT include hotels or restaurants as items. Food experiences like "street food walk" or "local market food tasting" are fine as activities.
- Ensure exactly ${days} elements in the "schedule" array.
- All place names MUST be real, verifiable places.
- Return ONLY raw JSON string. No other text.`;
}

export default async function handler(req, res) {
  // CORS headers
  const allowedOrigins = ['https://travvana.com', 'http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'];
  const origin = req.headers.origin || '';
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://travvana.com');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a minute.' });
  }

  // Validate API key exists
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[API] GEMINI_API_KEY environment variable is not set.');
    return res.status(500).json({ error: 'Server configuration error. Please contact support.' });
  }

  // Parse and validate body
  const body = req.body;
  if (!body) {
    return res.status(400).json({ error: 'Request body is required' });
  }

  const validationErrors = validateInput(body);
  if (validationErrors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: validationErrors });
  }

  // Build prompt
  const prompt = buildPrompt(body);

  // Call Gemini
  const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  try {
    const geminiRes = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('[API] Gemini error:', geminiRes.status, errText);
      return res.status(502).json({ error: 'AI service error. Please try again.' });
    }

    const json = await geminiRes.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(502).json({ error: 'Empty response from AI. Please try again.' });
    }

    // Clean and parse JSON
    const cleanText = text
      .replace(/^```json\n?/i, '')
      .replace(/\n?```$/i, '')
      .replace(/^```\n?/i, '')
      .trim();

    let itinerary;
    try {
      itinerary = JSON.parse(cleanText);
    } catch (parseErr) {
      console.error('[API] JSON parse error:', parseErr.message, '\nRaw text:', cleanText.slice(0, 500));
      return res.status(502).json({ error: 'AI returned invalid data. Please try again.' });
    }

    // Basic validation of response structure
    if (!itinerary.schedule || !Array.isArray(itinerary.schedule)) {
      return res.status(502).json({ error: 'AI returned incomplete data. Please try again.' });
    }

    return res.status(200).json(itinerary);

  } catch (err) {
    console.error('[API] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
}
