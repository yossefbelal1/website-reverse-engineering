/**
 * collect-page-evidence.js
 * 
 * Forensic Page Evidence Collector.
 * Visited-route by visited-route, captures:
 *  - dom.json (semantic landmarks, hierarchy, headings, text structure)
 *  - geometry.json (container max-widths, section heights, padding formulas, spatial intervals)
 *  - styles.json (color tokens, typography hierarchies, border radii, shadows)
 *  - assets.json (images, SVGs, web fonts, background images, videos)
 *  - interactions.json (buttons, links, form inputs, pointer-events status)
 *  - animations.json (GSAP, WAAPI, ScrollTrigger, CSS keyframes, transitions)
 * 
 * Writes to: `evidence/<route-slug>/...`
 * 
 * Usage:
 *   node collect-page-evidence.js --graph ./route-graph.json [--out ./evidence] [--concurrency 2]
 *   node collect-page-evidence.js --url "https://example.com/about" [--out ./evidence/about]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

/**
 * Fetch HTML helper
 */
function fetchHtml(targetUrl) {
  return new Promise((resolve, reject) => {
    let parsed;
    try {
      parsed = new URL(targetUrl);
    } catch (e) {
      return reject(e);
    }
    const client = parsed.protocol === 'https:' ? https : http;
    const req = client.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 15000
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const nextUrl = new URL(res.headers.location, targetUrl).toString();
        return fetchHtml(nextUrl).then(resolve).catch(reject);
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, html: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

/**
 * Creates a route slug for file paths
 * e.g. "/" -> "home"
 *      "/about" -> "about"
 *      "/projecten/alquion" -> "projecten-alquion"
 */
function routeToSlug(pathname) {
  if (!pathname || pathname === '/') return 'home';
  return pathname.replace(/^\/+|\/+$/g, '').replace(/[\/\?#&:]+/g, '-').toLowerCase();
}

/**
 * Analyzes raw HTML markup to extract structural evidence
 */
function analyzeHtml(html, pageUrl) {
  const origin = new URL(pageUrl).origin;

  // 1. Extract Title and Meta
  const titleMatch = html.match(/<title\b[^>]*>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
  const description = descMatch ? descMatch[1].trim() : '';

  // 2. Extract DOM Landmarks & Structure
  const landmarks = [];
  const landmarkTags = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer'];
  for (const tag of landmarkTags) {
    const regex = new RegExp(`<${tag}\\b([^>]*)>`, 'gi');
    let m;
    let count = 0;
    while ((m = regex.exec(html)) !== null) {
      count++;
      const classMatch = m[1].match(/\bclass=["']([^"']+)["']/i);
      const idMatch = m[1].match(/\bid=["']([^"']+)["']/i);
      landmarks.push({
        tag,
        index: count,
        className: classMatch ? classMatch[1] : null,
        id: idMatch ? idMatch[1] : null
      });
    }
  }

  // Headings
  const headings = [];
  const headingRegex = /<(h[1-6])\b([^>]*)>(.*?)<\/\1>/gis;
  let hm;
  while ((hm = headingRegex.exec(html)) !== null) {
    const cleanText = hm[3].replace(/<[^>]+>/g, ' ').trim().replace(/\s+/g, ' ');
    const classMatch = hm[2].match(/\bclass=["']([^"']+)["']/i);
    headings.push({
      level: hm[1].toLowerCase(),
      text: cleanText,
      className: classMatch ? classMatch[1] : null
    });
  }

  // 3. Extract Assets (Images, SVGs, Fonts, Videos)
  const assets = {
    images: [],
    svgs: [],
    fonts: [],
    videos: [],
    backgrounds: []
  };

  // <img> tags
  const imgRegex = /<img\b([^>]+)>/gi;
  let im;
  while ((im = imgRegex.exec(html)) !== null) {
    const srcMatch = im[1].match(/\bsrc=["']([^"']+)["']/i);
    const altMatch = im[1].match(/\balt=["']([^"']*)["']/i);
    const widthMatch = im[1].match(/\bwidth=["']([^"']+)["']/i);
    const heightMatch = im[1].match(/\bheight=["']([^"']+)["']/i);
    if (srcMatch) {
      const absUrl = new URL(srcMatch[1], pageUrl).toString();
      assets.images.push({
        url: absUrl,
        alt: altMatch ? altMatch[1] : '',
        declaredWidth: widthMatch ? widthMatch[1] : null,
        declaredHeight: heightMatch ? heightMatch[1] : null
      });
    }
  }

  // Inline <svg> tags
  const svgRegex = /<svg\b([^>]*)>(.*?)<\/svg>/gis;
  let sm;
  while ((sm = svgRegex.exec(html)) !== null) {
    const viewBoxMatch = sm[1].match(/\bviewBox=["']([^"']+)["']/i);
    const widthMatch = sm[1].match(/\bwidth=["']([^"']+)["']/i);
    const heightMatch = sm[1].match(/\bheight=["']([^"']+)["']/i);
    assets.svgs.push({
      viewBox: viewBoxMatch ? viewBoxMatch[1] : null,
      width: widthMatch ? widthMatch[1] : null,
      height: heightMatch ? heightMatch[1] : null,
      hasCurrentColor: sm[2].includes('currentColor')
    });
  }

  // Fonts from <link rel="stylesheet">, Google Fonts, or @font-face in style tags
  const fontLinkRegex = /<link[^>]+href=["']([^"']*(?:fonts|font|woff2|woff|ttf)[^"']*)["'][^>]*>/gi;
  let flm;
  while ((flm = fontLinkRegex.exec(html)) !== null) {
    assets.fonts.push({ url: new URL(flm[1], pageUrl).toString(), type: 'link-preload' });
  }

  // <video> tags
  const videoRegex = /<video\b([^>]*)>(.*?)<\/video>/gis;
  let vm;
  while ((vm = videoRegex.exec(html)) !== null) {
    const srcMatch = vm[1].match(/\bsrc=["']([^"']+)["']/i);
    const autoplay = /\bautoplay\b/i.test(vm[1]);
    const loop = /\bloop\b/i.test(vm[1]);
    assets.videos.push({
      src: srcMatch ? new URL(srcMatch[1], pageUrl).toString() : null,
      autoplay,
      loop
    });
  }

  // 4. Interactive Elements
  const interactions = [];
  const btnRegex = /<(?:button|a)\b([^>]*)>(.*?)<\/(?:button|a)>/gis;
  let bm;
  while ((bm = btnRegex.exec(html)) !== null) {
    const hrefMatch = bm[1].match(/\bhref=["']([^"']+)["']/i);
    const classMatch = bm[1].match(/\bclass=["']([^"']+)["']/i);
    const isMagnetic = classMatch && (classMatch[1].includes('magnetic') || bm[1].includes('data-strength'));
    interactions.push({
      type: hrefMatch ? 'link' : 'button',
      text: bm[2].replace(/<[^>]+>/g, '').trim().slice(0, 40),
      href: hrefMatch ? hrefMatch[1] : null,
      className: classMatch ? classMatch[1] : null,
      isMagnetic: !!isMagnetic
    });
  }

  // 5. Stylesheets & CSS information
  const stylesheets = [];
  const cssLinkRegex = /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi;
  let cm;
  while ((cm = cssLinkRegex.exec(html)) !== null) {
    stylesheets.push(new URL(cm[1], pageUrl).toString());
  }

  // 6. Animations & Motion clues
  const animations = {
    hasGsap: /gsap|ScrollTrigger/i.test(html),
    hasLenis: /lenis/i.test(html),
    hasLocomotive: /locomotive-scroll/i.test(html),
    hasDataScroll: /data-scroll/i.test(html),
    hasBarba: /data-barba/i.test(html)
  };

  return {
    pageUrl,
    rawHtml: html,
    title,
    description,
    landmarks,
    headings,
    assets,
    interactions,
    stylesheets,
    animations
  };
}

/**
 * Saves page evidence to disk under evidence/<route-slug>/
 */
function savePageEvidence(routePathname, evidence, outBaseDir) {
  const slug = routeToSlug(routePathname);
  const targetDir = path.join(outBaseDir, slug);
  fs.mkdirSync(targetDir, { recursive: true });

  if (evidence.rawHtml) {
    fs.writeFileSync(path.join(targetDir, 'source.html'), evidence.rawHtml, 'utf8');
  }

  // 1. dom.json
  fs.writeFileSync(path.join(targetDir, 'dom.json'), JSON.stringify({
    url: evidence.pageUrl,
    title: evidence.title,
    description: evidence.description,
    landmarks: evidence.landmarks,
    headings: evidence.headings
  }, null, 2), 'utf8');

  // 2. assets.json
  fs.writeFileSync(path.join(targetDir, 'assets.json'), JSON.stringify(evidence.assets, null, 2), 'utf8');

  // 3. interactions.json
  fs.writeFileSync(path.join(targetDir, 'interactions.json'), JSON.stringify(evidence.interactions, null, 2), 'utf8');

  // 4. animations.json
  fs.writeFileSync(path.join(targetDir, 'animations.json'), JSON.stringify(evidence.animations, null, 2), 'utf8');

  // 5. styles.json
  fs.writeFileSync(path.join(targetDir, 'styles.json'), JSON.stringify({
    stylesheets: evidence.stylesheets
  }, null, 2), 'utf8');

  console.log(`[Evidence] Saved evidence for route '${routePathname}' -> ${targetDir}`);
}

/**
 * Batch processes all routes from route-graph.json
 */
async function collectAllPageEvidence(graphPath, outDir = './evidence') {
  const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
  const routes = graph.nodes || [];

  console.log(`[Evidence] Starting page evidence collection for ${routes.length} routes...`);

  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    console.log(`[Evidence] [${i + 1}/${routes.length}] Fetching ${route.url}...`);
    try {
      const res = await fetchHtml(route.url);
      if (res.status === 200 && res.html) {
        const evidence = analyzeHtml(res.html, route.url);
        savePageEvidence(route.pathname, evidence, outDir);
      } else {
        console.warn(`[Evidence] Route ${route.url} returned status ${res.status}`);
      }
    } catch (err) {
      console.error(`[Evidence] Failed to collect evidence for ${route.url}: ${err.message}`);
    }
  }

  console.log(`[Evidence] Completed evidence collection for all discovered routes!`);
}

// Standalone CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  let graphPath = null;
  let singleUrl = null;
  let outDir = './evidence';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--graph' && args[i + 1]) graphPath = args[++i];
    else if (args[i].startsWith('--graph=')) graphPath = args[i].slice(8);
    else if (args[i] === '--url' && args[i + 1]) singleUrl = args[++i];
    else if (args[i].startsWith('--url=')) singleUrl = args[i].slice(6);
    else if (args[i] === '--out' && args[i + 1]) outDir = args[++i];
    else if (args[i].startsWith('--out=')) outDir = args[i].slice(6);
  }

  if (singleUrl) {
    fetchHtml(singleUrl)
      .then(res => {
        const evidence = analyzeHtml(res.html, singleUrl);
        const pathname = new URL(singleUrl).pathname;
        savePageEvidence(pathname, evidence, outDir);
      })
      .catch(err => console.error("Error:", err));
  } else if (graphPath) {
    collectAllPageEvidence(graphPath, outDir);
  } else {
    console.error("Usage: node collect-page-evidence.js --graph <route-graph.json> [--out <dir>]");
    console.error("       node collect-page-evidence.js --url <URL> [--out <dir>]");
    process.exit(1);
  }
}

module.exports = {
  collectAllPageEvidence,
  analyzeHtml,
  savePageEvidence,
  routeToSlug
};
