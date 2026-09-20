/**
 * discover-routes.js
 * 
 * Production-grade, multi-source route discovery engine for forensic website reverse engineering.
 * Discovers routes from:
 *  - sitemap.xml & recursive sitemap_index.xml
 *  - robots.txt directives (Sitemaps, Allowed/Disallowed paths)
 *  - HTML DOM crawl (<a href>, <nav>, <header>, <footer>, canonical, breadcrumbs, buttons)
 *  - JSON-LD structured data
 *  - JavaScript script bundle scanning (route declarations, pushState, router patterns)
 * 
 * Supports full URL normalization, domain boundary protection, and route categorization.
 * 
 * Usage:
 *   node discover-routes.js --url "https://example.com" [--depth 3] [--out ./route-graph.json]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Common tracking query parameters to discard during normalization
const TRACKING_PARAMS = new Set([
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'fbclid', 'gclid', 'msclkid', 'mc_cid', 'mc_eid', '_ga', '_gl', 'ref'
]);

// Non-page asset extensions to ignore during route discovery
const ASSET_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'avif', 'ico', 'bmp', 'tiff',
  'css', 'js', 'mjs', 'cjs', 'map', 'json', 'xml', 'txt',
  'woff', 'woff2', 'ttf', 'otf', 'eot',
  'mp4', 'webm', 'ogg', 'mov', 'avi', 'mp3', 'wav',
  'pdf', 'zip', 'tar', 'gz', 'rar', '7z', 'doc', 'docx', 'xls', 'xlsx'
]);

// Auth / system route patterns
const AUTH_PATTERNS = [
  /\/login\b/i, /\/signin\b/i, /\/signup\b/i, /\/register\b/i,
  /\/admin\b/i, /\/dashboard\b/i, /\/account\b/i, /\/portal\b/i,
  /\/auth\b/i, /\/logout\b/i
];

/**
 * Fetch helper using native http/https with redirect following and custom headers
 */
