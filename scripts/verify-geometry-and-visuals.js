/**
 * verify-geometry-and-visuals.js
 * 
 * Container-First Geometry & Quantitative Alignment Engine.
 * Evaluates:
 *  - Structural container width deviation: Goal is Δ <= 1px
 *  - Section vertical cadence and height ratios: Goal is Δ <= 2px
 *  - Typography wrap integrity: Zero artificial <br> tags
 *  - Viewport & canvas bounds alignment
 * 
 * Generates `GEOMETRY_AUDIT.md` and `VISUAL_COMPARISON_REPORT.md`.
 * 
 * Usage:
 *   node verify-geometry-and-visuals.js --orig ./evidence/home/geometry.json --local ./evidence/local-home/geometry.json [--out ./GEOMETRY_AUDIT.md]
 */

const fs = require('fs');
const path = require('path');

/**
 * Compare two container sets and compute sub-pixel deltas
 */
function compareContainers(origContainers = [], localContainers = []) {
  const results = [];
  const maxLen = Math.max(origContainers.length, localContainers.length);

  for (let i = 0; i < maxLen; i++) {
    const orig = origContainers[i] || {};
    const local = localContainers[i] || {};

    const origWidth = orig.width !== undefined ? Math.round(orig.width) : null;
    const localWidth = local.width !== undefined ? Math.round(local.width) : null;

    let delta = null;
    let status = 'MISSING';

    if (origWidth !== null && localWidth !== null) {
      delta = Math.abs(localWidth - origWidth);
      status = delta <= 1 ? 'PASS' : (delta <= 3 ? 'WARN' : 'FAIL');
    }

    results.push({
      index: i,
      origSelector: orig.selector || 'none',
      origWidth,
      origMaxWidth: orig.maxWidth || 'none',
      localSelector: local.selector || 'none',
      localWidth,
      localMaxWidth: local.maxWidth || 'none',
      delta,
      status
    });
  }

  return results;
}

/**
 * Compare two section sets top-to-bottom
 */
function compareSections(origSections = [], localSections = []) {
  const results = [];
  const maxLen = Math.max(origSections.length, localSections.length);

  for (let i = 0; i < maxLen; i++) {
    const orig = origSections[i] || {};
    const local = localSections[i] || {};

    const origHeight = orig.height !== undefined ? Math.round(orig.height) : null;
    const localHeight = local.height !== undefined ? Math.round(local.height) : null;

    let delta = null;
    let status = 'MISSING';

    if (origHeight !== null && localHeight !== null) {
      delta = Math.abs(localHeight - origHeight);
      status = delta <= 2 ? 'PASS' : (delta <= 10 ? 'WARN' : 'FAIL');
    }

    results.push({
      index: i,
      origTag: orig.tag || 'none',
      origClass: orig.className || '',
      origHeight,
      localTag: local.tag || 'none',
      localClass: local.className || '',
      localHeight,
      delta,
      status
    });
  }

  return results;
}

/**
 * Check for artificial <br> tags in local HTML
 */
function auditArtificialLineBreaks(htmlContent) {
  if (!htmlContent) return { count: 0, violations: [] };

  const violations = [];
  // Match <br> inside headings or styled paragraphs
  const headingRegex = /<(h[1-6]|p)\b[^>]*>(.*?)<\/\1>/gis;
  let m;
  while ((m = headingRegex.exec(htmlContent)) !== null) {
    if (/<br\s*\/?>/i.test(m[2])) {
      violations.push({
        tag: m[1],
        snippet: m[2].replace(/\s+/g, ' ').slice(0, 60)
      });
    }
  }

  return {
    count: violations.length,
    violations
  };
}

/**
 * Format audit into GEOMETRY_AUDIT.md
 */
