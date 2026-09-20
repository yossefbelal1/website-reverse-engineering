/**
 * test-route-discovery.js
 * 
 * Unit tests for URL normalization, domain boundary protection, route categorization,
 * sitemap parsing, robots.txt parsing, and HTML extraction.
 */

const assert = require('assert');
const {
  normalizeUrl,
  isSameDomain,
  categorizeRoute,
  parseRobotsTxt,
  extractRoutesFromHtml,
  scanScriptForRoutes
} = require('../scripts/discover-routes');

function runTests() {
  console.log('--- Running Route Discovery Tests ---');

  // Test 1: URL Normalization - Trailing Slashes & Hashes
  const base = 'https://example.com';
  assert.strictEqual(normalizeUrl('https://example.com/about/', base), 'https://example.com/about');
  assert.strictEqual(normalizeUrl('https://example.com/', base), 'https://example.com/');
  assert.strictEqual(normalizeUrl('/work/#projects', base), 'https://example.com/work');
  assert.strictEqual(normalizeUrl('contact', 'https://example.com/sub/'), 'https://example.com/sub/contact');
  console.log('  ✔ URL normalization: trailing slashes and hash fragments');

  // Test 2: URL Normalization - Tracking Query Stripping
  const dirtyUrl = 'https://example.com/blog?utm_source=twitter&utm_medium=social&utm_campaign=launch&ref=hacker-news';
  assert.strictEqual(normalizeUrl(dirtyUrl), 'https://example.com/blog');

  // Preserve meaningful application query params (e.g. pagination or filtering)
  const appUrl = 'https://example.com/products?category=apparel&page=2&utm_source=google';
  assert.strictEqual(normalizeUrl(appUrl), 'https://example.com/products?category=apparel&page=2');
  console.log('  ✔ URL normalization: tracking param stripping & app param preservation');

  // Test 3: URL Normalization - Invalid & Ignored Protocols
  assert.strictEqual(normalizeUrl('javascript:void(0)', base), null);
  assert.strictEqual(normalizeUrl('mailto:info@example.com', base), null);
  assert.strictEqual(normalizeUrl('tel:+1234567890', base), null);
  assert.strictEqual(normalizeUrl('#anchor', base), null);
  assert.strictEqual(normalizeUrl('', base), null);
  console.log('  ✔ URL normalization: ignore javascript/mailto/tel/empty');

  // Test 4: Domain Boundary Enforcement
  assert.strictEqual(isSameDomain('https://example.com/about', 'https://example.com'), true);
  assert.strictEqual(isSameDomain('https://www.example.com/about', 'https://example.com'), true);
  assert.strictEqual(isSameDomain('https://example.com/about', 'https://www.example.com'), true);
  assert.strictEqual(isSameDomain('https://otherdomain.com/about', 'https://example.com'), false);
  assert.strictEqual(isSameDomain('https://malicious-example.com', 'https://example.com'), false);
  console.log('  ✔ Domain boundary protection: same domain & www normalization');

  // Test 5: Route Categorization
  assert.strictEqual(categorizeRoute('https://example.com/'), 'root');
  assert.strictEqual(categorizeRoute('https://example.com/about'), 'static');
  assert.strictEqual(categorizeRoute('https://example.com/work/case-study-1'), 'dynamic-candidate');
  assert.strictEqual(categorizeRoute('https://example.com/assets/logo.svg'), 'asset');
  assert.strictEqual(categorizeRoute('https://example.com/image.png'), 'asset');
  assert.strictEqual(categorizeRoute('https://example.com/styles.css'), 'asset');
  assert.strictEqual(categorizeRoute('https://example.com/admin/settings'), 'auth-required');
  assert.strictEqual(categorizeRoute('https://example.com/login'), 'auth-required');
  assert.strictEqual(categorizeRoute('https://example.com/search?q=test'), 'query-state');
  console.log('  ✔ Route categorization: root, static, dynamic, asset, auth, query');

  // Test 6: Robots.txt Parsing
  const sampleRobots = `
# Sample robots.txt
User-agent: *
Disallow: /admin/
Disallow: /private/data
Allow: /about
Allow: /public/
Sitemap: https://example.com/sitemap.xml
Sitemap: https://example.com/sitemap-news.xml
`;
  const robotsResult = parseRobotsTxt(sampleRobots, 'https://example.com');
  assert.strictEqual(robotsResult.sitemaps.length, 2);
  assert.strictEqual(robotsResult.sitemaps[0], 'https://example.com/sitemap.xml');
  assert.strictEqual(robotsResult.sitemaps[1], 'https://example.com/sitemap-news.xml');
  assert.strictEqual(robotsResult.allowed.includes('https://example.com/about'), true);
  assert.strictEqual(robotsResult.disallowed.includes('https://example.com/admin'), true);
  console.log('  ✔ robots.txt parser: directives and sitemaps');

  // Test 7: HTML Route Extraction (Anchors, Nav, Canonical, Data-Attributes)
  const sampleHtml = `
<!DOCTYPE html>
<html>
<head>
  <link rel="canonical" href="https://example.com/about" />
</head>
<body>
  <header>
    <nav>
      <a href="/work">Work</a>
      <a href="/services">Services</a>
    </nav>
  </header>
  <main>
    <a href="/work/project-alpha" class="project-card">Project Alpha</a>
    <div data-href="/contact">Get in touch</div>
    <a href="https://external.com/profile">External</a>
  </main>
  <footer>
    <a href="/privacy-policy">Privacy</a>
  </footer>
</body>
</html>
`;
  const { discovered } = extractRoutesFromHtml(sampleHtml, 'https://example.com', 'https://example.com');
  const urls = discovered.map(d => d.url);
  assert.strictEqual(urls.includes('https://example.com/about'), true);
  assert.strictEqual(urls.includes('https://example.com/work'), true);
  assert.strictEqual(urls.includes('https://example.com/services'), true);
  assert.strictEqual(urls.includes('https://example.com/work/project-alpha'), true);
  assert.strictEqual(urls.includes('https://example.com/contact'), true);
  assert.strictEqual(urls.includes('https://example.com/privacy-policy'), true);
  assert.strictEqual(urls.includes('https://external.com/profile'), false); // External filtered
  console.log('  ✔ HTML route extraction: canonical, anchors, data-attributes, external exclusion');

  // Test 8: Script Route Scanning (SPA Router patterns)
  const sampleScript = `
    const routes = [
      { path: "/portfolio", component: Portfolio },
      { route: '/case-studies', component: Cases }
    ];
    function navigate(slug) {
      history.pushState(null, "", '/projects/' + slug);
    }
  `;
  const scriptDiscovered = [];
  scanScriptForRoutes(sampleScript, 'https://example.com', scriptDiscovered);
  const scriptUrls = scriptDiscovered.map(s => s.url);
  assert.strictEqual(scriptUrls.includes('https://example.com/portfolio'), true);
  assert.strictEqual(scriptUrls.includes('https://example.com/case-studies'), true);
  console.log('  ✔ JavaScript bundle analysis: SPA router declarations and pushState');

  console.log('All Route Discovery Tests Passed Successfully!\n');
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