function fetchUrl(targetUrl, options = {}) {
  return new Promise((resolve, reject) => {
    let parsed;
    try {
      parsed = new URL(targetUrl);
    } catch (e) {
      return reject(new Error(`Invalid URL: ${targetUrl}`));
    }

    const client = parsed.protocol === 'https:' ? https : http;
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        ...options.headers
      },
      timeout: options.timeout || 15000
    };

    const req = client.request(reqOptions, (res) => {
      // Handle redirects (301, 302, 307, 308)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = new URL(res.headers.location, targetUrl).toString();
        const maxRedirects = options.maxRedirects !== undefined ? options.maxRedirects : 5;
        if (maxRedirects <= 0) {
          return reject(new Error(`Too many redirects encountered at ${targetUrl}`));
        }
        return fetchUrl(redirectUrl, { ...options, maxRedirects: maxRedirects - 1 })
          .then(resolve)
          .catch(reject);
      }

      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data,
          finalUrl: targetUrl
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timed out after ${options.timeout || 15000}ms for ${targetUrl}`));
    });
    req.end();
  });
}

/**
 * Normalizes a URL:
 * - Resolves relative paths against base URL
 * - Trims whitespace
 * - Strips hash fragment
 * - Strips marketing tracking query parameters
 * - Standardizes trailing slashes: root is '/', all other paths strip trailing slash unless empty
 * - Converts hostname to lowercase
 */
function normalizeUrl(rawUrl, baseUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.startsWith('javascript:') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:') || trimmed.startsWith('#')) {
    return null;
  }

  let parsed;
  try {
    parsed = baseUrl ? new URL(trimmed, baseUrl) : new URL(trimmed);
  } catch (e) {
    return null;
  }

  // Only support HTTP and HTTPS
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return null;
  }

  // Lowercase hostname
  parsed.hostname = parsed.hostname.toLowerCase();

  // Strip port 80/443 default ports
  if ((parsed.protocol === 'http:' && parsed.port === '80') || (parsed.protocol === 'https:' && parsed.port === '443')) {
    parsed.port = '';
  }

  // Strip hash fragment
  parsed.hash = '';

  // Filter tracking query params
  const cleanParams = new URLSearchParams();
  for (const [key, val] of parsed.searchParams.entries()) {
    if (!TRACKING_PARAMS.has(key.toLowerCase())) {
      cleanParams.append(key, val);
    }
  }
  parsed.search = cleanParams.toString() ? `?${cleanParams.toString()}` : '';

  // Normalize pathname: ensure leading slash, remove duplicate slashes
  let cleanPath = parsed.pathname.replace(/\/+/g, '/');
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }
  parsed.pathname = cleanPath || '/';

  return parsed.toString();
}

/**
 * Checks whether a URL belongs to the target domain boundary
 */
function isSameDomain(candidateUrl, targetOrigin) {
  try {
    const cand = new URL(candidateUrl);
    const target = new URL(targetOrigin);
    // Exact hostname match or www vs non-www match
    const candHost = cand.hostname.replace(/^www\./, '');
    const targetHost = target.hostname.replace(/^www\./, '');
    return candHost === targetHost;
  } catch (e) {
    return false;
  }
}

/**
 * Extracts the file extension from a pathname
 */
function getExtension(pathname) {
  const lastSegment = pathname.split('/').pop() || '';
  const match = lastSegment.match(/\.([a-zA-Z0-9]+)$/);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Categorizes a route
 */
function categorizeRoute(urlStr) {
  const parsed = new URL(urlStr);
  const pathname = parsed.pathname;
  const ext = getExtension(pathname);

  if (ext && ASSET_EXTENSIONS.has(ext)) {
    return 'asset';
  }

  for (const pattern of AUTH_PATTERNS) {
    if (pattern.test(pathname)) {
      return 'auth-required';
    }
  }

  if (parsed.search) {
    return 'query-state';
  }

  if (pathname === '/') {
    return 'root';
  }

  // Look for dynamic patterns: multi-segment paths where last segment is a slug/id
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length >= 2) {
    return 'dynamic-candidate';
  }

  return 'static';
}

/**
 * Extract URLs from robots.txt content
 */
function parseRobotsTxt(robotsText, origin) {
  const discovered = { sitemaps: [], allowed: [], disallowed: [] };
  const lines = robotsText.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#')) continue;

    const sitemapMatch = trimmed.match(/^sitemap:\s*(https?:\/\/[^\s]+)/i);
    if (sitemapMatch) {
      discovered.sitemaps.push(sitemapMatch[1]);
      continue;
    }

    const allowMatch = trimmed.match(/^allow:\s*([^\s]+)/i);
    if (allowMatch) {
      const full = normalizeUrl(allowMatch[1], origin);
      if (full && isSameDomain(full, origin)) discovered.allowed.push(full);
      continue;
    }

    const disallowMatch = trimmed.match(/^disallow:\s*([^\s]+)/i);
    if (disallowMatch && disallowMatch[1] !== '/' && disallowMatch[1] !== '') {
      const full = normalizeUrl(disallowMatch[1], origin);
      if (full && isSameDomain(full, origin)) discovered.disallowed.push(full);
    }
  }
  return discovered;
}

/**
 * Recursively parse sitemap.xml and sitemap_index.xml
 */
async function parseSitemap(sitemapUrl, origin, visitedSitemaps = new Set()) {
  if (visitedSitemaps.has(sitemapUrl) || visitedSitemaps.size > 20) return [];
  visitedSitemaps.add(sitemapUrl);

  const routes = [];
  try {
    const res = await fetchUrl(sitemapUrl);
    if (res.status !== 200 || !res.data) return routes;

    const xml = res.data;

    // Check if this is a sitemap index (<sitemapindex>)
    const sitemapMatches = xml.matchAll(/<sitemap>\s*<loc>([^<]+)<\/loc>/gi);
    const subSitemaps = [];
    for (const match of sitemapMatches) {
      subSitemaps.push(match[1].trim());
    }

    if (subSitemaps.length > 0) {
      for (const sub of subSitemaps) {
        const subRoutes = await parseSitemap(sub, origin, visitedSitemaps);
        routes.push(...subRoutes);
      }
      return routes;
    }

    // Standard urlset (<urlset>)
    const urlMatches = xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>/gi);
    for (const match of urlMatches) {
      const raw = match[1].trim();
      const norm = normalizeUrl(raw, origin);
      if (norm && isSameDomain(norm, origin)) {
        routes.push({
          url: norm,
          source: 'sitemap.xml',
          type: categorizeRoute(norm)
        });
      }
    }
  } catch (err) {
    // Sitemap might not exist, non-fatal
  }
  return routes;
}

/**
 * Extract routes from HTML text via DOM markup, microformats, canonicals, and scripts
 */
function extractRoutesFromHtml(html, pageUrl, origin) {
  const discovered = [];

  // 1. Canonical link: <link rel="canonical" href="...">
  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
                         html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  if (canonicalMatch) {
    const norm = normalizeUrl(canonicalMatch[1], origin);
    if (norm && isSameDomain(norm, origin)) {
      discovered.push({ url: norm, source: 'html-canonical', context: 'head' });
    }
  }

  // 2. Standard <a> tags: <a ... href="...">
  const anchorRegex = /<a\b[^>]*?\bhref=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis;
  let match;
  while ((match = anchorRegex.exec(html)) !== null) {
    const rawHref = match[1];
    const anchorBody = match[2] || '';
    const norm = normalizeUrl(rawHref, pageUrl);
    if (!norm || !isSameDomain(norm, origin)) continue;

    // Detect context (nav, footer, button, etc.)
    let context = 'body';
    if (/<header\b/i.test(match[0]) || /nav\b/i.test(match[0])) context = 'navigation';
    else if (/footer\b/i.test(match[0])) context = 'footer';
    else if (/btn|button/i.test(match[0])) context = 'button';

    const text = anchorBody.replace(/<[^>]+>/g, '').trim().slice(0, 50);
    discovered.push({ url: norm, source: 'html-link', context, text });
  }

  // 3. Buttons or elements with data-href or onclick="location.href='...'"
  const dataHrefRegex = /\b(?:data-href|data-url|data-route)=["']([^"']+)["']/gi;
  while ((match = dataHrefRegex.exec(html)) !== null) {
    const norm = normalizeUrl(match[1], pageUrl);
    if (norm && isSameDomain(norm, origin)) {
      discovered.push({ url: norm, source: 'html-data-attribute', context: 'interactive' });
    }
  }

  // 4. JSON-LD structured data: <script type="application/ld+json">
  const jsonLdRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis;
  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1]);
      extractJsonLdUrls(data, origin, discovered);
    } catch (e) {}
  }

  // 5. JavaScript bundle references & route-like string patterns
  // Find script tags: <script src="...">
  const scriptSrcRegex = /<script[^>]+src=["']([^"']+)["'][^>]*>/gi;
  const scriptSources = [];
  while ((match = scriptSrcRegex.exec(html)) !== null) {
    const norm = normalizeUrl(match[1], pageUrl);
    if (norm && isSameDomain(norm, origin)) {
      scriptSources.push(norm);
    }
  }

  // Scan inline JavaScript for route definitions and SPA patterns
  const inlineScriptRegex = /<script\b(?![^>]*\bsrc=)[^>]*>(.*?)<\/script>/gis;
  while ((match = inlineScriptRegex.exec(html)) !== null) {
    const scriptBody = match[1];
    scanScriptForRoutes(scriptBody, origin, discovered);
  }

  return { discovered, scriptSources };
}

/**
 * Scan JavaScript source text for route definitions (e.g. path: "/about", history.pushState(null, "", "/work"), etc.)
 */
function scanScriptForRoutes(scriptContent, origin, discoveredList) {
  if (!scriptContent || typeof scriptContent !== 'string') return;

  // Patterns like: path: "/about" or route: '/services'
  const routePropRegex = /(?:path|route|url|href|to):\s*["'](\/[a-zA-Z0-9_\-\/]+)["']/g;
  let m;
  while ((m = routePropRegex.exec(scriptContent)) !== null) {
    const norm = normalizeUrl(m[1], origin);
    if (norm && isSameDomain(norm, origin) && categorizeRoute(norm) !== 'asset') {
      discoveredList.push({ url: norm, source: 'js-route-declaration', context: 'script-manifest' });
    }
  }

  // pushState / replaceState calls: history.pushState(..., ..., '/path')
  const historyRegex = /history\.(?:pushState|replaceState)\s*\([^,]+,[^,]+,\s*["'](\/[^"']+)["']\)/g;
  while ((m = historyRegex.exec(scriptContent)) !== null) {
    const norm = normalizeUrl(m[1], origin);
    if (norm && isSameDomain(norm, origin) && categorizeRoute(norm) !== 'asset') {
      discoveredList.push({ url: norm, source: 'js-history-api', context: 'spa-router' });
    }
  }
}

/**
 * Recursive JSON-LD traversal helper
 */
function extractJsonLdUrls(obj, origin, discoveredList) {
  if (!obj) return;
  if (Array.isArray(obj)) {
    obj.forEach(item => extractJsonLdUrls(item, origin, discoveredList));
    return;
  }
  if (typeof obj === 'object') {
    if (obj.url && typeof obj.url === 'string') {
      const norm = normalizeUrl(obj.url, origin);
      if (norm && isSameDomain(norm, origin)) {
        discoveredList.push({ url: norm, source: 'json-ld', context: obj['@type'] || 'structured-data' });
      }
    }
    for (const key of Object.keys(obj)) {
      extractJsonLdUrls(obj[key], origin, discoveredList);
    }
  }
}

/**
 * Master multi-source route discovery pipeline
 */
async function discoverRoutes(targetUrl, options = {}) {
  const maxDepth = options.depth || 2;
  const targetOrigin = new URL(targetUrl).origin;
  const rootUrl = normalizeUrl('/', targetOrigin);

  const inventory = new Map(); // url -> RouteRecord
  const crawlQueue = [{ url: rootUrl, depth: 0, referrer: null }];
  const crawledUrls = new Set();
  const scannedScripts = new Set();

  function recordRoute(urlStr, source, context = null, parent = null) {
    const norm = normalizeUrl(urlStr, targetOrigin);
    if (!norm || !isSameDomain(norm, targetOrigin)) return;
    const cat = categorizeRoute(norm);
    if (cat === 'asset') return;

    if (!inventory.has(norm)) {
      const parsed = new URL(norm);
      inventory.set(norm, {
        url: norm,
        pathname: parsed.pathname,
        search: parsed.search,
        type: cat,
        sources: new Set([source]),
        contexts: new Set(context ? [context] : []),
        parents: new Set(parent ? [parent] : []),
        discoveredAt: new Date().toISOString(),
        status: 'discovered'
      });
    } else {
      const existing = inventory.get(norm);
      existing.sources.add(source);
      if (context) existing.contexts.add(context);
      if (parent) existing.parents.add(parent);
    }
  }

  console.log(`[Discover] Initializing route discovery for: ${targetOrigin}`);

  // Step 1: Probe robots.txt
  const robotsUrl = `${targetOrigin}/robots.txt`;
  try {
    console.log(`[Discover] Probing robots.txt at ${robotsUrl}...`);
    const robotsRes = await fetchUrl(robotsUrl);
    if (robotsRes.status === 200 && robotsRes.data) {
      const parsedRobots = parseRobotsTxt(robotsRes.data, targetOrigin);
      console.log(`[Discover] robots.txt found. Sitemaps: ${parsedRobots.sitemaps.length}, Allowed routes: ${parsedRobots.allowed.length}`);

      for (const allowUrl of parsedRobots.allowed) {
        recordRoute(allowUrl, 'robots.txt-allow');
      }

      // If sitemaps discovered via robots.txt, parse them
      for (const smUrl of parsedRobots.sitemaps) {
        console.log(`[Discover] Parsing sitemap declared in robots.txt: ${smUrl}`);
        const smRoutes = await parseSitemap(smUrl, targetOrigin);
        for (const r of smRoutes) {
          recordRoute(r.url, 'sitemap.xml');
        }
      }
    }
  } catch (err) {
    console.log(`[Discover] robots.txt check skipped: ${err.message}`);
  }

  // Step 2: Probe standard sitemap locations if none found yet
  const standardSitemaps = [
    `${targetOrigin}/sitemap.xml`,
    `${targetOrigin}/sitemap_index.xml`,
    `${targetOrigin}/sitemap/sitemap.xml`
  ];

  for (const sm of standardSitemaps) {
    try {
      const smRoutes = await parseSitemap(sm, targetOrigin);
      if (smRoutes.length > 0) {
        console.log(`[Discover] Found ${smRoutes.length} routes from sitemap: ${sm}`);
        for (const r of smRoutes) {
          recordRoute(r.url, 'sitemap.xml');
        }
        break; // Found working sitemap
      }
    } catch (e) {}
  }

  // Step 3: Breadth-first crawl of HTML pages up to maxDepth
  while (crawlQueue.length > 0) {
    const current = crawlQueue.shift();
    if (crawledUrls.has(current.url)) continue;
    crawledUrls.add(current.url);

    recordRoute(current.url, current.depth === 0 ? 'root-entry' : 'crawler', null, current.referrer);

    if (current.depth > maxDepth) continue;

    console.log(`[Discover] Crawling [Depth ${current.depth}]: ${current.url}`);
    try {
      const pageRes = await fetchUrl(current.url);
      if (pageRes.status !== 200 || !pageRes.data) {
        console.log(`[Discover] Status ${pageRes.status} on ${current.url}`);
        continue;
      }

      const { discovered, scriptSources } = extractRoutesFromHtml(pageRes.data, current.url, targetOrigin);

      for (const item of discovered) {
        recordRoute(item.url, item.source, item.context, current.url);
        if (!crawledUrls.has(item.url) && current.depth + 1 <= maxDepth) {
          crawlQueue.push({ url: item.url, depth: current.depth + 1, referrer: current.url });
        }
      }

      // Step 4: Inspect external JavaScript bundles for route declarations
      for (const scriptUrl of scriptSources) {
        if (scannedScripts.has(scriptUrl) || scannedScripts.size > 15) continue;
        scannedScripts.add(scriptUrl);
        try {
          const sRes = await fetchUrl(scriptUrl);
          if (sRes.status === 200 && sRes.data) {
            const jsDiscovered = [];
            scanScriptForRoutes(sRes.data, targetOrigin, jsDiscovered);
            for (const jItem of jsDiscovered) {
              recordRoute(jItem.url, jItem.source, jItem.context, scriptUrl);
              if (!crawledUrls.has(jItem.url) && current.depth + 1 <= maxDepth) {
                crawlQueue.push({ url: jItem.url, depth: current.depth + 1, referrer: scriptUrl });
              }
            }
          }
        } catch (e) {}
      }
    } catch (err) {
      console.warn(`[Discover] Error fetching ${current.url}: ${err.message}`);
    }
  }

  // Convert map to serializable array
  const routeList = Array.from(inventory.values()).map(r => ({
    url: r.url,
    pathname: r.pathname,
    search: r.search,
    type: r.type,
    sources: Array.from(r.sources),
    contexts: Array.from(r.contexts),
    parents: Array.from(r.parents),
    discoveredAt: r.discoveredAt,
    status: r.status
  }));

  // Sort: root first, then static, then dynamic, alphabetically
  routeList.sort((a, b) => {
    if (a.pathname === '/') return -1;
    if (b.pathname === '/') return 1;
    return a.pathname.localeCompare(b.pathname);
  });

  console.log(`\n=== Route Discovery Summary ===`);
  console.log(`Target: ${targetOrigin}`);
  console.log(`Total Routes Discovered: ${routeList.length}`);
  const byType = routeList.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});
  console.log(`Breakdown:`, byType);

  return {
    target: targetOrigin,
    totalRoutes: routeList.length,
    generatedAt: new Date().toISOString(),
    routes: routeList
  };
}

// Standalone CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  let targetUrl = null;
  let depth = 2;
  let outFile = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) targetUrl = args[++i];
    else if (args[i].startsWith('--url=')) targetUrl = args[i].slice(6);
    else if (args[i] === '--depth' && args[i + 1]) depth = parseInt(args[++i], 10);
    else if (args[i].startsWith('--depth=')) depth = parseInt(args[i].slice(8), 10);
    else if (args[i] === '--out' && args[i + 1]) outFile = args[++i];
    else if (args[i].startsWith('--out=')) outFile = args[i].slice(6);
    else if (!targetUrl && !args[i].startsWith('--')) targetUrl = args[i];
  }

  if (!targetUrl) {
    console.error("Usage: node discover-routes.js --url <URL> [--depth <number>] [--out <file.json>]");
    process.exit(1);
  }

  discoverRoutes(targetUrl, { depth })
    .then(result => {
      if (outFile) {
        fs.writeFileSync(outFile, JSON.stringify(result, null, 2), 'utf8');
        console.log(`[Discover] Routes saved to: ${outFile}`);
      } else {
        console.log(JSON.stringify(result, null, 2));
      }
    })
    .catch(err => {
      console.error("[Discover] Fatal Error:", err);
      process.exit(1);
    });
}

module.exports = {
  discoverRoutes,
  normalizeUrl,
  isSameDomain,
  categorizeRoute,
  parseRobotsTxt,
  parseSitemap,
  extractRoutesFromHtml,
  scanScriptForRoutes
};