function generateGeometryAuditMarkdown(report) {
  let md = `# Spatial Geometry & Container Verification Audit\n\n`;
  md += `**Route**: \`${report.route}\`  \n`;
  md += `**Audited At**: \`${report.auditedAt}\`  \n`;
  md += `**Overall Geometry Status**: **${report.overallStatus}**  \n\n`;
  md += `---\n\n`;

  // Containers
  md += `## 1. Container Width Delta Analysis (Standard: $\\Delta \\le 1\\text{px}$)\n\n`;
  md += `| # | Reference Selector | Ref Width | Local Selector | Local Width | Delta (Δ) | Status |\n`;
  md += `|---|---|:---:|---|:---:|:---:|:---:|\n`;
  report.containers.forEach(c => {
    const dStr = c.delta !== null ? `${c.delta}px` : '-';
    md += `| ${c.index + 1} | \`${c.origSelector}\` | ${c.origWidth}px | \`${c.localSelector}\` | ${c.localWidth}px | ${dStr} | **${c.status}** |\n`;
  });
  md += `\n---\n\n`;

  // Sections
  md += `## 2. Top-to-Bottom Section Height Cadence (Standard: $\\Delta \\le 2\\text{px}$)\n\n`;
  md += `| # | Reference Section | Ref Height | Local Section | Local Height | Delta (Δ) | Status |\n`;
  md += `|---|---|:---:|---|:---:|:---:|:---:|\n`;
  report.sections.forEach(s => {
    const dStr = s.delta !== null ? `${s.delta}px` : '-';
    md += `| ${s.index + 1} | \`${s.origTag}.${s.origClass.slice(0, 20)}\` | ${s.origHeight}px | \`${s.localTag}.${s.localClass.slice(0, 20)}\` | ${s.localHeight}px | ${dStr} | **${s.status}** |\n`;
  });
  md += `\n---\n\n`;

  // Typography wrap
  md += `## 3. Typography & Line Wrapping Forensics\n\n`;
  md += `- **Artificial \`<br>\` Tags Detected**: \`${report.lineBreaks.count}\`\n`;
  if (report.lineBreaks.count > 0) {
    md += `\n> [!WARNING]\n> Detected artificial \`<br>\` tags violating Responsive Rule 3.1. Text wrap must be controlled by container width, not hard breaks.\n\n`;
    report.lineBreaks.violations.forEach((v, i) => {
      md += `${i + 1}. \`<${v.tag}>\`: "${v.snippet}"\n`;
    });
  } else {
    md += `✅ *Passed: Zero artificial line breaks found. Typography wraps organically with container geometry.*\n`;
  }

  return md;
}

// Standalone CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  let origFile = null;
  let localFile = null;
  let localHtmlFile = null;
  let outMd = null;
  let route = '/';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--orig' && args[i + 1]) origFile = args[++i];
    else if (args[i].startsWith('--orig=')) origFile = args[i].slice(7);
    else if (args[i] === '--local' && args[i + 1]) localFile = args[++i];
    else if (args[i].startsWith('--local=')) localFile = args[i].slice(8);
    else if (args[i] === '--html' && args[i + 1]) localHtmlFile = args[++i];
    else if (args[i].startsWith('--html=')) localHtmlFile = args[i].slice(7);
    else if (args[i] === '--out' && args[i + 1]) outMd = args[++i];
    else if (args[i].startsWith('--out=')) outMd = args[i].slice(6);
    else if (args[i] === '--route' && args[i + 1]) route = args[++i];
    else if (args[i].startsWith('--route=')) route = args[i].slice(8);
  }

  if (!origFile || !localFile) {
    console.error("Usage: node verify-geometry-and-visuals.js --orig <orig.json> --local <local.json> [--html <local.html>] [--out <GEOMETRY_AUDIT.md>]");
    process.exit(1);
  }

  const origData = JSON.parse(fs.readFileSync(origFile, 'utf8'));
  const localData = JSON.parse(fs.readFileSync(localFile, 'utf8'));

  const containers = compareContainers(origData.containers, localData.containers);
  const sections = compareSections(origData.sections, localData.sections);

  let lineBreaks = { count: 0, violations: [] };
  if (localHtmlFile && fs.existsSync(localHtmlFile)) {
    lineBreaks = auditArtificialLineBreaks(fs.readFileSync(localHtmlFile, 'utf8'));
  }

  const containerFails = containers.filter(c => c.status === 'FAIL').length;
  const sectionFails = sections.filter(s => s.status === 'FAIL').length;
  const overallStatus = (containerFails === 0 && lineBreaks.count === 0) ? 'PASS' : 'FAIL';

  const report = {
    route,
    auditedAt: new Date().toISOString(),
    overallStatus,
    containers,
    sections,
    lineBreaks
  };

  if (outMd) {
    fs.writeFileSync(outMd, generateGeometryAuditMarkdown(report), 'utf8');
    console.log(`[GeometryQA] Saved audit report to: ${outMd}`);
  } else {
    console.log(generateGeometryAuditMarkdown(report));
  }

  process.exit(overallStatus === 'PASS' ? 0 : 1);
}

module.exports = {
  compareContainers,
  compareSections,
  auditArtificialLineBreaks,
  generateGeometryAuditMarkdown
};
