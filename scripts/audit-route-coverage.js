/**
 * audit-route-coverage.js
 * 
 * Route Coverage, Navigation Integrity & FOUC / Headless Head Auditor.
 * Verifies that:
 *  1. 100% of discovered routes in route-graph.json are implemented locally.
 *  2. Every route's HTML entrypoint contains valid <head> stylesheets (Zero FOUC).
 *  3. Every internal link (<a href>) on every page resolves to an existing route (Zero broken navigation).
 * 
 * Generates `ROUTE_COVERAGE_MATRIX.md` and `route-coverage.json`.
 * 
 * Usage:
 *   node audit-route-coverage.js --graph ./route-graph.json --workspace ./ [--out ./ROUTE_COVERAGE_MATRIX.md]
 */

const fs = require('fs');
const path = require('path');
const { URL } = require('url');

/**
 * Maps a route pathname to candidate local HTML file paths
 * e.g. "/" -> ["index.html"]
 *      "/about" -> ["about/index.html", "about.html"]
 *      "/projecten/alquion" -> ["projecten/alquion/index.html", "projecten/alquion.html"]
 */
function resolveLocalPathCandidates(pathname) {
  const clean = pathname.replace(/^\/+|\/+$/g, '');
  if (!clean) return ['index.html'];
  return [
    path.join(clean, 'index.html'),
    `${clean}.html`,
    clean
  ];
}

/**
 * Audit a single route's local implementation
 */
