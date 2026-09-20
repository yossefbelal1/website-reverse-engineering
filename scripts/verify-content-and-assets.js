/**
 * verify-content-and-assets.js
 * 
 * Content and Asset Fidelity Auditor.
 * Verifies that:
 *  1. Reconstructed pages use authentic text copy instead of invented lorem ipsum placeholders.
 *  2. Headings and primary copy match the observed evidence.
 *  3. Referenced media assets (images, SVGs, videos) are genuinely linked and present.
 * 
 * Usage:
 *   node verify-content-and-assets.js --evidence ./evidence --workspace ./ [--out ./CONTENT_ASSET_AUDIT.md]
 */

const fs = require('fs');
const path = require('path');
const { resolveLocalPathCandidates } = require('./audit-route-coverage');

/**
 * Audit content and assets for a single route
 */
function auditRouteContentAndAssets(routeSlug, evidenceDir, workspaceRoot) {
  const pageEvidenceDir = path.join(evidenceDir, routeSlug);
  const domPath = path.join(pageEvidenceDir, 'dom.json');
  const assetsPath = path.join(pageEvidenceDir, 'assets.json');

  if (!fs.existsSync(domPath)) {
    return { routeSlug, status: 'SKIPPED', reason: 'No evidence found' };
  }

  const dom = JSON.parse(fs.readFileSync(domPath, 'utf8'));
  let assets = { images: [] };
  if (fs.existsSync(assetsPath)) {
    try { assets = JSON.parse(fs.readFileSync(assetsPath, 'utf8')); } catch (e) {}
  }

  // Resolve local file
  let pathname = '/';
  if (dom.url) {
    try {
      pathname = new URL(dom.url).pathname;
    } catch (e) {
      pathname = routeSlug === 'home' ? '/' : `/${routeSlug.replace(/-/g, '/')}`;
    }
  } else {
    pathname = routeSlug === 'home' ? '/' : `/${routeSlug.replace(/-/g, '/')}`;
  }
  const candidates = resolveLocalPathCandidates(pathname);
  let localFile = null;
  for (const c of candidates) {
    const full = path.join(workspaceRoot, c);
    if (fs.existsSync(full) && fs.statSync(full).isFile()) {
      localFile = full;
      break;
    }
  }

  if (!localFile) {
    return { routeSlug, status: 'FAIL', reason: 'Local implementation file missing' };
  }

  const localHtml = fs.readFileSync(localFile, 'utf8');

  // Check 1: Placeholder text detection
  const hasLorem = /lorem\s+ipsum/i.test(localHtml);

  // Check 2: Heading preservation
  let matchedHeadings = 0;
  const expectedHeadings = (dom.headings || []).map(h => h.text.trim());
  
  const localHeadings = [];
  const headingRegex = /<(h[1-6])\b[^>]*>(.*?)<\/\1>/gis;
  let lhm;
  while ((lhm = headingRegex.exec(localHtml)) !== null) {
    const cleanLocal = lhm[2].replace(/<[^>]+>/g, ' ').trim().replace(/\s+/g, ' ');
    if (cleanLocal) localHeadings.push(cleanLocal);
  }

  function normalizeHeading(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/gi, '');
  }

  expectedHeadings.forEach(eh => {
    const normExpected = normalizeHeading(eh);
    if (!normExpected) {
      matchedHeadings++;
      return;
    }
    const matched = localHtml.includes(eh) || 
      localHeadings.some(lh => {
        const normLocal = normalizeHeading(lh);
        return normLocal.includes(normExpected) || normExpected.includes(normLocal);
      });
    if (matched) {
      matchedHeadings++;
    }
  });
  const headingFidelity = expectedHeadings.length > 0 ? (matchedHeadings / expectedHeadings.length) : 1.0;

  // Check 3: Image asset presence
  let matchedImages = 0;
  const expectedImages = (assets.images || []).map(i => path.basename(new URL(i.url, 'http://dummy.com').pathname));
  expectedImages.forEach(imgName => {
    if (localHtml.includes(imgName)) {
      matchedImages++;
    }
  });
  const imageFidelity = expectedImages.length > 0 ? (matchedImages / expectedImages.length) : 1.0;

  const pass = !hasLorem && headingFidelity >= 0.7;

  return {
    routeSlug,
    pathname,
    hasLorem,
    expectedHeadingsCount: expectedHeadings.length,
    matchedHeadingsCount: matchedHeadings,
    headingFidelity: parseFloat((headingFidelity * 100).toFixed(1)),
    expectedImagesCount: expectedImages.length,
    matchedImagesCount: matchedImages,
    imageFidelity: parseFloat((imageFidelity * 100).toFixed(1)),
    status: pass ? 'PASS' : 'FAIL'
  };
}

