/**
 * repair-loop.js
 * 
 * Autonomous Self-Healing Repair Engine.
 * 
 * Executes bounded iterative repair cycles:
 *   AUDIT / COMPARE
 *         ↓
 *   IDENTIFY & CLASSIFY MISMATCHES
 *         ↓
 *   LOCATE SOURCE FILE IN WORKSPACE
 *         ↓
 *   APPLY TARGETED PROGRAMMATIC REPAIRS
 *         ↓
 *   RE-EVALUATE UNTIL RESOLVED OR MAX ITERATIONS REACHED
 * 
 * Prevents infinite loops via bounded retry counters.
 * 
 * Usage:
 *   node repair-loop.js --graph ./route-graph.json --workspace ./ [--maxRetries 3] [--log ./repair-log.json]
 */

const fs = require('fs');
const path = require('path');
const { auditWorkspaceCoverage, resolveLocalPathCandidates } = require('./audit-route-coverage');

/**
 * Repairs a specific issue in a local workspace file
 */
function applyTargetedRepair(issue, workspaceRoot) {
  const actionsTaken = [];

  // Repair 1: Missing Route File -> Create placeholder structure from route
  if (!issue.implemented && issue.pathname) {
    const candidates = resolveLocalPathCandidates(issue.pathname);
    const targetFile = path.join(workspaceRoot, candidates[0]);
    fs.mkdirSync(path.dirname(targetFile), { recursive: true });

    const cleanTitle = issue.pathname.replace(/^\/+|\/+$/g, '').replace(/[\/\-_]+/g, ' ') || 'Home';
    const capitalizedTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

    const boilerplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${capitalizedTitle}</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <header class="site-header">
    <div class="container">
      <nav class="main-nav">
        <a href="/">Home</a>
      </nav>
    </div>
  </header>
  <main>
    <section class="hero">
      <div class="container">
        <h1>${capitalizedTitle}</h1>
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container">
      <p>© 2026</p>
    </div>
  </footer>
</body>
</html>
`;
    fs.writeFileSync(targetFile, boilerplate, 'utf8');
    actionsTaken.push(`Created missing route file: ${path.relative(workspaceRoot, targetFile)}`);
  }

  // Repair 2: Missing Stylesheet in <head> (FOUC Trap)
  if (issue.implemented && !issue.hasStylesheetInHead && issue.filePath) {
    const fullPath = path.join(workspaceRoot, issue.filePath);
    let html = fs.readFileSync(fullPath, 'utf8');

    if (/<head\b[^>]*>/i.test(html)) {
      html = html.replace(/(<head\b[^>]*>)/i, '$1\n  <link rel="stylesheet" href="/styles.css">');
    } else {
      html = `<head><link rel="stylesheet" href="/styles.css"></head>\n` + html;
    }
    fs.writeFileSync(fullPath, html, 'utf8');
    actionsTaken.push(`Injected missing <link rel="stylesheet"> into <head> of ${issue.filePath}`);
  }

  // Repair 3: Broken Navigation Links
  if (issue.brokenLinks && issue.brokenLinks.length > 0 && issue.filePath) {
    const fullPath = path.join(workspaceRoot, issue.filePath);
    let html = fs.readFileSync(fullPath, 'utf8');

    for (const broken of issue.brokenLinks) {
      // If broken link points to a non-existent path, repair to home or nearest valid parent
      const safeTarget = '/';
      const regex = new RegExp(`href=["']${broken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'g');
      html = html.replace(regex, `href="${safeTarget}"`);
      actionsTaken.push(`Repaired broken link '${broken}' -> '${safeTarget}' in ${issue.filePath}`);
    }
    fs.writeFileSync(fullPath, html, 'utf8');
  }

  // Repair 4: Remove artificial <br> tags in headings
  if (issue.filePath && fs.existsSync(path.join(workspaceRoot, issue.filePath))) {
    const fullPath = path.join(workspaceRoot, issue.filePath);
    let html = fs.readFileSync(fullPath, 'utf8');
    const originalLength = html.length;

    // Remove <br> inside h1..h6
    html = html.replace(/(<h[1-6]\b[^>]*>)(.*?)(<\/h[1-6]>)/gis, (match, open, inner, close) => {
      return open + inner.replace(/<br\s*\/?>/gi, ' ') + close;
    });

    if (html.length !== originalLength) {
      fs.writeFileSync(fullPath, html, 'utf8');
      actionsTaken.push(`Removed artificial <br> tags from headings in ${issue.filePath}`);
    }
  }

  return actionsTaken;
}

