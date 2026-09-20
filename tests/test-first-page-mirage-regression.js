/**
 * test-first-page-mirage-regression.js
 * 
 * PERMANENT REGRESSION TEST FOR THE FIRST-PAGE MIRAGE TRAP.
 * 
 * Specifically asserts that:
 * 1. When the Homepage (/) has 100% fidelity, but subpages (/about, /work, /contact)
 *    are missing or unstyled, the engine STRICTLY rejects completion with status FAIL.
 * 2. When ALL discovered routes reach parity, the engine cleanly reports PASS.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { evaluateQualityGates } = require('../scripts/run-quality-gates');

function runTests() {
  console.log('--- Running First-Page Mirage Regression Tests ---');

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mirage-test-'));

  try {
    // 1. Build Route Graph with 4 routes
    const graphPath = path.join(tempDir, 'route-graph.json');
    const mockGraph = {
      target: 'https://example.com',
      totalRoutes: 4,
      totalDynamicFamilies: 1,
      nodes: [
        { pathname: '/', url: 'https://example.com/', priority: 'critical' },
        { pathname: '/about', url: 'https://example.com/about', priority: 'high' },
        { pathname: '/work', url: 'https://example.com/work', priority: 'high' },
        { pathname: '/contact', url: 'https://example.com/contact', priority: 'high' }
      ]
    };
    fs.writeFileSync(graphPath, JSON.stringify(mockGraph, null, 2), 'utf8');

    // -------------------------------------------------------------
    // SCENARIO A: The "First-Page Mirage" Trap
    // Homepage is implemented with high craft, but subpages are missing!
    // -------------------------------------------------------------
    fs.writeFileSync(path.join(tempDir, 'index.html'), `
<!DOCTYPE html>
<html>
<head>
  <title>Award-Winning Home</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <h1>Award-Winning Experience</h1>
  <p>Crafted with sub-pixel precision.</p>
</body>
</html>
`, 'utf8');

    // Evaluate Quality Gates on Scenario A
    const scenarioAResult = evaluateQualityGates(graphPath, tempDir);

    // Assert: Overall status MUST be FAIL!
    assert.strictEqual(
      scenarioAResult.overallStatus,
      'FAIL',
      'First-Page Mirage Violation: Overall status must be FAIL when subpages are missing!'
    );

    // Assert: QG-01 Route Completeness must FAIL
    const qg01 = scenarioAResult.gates.find(g => g.id === 'QG-01');
    assert.strictEqual(qg01.status, 'FAIL');
    assert.strictEqual(qg01.failureClass, 'PAGE_IMPLEMENTATION_FAILURE');

    // Assert: Critical failure count must be > 0
    assert.ok(scenarioAResult.scorecard.criticalFailures > 0);
    assert.strictEqual(scenarioAResult.scorecard.routeCoverage, '25.0%');

    console.log('  ✔ Scenario A: Perfect home + missing subpages strictly triggers FAIL (Scorecard: 25.0% coverage)');

    // -------------------------------------------------------------
    // SCENARIO B: Subpage Implemented but has FOUC (Headless Head Trap)
    // -------------------------------------------------------------
    fs.mkdirSync(path.join(tempDir, 'about'), { recursive: true });
    fs.mkdirSync(path.join(tempDir, 'work'), { recursive: true });
    fs.mkdirSync(path.join(tempDir, 'contact'), { recursive: true });

    // About has no stylesheet in <head>
    fs.writeFileSync(path.join(tempDir, 'about', 'index.html'), `<!DOCTYPE html><html><head><title>About</title></head><body><h1>About</h1></body></html>`, 'utf8');
    fs.writeFileSync(path.join(tempDir, 'work', 'index.html'), `<!DOCTYPE html><html><head><link rel="stylesheet" href="/styles.css"></head><body><h1>Work</h1></body></html>`, 'utf8');
    fs.writeFileSync(path.join(tempDir, 'contact', 'index.html'), `<!DOCTYPE html><html><head><link rel="stylesheet" href="/styles.css"></head><body><h1>Contact</h1></body></html>`, 'utf8');

    const scenarioBResult = evaluateQualityGates(graphPath, tempDir);
    assert.strictEqual(scenarioBResult.overallStatus, 'FAIL', 'Must fail when FOUC is detected on subpages!');
    const qg16 = scenarioBResult.gates.find(g => g.id === 'QG-16');
    assert.strictEqual(qg16.status, 'FAIL');
    console.log('  ✔ Scenario B: Subpage with unstyled FOUC strictly triggers FAIL (QG-16)');

    // -------------------------------------------------------------
    // SCENARIO C: 100% Multi-Page Parity & Navigation Health
    // All routes implemented with <head> stylesheets and valid links
    // -------------------------------------------------------------
    fs.writeFileSync(path.join(tempDir, 'about', 'index.html'), `<!DOCTYPE html><html><head><link rel="stylesheet" href="/styles.css"></head><body><h1>About</h1></body></html>`, 'utf8');

    const scenarioCResult = evaluateQualityGates(graphPath, tempDir);
    assert.strictEqual(scenarioCResult.overallStatus, 'PASS', 'Must pass when all routes are implemented and styled!');
    assert.strictEqual(scenarioCResult.scorecard.routeCoverage, '100.0%');
    assert.strictEqual(scenarioCResult.scorecard.criticalFailures, 0);

    console.log('  ✔ Scenario C: 100% multi-page implementation and FOUC-safe styling cleanly returns PASS');
    console.log('All First-Page Mirage Regression Tests Passed Successfully!\n');
  } finally {
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