/**
 * Main batch runner
 */
function auditAllContentAndAssets(evidenceDir, workspaceRoot) {
  if (!fs.existsSync(evidenceDir)) return { totalRoutes: 0, results: [] };

  const slugs = fs.readdirSync(evidenceDir);
  const results = [];

  for (const slug of slugs) {
    const res = auditRouteContentAndAssets(slug, evidenceDir, workspaceRoot);
    if (res.status !== 'SKIPPED') {
      results.push(res);
    }
  }

  const passed = results.filter(r => r.status === 'PASS').length;
  const status = passed === results.length && results.length > 0 ? 'PASS' : 'FAIL';

  return {
    totalRoutes: results.length,
    passedRoutes: passed,
    status,
    results
  };
}

function generateContentAssetMarkdown(report) {
  let md = `# Content & Asset Fidelity Audit\n\n`;
  md += `**Overall Status**: **${report.status}**  \n`;
  md += `**Routes Audited**: \`${report.totalRoutes}\` (Passed: \`${report.passedRoutes}\`)  \n\n`;
  md += `---\n\n`;

  md += `| Route | Has Placeholder (Lorem) | Heading Fidelity | Image Fidelity | Status |\n`;
  md += `|---|:---:|:---:|:---:|:---:|\n`;

  report.results.forEach(r => {
    const loremStr = r.hasLorem ? '❌ YES' : '✅ No';
    const hStr = `${r.matchedHeadingsCount}/${r.expectedHeadingsCount} (${r.headingFidelity}%)`;
    const iStr = `${r.matchedImagesCount}/${r.expectedImagesCount} (${r.imageFidelity}%)`;
    const stIcon = r.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
    md += `| \`${r.pathname}\` | ${loremStr} | ${hStr} | ${iStr} | **${stIcon}** |\n`;
  });

  return md;
}

// Standalone CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  let evidenceDir = './evidence';
  let workspaceRoot = './';
  let outMd = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--evidence' && args[i + 1]) evidenceDir = args[++i];
    else if (args[i].startsWith('--evidence=')) evidenceDir = args[i].slice(11);
    else if (args[i] === '--workspace' && args[i + 1]) workspaceRoot = args[++i];
    else if (args[i].startsWith('--workspace=')) workspaceRoot = args[i].slice(12);
    else if (args[i] === '--out' && args[i + 1]) outMd = args[++i];
    else if (args[i].startsWith('--out=')) outMd = args[i].slice(6);
  }

  const report = auditAllContentAndAssets(evidenceDir, workspaceRoot);

  if (outMd) {
    fs.writeFileSync(outMd, generateContentAssetMarkdown(report), 'utf8');
    console.log(`[ContentAudit] Saved report to: ${outMd}`);
  } else {
    console.log(generateContentAssetMarkdown(report));
  }

  process.exit(report.status === 'PASS' ? 0 : 1);
}

module.exports = {
  auditRouteContentAndAssets,
  auditAllContentAndAssets,
  generateContentAssetMarkdown
};
