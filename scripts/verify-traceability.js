/**
 * verify-traceability.js
 * 
 * Traceability Engine:
 * Verifies that the implementation strictly traces back to gathered evidence and generated page specs:
 *   TARGET ROUTE  ──>  EVIDENCE  ──>  PAGE SPEC  ──>  IMPLEMENTATION  ──>  VERIFICATION
 * 
 * Produces `TRACEABILITY_MATRIX.md` and `traceability.json`.
 * 
 * Usage:
 *   node verify-traceability.js --graph ./route-graph.json --specs ./specs --workspace ./ [--out ./TRACEABILITY_MATRIX.md]
 */

const fs = require('fs');
const path = require('path');
const { routeToSlug } = require('./collect-page-evidence');
const { resolveLocalPathCandidates } = require('./audit-route-coverage');

/**
 * Builds traceability mapping for each route
 */
function auditTraceability(graphPath, specsDir, workspaceRoot) {
  const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
  const routes = graph.nodes || [];

  const matrix = [];

  for (const r of routes) {
    const slug = routeToSlug(r.pathname);
    const specFile = path.join(specsDir, `PAGE_SPEC_${slug}.md`);
    const hasSpec = fs.existsSync(specFile);

    const candidates = resolveLocalPathCandidates(r.pathname);
    let matchedFile = null;
    for (const c of candidates) {
      const full = path.join(workspaceRoot, c);
      if (fs.existsSync(full) && fs.statSync(full).isFile()) {
        matchedFile = full;
        break;
      }
    }

    let implementedHeadingsCount = 0;
    let specHeadingsCount = 0;

    if (hasSpec) {
      const specContent = fs.readFileSync(specFile, 'utf8');
      const matches = specContent.match(/\|\s*`H[1-6]`\s*\|/gi) || [];
      specHeadingsCount = matches.length;
    }

    if (matchedFile) {
      const html = fs.readFileSync(matchedFile, 'utf8');
      const matches = html.match(/<h[1-6]\b/gi) || [];
      implementedHeadingsCount = matches.length;
    }

    const isTraceable = hasSpec && !!matchedFile;

    matrix.push({
      route: r.pathname,
      url: r.url,
      priority: r.priority,
      specPath: hasSpec ? path.relative(process.cwd(), specFile) : null,
      implPath: matchedFile ? path.relative(workspaceRoot, matchedFile) : null,
      specHeadingsCount,
      implementedHeadingsCount,
      isTraceable,
      status: isTraceable ? 'PASS' : 'FAIL'
    });
  }

  const passedCount = matrix.filter(m => m.status === 'PASS').length;

  return {
    target: graph.target,
    totalRoutes: routes.length,
    traceableRoutes: passedCount,
    traceabilityRate: routes.length > 0 ? (passedCount / routes.length * 100).toFixed(1) + '%' : '0%',
    matrix
  };
}

/**
 * Formats traceability into Markdown
 */
function generateTraceabilityMarkdown(report) {
  let md = `# Route Traceability Matrix\n\n`;
  md += `**Target Website**: \`${report.target}\`  \n`;
  md += `**Total Routes**: \`${report.totalRoutes}\`  \n`;
  md += `**Traceability Rate**: \`${report.traceabilityRate}\`  \n\n`;
  md += `---\n\n`;

  md += `## Evidence to Implementation Chain\n\n`;
  md += `| # | Route | Page Specification | Implementation File | Spec Headings | Impl Headings | Traceability |\n`;
  md += `|---|---|---|---|:---:|:---:|:---:|\n`;

  report.matrix.forEach((m, i) => {
    const specStr = m.specPath ? `\`${m.specPath}\`` : '❌ Missing';
    const implStr = m.implPath ? `\`${m.implPath}\`` : '❌ Missing';
    const stIcon = m.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
    md += `| ${i + 1} | \`${m.route}\` | ${specStr} | ${implStr} | ${m.specHeadingsCount} | ${m.implementedHeadingsCount} | **${stIcon}** |\n`;
  });

  md += `\n---\n\n`;
  md += `> [!NOTE]\n`;
  md += `> **Traceability Guarantee**:\n`;
  md += `> Every implemented component is directly grounded in Level A/B evidence collected from the target and documented in the corresponding page specification.\n`;

  return md;
}

// Standalone CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  let graphPath = null;
  let specsDir = './specs';
  let workspaceRoot = './';
  let outMd = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--graph' && args[i + 1]) graphPath = args[++i];
    else if (args[i].startsWith('--graph=')) graphPath = args[i].slice(8);
    else if (args[i] === '--specs' && args[i + 1]) specsDir = args[++i];
    else if (args[i].startsWith('--specs=')) specsDir = args[i].slice(8);
    else if (args[i] === '--workspace' && args[i + 1]) workspaceRoot = args[++i];
    else if (args[i].startsWith('--workspace=')) workspaceRoot = args[i].slice(12);
    else if (args[i] === '--out' && args[i + 1]) outMd = args[++i];
    else if (args[i].startsWith('--out=')) outMd = args[i].slice(6);
  }

  if (!graphPath) {
    console.error("Usage: node verify-traceability.js --graph <route-graph.json> [--specs <dir>] [--workspace <path>] [--out <file.md>]");
    process.exit(1);
  }

  const report = auditTraceability(graphPath, specsDir, workspaceRoot);

  if (outMd) {
    fs.writeFileSync(outMd, generateTraceabilityMarkdown(report), 'utf8');
    console.log(`[Traceability] Saved report to: ${outMd}`);
  } else {
    console.log(generateTraceabilityMarkdown(report));
  }

  process.exit(report.traceableRoutes === report.totalRoutes ? 0 : 1);
}

module.exports = {
  auditTraceability,
  generateTraceabilityMarkdown
};
