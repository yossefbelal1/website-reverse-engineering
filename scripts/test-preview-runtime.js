/**
 * test-preview-runtime.js
 * 
 * Exhaustive runtime verification suite for the local preview server.
 * Audits all 13 routes, validates HTTP status codes, title tags, internal link
 * integrity, stylesheet references, and placeholder text absence.
 */

const http = require('http');
const { URL } = require('url');

const BASE_URL = 'http://127.0.0.1:3000';

const ROUTES_TO_TEST = [
  '/',
  '/about',
  '/work',
  '/contact',
  '/privacy-statement',
  '/projecten/alquion',
  '/projecten/ausems',
  '/projecten/bloomer',
  '/projecten/design-chair',
  '/projecten/limelight',
  '/projecten/massage-studio',
  '/projecten/move-to-dream',
  '/projecten/yoga-website'
];

function fetchRoute(pathname) {
  return new Promise((resolve, reject) => {
    const targetUrl = new URL(pathname, BASE_URL).toString();
    const req = http.get(targetUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          pathname,
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${pathname}`));
    });
  });
}

async function verifyAllRoutes() {
  console.log(`[PreviewAudit] Starting runtime verification against: ${BASE_URL}\n`);
  const results = [];
  const allInternalLinks = new Set();

  for (const route of ROUTES_TO_TEST) {
    try {
      const res = await fetchRoute(route);
      const titleMatch = res.body.match(/<title>([^<]*)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : null;

      const hasLorem = /lorem\s+ipsum/i.test(res.body);
      const hasStylesheet = /<link[^>]+rel=["']stylesheet["']/i.test(res.body);
      const hasHead = /<head\b[^>]*>/i.test(res.body);

      // Extract internal links
      const linkRegex = /<a\b[^>]*\bhref=["']([^"']+)["']/gi;
      let lm;
      const internalLinks = [];
      while ((lm = linkRegex.exec(res.body)) !== null) {
        const href = lm[1].trim();
        if (href.startsWith('/') && !href.startsWith('//') && !href.startsWith('/#')) {
          const cleanHref = href.split('#')[0].split('?')[0];
          if (cleanHref) {
            internalLinks.push(cleanHref);
            allInternalLinks.add(cleanHref);
          }
        }
      }

      const passed = res.status === 200 && !hasLorem && hasStylesheet && hasHead;

      results.push({
        pathname: route,
        status: res.status,
        passed,
        title,
        sizeBytes: Buffer.byteLength(res.body, 'utf8'),
        hasLorem,
        hasStylesheet,
        hasHead,
        internalLinksCount: internalLinks.length
      });

      console.log(`  ${passed ? '✔' : '✖'} [${res.status}] ${route} -> "${title || 'No Title'}" (${res.body.length} bytes)`);
    } catch (err) {
      results.push({
        pathname: route,
        status: 'ERROR',
        passed: false,
        error: err.message
      });
      console.log(`  ✖ [ERROR] ${route} -> ${err.message}`);
    }
  }

  // Audit all discovered unique internal links to guarantee 0 broken links
  console.log(`\n[PreviewAudit] Auditing ${allInternalLinks.size} unique internal navigation targets for broken links...`);
  const brokenLinks = [];
  for (const link of allInternalLinks) {
    try {
      const res = await fetchRoute(link);
      if (res.status !== 200) {
        brokenLinks.push({ link, status: res.status });
        console.log(`  ✖ Broken internal link: ${link} -> ${res.status}`);
      }
    } catch (e) {
      brokenLinks.push({ link, error: e.message });
      console.log(`  ✖ Failed internal link request: ${link} -> ${e.message}`);
    }
  }

  if (brokenLinks.length === 0) {
    console.log(`  ✔ All ${allInternalLinks.size} internal navigation links resolved successfully (0 broken links)!`);
  }

  const allPassed = results.every(r => r.passed) && brokenLinks.length === 0;

  return {
    baseUrl: BASE_URL,
    timestamp: new Date().toISOString(),
    totalRoutes: results.length,
    passedRoutes: results.filter(r => r.passed).length,
    totalInternalLinksAudited: allInternalLinks.size,
    brokenLinksCount: brokenLinks.length,
    brokenLinks,
    overallStatus: allPassed ? 'PASS' : 'FAIL',
    results
  };
}

if (require.main === module) {
  verifyAllRoutes().then(report => {
    console.log(`\n===========================================================`);
    console.log(`=== RUNTIME AUDIT SUMMARY: ${report.overallStatus} ===`);
    console.log(`Routes Tested: ${report.passedRoutes}/${report.totalRoutes} Passed`);
    console.log(`Broken Links:  ${report.brokenLinksCount}`);
    console.log(`===========================================================\n`);
    process.exit(report.overallStatus === 'PASS' ? 0 : 1);
  }).catch(err => {
    console.error('[PreviewAudit Error]', err);
    process.exit(1);
  });
}

module.exports = { verifyAllRoutes, ROUTES_TO_TEST };