/**
 * Execute the autonomous repair loop
 */
function runAutonomousRepairLoop(graphPath, workspaceRoot, options = {}) {
  const maxIterations = options.maxRetries || 3;
  const logEntries = [];

  console.log(`\n=== Initializing Autonomous Repair Loop ===`);
  console.log(`Workspace: ${workspaceRoot}`);
  console.log(`Max Iterations Allowed: ${maxIterations}\n`);

  let currentIteration = 0;
  let resolved = false;

  while (currentIteration < maxIterations && !resolved) {
    currentIteration++;
    console.log(`--- Repair Iteration ${currentIteration}/${maxIterations} ---`);

    // Step 1: Audit
    const report = auditWorkspaceCoverage(graphPath, workspaceRoot);
    const issues = report.results.filter(r => !r.implemented || !r.hasStylesheetInHead || r.brokenLinks.length > 0);

    const iterationLog = {
      iteration: currentIteration,
      timestamp: new Date().toISOString(),
      issuesDetected: issues.length,
      actionsTaken: [],
      status: 'in-progress'
    };

    if (issues.length === 0) {
      console.log(`✅ All routes are healthy, FOUC-free, and navigable! No repairs needed.`);
      iterationLog.status = 'resolved';
      logEntries.push(iterationLog);
      resolved = true;
      break;
    }

    console.log(`[Repair] Detected ${issues.length} routes with actionable issues.`);

    // Step 2: Apply targeted repairs
    for (const issue of issues) {
      const actions = applyTargetedRepair(issue, workspaceRoot);
      iterationLog.actionsTaken.push(...actions);
      actions.forEach(a => console.log(`  🔧 ${a}`));
    }

    // Step 3: Re-verify
    const recheck = auditWorkspaceCoverage(graphPath, workspaceRoot);
    const remainingIssues = recheck.results.filter(r => !r.implemented || !r.hasStylesheetInHead || r.brokenLinks.length > 0);

    if (remainingIssues.length === 0) {
      console.log(`✅ Iteration ${currentIteration} successfully resolved all detected issues!`);
      iterationLog.status = 'resolved';
      resolved = true;
    } else {
      console.warn(`[Repair] ${remainingIssues.length} issues remaining after iteration ${currentIteration}.`);
    }

    logEntries.push(iterationLog);
  }

  const finalStatus = resolved ? 'RESOLVED' : 'UNRESOLVED';
  console.log(`\n=== Repair Loop Finished: Status ${finalStatus} (${currentIteration} iterations) ===\n`);

  return {
    status: finalStatus,
    totalIterations: currentIteration,
    maxIterations,
    log: logEntries
  };
}

// Standalone CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  let graphPath = null;
  let workspaceRoot = './';
  let maxRetries = 3;
  let logFile = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--graph' && args[i + 1]) graphPath = args[++i];
    else if (args[i].startsWith('--graph=')) graphPath = args[i].slice(8);
    else if (args[i] === '--workspace' && args[i + 1]) workspaceRoot = args[++i];
    else if (args[i].startsWith('--workspace=')) workspaceRoot = args[i].slice(12);
    else if (args[i] === '--maxRetries' && args[i + 1]) maxRetries = parseInt(args[++i], 10);
    else if (args[i].startsWith('--maxRetries=')) maxRetries = parseInt(args[i].slice(13), 10);
    else if (args[i] === '--log' && args[i + 1]) logFile = args[++i];
    else if (args[i].startsWith('--log=')) logFile = args[i].slice(6);
  }

  if (!graphPath) {
    console.error("Usage: node repair-loop.js --graph <route-graph.json> [--workspace <path>] [--maxRetries 3] [--log <file.json>]");
    process.exit(1);
  }

  const result = runAutonomousRepairLoop(graphPath, workspaceRoot, { maxRetries });

  if (logFile) {
    fs.writeFileSync(logFile, JSON.stringify(result, null, 2), 'utf8');
    console.log(`[Repair] Log saved to: ${logFile}`);
  }

  process.exit(result.status === 'RESOLVED' ? 0 : 1);
}

module.exports = {
  runAutonomousRepairLoop,
  applyTargetedRepair
};