function auditRouteImplementation(routeNode, workspaceRoot) {
  const candidates = resolveLocalPathCandidates(routeNode.pathname);
  let matchedFile = null;

  for (const relPath of candidates) {
    const full = path.join(workspaceRoot, relPath);
    if (fs.existsSync(full) && fs.statSync(full).isFile()) {
      matchedFile = full;
      break;
    }
  }

  const result = {
    pathname: routeNode.pathname,
    priority: routeNode.priority || 'medium',
    isDynamic: !!routeNode.isDynamic,
    implemented: !!matchedFile,
    filePath: matchedFile ? path.relative(workspaceRoot, matchedFile) : null,
    hasHead: false,
    hasStylesheetInHead: false,
    brokenLinks: [],
    validLinks: []
  };

  if (!matchedFile) return result;

  try {
    const html = fs.readFileSync(matchedFile, 'utf8');

    // 1. Check for <head> tag
    result.hasHead = /<head\b[^>]*>/i.test(html);

    // 2. Check for stylesheet links in head (FOUC check)
    const headMatch = html.match(/<head\b[^>]*>(.*?)<\/head>/is);
    if (headMatch) {
      const headContent = headMatch[1];
      result.hasStylesheetInHead = /<link[^>]+rel=["']stylesheet["']/i.test(headContent) ||
                                  /<style\b[^>]*>/i.test(headContent);
    }

    // 3. Audit internal navigation links
    const linkRegex = /<a\b[^>]+href=["']([^"']+)["']/gi;
    let m;
    while ((m = linkRegex.exec(html)) !== null) {
      const rawHref = m[1].trim();
      // Skip external, anchors, javascript, mailto
      if (rawHref.startsWith('http://') || rawHref.startsWith('https://') ||
          rawHref.startsWith('#') || rawHref.startsWith('mailto:') ||
          rawHref.startsWith('tel:') || rawHref.startsWith('javascript:')) {
        continue;
      }

      // Resolve relative to current pathname
      let targetPathname = rawHref.split('#')[0].split('?')[0];
      if (!targetPathname.startsWith('/')) {
        targetPathname = path.posix.join(path.posix.dirname(routeNode.pathname), targetPathname);
      }
      if (targetPathname.length > 1 && targetPathname.endsWith('/')) {
        targetPathname = targetPathname.slice(0, -1);
      }

      const targetCandidates = resolveLocalPathCandidates(targetPathname);
      const exists = targetCandidates.some(c => fs.existsSync(path.join(workspaceRoot, c)));

      if (exists) {
        result.validLinks.push(rawHref);
      } else {
        result.brokenLinks.push(rawHref);
      }
    }
  } catch (e) {
    result.error = e.message;
  }

  return result;
}

/**
 * Audits entire route graph against workspace
 */
function auditWorkspaceCoverage(graphPath, workspaceRoot) {
  const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
  const routes = graph.nodes || [];

  console.log(`[Coverage] Auditing route coverage for ${routes.length} routes in: ${workspaceRoot}`);

  const auditResults = routes.map(r => auditRouteImplementation(r, workspaceRoot));

  const totalDiscovered = auditResults.length;
  const totalImplemented = auditResults.filter(r => r.implemented).length;
  const foucSafe = auditResults.filter(r => r.implemented && r.hasStylesheetInHead).length;
  const withBrokenLinks = auditResults.filter(r => r.brokenLinks.length > 0);

  const isComplete = totalImplemented === totalDiscovered;
  const isFoucSafe = foucSafe === totalImplemented;
  const isNavHealthy = withBrokenLinks.length === 0;

  const passStatus = isComplete && isFoucSafe && isNavHealthy;

  return {
    target: graph.target,
    workspace: workspaceRoot,
    auditedAt: new Date().toISOString(),
    metrics: {
      totalDiscovered,
      totalImplemented,
      implementationRate: totalDiscovered > 0 ? (totalImplemented / totalDiscovered * 100).toFixed(1) + '%' : '0%',
      foucSafeCount: foucSafe,
      routesWithBrokenLinks: withBrokenLinks.length,
      overallStatus: passStatus ? 'PASS' : 'FAIL'
    },
    results: auditResults
  };
}

/**
 * Formats coverage report into Markdown
 */
function generateCoverageMarkdown(report) {
  const m = report.metrics;
  let md = `# Route Coverage & Multi-Page Parity Matrix\n\n`;
  md += `**Target Website**: \`${report.target}\`  \n`;
  md += `**Workspace**: \`${report.workspace}\`  \n`;
  md += `**Audited At**: \`${report.auditedAt}\`  \n`;
  md += `**Overall Coverage Status**: **${m.overallStatus}**  \n\n`;

  md += `### Summary Metrics\n\n`;
  md += `- **Routes Discovered**: \`${m.totalDiscovered}\`\n`;
  md += `- **Routes Implemented**: \`${m.totalImplemented} / ${m.totalDiscovered} (${m.implementationRate})\`\n`;
  md += `- **FOUC-Free Pages (Direct Stylesheet in Head)**: \`${m.foucSafeCount} / ${m.totalImplemented}\`\n`;
  md += `- **Routes with Broken Internal Links**: \`${m.routesWithBrokenLinks}\`\n\n`;
  md += `---\n\n`;

  md += `## Route Coverage Matrix\n\n`;
  md += `| # | Route | Priority | Implemented | Local File | Headless Head / FOUC Safe | Broken Links | Status |\n`;
  md += `|---|-------|:--------:|:-----------:|------------|:--------------------------:|:------------:|:------:|\n`;

  report.results.forEach((r, idx) => {
    const impStr = r.implemented ? '✅ PASS' : '❌ MISSING';
    const foucStr = !r.implemented ? '-' : (r.hasStylesheetInHead ? '✅ YES' : '❌ NO');
    const blStr = r.brokenLinks.length > 0 ? `❌ (${r.brokenLinks.length} broken)` : '✅ 0';
    const status = (r.implemented && r.hasStylesheetInHead && r.brokenLinks.length === 0) ? 'PASS' : 'FAIL';
    md += `| ${idx + 1} | \`${r.pathname}\` | \`${r.priority}\` | ${impStr} | \`${r.filePath || '-'}\` | ${foucStr} | ${blStr} | **${status}** |\n`;
  });

  md += `\n---\n\n`;
  md += `> [!IMPORTANT]\n`;
  md += `> **First-Page Mirage Hard Gate**:\n`;
  md += `> An implementation with 100% homepage fidelity but 0% subpage coverage is classified as **FAIL**. All discovered routes must reach **PASS** before sign-off.\n`;

  return md;
}

// Standalone CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  let graphPath = null;
  let workspaceRoot = './';
  let outMd = null;
  let outJson = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--graph' && args[i + 1]) graphPath = args[++i];
    else if (args[i].startsWith('--graph=')) graphPath = args[i].slice(8);
    else if (args[i] === '--workspace' && args[i + 1]) workspaceRoot = args[++i];
    else if (args[i].startsWith('--workspace=')) workspaceRoot = args[i].slice(12);
    else if (args[i] === '--out' && args[i + 1]) outMd = args[++i];
    else if (args[i].startsWith('--out=')) outMd = args[i].slice(6);
    else if (args[i] === '--json' && args[i + 1]) outJson = args[++i];
    else if (args[i].startsWith('--json=')) outJson = args[i].slice(7);
  }

  if (!graphPath) {
    console.error("Usage: node audit-route-coverage.js --graph <route-graph.json> [--workspace <path>] [--out <ROUTE_COVERAGE_MATRIX.md>]");
    process.exit(1);
  }

  const report = auditWorkspaceCoverage(graphPath, workspaceRoot);

  if (outJson) fs.writeFileSync(outJson, JSON.stringify(report, null, 2), 'utf8');
  if (outMd) {
    fs.writeFileSync(outMd, generateCoverageMarkdown(report), 'utf8');
    console.log(`[Coverage] Saved matrix to: ${outMd}`);
  } else if (!outJson) {
    console.log(generateCoverageMarkdown(report));
  }

  // Exit with status code: 0 if PASS, 1 if FAIL
  process.exit(report.metrics.overallStatus === 'PASS' ? 0 : 1);
}

module.exports = {
  auditWorkspaceCoverage,
  auditRouteImplementation,
  generateCoverageMarkdown,
  resolveLocalPathCandidates
};
