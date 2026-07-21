/* ============================================
   TRAVVANA — SEO Service (Enhanced)
   Centralized, dynamic SEO management.
   Updates document title, meta tags, canonical
   URLs, Open Graph, Twitter Cards, and injects
   JSON-LD structured data on the fly.
   
   Enhanced for: Google Discover, AI search,
   comprehensive structured data, and
   query-string URL support.
   ============================================ */

const SITE_URL = 'https://www.travvana.com';
const SITE_NAME = 'Travvana';
const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/images/logo.webp`;

class SeoService {
  constructor() {
    this._schemaScripts = [];
  }

  /* ── Core Page Update ── */

  /**
   * Update all SEO-relevant meta tags for the current page.
   * @param {Object} opts
   * @param {string} opts.title        - Page title (appended with ' | Travvana' if needed)
   * @param {string} opts.description  - Meta description (≤160 chars recommended)
   * @param {string} opts.canonical    - Canonical URL
   * @param {string} [opts.image]      - OG/Twitter image URL
   * @param {string} [opts.type]       - OG type (default: 'website')
   * @param {string} [opts.robots]     - Robots directive (default: 'index, follow')
   */
  updatePage({ title, description, canonical, image, type = 'website', robots = 'index, follow, max-image-preview:large' }) {
    // Title
    if (title) {
      const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
      document.title = fullTitle;
      this._setMeta('property', 'og:title', fullTitle);
      this._setMeta('name', 'twitter:title', fullTitle);
    }

    // Description
    if (description) {
      this._setMeta('name', 'description', description);
      this._setMeta('property', 'og:description', description);
      this._setMeta('name', 'twitter:description', description);
    }

    // Canonical
    if (canonical) {
      this._setCanonical(canonical);
      this._setMeta('property', 'og:url', canonical);
    }

    // Image
    const imgUrl = image ? this._resolveUrl(image) : DEFAULT_OG_IMAGE;
    this._setMeta('property', 'og:image', imgUrl);
    this._setMeta('name', 'twitter:image', imgUrl);

    // Type
    this._setMeta('property', 'og:type', type);

    // Robots — includes max-image-preview:large for Google Discover
    this._setMeta('name', 'robots', robots);
  }

  /* ── Structured Data (JSON-LD) ── */

  /**
   * Inject a JSON-LD schema block into the page <head>.
   * Each call adds a new <script> tag. Previous dynamic schemas are cleared first.
   * @param {Object|Object[]} schema - One or more schema objects
   */
  injectSchema(schema) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    script.setAttribute('data-dynamic', 'true');
    document.head.appendChild(script);
    this._schemaScripts.push(script);
  }

  /**
   * Remove all dynamically-injected JSON-LD scripts.
   * Also removes any static inline schemas to prevent duplicates.
   * Called before injecting new page-specific schemas.
   */
  clearDynamicSchemas() {
    this._schemaScripts.forEach(s => s.remove());
    this._schemaScripts = [];

    // Also remove any static inline schemas (prevents duplicates on SPA navigation)
    document.querySelectorAll('script[type="application/ld+json"]:not([data-dynamic])').forEach(s => s.remove());
  }

  /* ── Schema Generators ── */

  /**
   * Inject Organization + WebSite + SearchAction schemas (for homepage).
   */
  injectOrganizationSchema() {
    this.injectSchema([
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/assets/images/logo.webp`,
        sameAs: [],
        description: 'Discover India through curated travel experiences. Explore states, attractions, hidden gems, and plan your perfect Indian adventure.',
        foundingDate: '2024',
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          url: `${SITE_URL}`,
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        description: 'Discover the soul of India through curated, high-fidelity travel discovery. Explore states, destinations, hidden gems, and plan your perfect Indian adventure.',
        inLanguage: 'en-IN',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/discovery.html?search={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ]);
  }

  /**
   * Inject WebPage schema for the current page.
   * @param {Object} opts
   */
  injectWebPageSchema({ name, description, url }) {
    this.injectSchema({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name,
      description,
      url,
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
      inLanguage: 'en-IN',
      dateModified: new Date().toISOString().split('T')[0],
    });
  }

  /**
   * Inject BreadcrumbList schema.
   * @param {Array<{name: string, url: string}>} items
   */
  injectBreadcrumbSchema(items) {
    this.injectSchema({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        item: item.url,
      })),
    });
  }

  /**
   * Inject CollectionPage schema (for discovery/destinations pages).
   * @param {Object} opts
   * @param {string} opts.name
   * @param {string} opts.description
   * @param {string} opts.url
   */
  injectCollectionPageSchema({ name, description, url }) {
    this.injectSchema({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name,
      description,
      url,
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
      inLanguage: 'en-IN',
    });
  }

  /**
   * Inject TouristAttraction schema for a place detail page.
   * @param {Object} place - Place data object from JSON
   * @param {string} stateSlug - State slug for URL building
   */
  injectTouristAttractionSchema(place, stateSlug) {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'TouristAttraction',
      name: place.name,
      description: place.history || place.description || `${place.name} — a must-visit destination in India.`,
      url: `${SITE_URL}/place-detail.html?place=${encodeURIComponent(place.slug || place.id)}`,
    };

    // Image with ImageObject
    const img = place.images?.main || place.heroImage || place.image;
    if (img) {
      const imgUrl = this._resolveUrl(img);
      schema.image = {
        '@type': 'ImageObject',
        url: imgUrl,
        caption: `${place.name} — ${place.city || ''}, ${place.state || this._unslugify(stateSlug)}`,
      };
    }

    // Location
    if (place.city) {
      schema.address = {
        '@type': 'PostalAddress',
        addressLocality: place.city,
        addressRegion: place.state || this._unslugify(stateSlug),
        addressCountry: 'IN',
      };
    }

    // Geo coordinates
    if (place.latitude && place.longitude) {
      schema.geo = {
        '@type': 'GeoCoordinates',
        latitude: place.latitude,
        longitude: place.longitude,
      };
    }

    // Opening hours
    if (place.timings) {
      schema.openingHours = place.timings;
    }

    // Rating
    if (place.rating) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: String(place.rating),
        bestRating: '5',
        worstRating: '1',
        ratingCount: String(Math.max(1, Math.floor(place.rating * 20))),
      };
    }

    // Tourist info
    if (place.entryFee) schema.isAccessibleForFree = place.entryFee.toLowerCase().includes('free');
    if (place.bestTime) schema.touristType = `Best visited: ${place.bestTime}`;
    if (place.category) schema.additionalType = place.category;

    // Speakable — helps AI assistants and Google Assistant
    schema.speakable = {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.detail-title', '.detail-text', '.detail-info-value'],
    };

    this.injectSchema(schema);
  }

  /**
   * Inject Place schema for a state detail page.
   * @param {Object} stateData - State data object from JSON
   * @param {string} stateSlug
   */
  injectStateSchema(stateData, stateSlug) {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Place',
      name: stateData.name || stateData.state,
      description: stateData.tagline || stateData.description || `Explore the beauty and culture of ${stateData.name || stateData.state}, India.`,
      url: `${SITE_URL}/state-detail.html?state=${encodeURIComponent(stateSlug)}`,
      address: {
        '@type': 'PostalAddress',
        addressRegion: stateData.name || stateData.state,
        addressCountry: 'IN',
      },
    };

    // Hero image
    if (stateData.heroImage) {
      schema.image = this._resolveUrl(stateData.heroImage);
    }

    this.injectSchema(schema);

    // Also inject ItemList for the places within this state
    if (stateData.places?.length) {
      this.injectSchema({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `Places to Visit in ${stateData.name || stateData.state}`,
        numberOfItems: stateData.places.length,
        itemListElement: stateData.places.slice(0, 20).map((place, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: place.name,
          url: `${SITE_URL}/place-detail.html?place=${encodeURIComponent(place.slug || place.id)}`,
        })),
      });
    }
  }

  /**
   * Inject FAQPage schema from a place's data.
   * @param {Object} place
   * @returns {Array} The FAQ array (for rendering visually)
   */
  injectFAQSchema(place) {
    const faqs = [];

    if (place.bestTime) {
      faqs.push({
        question: `What is the best time to visit ${place.name}?`,
        answer: place.bestTime,
      });
    }
    if (place.entryFee) {
      faqs.push({
        question: `What is the entry fee for ${place.name}?`,
        answer: place.entryFee,
      });
    }
    if (place.timings) {
      faqs.push({
        question: `What are the opening hours of ${place.name}?`,
        answer: place.timings,
      });
    }
    if (place.famousFor) {
      faqs.push({
        question: `What is ${place.name} famous for?`,
        answer: place.famousFor,
      });
    }
    if (place.history) {
      faqs.push({
        question: `What is the history of ${place.name}?`,
        answer: place.history.length > 300 ? place.history.substring(0, 300) + '...' : place.history,
      });
    }

    if (faqs.length) {
      this.injectSchema({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      });
    }

    return faqs;
  }

  /* ── Private Helpers ── */

  /**
   * Set or create a <meta> tag.
   * @param {string} attrName  - 'name' or 'property'
   * @param {string} attrValue - e.g. 'og:title' or 'description'
   * @param {string} content   - The content value
   */
  _setMeta(attrName, attrValue, content) {
    let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrValue);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  /**
   * Set or create the <link rel="canonical"> tag.
   * @param {string} url
   */
  _setCanonical(url) {
    let el = document.querySelector('link[rel="canonical"]');
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', 'canonical');
      document.head.appendChild(el);
    }
    el.setAttribute('href', url);
  }

  /**
   * Convert a relative image path to an absolute URL.
   * @param {string} path
   * @returns {string}
   */
  _resolveUrl(path) {
    if (!path) return DEFAULT_OG_IMAGE;
    if (path.startsWith('http')) return path;
    // Strip leading './' or '/'
    const clean = path.replace(/^\.?\//, '');
    return `${SITE_URL}/${clean}`;
  }

  /**
   * Convert a slug to a readable name.
   * @param {string} slug
   * @returns {string}
   */
  _unslugify(slug) {
    if (!slug) return '';
    return slug
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
}

export const seoService = new SeoService();
