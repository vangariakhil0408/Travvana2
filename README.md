# TRAVVANA — Discovery Mode MVP

> **Discover India, Your Way** 🧭

A premium, mobile-first travel discovery platform for exploring India's 28 states, 8 union territories, and thousands of incredible destinations.

## 🚀 Quick Start

```bash
# Option 1: Use any static file server
npx serve .

# Option 2: Python
python -m http.server 8000

# Option 3: VS Code Live Server extension
# Right-click index.html → Open with Live Server
```

Then open `http://localhost:3000` (or your server's port).

## 🏗️ Architecture

### JSON-First Data Layer
All data lives in structured JSON files under `data/`. No backend required for the MVP — just a static file server.

### Core Flow
```
India → State/UT → District → Place → Detail → Nearby → Reels → Booking CTA → AI Trip CTA
```

### Tech Stack
- **HTML5** — Semantic, accessible markup
- **CSS3** — Custom properties, glassmorphism, responsive grid
- **Vanilla JS (ES Modules)** — Modular architecture, ready for React migration
- **JSON** — Normalized, lazy-loaded data files

### Design System
- **Theme**: Dark mode default with orange (#FF6B2C) accent
- **Typography**: Inter font from Google Fonts
- **Components**: Cards, buttons, filters, search, hero, skeleton loading
- **Animations**: Staggered fade-in, hover transforms, shimmer skeletons

## 📁 Folder Structure

```
├── index.html              # Landing page
├── discovery.html           # Explore all states/UTs
├── state-detail.html        # State deep-dive
├── district-detail.html     # District exploration
├── place-detail.html        # Place detail with CTAs
├── styles/                  # CSS (base, layout, components, pages)
├── js/                      # JavaScript modules
│   ├── core/               # App, router, theme, eventBus, config
│   ├── state/              # Centralized state management
│   ├── services/           # JSON loader, cache, search
│   ├── modules/discovery/  # Controllers, renderers, components, helpers
│   └── utils/              # DOM helpers, constants
└── data/                    # All JSON data
    ├── countries/india/     # States, UTs, regions
    └── feeds/              # Trending, popular, hidden gems, seasonal
```

## 📊 Data Coverage

| Category | Count |
|----------|-------|
| States | 28 |
| Union Territories | 8 |
| Showcase States (full data) | 6 (Kerala, Rajasthan, Goa, Himachal, Tamil Nadu, Karnataka) |
| Place Detail Files | 18+ |
| Feed Files | 4 |

## 🎯 Features

- ✅ Full discovery drilldown (State → District → Place)
- ✅ Search with fuzzy matching
- ✅ Category filters (Nature, Heritage, Beaches, Temples, etc.)
- ✅ Region filters (North, South, East, West, etc.)
- ✅ Sort (Popularity, A-Z, Rating, Places count)
- ✅ Skeleton loading screens
- ✅ Dark/Light theme toggle
- ✅ Breadcrumb navigation
- ✅ Booking CTA (placeholder)
- ✅ AI Trip CTA (placeholder)
- ✅ Related Reels section (placeholder)
- ✅ Responsive mobile-first design
- ✅ Session-based data caching
- ✅ Gradient fallbacks for missing images

## 🔮 React Migration

The architecture maps 1:1 to React:

| Vanilla JS | React |
|-----------|-------|
| `appState.js` | `useContext` + `useReducer` |
| `eventBus.js` | Custom hooks |
| `router.js` | React Router |
| Component functions | Functional components |
| `jsonLoader.js` | React Query |
| CSS files | CSS Modules |

## 💰 Monetization Hooks

- Booking partner deep links (MakeMyTrip, Goibibo, OYO)
- Sponsored place cards
- Premium AI planner
- Ad slot containers in feeds
- Affiliate links on place detail pages

## 📄 License

MIT — Built with ❤️ by Travvana
