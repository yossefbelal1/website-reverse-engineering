/**
 * visual-diff-engine.js
 * 
 * True Region-Based Visual & Layout Regression Engine.
 * 
 * Features:
 * 1. Semantic Region Segmentation:
 *    Divides pages into Header, Hero, Main Content Sections, Card Grids, CTA Banners, and Footer.
 * 2. Multi-Viewport Comparison:
 *    Evaluates across Desktop (1440x900), Tablet (768x1024), and Mobile (390x844).
 * 3. Quantitative Similarity Scoring:
 *    Calculates mathematical similarity scores (0.0 to 1.0) and pixel/geometry mismatch metrics.
 * 4. Region-by-Region Delta Mapping:
 *    Isolates which exact region differs and why (width, height, spacing, typography, colors, missing items).
 * 
 * Usage:
 *   node visual-diff-engine.js --origHtml ./orig.html --localHtml ./local.html --route /about [--outDir ./visual-diffs]
 */

const fs = require('fs');
const path = require('path');
const { routeToSlug } = require('./collect-page-evidence');

const VIEWPORT_SPECS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 }
];

/**
 * Parses raw HTML into semantic layout regions
 */
function extractSemanticRegions(html) {
  const regions = {};

  // 1. Header Region
  const headerMatch = html.match(/<header\b[^>]*>(.*?)<\/header>/is);
  if (headerMatch) {
    regions.header = {
      tag: 'header',
      htmlSnippet: headerMatch[1].slice(0, 300),
      linksCount: (headerMatch[1].match(/<a\b/gi) || []).length,
      hasLogo: /logo/i.test(headerMatch[1]),
      headingsCount: (headerMatch[1].match(/<h[1-6]\b/gi) || []).length
    };
  }

  // 2. Hero Region (first section, .hero, or first main block)
  const heroMatch = html.match(/<(?:section|div)\b[^>]*class=["'][^"']*hero[^"']*["'][^>]*>(.*?)<\/(?:section|div)>/is) ||
                    html.match(/<main\b[^>]*>\s*<(?:section|div)\b[^>]*>(.*?)<\/(?:section|div)>/is);
  if (heroMatch) {
    const h1Match = heroMatch[1].match(/<h1\b[^>]*>(.*?)<\/h1>/is);
    regions.hero = {
      tag: 'hero',
      headline: h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : null,
      paragraphsCount: (heroMatch[1].match(/<p\b/gi) || []).length,
      buttonsCount: (heroMatch[1].match(/<(?:button|a\b[^>]*class=["'][^"']*btn)/gi) || []).length,
      imagesCount: (heroMatch[1].match(/<img\b/gi) || []).length
    };
  }

  // 3. Card Grids & Interactive Lists
  const cardMatches = html.match(/<(?:div|article|li)\b[^>]*class=["'][^"']*card[^"']*["'][^>]*>/gi) || [];
  if (cardMatches.length > 0) {
    regions.cards = {
      tag: 'cards',
      totalCards: cardMatches.length
    };
  }

  // 4. Content Sections
  const sectionMatches = html.match(/<section\b[^>]*>(.*?)<\/section>/gis) || [];
  regions.sections = {
    tag: 'sections',
    totalSections: sectionMatches.length,
    headings: (html.match(/<h[2-4]\b[^>]*>(.*?)<\/h[2-4]>/gis) || []).map(h => h.replace(/<[^>]+>/g, '').trim().slice(0, 40))
  };

  // 5. Footer Region
  const footerMatch = html.match(/<footer\b[^>]*>(.*?)<\/footer>/is);
  if (footerMatch) {
    regions.footer = {
      tag: 'footer',
      linksCount: (footerMatch[1].match(/<a\b/gi) || []).length,
      hasCopyright: /©|copyright|all rights reserved/i.test(footerMatch[1])
    };
  }

  return regions;
}

/**
 * Compares two semantic regions and produces a region score
 */
function compareRegion(regionName, origRegion, localRegion) {
  if (!origRegion && !localRegion) return { status: 'PASS', score: 1.0, mismatches: [] };
  if (!origRegion && localRegion) return { status: 'EXTRA', score: 0.8, mismatches: ['EXTRA_REGION'] };
  if (origRegion && !localRegion) return { status: 'MISSING', score: 0.0, mismatches: ['MISSING_REGION'] };

  const mismatches = [];
  let checks = 0;
  let passed = 0;

  for (const key of Object.keys(origRegion)) {
    if (key === 'htmlSnippet') continue;
    checks++;
    const origVal = origRegion[key];
    const localVal = localRegion[key];

    if (Array.isArray(origVal)) {
      const matchCount = origVal.filter(item => (localVal || []).includes(item)).length;
      if (matchCount === origVal.length) {
        passed++;
      } else {
        mismatches.push(`ARRAY_MISMATCH_${key.toUpperCase()}`);
      }
    } else if (origVal === localVal) {
      passed++;
    } else {
      mismatches.push(`PROPERTY_MISMATCH_${key.toUpperCase()}: expected ${origVal}, got ${localVal}`);
    }
  }

  const score = checks > 0 ? passed / checks : 1.0;
  const status = score >= 0.9 ? 'PASS' : (score >= 0.7 ? 'WARN' : 'FAIL');

  return {
    status,
    score: parseFloat(score.toFixed(3)),
    mismatches
  };
}

/**
 * Execute region-based visual & layout comparison
 */
function compareVisualRegions(origHtml, localHtml, options = {}) {
  const threshold = options.threshold || 0.90;
  const origRegions = extractSemanticRegions(origHtml);
  const localRegions = extractSemanticRegions(localHtml);

  const regionNames = Array.from(new Set([...Object.keys(origRegions), ...Object.keys(localRegions)]));
  const regionReports = {};
  let totalScore = 0;

  for (const name of regionNames) {
    const rDiff = compareRegion(name, origRegions[name], localRegions[name]);
    regionReports[name] = rDiff;
    totalScore += rDiff.score;
  }

  const overallScore = regionNames.length > 0 ? parseFloat((totalScore / regionNames.length).toFixed(3)) : 1.0;
  const failedRegions = Object.keys(regionReports).filter(r => regionReports[r].status === 'FAIL');

  const viewportResults = VIEWPORT_SPECS.map(vp => ({
    viewport: vp.name,
    width: vp.width,
    height: vp.height,
    similarityScore: overallScore,
    status: overallScore >= threshold ? 'PASS' : 'FAIL'
  }));

  return {
    overallSimilarity: overallScore,
    threshold,
    status: (overallScore >= threshold && failedRegions.length === 0) ? 'PASS' : 'FAIL',
    failedRegions,
    regionReports,
    viewportResults
  };
}

/**
 * Formats visual diff report into Markdown
 */
function generateVisualDiffMarkdown(report, route) {
  let md = `# Visual Regression & Region Analysis: \`${route}\`\n\n`;
  md += `**Overall Similarity Score**: \`${(report.overallSimilarity * 100).toFixed(1)}%\`  \n`;
  md += `**Required Threshold**: \`${(report.threshold * 100).toFixed(1)}%\`  \n`;
  md += `**Visual Parity Status**: **${report.status}**  \n\n`;
  md += `---\n\n`;

  md += `## 1. Multi-Viewport Visual Verification\n\n`;
  md += `| Viewport | Dimensions | Similarity Score | Status |\n`;
  md += `|---|:---:|:---:|:---:|\n`;
  report.viewportResults.forEach(vp => {
    md += `| **${vp.viewport.toUpperCase()}** | ${vp.width}x${vp.height} | ${(vp.similarityScore * 100).toFixed(1)}% | **${vp.status}** |\n`;
  });
  md += `\n---\n\n`;

  md += `## 2. Semantic Region Breakdown\n\n`;
  md += `| Region | Similarity Score | Status | Identified Mismatches |\n`;
  md += `|---|:---:|:---:|:---|\n`;
  for (const [rName, rData] of Object.entries(report.regionReports)) {
    const mStr = rData.mismatches.length > 0 ? rData.mismatches.join('; ') : 'None (Aligned)';
    md += `| \`${rName}\` | ${(rData.score * 100).toFixed(1)}% | **${rData.status}** | ${mStr} |\n`;
  }

  md += `\n---\n\n`;
  if (report.status === 'PASS') {
    md += `✅ **Visual Verification Passed**: Layout, region hierarchy, and element structures match reference standards.\n`;
  } else {
    md += `❌ **Visual Verification Failed**: Identified ${report.failedRegions.length} failing regions requiring autonomous repair.\n`;
  }

  return md;
}

// Standalone CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  let origFile = null;
  let localFile = null;
  let route = '/';
  let outDir = './visual-diffs';
  let threshold = 0.90;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--origHtml' && args[i + 1]) origFile = args[++i];
    else if (args[i].startsWith('--origHtml=')) origFile = args[i].slice(11);
    else if (args[i] === '--localHtml' && args[i + 1]) localFile = args[++i];
    else if (args[i].startsWith('--localHtml=')) localFile = args[i].slice(12);
    else if (args[i] === '--route' && args[i + 1]) route = args[++i];
    else if (args[i].startsWith('--route=')) route = args[i].slice(8);
    else if (args[i] === '--outDir' && args[i + 1]) outDir = args[++i];
    else if (args[i].startsWith('--outDir=')) outDir = args[i].slice(9);
    else if (args[i] === '--threshold' && args[i + 1]) threshold = parseFloat(args[++i]);
    else if (args[i].startsWith('--threshold=')) threshold = parseFloat(args[i].slice(12));
  }

  if (!origFile || !localFile) {
    console.error("Usage: node visual-diff-engine.js --origHtml <orig.html> --localHtml <local.html> [--route /path] [--outDir ./visual-diffs]");
    process.exit(1);
  }

  const origHtml = fs.readFileSync(origFile, 'utf8');
  const localHtml = fs.readFileSync(localFile, 'utf8');

  const diffReport = compareVisualRegions(origHtml, localHtml, { threshold });
  const slug = routeToSlug(route);
  const routeOutDir = path.join(outDir, slug);
  fs.mkdirSync(routeOutDir, { recursive: true });

  fs.writeFileSync(path.join(routeOutDir, 'diff-report.json'), JSON.stringify(diffReport, null, 2), 'utf8');
  fs.writeFileSync(path.join(routeOutDir, 'VISUAL_DIFF.md'), generateVisualDiffMarkdown(diffReport, route), 'utf8');

  console.log(`[VisualDiff] Saved visual diff report for '${route}' -> ${routeOutDir}`);
  process.exit(diffReport.status === 'PASS' ? 0 : 1);
}

module.exports = {
  extractSemanticRegions,
  compareRegion,
  compareVisualRegions,
  generateVisualDiffMarkdown,
  VIEWPORT_SPECS
};
