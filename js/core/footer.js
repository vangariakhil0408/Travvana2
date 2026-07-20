/* ============================================
   TRAVVANA — Footer Component
   Global footer with internal links for SEO
   crawl depth and internal linking strategy.
   ============================================ */

/**
 * Render the global footer into the DOM
 */
export function renderFooter() {
  // Don't render footer inside a container that doesn't exist
  const body = document.body;
  if (!body) return;

  // Avoid duplicate footer
  if (document.querySelector('.site-footer')) return;

  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.setAttribute('role', 'contentinfo');

  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <!-- Brand -->
        <div class="footer-col">
          <a href="index.html" class="footer-brand" aria-label="Travvana Home">
            <img src="assets/images/logo.webp" alt="Travvana" width="32" height="32" loading="lazy">
            <span>TRAVVANA</span>
          </a>
          <p class="footer-tagline">Discover India, Your Way. Explore states, attractions, hidden gems, and plan your perfect Indian adventure.</p>
        </div>

        <!-- Popular States -->
        <div class="footer-col">
          <h3 class="footer-heading">Popular States</h3>
          <nav aria-label="Popular states">
            <ul class="footer-links">
              <li><a href="state-detail.html?state=rajasthan">Rajasthan</a></li>
              <li><a href="state-detail.html?state=kerala">Kerala</a></li>
              <li><a href="state-detail.html?state=karnataka">Karnataka</a></li>
              <li><a href="state-detail.html?state=tamil-nadu">Tamil Nadu</a></li>
              <li><a href="state-detail.html?state=goa">Goa</a></li>
              <li><a href="state-detail.html?state=himachal-pradesh">Himachal Pradesh</a></li>
              <li><a href="state-detail.html?state=uttarakhand">Uttarakhand</a></li>
              <li><a href="state-detail.html?state=maharashtra">Maharashtra</a></li>
            </ul>
          </nav>
        </div>

        <!-- Top Destinations -->
        <div class="footer-col">
          <h3 class="footer-heading">Top Destinations</h3>
          <nav aria-label="Top destinations">
            <ul class="footer-links">
              <li><a href="place-detail.html?place=taj-mahal">Taj Mahal</a></li>
              <li><a href="place-detail.html?place=hampi-ruins">Hampi</a></li>
              <li><a href="place-detail.html?place=mysore-palace">Mysore Palace</a></li>
              <li><a href="place-detail.html?place=golden-temple">Golden Temple</a></li>
              <li><a href="place-detail.html?place=hawa-mahal">Hawa Mahal</a></li>
              <li><a href="place-detail.html?place=gateway-of-india">Gateway of India</a></li>
              <li><a href="place-detail.html?place=dal-lake">Dal Lake</a></li>
              <li><a href="place-detail.html?place=kedarnath">Kedarnath</a></li>
            </ul>
          </nav>
        </div>

        <!-- Quick Links -->
        <div class="footer-col">
          <h3 class="footer-heading">Quick Links</h3>
          <nav aria-label="Quick links">
            <ul class="footer-links">
              <li><a href="index.html">Home</a></li>
              <li><a href="discovery.html">Explore States</a></li>
              <li><a href="destinations.html">All Destinations</a></li>
              <li><a href="planner.html">AI Trip Planner</a></li>
              <li><a href="bookings.html">Bookings</a></li>
              <li><a href="travvanagram.html">Travvanagram</a></li>
            </ul>
          </nav>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} Travvana. All rights reserved. Made with ❤️ for India.</p>
      </div>
    </div>
  `;

  // Insert before bottom-nav (mobile) if it exists, otherwise append to body
  const bottomNav = document.querySelector('.bottom-nav');
  if (bottomNav) {
    body.insertBefore(footer, bottomNav);
  } else {
    body.appendChild(footer);
  }
}
